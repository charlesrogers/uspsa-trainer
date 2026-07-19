// Sync engine — the outbox + last-write-wins algorithm. THIS IS WHERE THE BUGS
// LIVE, so it is built decoupled from IndexedDB and Supabase behind two
// interfaces and proven correct against in-memory fakes before it is wired to
// anything real.
//
// Invariants (fixed by the roadmap):
//   * updated_at is the SERVER clock, assigned on upsert. The client never sets
//     it. A device with a wrong clock therefore cannot win an LWW race or
//     resurrect a deleted row — ordering is by server receipt, full stop.
//   * Deletes are soft (deleted_at). They propagate like any other field.
//   * Upserts are idempotent by primary key, so a partial-push failure can be
//     retried safely.
//   * The local store is the UI's source of truth; sync is a background mirror.

export type SyncTable = "profiles" | "sessions" | "runs" | "plans";

/** A row as it crosses the wire. `pk` is the primary key value the row is
 *  addressed by (id for sessions/runs, user_id for profiles, `${user}:${key}`
 *  for plans). `updated_at`/`deleted_at` are server-assigned ISO timestamps. */
export interface SyncRow {
  pk: string;
  data: Record<string, unknown>;
  updated_at: string;
  deleted_at: string | null;
}

/** Outbox entry: a locally-dirty row awaiting push. */
export interface OutboxEntry {
  table: SyncTable;
  pk: string;
}

/** The remote (Supabase). The real impl wraps supabase-js; the test impl is an
 *  in-memory Postgres that stamps `updated_at` with its own clock. */
export interface RemoteClient {
  /** Upsert rows (idempotent by pk). Returns the rows with SERVER-assigned
   *  updated_at. Any client-supplied updated_at MUST be ignored. */
  upsert(table: SyncTable, rows: SyncRow[]): Promise<SyncRow[]>;
  /** Pull rows for this table whose server updated_at is strictly greater than
   *  `sinceExclusive` (ISO), oldest-first. */
  pull(table: SyncTable, sinceExclusive: string | null): Promise<SyncRow[]>;
}

/** The local mirror (IndexedDB, in the real wiring). */
export interface LocalStore {
  /** Dirty rows awaiting push, in enqueue order. */
  outbox(): OutboxEntry[];
  /** Remove entries from the outbox after a successful push. */
  clearOutbox(entries: OutboxEntry[]): void;
  /** The current local row for a pk, or undefined if absent. */
  localRow(table: SyncTable, pk: string): SyncRow | undefined;
  /** The server updated_at last recorded for a pk (drives LWW); null if unknown. */
  rowVersion(table: SyncTable, pk: string): string | null;
  /** Apply a remote row into the local mirror (upsert; a non-null deleted_at
   *  soft-deletes locally) and record its server updated_at as the new version.
   *  MUST NOT re-enqueue the row to the outbox. */
  applyRemote(table: SyncTable, row: SyncRow): void;
  /** Watermark: the max server updated_at pulled so far for a table. */
  watermark(table: SyncTable): string | null;
  setWatermark(table: SyncTable, iso: string): void;
}

export interface SyncResult {
  pushed: number;
  pulled: number;
  applied: number; // pulled rows that won LWW and were applied
  errors: string[];
}

const TABLES: SyncTable[] = ["profiles", "sessions", "runs", "plans"];

function maxIso(a: string | null, b: string): string {
  return a === null || b > a ? b : a;
}

/** One full sync cycle: push the outbox, then pull-and-merge every table.
 *  Push failures leave the outbox intact for the next cycle (idempotent retry).
 *  Pull merges via LWW on the SERVER updated_at only. */
export async function syncCycle(
  local: LocalStore,
  remote: RemoteClient,
  opts: { tables?: SyncTable[] } = {}
): Promise<SyncResult> {
  const tables = opts.tables ?? TABLES;
  const result: SyncResult = { pushed: 0, pulled: 0, applied: 0, errors: [] };

  // ── PUSH ──────────────────────────────────────────────────────────────────
  // Group the outbox by table and upsert. On success, record the server
  // updated_at (via applyRemote, which also updates the local version) and clear
  // those entries. On failure, keep them queued — the next cycle retries.
  for (const table of tables) {
    const entries = local.outbox().filter((e) => e.table === table);
    if (entries.length === 0) continue;

    const rows: SyncRow[] = [];
    const pushedEntries: OutboxEntry[] = [];
    for (const entry of entries) {
      const row = local.localRow(table, entry.pk);
      if (row === undefined) {
        // The row vanished locally before push; drop the stale outbox entry.
        pushedEntries.push(entry);
        continue;
      }
      rows.push(row);
      pushedEntries.push(entry);
    }

    if (rows.length === 0) {
      local.clearOutbox(pushedEntries); // only vanished rows
      continue;
    }

    try {
      const returned = await remote.upsert(table, rows);
      // Fold the server-authoritative rows back in so local versions match the
      // server clock (prevents the row we just pushed from re-applying on pull).
      for (const row of returned) {
        local.applyRemote(table, row);
        local.setWatermark(table, maxIso(local.watermark(table), row.updated_at));
      }
      local.clearOutbox(pushedEntries);
      result.pushed += rows.length;
    } catch (err) {
      // Leave the outbox intact — retried next cycle. Upserts are idempotent by
      // pk, so re-pushing an already-applied row is harmless.
      result.errors.push(`push ${table}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ── PULL + MERGE (LWW on server updated_at) ─────────────────────────────────
  for (const table of tables) {
    let incoming: SyncRow[];
    try {
      incoming = await remote.pull(table, local.watermark(table));
    } catch (err) {
      result.errors.push(`pull ${table}: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    for (const row of incoming) {
      result.pulled += 1;
      const localVersion = local.rowVersion(table, row.pk);
      // LWW: only apply if the incoming SERVER version is strictly newer than
      // what we already hold. A stale/older server row can never override a
      // newer one, so a delete cannot be resurrected by a laggard write.
      if (localVersion === null || row.updated_at > localVersion) {
        local.applyRemote(table, row);
        result.applied += 1;
      }
      // Advance the watermark past every row we saw, applied or not, so we don't
      // re-fetch it forever.
      local.setWatermark(table, maxIso(local.watermark(table), row.updated_at));
    }
  }

  return result;
}
