// The exhaustive sync matrix the roadmap calls out as "where the bugs live":
// fresh-device pull, two-device LWW convergence, offline queue survives restart,
// idempotent partial-push retry, soft-delete propagation, and — the important
// one — a skewed client clock cannot resurrect a deleted row.

import { describe, it, expect, beforeEach } from "vitest";
import { syncCycle, type SyncTable } from "../sync/engine";
import { FakeServer, FakeLocal } from "./syncFakes";

const RUNS: SyncTable = "runs";

let server: FakeServer;

beforeEach(() => {
  server = new FakeServer();
});

describe("push", () => {
  it("uploads local writes and empties the outbox", async () => {
    const local = new FakeLocal();
    local.writeLocal(RUNS, "r1", { totalTime: 1.8 });
    local.writeLocal(RUNS, "r2", { totalTime: 2.1 });

    const res = await syncCycle(local, server);

    expect(res.pushed).toBe(2);
    expect(local.outboxSize()).toBe(0);
    expect(server.row(RUNS, "r1")?.data.totalTime).toBe(1.8);
  });

  it("ignores any client-supplied updated_at — the server stamps its own", async () => {
    const local = new FakeLocal();
    // Poison the local row with a far-future client timestamp.
    local.rows[RUNS].set("r1", { pk: "r1", data: { totalTime: 1 }, updated_at: "2999-01-01T00:00:00.000Z", deleted_at: null });
    (local as unknown as { outboxEntries: { table: SyncTable; pk: string }[] }).outboxEntries = [{ table: RUNS, pk: "r1" }];

    await syncCycle(local, server);

    expect(server.row(RUNS, "r1")!.updated_at.startsWith("2026")).toBe(true);
  });
});

describe("fresh-device pull", () => {
  it("rebuilds identical local state from the server", async () => {
    // Device A creates data and pushes.
    const a = new FakeLocal();
    a.writeLocal(RUNS, "r1", { totalTime: 1.8 });
    a.writeLocal(RUNS, "r2", { totalTime: 2.1 });
    await syncCycle(a, server);

    // Fresh device B pulls from empty.
    const b = new FakeLocal();
    const res = await syncCycle(b, server);

    expect(res.applied).toBe(2);
    expect(b.data(RUNS, "r1")?.totalTime).toBe(1.8);
    expect(b.data(RUNS, "r2")?.totalTime).toBe(2.1);
    // A pk we already hold isn't re-applied on the next cycle.
    const res2 = await syncCycle(b, server);
    expect(res2.applied).toBe(0);
  });
});

describe("two-device last-write-wins convergence", () => {
  it("the later server write wins on both devices", async () => {
    const a = new FakeLocal();
    a.writeLocal(RUNS, "r1", { totalTime: 1.8 });
    await syncCycle(a, server); // r1 @ server v1

    const b = new FakeLocal();
    await syncCycle(b, server); // b pulls r1 v1

    // Both edit r1; A pushes first, then B. B is the later server write.
    a.writeLocal(RUNS, "r1", { totalTime: 1.6 });
    await syncCycle(a, server);
    b.writeLocal(RUNS, "r1", { totalTime: 1.5 });
    await syncCycle(b, server);

    // Pull everything back on both.
    await syncCycle(a, server);
    await syncCycle(b, server);

    expect(a.data(RUNS, "r1")?.totalTime).toBe(1.5);
    expect(b.data(RUNS, "r1")?.totalTime).toBe(1.5);
    expect(server.row(RUNS, "r1")?.data.totalTime).toBe(1.5);
  });
});

describe("offline queue survives restart", () => {
  it("a queued write with no server reaches the server after 'restart'", async () => {
    const local = new FakeLocal();
    local.writeLocal(RUNS, "r1", { totalTime: 1.8 });

    // "Offline": the server rejects the push.
    server.failOnce();
    const offline = await syncCycle(local, server);
    expect(offline.errors.length).toBe(1);
    expect(local.outboxSize()).toBe(1); // still queued

    // Simulate a process restart: the outbox is persistent, so a NEW LocalStore
    // would be rehydrated with the same entry. Here the same instance stands in;
    // the point is the entry survived the failure. Reconnect and sync.
    const online = await syncCycle(local, server);
    expect(online.pushed).toBe(1);
    expect(local.outboxSize()).toBe(0);
    expect(server.row(RUNS, "r1")).toBeDefined();
  });
});

