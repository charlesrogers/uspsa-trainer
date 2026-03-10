# USPSA Trainer — Knowledge Graph & Mastery Model Spec

## How We Approximate Math Academy's System for Practical Shooting

---

## 1. What Math Academy Does

[Math Academy](https://www.mathacademy.com/how-our-ai-works) is a mastery-based learning platform built on three core innovations:

1. **Knowledge Graph** — A directed graph of ~1,000+ math topics connected by prerequisite relationships. Each topic has weighted edges to its prerequisites.

2. **Student Knowledge Profile** — The system overlays a student's answer history onto the graph, computing per-topic mastery and confidence. A custom spaced repetition algorithm (FIRe — Fractional Implicit Repetition) determines when each topic needs review.

3. **Task Selection Algorithm** — Given the student's knowledge profile and the graph, the system picks the optimal next task to maximize learning per unit time.

### Key Math Academy Concepts We Borrow

| Math Academy Concept | Our Equivalent | Notes |
|---|---|---|
| Topic | Skill | 63 skills in our taxonomy |
| Knowledge Graph (DAG) | Skill hierarchy (parent→child tree) | Simpler: tree not full DAG |
| Prerequisite weight | `encompassingWeight` on DrillSkillMap | 0.6–1.0 scale |
| Diagnostic exam | Assessment battery | 4–6 baseline drills at 7yd |
| Student knowledge profile | `SkillEstimate[]` | mastery, confidence, trend per skill |
| FIRe (implicit repetition) | Parent-child aggregation + drill-skill fan-out | Simplified version |
| Task selection algorithm | Recommendation engine | Gap-weighted priority scoring |
| Spaced repetition decay | Recency weight: `0.97^days` | ~3%/day exponential decay |
| Course progression / level gates | `levelIntroduced` gating by fundamental mastery | 4 levels, unlocked at 30/50/70% |

---

## 2. Our Knowledge Graph

### 2.1 Skill Taxonomy (63 skills, 8 categories)

```
fundamentals/
├── draw_presentation/
│   ├── grip_establishment
│   ├── presentation_speed
│   └── first_shot
├── grip/
│   ├── recoil_management
│   └── variable_hand_tension
├── trigger_control/
│   ├── press_quality
│   └── reset_management
├── sight_management/
│   ├── sight_tracking
│   └── sight_pickup
├── cadence
├── pacing
├── shot_calling
├── discipline
└── tension

transitions/
├── target_transition/
│   ├── close_transition (≤5yd apart)
│   ├── wide_transition (>5yd apart)
│   └── vertical_transition
├── 90_degree_transition
├── 180_degree_transition
└── vision_speed

reloads/
├── standing_reload
├── reload_on_move
└── reload_in_position_entry

movement/
├── position_entry
├── position_exit
├── mounted_movement
├── unmounted_movement
├── shooting_on_move
├── soft_stop
├── direction_change
└── stage_navigation

stage_craft/
├── stage_planning
├── hit_factor_optimization
├── pressure_shooting
├── classifier_execution
├── port_shooting
└── start_position_management

single_hand/
├── strong_hand_only
├── weak_hand_only
└── one_handed_pickup

confirmation/
├── kinesthetic_alignment
├── color_confirmation
├── full_sight_picture
└── dot_tracking

other/
├── empty_start
├── table_start
└── moving_target
```

**Math Academy parallel:** Their knowledge graph is a full DAG (directed acyclic graph) with ~1,000 topics and ~500,000 possible prerequisite weights. Ours is a simpler tree of 63 skills with 8 top-level categories. The tradeoff: we lose cross-category prerequisite edges (e.g., "trigger control is a prerequisite for shooting on the move") but gain simplicity and interpretability.

### 2.2 Drill → Skill Mappings (the "encompassing weights")

Each drill tests multiple skills with different weights:

```typescript
interface DrillSkillMap {
  drillId: string;
  skillId: string;
  encompassingWeight: number;  // 0.6–1.0
  isPrimary: boolean;
}
```

**Example — Bill Drill (6 shots, 1 target):**
| Skill | Weight | Primary? |
|---|---|---|
| Recoil Management | 1.0 | Yes |
| Grip | 0.9 | No |
| Cadence | 0.8 | No |
| Trigger Control | 0.7 | No |

**Example — Blake Drill (2 shots each on 3 targets):**
| Skill | Weight | Primary? |
|---|---|---|
| Target Transition | 1.0 | Yes |
| Sight Pickup | 0.8 | No |
| Cadence | 0.7 | No |

**Math Academy parallel:** In Math Academy, each topic has encompassing weights to its prerequisites (e.g., "integration by parts" encompasses 0.3 of "integration" and 0.2 of "product rule"). Our `encompassingWeight` on `DrillSkillMap` serves the same purpose — it says "how much credit should this skill get when you complete this drill?"

### 2.3 Benchmarks (the "correct answer")

Where Math Academy has binary right/wrong answers, we have continuous performance benchmarks:

```typescript
interface DrillBenchmark {
  drillId: string;
  classification: "C" | "B" | "A" | "M" | "GM";
  fireMode: "live_fire" | "dry_fire";
  distanceYards: number;
  targetTime: number;        // seconds
  targetAccuracy: string;    // "all A-zone"
}
```

**750+ benchmarks** across 50+ drills × 5 classifications × multiple distances × fire modes.

Performance is measured as `pctOfBenchmark = (benchmarkTime / actualTime) × 100`, capped at 150%. This is analogous to Math Academy's correctness signal, but continuous rather than binary.

---

## 3. Student Knowledge Profile

### 3.1 Skill Estimation Pipeline

This is our equivalent of Math Academy's student model that "takes a student's answers, overlays them on the knowledge graph, and figures out what topics the student knows."

```
SessionRun (raw performance data)
    ↓
collectSignals() — match runs to benchmarks, compute weighted signals
    ↓
SkillSignal[] (per-skill performance observations)
    ↓
aggregateSignals() — weighted average with recency decay
    ↓
SkillEstimate { mastery, confidence, trend }
    ↓
Parent aggregation — fill in parent skills from children
    ↓
CategoryEstimate[] — roll up to 8 high-level categories
```

### 3.2 Signal Collection

For each valid run in history:

1. **Find benchmark** for the drill at the user's target classification + distance + fire mode
2. **Compute performance**: `pctOfBenchmark = (benchmarkTime / actualTime) × 100` (capped at 150%)
3. **Apply weights:**
   - **Recency decay**: `0.97^daysSince` — a run from 30 days ago retains 35% weight, 60 days = 15%
   - **Cold bonus**: `1.2×` for cold (first) runs — these reveal true ownership vs. warmed-up performance
   - **Encompassing weight**: from `DrillSkillMap` — how central is this skill to the drill?
   - **Final signal weight** = `encompassingWeight × recencyDecay × coldBonus`

4. **Fan out to skills** — one run produces signals for every skill the drill maps to

**Math Academy parallel:** Their FIRe algorithm gives "fractional credit" to prerequisite topics when a student completes an advanced topic. Our fan-out from drill → multiple skills via `encompassingWeight` is the same concept: completing a Bill Drill gives full credit to Recoil Management (1.0) and partial credit to Grip (0.9), Cadence (0.8), and Trigger Control (0.7).

### 3.3 Signal Aggregation

Per skill:
- **Mastery** = weighted average of all signals: `Σ(pct × weight) / Σ(weight)`, capped at 100%
- **Confidence** = `min(1.0, signalCount / 5)` — 5 observations = full confidence
- **Trend** (requires 4+ signals): split into recent vs. older halves, compare averages
  - `improving`: recent > older by >5 points
  - `declining`: recent < older by >5 points
  - `stable`: within ±5 points

### 3.4 Parent-Child Aggregation (Simplified FIRe)

For parent skills with no direct signals:
- **Parent mastery** = average of children's mastery
- **Parent confidence** = average of children's confidence

Example: "Draw Presentation" mastery = avg("Grip Establishment", "Presentation Speed", "First Shot")

**Math Academy parallel:** Full FIRe computes fractional implicit repetition credit flowing up the DAG with distance-based decay. Our version is simpler — direct averaging of children — but captures the same principle: mastering sub-skills implies mastery of the parent concept.

### 3.5 What We Don't Do (vs. Math Academy)

| Math Academy Feature | Our Status | Why |
|---|---|---|
| Full DAG with cross-category prerequisites | Tree only | Shooting skills have fewer hard prerequisites than math |
| Per-topic spaced repetition scheduling | No explicit scheduling | Shooters choose their own drills; we recommend, not mandate |
| Fractional credit with time-distance decay | Flat encompassing weight | Simpler; our signal count is lower (3-10 runs vs. hundreds of math problems) |
| Adaptive diagnostic (binary search on graph) | Fixed 4-6 drill battery | Small enough skill space that brute-force coverage works |
| 500,000+ prerequisite weights | ~200 drill-skill mappings | Domain is smaller |

---

## 4. Assessment System (Diagnostic Exam)

### 4.1 Purpose

Math Academy opens with an adaptive diagnostic exam that "leverages the knowledge graph to minimize the number of questions needed to estimate a student's knowledge profile." Our assessment serves the same purpose with a fixed battery.

### 4.2 Assessment Batteries

**Live Fire (6 drills at 7 yards):**
| Drill | Skills Seeded |
|---|---|
| Pairs | Draw speed, cadence |
| Bill Drill | Grip, recoil control |
| Blake Drill | Transitions, sight pickup |
| 4 Aces | Reload speed |
| Strong Hand Only | SHO baseline |
| Weak Hand Only | WHO baseline |

**Dry Fire (4 drills at 7 yards):**
| Drill | Skills Seeded |
|---|---|
| Pairs | Draw speed, cadence |
| Blake Drill | Transitions, sight pickup |
| Singles | Pure transition speed |
| 4 Aces | Reload speed |

### 4.3 Completion Criteria

Each drill requires ≥1 valid run at exactly 7 yards. This seeds the skill estimation engine with enough signals to begin generating meaningful recommendations.

**Math Academy parallel:** Their diagnostic uses adaptive binary search on the knowledge graph — if you get a hard topic right, skip its prerequisites. Our domain is small enough (6 drills covers the fundamentals) that we don't need adaptive logic.

---

## 5. Recommendation Engine (Task Selection)

### 5.1 Purpose

Math Academy's task selection algorithm "takes a student's knowledge profile and uses it to determine the optimal learning tasks." Our recommendation engine does the same.

### 5.2 Drill Eligibility (Constraint Filtering)

Before scoring, filter drills by:
- **Fire mode**: dry/live/both
- **Max distance**: user's available range
- **Movement space**: can they do stage movement drills?
- **Level gating** (progressive unlock based on fundamental mastery):

| Fundamental Mastery | Drills Available |
|---|---|
| < 30% | Level 1 only |
| 30–50% | Levels 1–2 |
| 50–70% | Levels 1–3 |
| > 70% | All levels (1–4) |

**Math Academy parallel:** Their system won't assign a calculus problem until algebra prerequisites are mastered. Our level gates serve the same purpose — don't recommend advanced movement drills until fundamentals are solid.

### 5.3 Priority Scoring

For each eligible drill:

```
For each skill the drill maps to:
    gap = (100 - mastery) + (1 - confidence) × 15

priority = Σ(gap × encompassingWeight) across all mapped skills
```

**Key insight:** The `(1 - confidence) × 15` term means unknown skills are treated as urgent even if current mastery estimate is decent. This encourages data collection — the same principle as Math Academy's diagnostic that prioritizes under-assessed areas.

### 5.4 Distance Selection

Pick the best distance for each drill:
1. Filter to distances within user's max range
2. Prefer distances with benchmarks available
3. Prefer closest to 7 yards (standard practice distance)

### 5.5 Session Planning (70/30 Split)

```
Session budget: N minutes

Phase 1 — Weakness (70% of time):
    Take highest-priority drills until 70% budget used
    → "Build [weakest skill] (XX%)"

Phase 2 — Maintenance (30% of time):
    Take lowest-priority drills (strongest skills)
    → "Maintain [strong skill]"
```

**Math Academy parallel:** Their system balances new learning vs. review. Our 70/30 split is a simplified version of the same principle — most time on weaknesses, but don't let strong skills decay.

---

## 6. Decay & Retention Model

### 6.1 Recency Decay

Every signal loses 3% of its weight per day:

```
weight = base_weight × 0.97^days_since_run
```

| Days Since Run | Weight Retained |
|---|---|
| 0 (today) | 100% |
| 7 (1 week) | 81% |
| 14 (2 weeks) | 65% |
| 30 (1 month) | 40% |
| 60 (2 months) | 16% |
| 90 (3 months) | 6% |

This means skills you haven't practiced in 2+ months effectively drop out of your mastery estimate, driving them back into recommendations.

**Math Academy parallel:** Their FIRe algorithm tracks per-topic review intervals that expand with successful reviews (like SM-2/Anki). Our decay is simpler — uniform exponential — but achieves the same effect: old performance data loses influence, driving re-assessment.

### 6.2 Cold Run Bonus

First runs in a session (before warm-up) get 1.2× weight. This captures "ownership" — the gap between cold and warm performance reveals whether a skill is truly learned or just temporarily accessible.

**Math Academy parallel:** They test "interleaving" and "mixed review" — presenting problems out of context to test true retention. Our cold run bonus serves the same diagnostic purpose.

---

## 7. Architecture Comparison

```
┌─────────────────────────────────────────────────────────┐
│                    MATH ACADEMY                         │
│                                                         │
│  Topics (1000+) ──prerequisites──▶ Topics               │
│       │                                                 │
│       ▼                                                 │
│  Diagnostic Exam (adaptive binary search)               │
│       │                                                 │
│       ▼                                                 │
│  Student Knowledge Profile (per-topic mastery)          │
│       │                                                 │
│       ▼                                                 │
│  FIRe Spaced Repetition (fractional implicit credit)    │
│       │                                                 │
│       ▼                                                 │
│  Task Selection (optimal next problem)                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   USPSA TRAINER                          │
│                                                         │
│  Skills (63) ──parent/child──▶ Skills                   │
│  Drills (50+) ──encompassingWeight──▶ Skills            │
│  Benchmarks (750+) ──classification──▶ Drills           │
│       │                                                 │
│       ▼                                                 │
│  Assessment Battery (fixed 4-6 drills at 7yd)           │
│       │                                                 │
│       ▼                                                 │
│  Skill Estimation (weighted signal aggregation)         │
│       │  • recency decay (0.97^days)                    │
│       │  • cold bonus (1.2×)                            │
│       │  • encompassing weight (0.6-1.0)                │
│       │  • parent-child aggregation                     │
│       ▼                                                 │
│  Recommendation Engine (gap × weight scoring)           │
│       │  • level gating (30/50/70% unlock)              │
│       │  • 70/30 weakness/maintenance split             │
│       ▼                                                 │
│  Session Plan (prioritized drill list)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Future Improvements (Closer to Math Academy)

### 8.1 Cross-Skill Prerequisites (Tree → DAG)
Add explicit prerequisite edges between skills across categories. E.g., "shooting on the move" requires "grip" + "cadence" + "position entry." This would enable Math Academy-style prerequisite gating per-skill rather than per-level.

### 8.2 Adaptive Diagnostic
Replace fixed assessment battery with adaptive testing: if the user aces Bill Drill, skip Pairs (grip → draw prerequisite already demonstrated). Binary search on the skill graph to minimize assessment time.

### 8.3 Per-Skill Review Scheduling
Track last-reviewed date per skill and compute optimal review intervals (expanding with successful reviews, contracting on failures). Surface "review due" indicators on the dashboard.

### 8.4 True FIRe Implementation
When a user completes a drill, propagate fractional credit up the skill graph with distance-based decay: skills closer to the drill get more credit, distant prerequisites get less. Currently we use flat encompassing weights without graph-distance decay.

### 8.5 Accuracy-Weighted Signals
Currently we only use time. Incorporate points-down and dry-fire call quality as accuracy multipliers: `adjustedPct = timePct × accuracyMultiplier`. A fast but sloppy run should score lower than a clean run at the same speed.

---

## 9. Key Files

| File | Role |
|---|---|
| `src/data/seed.ts` | Skills, drills, drill-skill mappings, benchmarks |
| `src/lib/skillEstimation.ts` | Signal collection, weighted aggregation, trend detection |
| `src/lib/assessment.ts` | Diagnostic battery definitions, completion tracking |
| `src/lib/recommendations.ts` | Drill eligibility, priority scoring, session planning |
| `src/lib/store.ts` | localStorage persistence, session/run CRUD, helper queries |

---

## Sources

- [Math Academy — How Our AI Works](https://www.mathacademy.com/how-our-ai-works)
- [Math Academy — How It Works](https://mathacademy.com/how-it-works)
- [Justin Skycak — Individualized Spaced Repetition in Hierarchical Knowledge Structures](https://www.justinmath.com/individualized-spaced-repetition-in-hierarchical-knowledge-structures/)
- [Justin Skycak — How Math Academy Creates its Knowledge Graph](https://www.justinmath.com/how-math-academy-creates-its-knowledge-graph/)
- [Justin Skycak — The Tip of Math Academy's Technical Iceberg](https://www.justinmath.com/the-tip-of-math-academys-technical-iceberg/)
- [Frank Hecker — Math Academy Part 5: Product Features](https://frankhecker.com/2025/02/12/math-academy-part-5/)
- [Frank Hecker — Math Academy Part 7: Technology Brief](https://frankhecker.com/2025/02/14/math-academy-part-7/)
