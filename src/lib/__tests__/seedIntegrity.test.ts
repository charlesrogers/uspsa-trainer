// Seed-data integrity. This test is load-bearing forever.
//
// The corpus IS the product's credibility. A dangling reference here does not
// crash the app — it silently drops signals, dead-ends the assessment flow, or
// makes a drill un-scoreable for a whole classification. Those failures are
// invisible at runtime, which is exactly why they belong in CI.

import { describe, it, expect } from "vitest";
import { drills, skills, drillSkillMaps, allBenchmarks, sources } from "../store";
import { getAssessmentDrillIds } from "../assessment";

const drillIds = new Set(drills.map(d => d.id));
const skillIds = new Set(skills.map(s => s.id));
const sourceIds = new Set(sources.map(s => s.id));
const CLASSIFICATIONS = ["C", "B", "A", "M", "GM"] as const;

describe("referential integrity", () => {
  it("every drill points at a real source", () => {
    const broken = drills.filter(d => !sourceIds.has(d.sourceId)).map(d => `${d.id} -> ${d.sourceId}`);
    expect(broken).toEqual([]);
  });

  it("every drillSkillMap.drillId exists in drills", () => {
    const broken = [...new Set(drillSkillMaps.filter(m => !drillIds.has(m.drillId)).map(m => m.drillId))];
    expect(broken).toEqual([]);
  });

  it("every drillSkillMap.skillId exists in skills", () => {
    const broken = [...new Set(drillSkillMaps.filter(m => !skillIds.has(m.skillId)).map(m => m.skillId))];
    expect(broken).toEqual([]);
  });

  it("every benchmark.drillId exists in drills", () => {
    const broken = [...new Set(allBenchmarks.filter(b => !drillIds.has(b.drillId)).map(b => b.drillId))];
    expect(broken).toEqual([]);
  });

  it("every skill.parentId refers to a real skill", () => {
    const broken = skills
      .filter(s => s.parentId !== null && !skillIds.has(s.parentId))
      .map(s => `${s.id} -> ${s.parentId}`);
    expect(broken).toEqual([]);
  });

  it("every declared prerequisite refers to a real skill", () => {
    const broken = skills.flatMap(s =>
      (s.prerequisites ?? []).filter(p => !skillIds.has(p)).map(p => `${s.id} -> ${p}`)
    );
    expect(broken).toEqual([]);
  });

  it("skill ids and drill ids are unique", () => {
    expect(skills.length).toBe(skillIds.size);
    expect(drills.length).toBe(drillIds.size);
  });
});

describe("skill hierarchy is a DAG", () => {
  it("the parent chain has no cycles and terminates at a root", () => {
    const parentOf = new Map(skills.map(s => [s.id, s.parentId]));
    const cyclic: string[] = [];

    for (const skill of skills) {
      const seen = new Set<string>([skill.id]);
      let cursor = parentOf.get(skill.id) ?? null;
      while (cursor) {
        if (seen.has(cursor)) {
          cyclic.push(`${skill.id} (cycle at ${cursor})`);
          break;
        }
        seen.add(cursor);
        cursor = parentOf.get(cursor) ?? null;
      }
    }
    expect(cyclic).toEqual([]);
  });

  it("no skill is its own parent", () => {
    expect(skills.filter(s => s.parentId === s.id).map(s => s.id)).toEqual([]);
  });

  it("prerequisite edges do not form a cycle", () => {
    const prereqs = new Map(skills.map(s => [s.id, s.prerequisites ?? []]));
    const state = new Map<string, "visiting" | "done">();
    const cycles: string[] = [];

    const visit = (id: string, path: string[]) => {
      if (state.get(id) === "done") return;
      if (state.get(id) === "visiting") {
        cycles.push([...path, id].join(" -> "));
        return;
      }
      state.set(id, "visiting");
      for (const next of prereqs.get(id) ?? []) {
        if (skillIds.has(next)) visit(next, [...path, id]);
      }
      state.set(id, "done");
    };

    for (const s of skills) visit(s.id, []);
    expect(cycles).toEqual([]);
  });
});

