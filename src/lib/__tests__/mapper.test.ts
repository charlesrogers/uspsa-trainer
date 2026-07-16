// The mapper is the one place camelCase models meet snake_case rows. A single
// wrong column name here silently drops a field on every sync. Round-trip every
// type and pin the exact column names.

import { describe, it, expect } from "vitest";
import {
  profileToDb, profileFromDb, sessionToDb, sessionFromDb,
  runToDb, runFromDb, planToDb, planFromDb,
} from "../sync/mapper";
import { makeRun, makeSession } from "./harness";
import type { UserProfile } from "../store";

const USER = "11111111-1111-1111-1111-111111111111";

const profile: UserProfile = {
  displayName: "Charles", uspsa_number: "A1234", classification: "B",
  targetClassification: "A", division: "Carry Optics", equipment: "PDP",
  optic: "red_dot", dailyXpGoal: 45,
};

describe("profile mapping", () => {
  it("round-trips losslessly", () => {
    expect(profileFromDb(profileToDb(profile, USER))).toEqual(profile);
  });

  it("uses snake_case columns and carries the user id", () => {
    const row = profileToDb(profile, USER);
    expect(row.user_id).toBe(USER);
    expect(row.display_name).toBe("Charles");
    expect(row.target_classification).toBe("A");
    expect(row.daily_xp_goal).toBe(45);
    // Never client-set — the DB trigger owns these.
    expect(row.updated_at).toBeUndefined();
  });

  it("defends the optic enum on read", () => {
    expect(profileFromDb({ ...profileToDb(profile, USER), optic: "garbage" }).optic).toBe("iron");
  });
});

describe("session mapping", () => {
  it("round-trips, including a null ended_at", () => {
    const s = makeSession({ id: "s1", endedAt: null });
    expect(sessionFromDb(sessionToDb(s, USER))).toEqual(s);
  });

  it("preserves an ended session", () => {
    const s = makeSession({ id: "s1", endedAt: "2026-06-01T10:00:00.000Z" });
    expect(sessionFromDb(sessionToDb(s, USER))).toEqual(s);
  });

  it("maps snake_case fields", () => {
    const row = sessionToDb(makeSession({ id: "s1" }), USER);
    expect(row.started_at).toBeTruthy();
    expect(row.fire_mode).toBe("live_fire");
    expect(row.user_id).toBe(USER);
  });
});

describe("run mapping", () => {
  it("round-trips a full live-fire run", () => {
    const r = makeRun({ id: "r1", splits: [0.22, 0.25, 0.3], pointsDown: 3, firstShotTime: 1.1 });
    expect(runFromDb(runToDb(r, USER))).toEqual(r);
  });

  it("round-trips a dry-fire run with nulls", () => {
    const r = makeRun({
      id: "r2", fireMode: "dry_fire", pointsDown: null, dryFireCallPct: 80,
      firstShotTime: null, splits: [],
    });
    expect(runFromDb(runToDb(r, USER))).toEqual(r);
  });

  it("coerces numeric/jsonb columns back to numbers", () => {
    // Postgres numeric can arrive as a string; splits as jsonb. Both must
    // become real numbers, not strings.
    const r = makeRun({ id: "r3", distanceYards: 7, totalTime: 2.0, splits: [0.25] });
    const row = runToDb(r, USER);
    const wireish = {
      ...row,
      distance_yards: "7" as unknown as number,
      total_time: "2.0" as unknown as number,
      first_shot_time: "1.0" as unknown as number,
      splits: ["0.25"] as unknown as number[],
    };
    const back = runFromDb(wireish);
    expect(back.distanceYards).toBe(7);
    expect(back.totalTime).toBe(2.0);
    expect(back.firstShotTime).toBe(1.0);
    expect(back.splits).toEqual([0.25]);
    expect(typeof back.splits[0]).toBe("number");
  });

  it("maps snake_case columns and the session foreign key", () => {
    const row = runToDb(makeRun({ id: "r1", sessionId: "s9" }), USER);
    expect(row.session_id).toBe("s9");
    expect(row.drill_id).toBe("dr-pairs");
    expect(row.run_number).toBeTypeOf("number");
    expect(row.is_valid).toBe(true);
    expect(row.dry_fire_call_pct).toBeNull();
    expect(row.user_id).toBe(USER);
  });
});

describe("plan (kv) mapping", () => {
  it("round-trips an arbitrary json value", () => {
    const value = { totalMinutes: 30, drills: [{ drillId: "dr-pairs", reps: 3 }] };
    const row = planToDb("session_plan", value, USER);
    expect(row).toEqual({ user_id: USER, key: "session_plan", value });
    expect(planFromDb(row)).toEqual({ key: "session_plan", value });
  });
});
