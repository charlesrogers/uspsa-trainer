// In-memory fakes for the sync engine tests. The server fake models the two
// invariants that make sync safe: it stamps updated_at with ITS OWN monotonic
// clock (ignoring any client-supplied value), and it filters pulls by that
// server clock. The local fake models the IndexedDB mirror + outbox + versions.

import type {
  RemoteClient, LocalStore, SyncRow, SyncTable, OutboxEntry,
} from "../sync/engine";

/** A Supabase stand-in with a controllable monotonic clock. */
export class FakeServer implements RemoteClient {
  private tables: Record<string, Map<string, SyncRow>> = {
    profiles: new Map(), sessions: new Map(), runs: new Map(), plans: new Map(),
  };
  private clock = 0;
  public upsertCalls = 0;
  private failNextUpsert = false;

  /** Force the next upsert() to throw, to test partial-push retry. */
  failOnce() {
    this.failNextUpsert = true;
  }

  private stamp(): string {
    // Monotonic ISO the server controls. Client timestamps are never used.
    this.clock += 1;
    return `2026-01-01T00:00:${String(this.clock).padStart(2, "0")}.000Z`;
  }

  async upsert(table: SyncTable, rows: SyncRow[]): Promise<SyncRow[]> {
    this.upsertCalls += 1;
    if (this.failNextUpsert) {
      this.failNextUpsert = false;
      throw new Error("simulated network failure");
    }
    const store = this.tables[table];
    const out: SyncRow[] = [];
    for (const row of rows) {
      // SERVER assigns updated_at — the client's row.updated_at is discarded.
      const stamped: SyncRow = {
        pk: row.pk,
        data: row.data,
        deleted_at: row.deleted_at,
        updated_at: this.stamp(),
      };
      store.set(row.pk, stamped);
      out.push(stamped);
    }
    return out;
  }

  async pull(table: SyncTable, sinceExclusive: string | null): Promise<SyncRow[]> {
    return [...this.tables[table].values()]
      .filter((r) => sinceExclusive === null || r.updated_at > sinceExclusive)
      .sort((a, b) => a.updated_at.localeCompare(b.updated_at));
  }

  /** Test introspection. */
  row(table: SyncTable, pk: string): SyncRow | undefined {
    return this.tables[table].get(pk);
  }
}

/** An IndexedDB-mirror stand-in: rows, per-row server version, outbox, watermark. */
export class FakeLocal implements LocalStore {
  rows: Record<string, Map<string, SyncRow>> = {
    profiles: new Map(), sessions: new Map(), runs: new Map(), plans: new Map(),
  };
  private versions: Record<string, Map<string, string>> = {
    profiles: new Map(), sessions: new Map(), runs: new Map(), plans: new Map(),
  };
  private outboxEntries: OutboxEntry[] = [];
  private watermarks: Partial<Record<SyncTable, string>> = {};

  // ── local mutations (what the app would do) ──

  /** Simulate a local write: set the row and enqueue it. deleted_at optional. */
  writeLocal(table: SyncTable, pk: string, data: Record<string, unknown>, deletedAt: string | null = null) {
    this.rows[table].set(pk, { pk, data, updated_at: "", deleted_at: deletedAt });
    if (!this.outboxEntries.some((e) => e.table === table && e.pk === pk)) {
      this.outboxEntries.push({ table, pk });
    }
  }

  // ── LocalStore interface ──

  outbox(): OutboxEntry[] {
    return [...this.outboxEntries];
  }
  clearOutbox(entries: OutboxEntry[]): void {
    this.outboxEntries = this.outboxEntries.filter(
      (e) => !entries.some((x) => x.table === e.table && x.pk === e.pk)
    );
  }
  localRow(table: SyncTable, pk: string): SyncRow | undefined {
    return this.rows[table].get(pk);
  }
  rowVersion(table: SyncTable, pk: string): string | null {
    return this.versions[table].get(pk) ?? null;
  }
  applyRemote(table: SyncTable, row: SyncRow): void {
    this.rows[table].set(row.pk, row);
    this.versions[table].set(row.pk, row.updated_at);
  }
  watermark(table: SyncTable): string | null {
    return this.watermarks[table] ?? null;
  }
  setWatermark(table: SyncTable, iso: string): void {
    this.watermarks[table] = iso;
  }

  // ── introspection ──
  isDeleted(table: SyncTable, pk: string): boolean {
    return this.rows[table].get(pk)?.deleted_at != null;
  }
  data(table: SyncTable, pk: string): Record<string, unknown> | undefined {
    return this.rows[table].get(pk)?.data;
  }
  outboxSize(): number {
    return this.outboxEntries.length;
  }
}
