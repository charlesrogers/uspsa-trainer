// Characterization tests for the PractiScore importer.
// Fixtures are synthesised from the parser's own alias table and branches.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { installBrowserEnv, uninstallBrowserEnv } from "./harness";
import {
  parsePractiScoreCSV, detectFormat, convertToSessionRuns,
  getImportedMatches, addImportedMatch, deleteImportedMatch, isDuplicateMatch,
} from "../practiscoreImport";
import { drills } from "../store";

beforeEach(() => installBrowserEnv());
afterEach(() => uninstallBrowserEnv());

const CSV = [
  "Stage,Stage Number,Time,HF,A,C,D,M,NS,Proc,Points,Max Points,Stage %",
  "Speed Shoot,1,4.50,6.6667,10,2,0,0,0,0,30,50,85.5",
  "Field Course,2,18.20,5.4945,24,6,2,0,1,1,100,160,72.1",
].join("\n");

describe("detectFormat", () => {
  it("recognises csv, tsv, and neither", () => {
    expect(detectFormat("a,b,c\n1,2,3")).toBe("csv");
    expect(detectFormat("a\tb\tc\n1\t2\t3")).toBe("tsv");
    expect(detectFormat("just one column")).toBe("unknown");
  });
});

describe("parsePractiScoreCSV", () => {
  it("parses a comma-delimited match", () => {
    const { match, warnings } = parsePractiScoreCSV(CSV);
    expect(warnings).toEqual([]);
    expect(match.stages).toHaveLength(2);

    const [s1, s2] = match.stages;
    expect(s1.stageName).toBe("Speed Shoot");
    expect(s1.time).toBe(4.5);
    expect(s1.aHits).toBe(10);
    expect(s1.points).toBe(30);
    expect(s2.stageNumber).toBe(2);
    expect(s2.noShoots).toBe(1);
    expect(s2.procedurals).toBe(1);
  });

  it("handles tab and semicolon delimiters", () => {
    const tsv = CSV.replace(/,/g, "\t");
    expect(parsePractiScoreCSV(tsv).match.stages).toHaveLength(2);
    const ssv = CSV.replace(/,/g, ";");
    expect(parsePractiScoreCSV(ssv).match.stages).toHaveLength(2);
  });

  it("handles quoted fields containing the delimiter and escaped quotes", () => {
    const csv = [
      "Stage,Time,A",
      '"Stage 1, The Wall",4.50,10',
      '"He said ""go""",3.00,6',
    ].join("\n");
    const { match } = parsePractiScoreCSV(csv);
    expect(match.stages[0].stageName).toBe("Stage 1, The Wall");
    expect(match.stages[1].stageName).toBe('He said "go"');
  });

  it("matches headers case-insensitively and through aliases", () => {
    const csv = ["STAGE NAME,RAW TIME,ALPHA,CHARLIE", "Stage 1,4.50,10,2"].join("\n");
    const { match } = parsePractiScoreCSV(csv);
    expect(match.stages[0].stageName).toBe("Stage 1");
    expect(match.stages[0].time).toBe(4.5);
    expect(match.stages[0].aHits).toBe(10);
    expect(match.stages[0].cHits).toBe(2);
  });

  it("derives points, maxPoints and hit factor when the columns are absent", () => {
    const csv = ["Stage,Time,A,C,D", "Stage 1,5.00,8,2,0"].join("\n");
    const s = parsePractiScoreCSV(csv).match.stages[0];
    expect(s.points).toBe(8 * 5 + 2 * 4); // 48
    expect(s.maxPoints).toBe(10 * 5); // 50
    expect(s.hitFactor).toBeCloseTo(48 / 5, 4);
  });

  it("numbers unnamed stages sequentially", () => {
    const csv = ["Time,A", "4.50,10", "5.00,10"].join("\n");
    const { match } = parsePractiScoreCSV(csv);
    expect(match.stages.map(s => s.stageName)).toEqual(["Stage 1", "Stage 2"]);
    expect(match.stages.map(s => s.stageNumber)).toEqual([1, 2]);
  });

  it("sorts stages by stage number", () => {
    const csv = ["Stage,Stg #,Time", "Third,3,5.0", "First,1,4.0", "Second,2,4.5"].join("\n");
    const { match } = parsePractiScoreCSV(csv);
    expect(match.stages.map(s => s.stageName)).toEqual(["First", "Second", "Third"]);
  });

  it("skips rows with a zero or missing time, and warns", () => {
    const csv = ["Stage,Time,A", "Good,4.50,10", "Bad,0,10", "AlsoBad,,10"].join("\n");
    const { match, warnings } = parsePractiScoreCSV(csv);
    expect(match.stages).toHaveLength(1);
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toMatch(/Skipped/);
  });

  it("computes an overall hit factor across stages", () => {
    const { match } = parsePractiScoreCSV(CSV);
    const totalPoints = 30 + 100;
    const totalTime = 4.5 + 18.2;
    expect(match.overallHF).toBeCloseTo(totalPoints / totalTime, 3);
  });

  it("applies overrides and falls back to sane defaults", () => {
    const withOverrides = parsePractiScoreCSV(CSV, {
      matchName: "Area 5", matchDate: "2026-06-01", division: "Production",
    }).match;
    expect(withOverrides.matchName).toBe("Area 5");
    expect(withOverrides.matchDate).toBe("2026-06-01");
    expect(withOverrides.division).toBe("Production");

    const bare = parsePractiScoreCSV(CSV).match;
    expect(bare.matchName).toBe("Imported Match");
    expect(bare.division).toBe("Unknown");
    expect(bare.matchDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("detects the division from the data when not overridden", () => {
    const csv = ["Stage,Time,Division", "Stage 1,4.5,Limited"].join("\n");
    expect(parsePractiScoreCSV(csv).match.division).toBe("Limited");
  });

  describe("rejections", () => {
    it("throws on a file with no data rows", () => {
      expect(() => parsePractiScoreCSV("Stage,Time,A")).toThrow(/at least a header row/i);
    });

    it("throws when there is no Time column", () => {
      expect(() => parsePractiScoreCSV("Stage,A,C\nStage 1,10,2")).toThrow(/Time.*column/i);
    });

    it("throws when every row is skipped", () => {
      expect(() => parsePractiScoreCSV("Stage,Time\nStage 1,0")).toThrow(/No valid stage data/i);
    });
  });
});

describe("convertToSessionRuns", () => {
  const { match } = parsePractiScoreCSV(CSV, { matchName: "Area 5", matchDate: "2026-06-01" });

  it("builds one closed live-fire session dated to the match", () => {
    const { session } = convertToSessionRuns(match);
    expect(session.fireMode).toBe("live_fire");
    expect(session.location).toBe("Area 5");
    expect(session.startedAt).toBe(session.endedAt);
    expect(session.startedAt.slice(0, 10)).toBe("2026-06-01");
  });

  it("emits one run per stage, marking only the first as cold", () => {
    const { runs } = convertToSessionRuns(match);
    expect(runs).toHaveLength(2);
    expect(runs.map(r => r.isCold)).toEqual([true, false]);
    expect(runs.map(r => r.totalTime)).toEqual([4.5, 18.2]);
    expect(runs.every(r => r.fireMode === "live_fire" && r.isValid)).toBe(true);
  });

  it("scores points-down as C=1, D=3, M=10, NS=10", () => {
    const { runs } = convertToSessionRuns(match);
    expect(runs[0].pointsDown).toBe(2 * 1); // 2C
    expect(runs[1].pointsDown).toBe(6 * 1 + 2 * 3 + 0 * 10 + 1 * 10); // 6C, 2D, 1NS
  });

  it("buckets stages into short/medium/long pseudo-drills by round count", () => {
    const csv = [
      "Stage,Time,A",
      "Short,4.0,6",    // 6 rounds  -> short
      "Medium,9.0,12",  // 12 rounds -> medium
      "Long,20.0,24",   // 24 rounds -> long
    ].join("\n");
    const { runs } = convertToSessionRuns(parsePractiScoreCSV(csv).match);
    expect(runs.map(r => r.drillId)).toEqual([
      "match-stage-short", "match-stage-medium", "match-stage-long",
    ]);
  });

  // ⚠️ KNOWN GAP, pinned deliberately (see M7 in the roadmap).
  // The importer invents drill ids that do not exist in the corpus, so imported
  // match runs produce ZERO skill signals and ZERO round counts. This test
  // documents the current, broken reality — it is not an endorsement of it.
  it("KNOWN GAP: the pseudo-drill ids are absent from the corpus", () => {
    const ids = ["match-stage-short", "match-stage-medium", "match-stage-long"];
    for (const id of ids) {
      expect(drills.find(d => d.id === id)).toBeUndefined();
    }
  });

  it("estimates round count from hits, then max points, then a default of 10", () => {
    const fromHits = convertToSessionRuns(
      parsePractiScoreCSV(["Stage,Time,A,C,M", "S,5.0,6,2,1"].join("\n")).match
    );
    expect(fromHits.totalRounds).toBe(9); // 6A + 2C + 1M

    const fromMaxPoints = convertToSessionRuns(
      parsePractiScoreCSV(["Stage,Time,Max Points", "S,5.0,60"].join("\n")).match
    );
    expect(fromMaxPoints.totalRounds).toBe(12); // 60 / 5

    const fallback = convertToSessionRuns(
      parsePractiScoreCSV(["Stage,Time", "S,5.0"].join("\n")).match
    );
    expect(fallback.totalRounds).toBe(10);
  });
});

describe("imported-match registry", () => {
  it("starts empty, adds newest-first, dedupes and deletes", () => {
    expect(getImportedMatches()).toEqual([]);

    const base = { division: "Production", stageCount: 2, sessionId: "s1", importedAt: new Date().toISOString() };
    addImportedMatch({ id: "m1", matchName: "Area 5", matchDate: "2026-06-01", ...base });
    addImportedMatch({ id: "m2", matchName: "Area 6", matchDate: "2026-07-01", ...base });

    expect(getImportedMatches().map(m => m.id)).toEqual(["m2", "m1"]);
    expect(isDuplicateMatch("Area 5", "2026-06-01")).toBe(true);
    expect(isDuplicateMatch("Area 5", "2026-06-02")).toBe(false);

    deleteImportedMatch("m1");
    expect(getImportedMatches().map(m => m.id)).toEqual(["m2"]);
  });
});