describe("partial-push failure retries idempotently", () => {
  it("re-pushing an already-applied row does not duplicate or corrupt it", async () => {
    const local = new FakeLocal();
    local.writeLocal(RUNS, "r1", { totalTime: 1.8 });

    server.failOnce();
    await syncCycle(local, server); // fails, stays queued
    await syncCycle(local, server); // retries

    expect(server.row(RUNS, "r1")?.data.totalTime).toBe(1.8);
    // Upsert is keyed by pk — exactly one row exists regardless of retries.
    const pulled = await server.pull(RUNS, null);
    expect(pulled.filter((r) => r.pk === "r1")).toHaveLength(1);
  });
});

describe("soft delete propagates", () => {
  it("a delete on one device removes the row on another", async () => {
    const a = new FakeLocal();
    a.writeLocal(RUNS, "r1", { totalTime: 1.8 });
    await syncCycle(a, server);

    const b = new FakeLocal();
    await syncCycle(b, server);
    expect(b.isDeleted(RUNS, "r1")).toBe(false);

    // A soft-deletes r1 and syncs.
    a.writeLocal(RUNS, "r1", { totalTime: 1.8 }, "2026-01-01T00:00:00.000Z");
    await syncCycle(a, server);

    // B pulls the delete.
    const res = await syncCycle(b, server);
    expect(res.applied).toBe(1);
    expect(b.isDeleted(RUNS, "r1")).toBe(true);
  });
});

describe("clock skew cannot resurrect a deleted row", () => {
  it("an older server row never overrides a newer local version (LWW on server clock)", async () => {
    const a = new FakeLocal();
    a.writeLocal(RUNS, "r1", { totalTime: 1.8 });
    await syncCycle(a, server); // r1 v1

    const b = new FakeLocal();
    await syncCycle(b, server); // b holds r1 v1

    // A deletes r1 (server stamps a LATER version).
    a.writeLocal(RUNS, "r1", { totalTime: 1.8 }, "2026-01-01T00:00:00.000Z");
    await syncCycle(a, server);

    // B pulls the delete — now B's version of r1 is the delete's server clock.
    await syncCycle(b, server);
    expect(b.isDeleted(RUNS, "r1")).toBe(true);
    const deletedVersion = b.rowVersion(RUNS, "r1")!;

    // Now a laggard/skewed re-delivery of the OLD (pre-delete) row arrives with
    // an EARLIER server updated_at. It must NOT win — the row stays deleted.
    const stale = { pk: "r1", data: { totalTime: 1.8 }, deleted_at: null, updated_at: "2026-01-01T00:00:01.000Z" };
    const staleServer = {
      async upsert() { return []; },
      async pull(table: SyncTable) { return table === RUNS ? [stale] : []; },
    };
    const res = await syncCycle(b, staleServer, { tables: [RUNS] });
    expect(res.applied).toBe(0); // rejected: stale.updated_at < deletedVersion
    expect(b.isDeleted(RUNS, "r1")).toBe(true);
    expect(b.rowVersion(RUNS, "r1")).toBe(deletedVersion);
    expect(stale.updated_at < deletedVersion).toBe(true); // sanity: it really is older
  });

  it("a client with a wildly wrong clock still can't push a winning timestamp", async () => {
    const skewed = new FakeLocal();
    // Client clock is a year ahead; the poisoned updated_at is far in the future.
    skewed.rows[RUNS].set("r1", { pk: "r1", data: { totalTime: 9 }, updated_at: "2999-01-01T00:00:00.000Z", deleted_at: null });
    (skewed as unknown as { outboxEntries: { table: SyncTable; pk: string }[] }).outboxEntries = [{ table: RUNS, pk: "r1" }];
    await syncCycle(skewed, server);

    // The server-stored version is on the server's 2026 clock, not 2999.
    expect(server.row(RUNS, "r1")!.updated_at.startsWith("2026")).toBe(true);
    // A second device sees the real (server) ordering, unaffected by the skew.
    const other = new FakeLocal();
    await syncCycle(other, server);
    expect(other.data(RUNS, "r1")?.totalTime).toBe(9);
  });
});

describe("watermark", () => {
  it("advances so unchanged rows aren't re-pulled every cycle", async () => {
    const a = new FakeLocal();
    a.writeLocal(RUNS, "r1", { totalTime: 1 });
    await syncCycle(a, server);

    const b = new FakeLocal();
    await syncCycle(b, server); // applies r1
    const res2 = await syncCycle(b, server); // nothing new
    expect(res2.pulled).toBe(0);

    // A new row on A shows up on B's next pull, but the old one does not re-pull.
    a.writeLocal(RUNS, "r2", { totalTime: 2 });
    await syncCycle(a, server);
    const res3 = await syncCycle(b, server);
    expect(res3.pulled).toBe(1);
    expect(res3.applied).toBe(1);
  });
});