describe("drill/benchmark sanity", () => {
  it("every benchmark target time is positive", () => {
    const broken = allBenchmarks.filter(b => !(b.targetTime > 0)).map(b => `${b.drillId}/${b.classification}`);
    expect(broken).toEqual([]);
  });

  it("encompassing weights sit in (0, 1]", () => {
    const broken = drillSkillMaps
      .filter(m => !(m.encompassingWeight > 0 && m.encompassingWeight <= 1))
      .map(m => `${m.drillId}/${m.skillId} = ${m.encompassingWeight}`);
    expect(broken).toEqual([]);
  });

  it("a faster classification is never slower than a lower one at the same drill/distance", () => {
    // GM should be at least as fast as M, M as A, and so on.
    const order = ["C", "B", "A", "M", "GM"];
    const violations: string[] = [];

    for (const b of allBenchmarks) {
      const idx = order.indexOf(b.classification);
      if (idx <= 0) continue;
      const lower = allBenchmarks.find(
        x => x.drillId === b.drillId && x.fireMode === b.fireMode &&
             x.distanceYards === b.distanceYards && x.classification === order[idx - 1]
      );
      if (lower && b.targetTime > lower.targetTime) {
        violations.push(
          `${b.drillId} @${b.distanceYards}yd ${b.fireMode}: ${b.classification} ${b.targetTime}s is SLOWER than ${lower.classification} ${lower.targetTime}s`
        );
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("the assessment flow cannot dead-end", () => {
  it.each(["dry_fire", "live_fire"] as const)(
    "%s battery drills all exist in the corpus",
    fireMode => {
      const missing = getAssessmentDrillIds(fireMode).filter(id => !drillIds.has(id));
      expect(missing).toEqual([]);
    }
  );

  it.each(["dry_fire", "live_fire"] as const)(
    "%s battery drills each map to at least one skill",
    fireMode => {
      const unmapped = getAssessmentDrillIds(fireMode).filter(
        id => !drillSkillMaps.some(m => m.drillId === id)
      );
      expect(unmapped).toEqual([]);
    }
  );
});

describe("every drill is reachable by the engine", () => {
  it("each drill maps to at least one skill (otherwise it can never be recommended)", () => {
    const unmapped = drills.filter(d => !drillSkillMaps.some(m => m.drillId === d.id)).map(d => d.id);
    expect(unmapped).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// ⛔ KNOWN CORPUS GAPS — QUARANTINED, AWAITING CHARLES'S SIGN-OFF
//
// These checks FAIL against the corpus as it ships today. Per the roadmap,
// seed.ts is not mine to change: "Never change benchmark numbers, drill
// definitions, encompassing weights, or skill-graph structure in seed.ts
// except where a milestone explicitly says to, and then only with Charles's
// sign-off on the specific numbers."
//
// They are marked `it.fails()`, which asserts they are CURRENTLY BROKEN. CI
// stays green, the gap stays visible, and the moment the corpus is fixed these
// flip to failing — forcing whoever fixes it to delete the quarantine marker
// and promote them back into the suite above. No silent skips.
// ────────────────────────────────────────────────────────────────────────────
describe("KNOWN CORPUS GAPS (quarantined — see M8)", () => {
  it.fails("GAP: there are no C or A benchmarks anywhere in the corpus", () => {
    // Only B, M and GM have benchmarks (111 / 99 / 120). A user whose target
    // classification is C or A gets ZERO signals from every run they ever log:
    // findBenchmark() returns undefined, collectSignals() skips the run, and
    // the whole app reads 0% mastery with no error shown.
    const missing = CLASSIFICATIONS.filter(c => !allBenchmarks.some(b => b.classification === c));
    expect(missing).toEqual([]);
  });

  it.fails("GAP: 52 of 81 drills have no benchmark, so runs on them produce no signal", () => {
    const unbenchmarked = drills.filter(d => !allBenchmarks.some(b => b.drillId === d.id)).map(d => d.id);
    expect(unbenchmarked).toEqual([]);
  });

  it.fails("GAP: dr-distance-changeup and dr-mxad are benchmarked at 7yd, a distance they do not offer", () => {
    const broken: string[] = [];
    for (const b of allBenchmarks) {
      const drill = drills.find(d => d.id === b.drillId);
      if (drill && !drill.distances.includes(b.distanceYards)) {
        broken.push(`${b.drillId} @ ${b.distanceYards}yd (${b.fireMode}, ${b.classification})`);
      }
    }
    expect(broken).toEqual([]);
  });

  it.fails.each(["dry_fire", "live_fire"] as const)(
    "GAP: %s battery drills lack a 7yd benchmark for every classification",
    fireMode => {
      // Falls out of the no-C/no-A gap above: a C-class shooter can finish the
      // whole cold-start assessment and still be told nothing.
      const gaps: string[] = [];
      for (const drillId of getAssessmentDrillIds(fireMode)) {
        for (const classification of CLASSIFICATIONS) {
          const bm = allBenchmarks.find(
            b => b.drillId === drillId && b.fireMode === fireMode &&
                 b.distanceYards === 7 && b.classification === classification
          );
          if (!bm) gaps.push(`${drillId} @7yd ${fireMode} — no ${classification} benchmark`);
        }
      }
      expect(gaps).toEqual([]);
    }
  );
});
