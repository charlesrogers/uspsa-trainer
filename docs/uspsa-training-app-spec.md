# USPSA Training App — Product & Technical Specification

**Version:** 2.0
**Date:** March 8, 2026
**Author:** Charles [Last Name]
**Status:** Draft — Revised with Math Academy architectural patterns

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Product Vision](#product-vision)
4. [Target Users](#target-users)
5. [Core Product Concepts](#core-product-concepts)
6. [User Experience Flow](#user-experience-flow)
7. [Gamification System](#gamification-system)
8. [Feature Specification](#feature-specification)
9. [Technical Architecture](#technical-architecture)
10. [Data Model](#data-model)
11. [Bluetooth Integration](#bluetooth-integration)
12. [Skill Graph & Diagnostic Engine](#skill-graph--diagnostic-engine)
13. [Content Corpus & Multi-Source Architecture](#content-corpus--multi-source-architecture)
14. [External Integrations](#external-integrations)
15. [Monetization](#monetization)
16. [Roadmap](#roadmap)
17. [Risks & Mitigations](#risks--mitigations)
18. [Success Metrics](#success-metrics)
19. [Open Questions](#open-questions)

---

## 1. Executive Summary

The USPSA Training App is a data-driven skill development platform for competitive practical shooters. It connects via Bluetooth to a shot timer, captures drill performance data, and uses a diagnostic engine — modeled after Math Academy's adaptive learning system — to identify specific skill gaps and prescribe targeted training interventions.

The core insight: competitive shooters plateau not because they lack practice time, but because they lack diagnostic precision. They don't know *which* fundamental skill is limiting their stage performance, and they don't have a system that isolates that skill, prescribes the right drill, and tracks whether the intervention worked.

This app solves that by creating two foundational mappings:

- **Skills → Drills**: Which drills isolate and develop which fundamental skills
- **Skills → Stages**: Which skills are bottlenecking real match performance

These two mappings are encoded in a **weighted skill graph** (inspired by Math Academy's knowledge graph with encompassing weights) that understands not just *which* skills a drill tests, but *how much* practicing one drill implicitly reviews component skills. Combined with objective timing data, a memory decay model for skill retention scheduling, and classification-level benchmarks drawn from multiple expert sources (Ben Stoeger, Charlie Perez, Brian Enos, and others via an extensible content corpus), the system creates a closed-loop training system that tells any shooter — from C class to Grand Master — exactly what to work on next and whether it's working.

---

## 2. Problem Statement

Competitive USPSA shooters face several interconnected problems:

**No diagnostic feedback loop.** A shooter runs a Bill Drill in 2.8 seconds when their target is 2.4. They know they're slow. They don't know *why* — is it the draw? Splits? Grip tension causing the group to open up? Sight tracking? Without isolating the bottleneck, they just run the same drill hoping it gets faster. It usually doesn't.

**Training is disconnected from match performance.** Shooters practice drills at the range, then shoot matches on weekends, but there's no systematic way to correlate which drill improvements translate to which stage improvements. A shooter might drill draws all week but their actual match bottleneck is transitions between targets at varying distances.

**No objective standards by classification.** Ben Stoeger and Joel Park's *Practical Shooting Training* provides a 4-level framework, and Stoeger's *Skills and Drills* includes benchmarks. But these exist in books, not in a system that tracks your performance against them over time and tells you when you've met the standard for your current level and when to push toward the next one.

**Plateau detection is subjective.** Shooters know they're stuck but can't articulate what changed. Was it a technical regression? Mental game? Equipment? The current answer is "go take a class" — valuable, but expensive and infrequent.

---

## 3. Product Vision

**Math Academy for USPSA.** Just as Math Academy uses adaptive diagnostics, XP-based gamification, and knowledge graphs to identify exactly where a student needs work in mathematics, this app identifies exactly where a shooter needs work in practical shooting — and prescribes the most efficient path to improvement.

The app should make a B-class shooter feel like they have a Grand Master coach watching every practice session, diagnosing their weaknesses, and handing them a specific training plan for the next session.

---

## 4. Target Users

### Primary: USPSA Competitors (All Classifications)

The app serves all classification levels because the diagnostic model *requires* data from the full spectrum to establish meaningful benchmarks:

| Classification | % of GM Standard | Role in Ecosystem |
|---|---|---|
| **C Class** | 40–59% | Largest user segment. Highest improvement potential. Most likely to churn without gamification. |
| **B Class** | 60–74% | Key retention segment. Motivated enough to train seriously but often plateaued. Core revenue driver. |
| **A Class** | 75–84% | Sophisticated users. Will stress-test the diagnostic engine. Likely to provide drill content and feedback. |
| **Master** | 85–94% | Small but influential. Their data establishes upper-tier benchmarks. Potential instructor/ambassador partners. |
| **Grand Master** | 95%+ | Aspirational tier. Their performance data calibrates the top of the scoring model. Many are already instructors. |

### Secondary Markets (Phase 3+)

- Private shooting instructors managing multiple students
- Military/LE marksmanship programs
- Long-range precision shooters (separate skill taxonomy)

### Platform

Android-first. The USPSA competitor base skews Android, and the primary hardware integration target (AMG Lab Commander) supports BLE on both Android and iOS. Android launches first; iOS follows in Phase 4.

---

## 5. Core Product Concepts

### 5.1 The Weighted Skill Graph

The entire product hinges on a **weighted directed acyclic graph (DAG)** of skills and drills, inspired by Math Academy's knowledge graph architecture. This is not a flat tagging system — each edge in the graph carries an **encompassing weight** that encodes how much practicing one skill or drill implicitly reviews a component skill.

**Mapping 1: Skills → Drills (with encompassing weights)**

Every drill in the library is tagged to the specific fundamental skills it tests or develops. A Bill Drill at 7 yards primarily tests draw speed, grip establishment, and split times. A Blake Drill tests transitions and visual tracking between targets at varying distances.

Critically, each mapping carries an **encompassing weight** (0.0–1.0) indicating what fraction of the component skill is implicitly practiced when running that drill. For example:

```
El Presidente
├── Draw Presentation       (weight: 0.7 — strong test of draw, but with a turn)
├── Splits / Close Pairs    (weight: 0.6 — 6 pairs at moderate distance)
├── Transitions             (weight: 0.8 — 5 transitions across 3 targets)
├── Standing Reload         (weight: 0.9 — full standing reload mid-drill)
└── Turn + Draw             (weight: 1.0 — this is THE turn-draw drill)
```

This means a shooter who runs El Presidente regularly gets 90% implicit review credit for standing reloads — the system doesn't need to separately prescribe reload drills unless their reload is specifically deficient. This is the key insight from Math Academy's **Fractional Implicit Repetition (FIRe)** model: review scheduling should account for credit flowing backward through the skill graph.

**Mapping 2: Skills → Stages**

Match stages are decomposed into the skills required to shoot them efficiently. A stage with four paper targets at 7–15 yards, a mandatory reload, and movement between two shooting positions requires: draw speed, close-distance accuracy, transitions, reload under movement, and position entry/exit footwork. By mapping the stage's skill requirements and comparing the shooter's known skill levels (from drill data), the system can identify which specific skill gap is costing the most time on that stage.

### 5.2 Diagnostic Skill Isolation

Inspired by Stoeger's teaching methodology of breaking down performance into component pieces: when the system identifies a skill gap (e.g., "your transitions are slow"), it prescribes sub-drills that isolate the sub-movements within that skill. Transitions might be slow because of: slow visual pickup of the next target, slow gun movement (grip/stance issue), or slow sight confirmation on the new target. Each of these sub-movements has a corresponding isolation drill.

This creates a drill hierarchy where encompassing weights flow upward:

```
Master Drill (e.g., El Presidente)
├── Component Skill: Draw + Presentation         [encompasses 0.7]
│   └── Sub-drill: Draw to first shot (no follow-up)
├── Component Skill: Splits (close-range pairs)   [encompasses 0.6]
│   └── Sub-drill: Bill Drill at 7yd
├── Component Skill: Transition                   [encompasses 0.8]
│   └── Sub-drill: Two-target transition drill
├── Component Skill: Reload                       [encompasses 0.9]
│   └── Sub-drill: Standing reload (no movement)
└── Component Skill: Turn + Draw                  [encompasses 1.0]
    └── Sub-drill: 180° turn to first shot
```

### 5.3 Classification-Level Benchmarking (Multi-Source)

Every drill has time/accuracy benchmarks for each classification level, drawn from multiple expert sources. The initial calibration framework uses Ben Stoeger & Joel Park's *Practical Shooting Training* 4-level system, supplemented by benchmarks from Charlie Perez, Brian Enos, and other instructors as they are added to the content corpus (see Section 13).

When multiple sources provide benchmarks for the same drill, the system computes a **weighted consensus benchmark** based on configurable source trust weights. The system knows that a 2.0s Bill Drill at 7 yards with all A-zone hits is roughly GM-level performance, while 3.2s with a C or two is solid B-class. This lets the system:

- Tell a B-class shooter exactly which drills they need to bring up to A-class standard
- Prioritize the skills with the *largest gap* between their current performance and the next classification level
- Avoid wasting time on skills already at or above their target level
- Cross-reference multiple expert opinions to avoid over-indexing on a single instructor's standards

### 5.4 Parallel Dry Fire and Live Fire Skill Tracks

Following Stoeger's "live/dry loop" methodology — where dry fire is practice and live fire is testing — the system maintains **parallel skill profiles** for dry fire and live fire performance. These are not the same skill:

- **Dry fire** benchmarks are faster (e.g., 0.8s draw vs. 1.0s live fire draw at Level 3)
- **Live fire** introduces recoil management, accuracy under recoil, and auditory/tactile feedback that dry fire cannot replicate
- The **transfer ratio** (live fire improvement per unit of dry fire improvement) is itself a diagnostic signal — a low transfer ratio suggests the shooter's dry fire technique diverges from their live fire technique (common with grip pressure)

Dry fire sessions are first-class training events, not a fallback mode. The training plan generator prescribes dry fire and live fire sessions separately, following Stoeger's recommended cycle: dry fire during the week, test live on weekends.

### 5.5 Confirmation Scheme Taxonomy

Derived from Hwansik Kim's Confirmation Drill (published in Stoeger & Park's *Practical Shooting Training*), the system tracks a meta-skill that separates classification levels: **aiming strategy selection**. There are four confirmation schemes a shooter can employ, each with a different speed/accuracy tradeoff:

| Scheme | Description | Speed | Accuracy | When to Use |
|---|---|---|---|---|
| **1: Kinesthetic** | No visual confirmation — fire on feel of alignment | Fastest | Lowest | Point-blank, <3 yards |
| **2: Color Reaction** | React to color of sight/dot crossing the aiming area | Fast | Moderate | Close targets, <10 yards, predictive shooting |
| **2.5: Rough Alignment** | Front sight through rear notch, slightly misaligned (irons) | Moderate | Good | Medium distance, 10–15 yards |
| **3: Full Sight Picture** | Dot stopped and stable / perfect sight picture | Slowest | Highest | Far targets, >15 yards, partials, headshots |

The diagnostic engine detects **confirmation scheme mismatch**: over-confirming on close targets (wasting time on Scheme 3 when Scheme 2 would suffice) or under-confirming on far targets (using Scheme 2 when Scheme 3 is required, resulting in points-down). This is measured by comparing split times to expected times for each target distance — abnormally slow splits on close targets suggest over-confirmation, while points-down on far targets with fast splits suggest under-confirmation.

---

## 6. User Experience Flow

### 6.1 Onboarding

1. **Account creation**: Name, USPSA number (optional), current classification, division, equipment setup
2. **Shot timer pairing**: BLE scan → select AMG Lab Commander from list → confirm data link with a remote-start test beep
3. **Diagnostic assessment**: A graph-aware placement test modeled on Math Academy's approach. Rather than testing every skill independently, the system exploits the skill graph's structure to infer mastery: a clean Blake Drill at Level 3 pace implies draw, splits, and transitions are all at least Level 2, eliminating the need to test those in isolation. The diagnostic selects the **maximally informative drill** at each step — the one whose result resolves the most uncertainty across the skill graph. Correct performance (meeting benchmark) propagates positive evidence to prerequisite skills; poor performance propagates negative evidence to dependent skills. This compresses a comprehensive assessment from ~30 drills down to 8–12, taking approximately 30–45 minutes of range time (about 150–200 rounds). Each drill has strict standardized parameters: distance, target type, par time, and round count.
4. **Baseline report**: System generates a skill profile showing current estimated performance level for each skill category, compared to their stated classification's expected benchmarks. Skills are marked as either **confirmed** (directly tested), **inferred** (deduced from performance on compound drills via the skill graph), or **untested** (insufficient evidence — scheduled for assessment in the first training session).

### 6.2 Daily Training Session

1. Open app → see **recommended training plan** for today's session, prioritized by largest skill gaps
2. Select a drill from the plan (or browse the full drill library)
3. Review drill standards: distance, target setup, round count, any par time
4. Tap "Start Drill" → app enters capture mode, listening for shot string data from the timer
5. Timer beeps → shooter runs the drill → timer captures all shot times
6. Shot string data transfers automatically via BLE: first shot time, each split, total time
7. Review captured string → **discard any invalid runs** (timer didn't pick up a shot, procedural error, etc.)
8. Run drill again, or move to next prescribed drill
9. After session: see updated skill profile with session summary — what improved, what didn't, what to focus on next time

### 6.3 Match Integration

1. After a match, import stage results from PractiScore (file import, not live API — PractiScore doesn't currently offer a public API for individual match results)
2. System decomposes each stage into required skills based on stage metadata (target count, distances, movement, reload requirements)
3. System compares predicted stage performance (based on drill-measured skill levels) against actual stage results
4. Delta analysis: where is the shooter losing time relative to what their training data suggests they should be capable of? This reveals either: (a) skills that don't transfer from drills to stages (a mental/pressure issue), or (b) stage-specific skills not covered in their training (movement, stage planning, etc.)

---

## 7. Gamification System

### 7.1 Dual Metric System: XP (Effort) vs. Mastery %

Following Math Academy's deliberate separation: **XP measures effort, Mastery % measures achievement.** These are tracked independently to prevent the degenerate case where a struggling shooter earns zero XP and churns.

**XP (Experience Points) — Effort Metric**

- **1 XP ≈ 1 minute of focused training effort** — this is a standardized effort metric, not a score
- XP is earned for completing drills with focused effort, regardless of performance level
- Full XP (1 per minute) awarded for drills where the shooter is clearly engaged and attempting to perform
- **Bonus XP** for: clean runs (all A-zone hits), personal records, completing prescribed drills (vs. self-selected), and cold-start runs (first drill of session, 2x multiplier per Stoeger's methodology)
- **Reduced XP** for detected rushing or clearly unfocused runs (anomalously fast times with poor accuracy)
- Daily XP goal: configurable, default 30 XP (roughly a 30-minute focused session)
- Cumulative XP never resets — it is the lifetime effort counter

**Mastery % — Achievement Metric**

- Each skill in the skill graph has a mastery percentage relative to the shooter's target classification
- 100% = all skills at or above target classification benchmark
- Mastery % drives the training plan — it determines *what* to work on
- XP drives engagement — it determines *how much* to work
- A shooter can have high XP velocity (training a lot) with low mastery growth (training inefficiently) — this itself is a diagnostic signal the system surfaces

### 7.2 Leagues

Weekly competitive leagues, identical in structure to Math Academy:

- Shooters are placed into leagues based on **weekly XP velocity** (effort, not achievement)
- Weekly promotion/demotion between league tiers (e.g., Bronze → Silver → Gold → Platinum → Diamond → Master → Grand Master league)
- League standings reset weekly; cumulative XP never resets
- Leagues are segmented by USPSA classification so a C-class shooter competes against other C-class shooters, not GMs
- Optional — can be disabled if the shooter finds it distracting
- Mastery % progress is displayed but does **not** factor into league ranking — leagues reward consistent training effort

### 7.3 Anti-Gaming Measures

Math Academy users sometimes game the system by doing easy tasks to accumulate XP. Shooting equivalent: running the same easy drill over and over. Countermeasures:

- **Diminishing XP returns**: Running the same drill more than 3x in a session yields rapidly decreasing XP after the third rep (unless performance is improving)
- **Skill coverage requirements**: Weekly XP bonuses for training across all skill categories, not just strengths
- **Diagnostic priority weighting**: Drills prescribed by the diagnostic engine yield 1.5x XP versus self-selected drills
- **Cold performance multiplier**: Running a drill as the *first* drill of a session (cold, no warmup) earns a 2x multiplier — this is the truest test of skill retention, per Stoeger's methodology
- **Mastery % is ungameable**: Since mastery is computed from actual performance against benchmarks (not from XP), grinding easy drills inflates XP but does not inflate mastery — and the dashboard makes this visible

---

## 8. Feature Specification

### 8.1 Drill Library

| Attribute | Description |
|---|---|
| Name | Canonical drill name (e.g., "Bill Drill", "Blake Drill", "El Presidente") |
| Source | Attribution (Stoeger, USPSA classifier, community) |
| Skill tags | Primary and secondary skills tested (from the skill taxonomy) |
| Setup | Target type, count, distances, arrangement, scoring zones |
| Round count | Rounds per run |
| Par time(s) | Optional par time beeps for timed segments |
| Benchmarks | Target times for each classification level (GM, M, A, B, C) |
| Sub-drills | Links to drills that isolate component skills |
| Mode | Live fire, dry fire, or both |
| Content links | Optional links to instructional content (video, written) |

Initial library: ~40–60 core drills covering all major skill categories, drawn from Stoeger's published drill sets and standard USPSA classifiers.

### 8.2 Training Plan Generator

The system generates personalized training plans based on:

- Current skill profile (from drill performance data)
- Target classification level (user-set goal)
- Available training time per session
- Available training mode (dry fire vs. live fire vs. both)
- Largest skill gaps relative to target classification
- Spaced repetition schedule for skills already at target level (maintenance)

### 8.3 Match Preparation Mode

Activated 2–3 weeks before a scheduled match:

- Suspends normal skill development curriculum
- Shifts to stage-relevant skill combinations
- Incorporates mental pressure drills (e.g., "shoot this drill cold for score, one attempt only")
- Hit factor practice with points-down scoring
- Lanny Bassham Mental Management principles integrated into session prompts

### 8.4 Performance Analytics

- Skill trajectory graphs over time (per-skill and aggregate)
- Session-over-session comparison
- Hit factor trends
- Classification predictor (estimated current % based on drill data)
- Plateau detection with automated intervention recommendations
- Environmental annotation (indoor/outdoor, temperature, time of day) for correlation analysis

### 8.5 Coach Integration (Phase 2)

- Instructor accounts with multi-student dashboards
- Ability to assign custom training plans
- Session review with annotated feedback
- Revenue sharing model for student referrals
- Curriculum customization tools

---

## 9. Technical Architecture

### 9.1 Platform

| Component | Technology |
|---|---|
| **Mobile App** | Android (Kotlin), minimum API 21 (Android 5.0) for BLE compatibility |
| **Backend** | Node.js or Python (FastAPI) — to be determined based on team |
| **Database** | PostgreSQL (relational data: users, drills, skills, sessions) + TimescaleDB extension (time-series shot data) |
| **Auth** | Firebase Auth or Auth0 |
| **API** | REST for CRUD, WebSockets for real-time BLE data relay to UI |
| **Hosting** | AWS or GCP (standard web tier — no exotic compute requirements at launch) |
| **Analytics** | Mixpanel or Amplitude for product analytics; internal analytics engine for performance data |
| **File Storage** | S3-compatible object store for PractiScore import files, target photos, session media |

### 9.2 System Architecture (Simplified)

```
┌──────────────────┐     BLE      ┌──────────────────┐
│  AMG Lab         │◄────────────►│  Android App      │
│  Commander       │  GATT/Push   │                    │
└──────────────────┘              │  ┌──────────────┐ │
                                  │  │ BLE Service  │ │
                                  │  │ (Background) │ │
                                  │  └──────┬───────┘ │
                                  │         │         │
                                  │  ┌──────▼───────┐ │
                                  │  │ Local DB     │ │
                                  │  │ (Room/SQLite)│ │
                                  │  └──────┬───────┘ │
                                  │         │         │
                                  │  ┌──────▼───────┐ │
                                  │  │ UI Layer     │ │
                                  │  │ (Compose)    │ │
                                  │  └──────┬───────┘ │
                                  └─────────┼─────────┘
                                            │ HTTPS (sync)
                                  ┌─────────▼─────────┐
                                  │  API Server        │
                                  │  ┌───────────────┐ │
                                  │  │ Auth          │ │
                                  │  │ Session Sync  │ │
                                  │  │ Diagnostic    │ │
                                  │  │   Engine      │ │
                                  │  │ XP Calculator │ │
                                  │  │ League Mgr    │ │
                                  │  └───────┬───────┘ │
                                  └─────────┼─────────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │  PostgreSQL +      │
                                  │  TimescaleDB       │
                                  └───────────────────┘
```

### 9.3 Offline-First Design

Shooting ranges frequently have poor or no cell coverage. The app must work fully offline:

- All drill data, skill taxonomy, and benchmarks cached locally
- BLE capture and session recording works without internet
- Local Room/SQLite DB stores all session data
- Background sync when connectivity resumes
- Conflict resolution: server is source of truth for league standings and social data; local is source of truth for session data (server never overwrites local timing data)

---

## 10. Data Model

### 10.1 Core Entities

```
USER
├── user_id (UUID)
├── display_name
├── uspsa_number (nullable)
├── classification (enum: U, D, C, B, A, M, GM)
├── target_classification (enum: same — user's goal level)
├── division (enum: Production, Limited, Open, CO, PCC, etc.)
├── equipment_profile (JSON: gun, holster, mag pouches, optic_type)
├── daily_xp_goal (int, default 30)
├── total_xp (bigint)
├── mastery_pct (float, 0.0–1.0, computed: aggregate mastery vs. target classification)
├── created_at
└── updated_at

───────────────────────────────────────────────────
CONTENT CORPUS (Multi-Source Architecture)
───────────────────────────────────────────────────

SOURCE
├── source_id (UUID)
├── name (e.g., "Ben Stoeger", "Charlie Perez", "Brian Enos")
├── type (enum: expert_author, community, system_generated)
├── license_status (enum: licensed, derived, original, pending)
├── trust_weight (float, 0.0–1.0, default 1.0 — used for consensus benchmarks)
├── attribution_text (text, e.g., "Benchmarks derived from standards by Ben Stoeger")
├── books (JSON array, e.g., ["Practical Shooting Training", "Skills and Drills"])
├── url (nullable)
└── created_at

───────────────────────────────────────────────────
SKILL GRAPH (Weighted DAG)
───────────────────────────────────────────────────

SKILL
├── skill_id (UUID)
├── name (e.g., "Draw Presentation")
├── category (enum: see Skill Taxonomy)
├── description
├── parent_skill_id (nullable, for sub-skills)
├── level_introduced (int, 1–4: which training level this skill first matters)
├── is_measurable_by_timer (bool — can the timer alone assess this skill?)
├── sort_order
└── updated_at

SKILL_PREREQUISITE
├── skill_id (FK — the skill that requires the prerequisite)
├── prerequisite_skill_id (FK — the required skill)
├── encompassing_weight (float, 0.0–1.0: how much practicing skill_id
│   implicitly reviews prerequisite_skill_id)
└── notes (nullable, text — rationale for weight assignment)

DRILL
├── drill_id (UUID)
├── canonical_name (text — the standard name, e.g., "Bill Drill")
├── source_id (FK → SOURCE, who created/published this drill)
├── developer (text, nullable — e.g., "Hwansik Kim" for Confirmation Drill)
├── description
├── setup_instructions (text)
├── round_count (int)
├── target_count (int)
├── distances (JSON array, e.g., [7, 15, 25])
├── scoring_type (enum: time_only, hit_factor, pass_fail)
├── par_times (JSON array, nullable)
├── mode (enum: live_fire, dry_fire, both)
├── is_diagnostic (bool — part of the diagnostic assessment battery)
├── diagnostic_information_value (float, nullable — how much skill graph
│   uncertainty this drill resolves, used for placement test ordering)
├── parent_drill_id (nullable, for sub-drill hierarchy)
├── content_url (nullable)
├── category (enum: marksmanship, transition_vision, stage_movement, special)
└── created_at

DRILL_VARIANT
├── variant_id (UUID)
├── drill_id (FK → canonical drill)
├── source_id (FK → SOURCE — who created this variant)
├── variant_name (text, e.g., "Perez Modified Blake", "Enos Transitions")
├── setup_delta (JSON — what differs from the canonical drill)
├── round_count_override (int, nullable)
├── distances_override (JSON, nullable)
├── notes (text, nullable)
└── created_at

DRILL_SKILL_MAP
├── drill_id (FK)
├── skill_id (FK)
├── encompassing_weight (float, 0.0–1.0: how much running this drill
│   implicitly reviews/practices this skill — this is the FIRe weight)
├── is_primary (bool — is this the primary skill the drill targets?)
└── source_id (FK → SOURCE — who defined this mapping)

DRILL_BENCHMARK
├── benchmark_id (UUID)
├── drill_id (FK)
├── source_id (FK → SOURCE — whose standard is this?)
├── classification (enum: D, C, B, A, M, GM)
├── fire_mode (enum: live_fire, dry_fire)
├── distance_yards (int — benchmark at which distance)
├── target_time (float, seconds)
├── target_accuracy (text, e.g., "all A-zone", "no more than 2 C's")
├── hit_factor_target (float, nullable)
├── start_position (enum: hands_relaxed, surrender, uprange, unloaded)
├── start_position_time_adder (float, default 0.0 — seconds added for non-standard starts)
├── equipment_adjustment (JSON, nullable — e.g., {"red_dot": -0.05, "major": -0.05, "open": -0.10})
└── proficiency_standard (text, default "9 of 10 attempts" — per Stoeger)

CONSENSUS_BENCHMARK (computed, materialized view)
├── drill_id (FK)
├── classification (enum)
├── fire_mode (enum)
├── distance_yards (int)
├── consensus_time (float — trust-weighted average across sources)
├── source_count (int — how many sources contributed)
├── variance (float — disagreement across sources)
└── computed_at (timestamp)

───────────────────────────────────────────────────
SESSION & PERFORMANCE DATA
───────────────────────────────────────────────────

SESSION
├── session_id (UUID)
├── user_id (FK)
├── started_at (timestamp)
├── ended_at (timestamp)
├── mode (enum: training, diagnostic, match_prep)
├── fire_mode (enum: live_fire, dry_fire)
├── location (text, nullable)
├── environment (JSON: indoor/outdoor, temp, conditions)
├── total_xp_earned (int)
├── notes (text, nullable)
└── synced (bool)

SESSION_RUN
├── run_id (UUID)
├── session_id (FK)
├── drill_id (FK)
├── variant_id (FK, nullable → DRILL_VARIANT)
├── run_number (int, within session)
├── is_valid (bool, user can discard invalid runs)
├── is_cold (bool, first run of session for this drill's primary skill = true)
├── fire_mode (enum: live_fire, dry_fire)
├── total_time (float, seconds)
├── first_shot_time (float, seconds from beep)
├── shot_times (JSON array of floats, each shot timestamp)
├── splits (JSON array of floats, computed inter-shot intervals)
├── points_down (int, nullable, user-entered)
├── points_down_required (bool — whether XP requires accuracy entry for this drill)
├── hit_factor (float, nullable, computed)
├── xp_earned (int)
├── classification_percentile (float, where this run falls vs. consensus benchmarks)
├── captured_at (timestamp)
└── timer_raw_data (JSON, nullable — raw BLE payload for audit; null = manual entry)

───────────────────────────────────────────────────
USER SKILL PROFILE (with Memory Decay Model)
───────────────────────────────────────────────────

USER_SKILL_PROFILE
├── user_id (FK)
├── skill_id (FK)
├── fire_mode (enum: live_fire, dry_fire — separate profiles per mode)
├── current_level (float, 0.0–1.0 scale, where 1.0 = GM benchmark)
├── confidence (float, 0.0–1.0, based on recency and sample size)
├── cold_level (float, 0.0–1.0 — skill level measured from cold runs only)
├── warm_level (float, 0.0–1.0 — skill level measured from warm runs only)
├── ownership_score (float — cold_level / warm_level; near 1.0 = skill is "owned")
├── breakpoint_distance_yd (int, nullable — distance where score drops below 0.85)
├── breakpoint_par_ratio (float, nullable — par time ratio where technique breaks)
├── last_stress_test_at (timestamp — last time this skill was tested at/beyond breakpoint)
├── stress_test_interval_days (int — how often to re-test; shorter for fragile skills)
├── trend (enum: improving, stable, declining, plateaued)
├── plateau_sessions (int, default 0 — consecutive sessions within ±3% of EMA)
├── assessment_status (enum: confirmed, inferred, untested)
├── last_assessed_at (timestamp)
├── last_implicit_review_at (timestamp — last time this skill got implicit credit)
├── run_count (int, total runs directly assessing this skill)
└── updated_at (timestamp)

───────────────────────────────────────────────────
MATCH DATA
───────────────────────────────────────────────────

MATCH_IMPORT
├── import_id (UUID)
├── user_id (FK)
├── match_name (text)
├── match_date (date)
├── source_file (text, path to .psc file)
├── division (text)
├── overall_hit_factor (float)
├── overall_placement (text, e.g., "5th of 32 Production")
├── imported_at (timestamp)
└── raw_data (JSON)

MATCH_STAGE
├── stage_id (UUID)
├── import_id (FK)
├── stage_number (int)
├── stage_name (text)
├── raw_time (float)
├── points (int)
├── hit_factor (float)
├── penalties (JSON: misses, no-shoots, procedurals)
├── target_count (int, user-entered or parsed)
├── estimated_distances (JSON, user-entered)
├── movement_required (bool)
├── reload_required (bool)
└── skill_decomposition (JSON, computed: skill → estimated_time_cost)

───────────────────────────────────────────────────
GAMIFICATION
───────────────────────────────────────────────────

LEAGUE_STANDING
├── user_id (FK)
├── league_tier (enum: Bronze, Silver, Gold, Platinum, Diamond, Master, GM)
├── classification_bracket (enum: C, B, A, M, GM)
├── week_start (date)
├── weekly_xp (int)
├── rank_in_league (int)
├── promoted (bool, nullable)
└── demoted (bool, nullable)
```

### 10.2 Key Indexes

- `SESSION_RUN(user_id, drill_id, captured_at)` — for skill trajectory queries
- `SESSION_RUN(drill_id, classification_percentile)` — for benchmarking
- `USER_SKILL_PROFILE(user_id, fire_mode)` — for training plan generation
- `USER_SKILL_PROFILE(last_stress_test_at, stress_test_interval_days)` — for stress test scheduling
- `USER_SKILL_PROFILE(user_id, ownership_score)` — for cold/warm gap analysis
- `USER_SKILL_PROFILE(user_id, breakpoint_distance_yd)` — for breakpoint-driven prescription
- `SKILL_PREREQUISITE(skill_id, prerequisite_skill_id)` — for graph traversal
- `DRILL_SKILL_MAP(drill_id, encompassing_weight DESC)` — for FIRe credit flow
- `DRILL_BENCHMARK(drill_id, source_id, classification, fire_mode)` — for consensus computation
- `LEAGUE_STANDING(classification_bracket, week_start, weekly_xp DESC)` — for league rankings

---

## 11. Bluetooth Integration

### 11.1 Hardware Target

**AMG Lab Commander Shot Timer**

- BLE (Bluetooth Low Energy) with "push" protocol — no traditional pairing required
- Compatible with Android and iOS via BLE
- ±0.01 second accuracy
- Digitally adjustable sensitivity (9mm, .22, AR, shotgun, PCC, CO2, hammer fall, striker fall, suppressed)
- Up to 3 extra par time beeps for drill segmentation (draw, reload, transitions)
- Preset system for instant switching between sensitivity/beep configurations (dry fire vs. live fire vs. match)
- Up to 17 days continuous battery life on standard AAA batteries
- 105dB beep at 1.5kHz — audible through double hearing protection
- Existing native integration with PractiScore (scoring), PractiScore Competitor (match results), and PractiScore Log (practice tracking)

### 11.2 Open BLE Protocol

**Critical advantage: AMG Lab publishes an open BLE protocol and grants developer access upon request.** This eliminates the single biggest technical risk in the project.

Additionally, there is an existing open-source reference implementation: [DenisZhadan/AmgLabCommander](https://github.com/DenisZhadan/AmgLabCommander) on GitHub (MIT license). This Android/Java demo app demonstrates:

- BLE scanning for AMG Lab Commander devices
- Establishing connection with a selected timer
- Remotely starting the timer (triggering the beep via BLE command)
- Reading shot notifications via BLE push (real-time per-shot data)
- Requesting stored shot series from timer memory

This reference implementation provides the foundation for our BLE integration layer. Key technical details:

1. **Scan**: The Commander advertises as "AMG Lab COMM XXXX" where XXXX = last 4 digits of MAC address
2. **Connect**: BLE push protocol — no OS-level pairing dialog required. The app connects directly, which means any user at a match can use any Commander without device-level setup
3. **Receive (Push)**: Each shot triggers a BLE notification in real time — the app receives individual shot timestamps as they happen, not just after the string completes. This enables live split display during a drill.
4. **Request (Pull)**: The app can also request complete shot series from timer memory after the fact, useful for importing data from a session that was run without the app connected
5. **Remote Start**: The app can trigger the timer's beep remotely via BLE command, which enables fully app-controlled drill workflows (select drill → app starts timer → data flows back automatically)

### 11.3 Connection Management

| Scenario | Behavior |
|---|---|
| Timer disconnects mid-drill | BLE push means each shot was already received individually. Partial string data is preserved. App prompts reconnect and can pull remaining data from timer memory. |
| Timer out of battery | Commander runs for weeks on AAAs — this is a low-probability scenario. If it happens, app detects disconnect, all local data preserved, user swaps batteries and reconnects. |
| Multiple Commanders in range (match day) | Each Commander has a unique BLE name suffix (last 4 of MAC). User selects their specific timer from the scan list. App remembers the selection for future auto-connect. |
| User also running PractiScore | The BLE push protocol supports multiple simultaneous listeners. The Commander can push data to both PractiScore and our app concurrently. (Confirmed by architecture — no exclusive pairing.) |
| No Commander available | Manual entry fallback (see below). |

### 11.4 Remote Start Capability

The ability to start the timer from the app is a unique UX advantage:

- User selects a drill in the app → taps "Run Drill" → app sends start command to Commander → beep sounds → shots are captured automatically
- This creates a seamless drill-to-data pipeline with zero manual timer interaction
- Par time configuration can be pushed from the app to the timer, so drill-specific par times are set automatically
- Enables future "guided session" mode where the app runs the shooter through a complete training plan hands-free

### 11.5 Dry Fire Support

The Commander's adjustable sensitivity can detect hammer fall and striker fall, making it a viable dry-fire timer. The app should:

- Include a "Dry Fire" mode that sets appropriate sensitivity via BLE preset push
- Adjust beep volume to a low setting (configurable) for indoor/home use
- Track dry-fire sessions separately in the data model but contribute them to skill profiles with appropriate weighting
- Leverage the Commander's par time beeps for timed dry-fire drills (e.g., par beep at 1.5s for draw-to-first-click)

### 11.6 Manual Entry Fallback

If BLE fails or the user doesn't have a Commander:

- Manual time entry mode with fields for: total time, first shot, splits (optional), points down
- Manual entries are flagged in the data model (`timer_raw_data = null`) for data quality purposes
- Manual entries contribute to skill profiles but with lower confidence weighting
- Future: support additional BLE-capable timers (ProTimer BT, ShotMaxx, etc.) via a timer abstraction layer

---

## 12. Skill Graph & Diagnostic Engine

### 12.1 Skill Taxonomy (v1)

The initial skill taxonomy, derived from Stoeger & Park's training framework, Hwansik Kim's diagnostic drills, and standard USPSA skill categories. This taxonomy is designed to be **extensible** — additional skills and sub-skills from other sources (Perez, Enos, etc.) are added by creating new `SKILL` nodes and wiring them into the existing graph via `SKILL_PREREQUISITE` edges with appropriate encompassing weights.

```
FUNDAMENTALS
├── Draw Presentation
│   ├── Grip Establishment (from holster)
│   ├── Presentation Speed (holster to sights on target)
│   └── First Shot (presentation + trigger break)
├── Grip
│   ├── Initial Grip Strength
│   ├── Grip Consistency Under Recoil
│   └── Support Hand Engagement
├── Trigger Control
│   ├── Trigger Press (isolation)
│   ├── Trigger Reset
│   └── Cadence Control (splits at varying tempos)
├── Confirmation Scheme Selection (meta-skill, see Section 5.5)
│   ├── Scheme 1: Kinesthetic Alignment
│   ├── Scheme 2: Color Reaction
│   ├── Scheme 2.5: Rough Alignment (irons)
│   └── Scheme 3: Full Sight Picture
├── Sight Management
│   ├── Visual Pickup Speed
│   ├── Sight Tracking (through recoil)
│   ├── Target Focus vs. Sight Focus Transition
│   └── Acceptable Sight Picture Calibration (speed vs. accuracy tradeoff)
├── Recoil Management
│   ├── Muzzle Return to Zero
│   └── Dot Tracking (for optic users)

TRANSITIONS
├── Target-to-Target Transition
│   ├── Close (< 10 yd)
│   ├── Medium (10–20 yd)
│   └── Far (> 20 yd)
├── Near-to-Far Transition (distance changeup)
├── Far-to-Near Transition
├── Wide Transition (90°+ swing)
├── Steel-to-Paper Transition
└── Transition Exit/Entry (visual pickup timing)

RELOADS
├── Standing Reload
├── Reload on the Move
└── Reload in Position Entry

MOVEMENT
├── Position Entry (deceleration, stance setup)
├── Position Exit (acceleration, no false steps)
├── Mounted Movement (gun up, blending positions)
├── Unmounted Movement (gun down, sprinting)
├── Shooting on the Move (target-focused, reactive)
├── Soft Stops (center of gravity never fully stops)
└── Direction Change (no drop steps, throw shoulders)

STAGE CRAFT
├── Stage Planning
├── Target Engagement Order
├── Hit Factor Optimization (speed vs. accuracy decision-making)
├── Shooting Under Pressure
└── Classifier Execution (cold performance under match conditions)

SINGLE-HAND SHOOTING
├── Strong Hand Only
└── Weak Hand Only
```

**Adding new skills from additional sources:** When a new instructor's methodology introduces skills not in the current taxonomy (e.g., Brian Enos's "seamless focus" or Charlie Perez's specific transition training), the process is:

1. Create new `SKILL` nodes for the novel concepts
2. Wire them to existing nodes via `SKILL_PREREQUISITE` with encompassing weights
3. Tag their drills via `DRILL_SKILL_MAP` with encompassing weights
4. Add benchmarks via `DRILL_BENCHMARK` linked to the new `SOURCE`
5. The diagnostic engine immediately incorporates the new skills — no algorithm changes required

### 12.2 Diagnostic Algorithm

The diagnostic engine is the core IP of the app. It operates in five layers, modeled on Math Academy's architecture but adapted for the unique characteristics of shooting performance data (continuous time measurements rather than discrete right/wrong answers).

**Layer 1: Skill Measurement**

For each drill run, the system computes a classification-normalized score for each tagged skill:

```
skill_score = consensus_benchmark_time / actual_time
```

Where `actual_time` is the shooter's time (lower is better), and `consensus_benchmark_time` is the weighted-average target from `CONSENSUS_BENCHMARK` for the shooter's target classification. A score of 1.0 means "exactly at your classification's benchmark." Above 1.0 = above benchmark (faster than target — good). Below 1.0 = below benchmark (slower than target — needs work).

**Accuracy adjustment:** When points-down is entered:

```
adjusted_score = skill_score * accuracy_multiplier
```

Where `accuracy_multiplier` penalizes points-down according to hit factor logic: `accuracy_multiplier = points_earned / max_possible_points`. A clean run (all A's) has multiplier 1.0. Missing accuracy data defaults to 0.95 (slight pessimistic assumption to incentivize entry).

Scores are weighted by `DRILL_SKILL_MAP.encompassing_weight` and accumulated into the `USER_SKILL_PROFILE` using an exponential moving average (EMA):

```
new_level = α * latest_score + (1 - α) * previous_level
```

Where α = 0.3 (tunable). Cold runs use α = 0.4 (weighted more heavily). Confidence score increases with sample size and recency.

**Layer 2: Fractional Implicit Repetition (FIRe) — Review Credit Flow**

When a shooter runs a compound drill (e.g., El Presidente), the system flows review credit backward through the skill graph to component skills. This is the key architectural insight from Math Academy.

For each skill tagged to the drill:

```
implicit_credit = encompassing_weight * raw_credit
```

Where `raw_credit` is positive for passing (meeting benchmark) and negative for failing. Credit flows recursively through `SKILL_PREREQUISITE` edges, attenuated by each edge's `encompassing_weight`:

```
For each prerequisite of the directly-assessed skill:
    prerequisite_credit = implicit_credit * prerequisite_encompassing_weight
    Update prerequisite's rep_count and memory accordingly
    Recurse to the prerequisite's own prerequisites (with further attenuation)
```

This means running El Presidente regularly can keep the system from scheduling separate draw drills, reload drills, and transition drills — *if* the El Prez performance is strong. But if transitions are weak within the El Prez, only the transition skill gets negative credit.

**Successful** performance on an advanced drill flows credit **backward** (to prerequisites). **Failed** performance on a basic drill flows negative credit **forward** (to dependent skills that rely on this foundation).

**Layer 3: Breakpoint Detection — Where Skills Fall Apart**

This is the core diagnostic insight unique to shooting (and distinct from Math Academy's memory decay model): **skills that look solid at low intensity break down when you increase speed, distance, or complexity.** A shooter can run a clean Bill Drill at 7 yards all day, but push to 15 yards or demand 0.18s splits and their grip, trigger control, and sight management all degrade simultaneously.

The system doesn't primarily worry about *forgetting* skills (though some degradation occurs with extended time away from practice). Instead, it maps each skill along three **stress axes** and finds the **breakpoint** — the parameter value where technique falls apart:

```
STRESS AXES:
├── Speed      (par time tightness, split demands)
├── Distance   (3 → 7 → 10 → 15 → 25 yards)
└── Complexity (single target → transitions → movement → reload + movement + transitions)
```

For each skill, the system builds a **performance envelope** by tracking results across the drill's parameter space. Stoeger's benchmark tables are structured exactly this way — the same drill (e.g., Bill Drill) has benchmarks at 3, 7, 10, 15, and 25 yards:

```
Example: Shooter's Bill Drill performance vs. Level 3 benchmarks

Distance   Benchmark   Actual   Score   Status
3 yd       1.8s        1.7s     1.06    ✓ Above benchmark
7 yd       2.0s        2.1s     0.95    ~ Near benchmark
10 yd      2.2s        2.5s     0.88    ✗ Below benchmark
15 yd      2.5s        3.4s     0.74    ✗ Well below — BREAKPOINT
25 yd      3.5s        5.0s     0.70    ✗ Skill collapse
```

The **breakpoint** is where the score drops below a threshold (default 0.85). Everything at or below the breakpoint represents exposed weaknesses — skills that *appear* adequate at lower intensity but are actually deficient.

**Breakpoint-driven training prescription:**

```
breakpoint_distance = first distance where score < 0.85
training_target = breakpoint_distance - 1 step  (push FROM competence INTO the breakpoint)
```

The system prescribes drills at or just past the breakpoint to force the shooter to confront the exposed weakness, rather than drilling at comfortable parameters. This follows Stoeger's principle: you must fail frequently at the edge of your ability to grow.

The same logic applies across the complexity axis. A shooter whose Blake Drill (3-target transitions) is at benchmark but whose El Presidente (transitions + reload + turn) collapses has a complexity breakpoint — the added cognitive and mechanical load of the reload exposes latent weaknesses in the component skills.

**Time away degradation:** When a shooter hasn't trained a skill in a significant period (configurable, default 3+ weeks), the system doesn't assume the skill is "forgotten" — it assumes the **breakpoint has moved closer in** (the performance envelope has contracted). The system schedules a re-assessment at the shooter's last-known breakpoint distance/speed to confirm where they currently stand, rather than starting from scratch.

**Layer 4: Gap Analysis & Stress Test Prioritization**

Given the user's target classification, the system computes:

```
gap = target_classification_benchmark - user_skill_level
```

For each skill. Positive gaps = below target (high priority). Zero or negative gaps = at or above target. The training plan ranks skills by:

1. **Gap magnitude** (largest gaps first)
2. **Breakpoint proximity** (skills where the breakpoint is close to the shooter's comfort zone — these are the highest-leverage improvements)
3. **Ownership score** (low ownership = fragile skill, prioritize even if near benchmark)
4. **Confidence** (low confidence = insufficient data, schedule a stress test)
5. **Staleness** (skills untested for 3+ weeks get a re-assessment at their breakpoint)

**Stress test scheduling:** Rather than scheduling maintenance reviews on a timer, the system periodically **stress-tests skills that appear solid** by prescribing the drill at one level harder than the shooter's current comfortable parameters (farther distance, tighter par time, more targets). This catches skills that have silently degraded or were never truly solid — they just hadn't been challenged. The stress test frequency is lower for well-owned skills (high ownership score) and higher for recently acquired skills.

**Layer 5: Plateau Detection & Intervention**

A plateau is detected when:

- A skill's EMA has been within ±3% for more than 10 sessions (or 4 weeks, whichever comes first)
- The skill is still below the target classification benchmark

When a plateau is detected, the system:

1. Prescribes **sub-drills** that isolate component movements within the plateaued skill — traversing down the skill graph to find the prerequisite(s) that may be the root cause
2. Enters **"trial mode"** — encouraging the shooter to experiment with technique changes (grip pressure, stance, hold, etc.) without penalizing XP for temporary performance drops
3. Flags the plateau in the analytics dashboard with a **root-cause hypothesis**:
   - **Technical**: sub-skill measurement reveals a specific weak link
   - **Confirmation scheme mismatch**: shooter is over/under-confirming for the target distances in this drill
   - **Narrow performance envelope**: skill is solid at comfortable parameters but the breakpoint hasn't moved — the shooter isn't pushing into harder distances/speeds. Prescribe at breakpoint+ parameters.
   - **Cold/warm gap**: high ownership delta suggests the skill is fragile under cold conditions (needs more cold-start volume, not more speed)
   - **Mental/pressure**: drill performance is strong but match stage performance on the same skills is weak (requires match prep mode, not more drilling)

### 12.3 Cold vs. Warm Performance & Ownership Score

Following Stoeger's principle that "the only way to be sure you can shoot a GM score on a classifier is to be able to shoot it cold":

- The system separately tracks cold performance (first run of session for a given skill) vs. warm performance (subsequent runs)
- Cold performance uses α = 0.4 in the EMA (weighted more heavily) because it reflects true retained skill level
- The **ownership score** is a first-class diagnostic metric:

```
ownership_score = cold_level / warm_level
```

| Ownership Score | Interpretation | Action |
|---|---|---|
| 0.90–1.0 | Skill is "owned" — deeply retained | Stress-test infrequently (every 4–6 weeks), push to harder parameters |
| 0.75–0.89 | Skill is functional but fragile | Regular stress-testing (every 1–2 weeks), prescribe at breakpoint parameters |
| < 0.75 | Skill requires significant warmup to access | Prescribe as first drill of sessions (cold), focus on building consistency before pushing speed/distance |

- Low ownership score suggests the skill has a narrow performance envelope — it works under ideal conditions but collapses under stress. The system prioritizes **widening the envelope** (drilling at increasing speed/distance/complexity) rather than just repeating the comfortable parameters.
- The cold/warm delta per skill is surfaced in the analytics dashboard as a retention quality indicator

---

## 13. Content Corpus & Multi-Source Architecture

The system is designed from the ground up to incorporate training methodologies, drills, and benchmarks from **multiple expert sources** — not just a single instructor. This is critical for several reasons:

- Different instructors emphasize different aspects of the skill graph (Stoeger's predictive/reactive framework, Enos's flow state and subconscious process, Perez's transition-heavy approach)
- No single source provides benchmarks for every drill at every classification level
- Shooters have strong instructor preferences — the system should accommodate, not dictate
- The corpus will grow over time as partnerships are established and community content is curated

### 13.1 Source Registry

Each content source is registered in the `SOURCE` entity with a **trust weight** (0.0–1.0) used for computing consensus benchmarks. Initial sources:

| Source | Type | Trust Weight | Content Contribution |
|---|---|---|---|
| Ben Stoeger & Joel Park | expert_author | 1.0 | *Practical Shooting Training* 4-level system, ~40 drills with full benchmarks |
| Ben Stoeger | expert_author | 1.0 | *Skills and Drills*, additional benchmarks and technique guidance |
| Charlie Perez | expert_author | 1.0 | Drills, benchmarks, and training philosophy (to be integrated) |
| Brian Enos | expert_author | 1.0 | *Practical Shooting: Beyond Fundamentals*, flow/subconscious shooting framework (to be integrated) |
| Hwansik Kim | expert_author | 0.9 | Confirmation Drill, Measurement Drill, Designated Target, Track the A Zone, Go/Stop (published in PST) |
| USPSA Classifiers | system_generated | 1.0 | Official classifier stages with known hit factor benchmarks per classification |
| Community | community | 0.5 | User-submitted drills (Phase 2+, requires moderator approval) |

### 13.2 Consensus Benchmark Computation

When multiple sources provide benchmarks for the same drill at the same classification level:

```
consensus_time = Σ(source_trust_weight * source_target_time) / Σ(source_trust_weight)
```

The `CONSENSUS_BENCHMARK` materialized view stores these pre-computed values. The `variance` field indicates disagreement across sources — high variance drills are flagged for manual review.

When only one source provides a benchmark, it is used directly (no averaging). When zero sources provide a benchmark for a specific drill/classification/distance combination, the system can **interpolate** from adjacent levels using the known ratio between classification tiers observed in drills that do have full coverage.

### 13.3 Content Authoring Workflow

Adding a new source to the corpus:

1. **Register the source** in `SOURCE` with appropriate metadata and trust weight
2. **Map drills**: For each drill the source describes:
   - If it matches a canonical drill already in the library → add `DRILL_BENCHMARK` rows linked to the new source
   - If it's a variant of an existing drill → create a `DRILL_VARIANT` with `setup_delta` describing differences
   - If it's an entirely new drill → create a new `DRILL` and tag it with `DRILL_SKILL_MAP` entries
3. **Tag skills**: Each drill must be mapped to skills with encompassing weights. Domain expertise is required — this cannot be automated (per Math Academy's experience, this is the most labor-intensive step)
4. **Set benchmarks**: Add `DRILL_BENCHMARK` rows for each classification level the source provides standards for
5. **Validate graph integrity**: Ensure new skills are wired into the existing DAG via `SKILL_PREREQUISITE` edges, and that no cycles are introduced
6. **Recompute consensus**: Trigger recomputation of `CONSENSUS_BENCHMARK` materialized view

**Phase 1:** Manual authoring by the development team using a spreadsheet-to-database pipeline.
**Phase 2:** Admin web tool for registered instructors to submit drills and benchmarks.
**Phase 3:** Community submission portal with moderator approval workflow.

### 13.4 Handling Conflicting Philosophies

Different sources may disagree not just on benchmarks, but on training philosophy:

- Stoeger: explicit predictive vs. reactive shooting framework, structured drill progression
- Enos: subconscious process, "let it happen," flow state
- Perez: aggressive transition training, specific corrective protocols

The system handles this by:

- **Skill graph is philosophy-neutral**: It maps skills and their relationships without prescribing *how* to develop them. "Transition Speed" is a measurable skill regardless of whether you train it via Stoeger's method or Perez's.
- **Drill-level attribution**: Each drill and benchmark is linked to its source, so the system can present "Ben Stoeger recommends..." or "Charlie Perez's approach to..." without conflating viewpoints.
- **User preference**: Users can optionally weight certain sources higher in their training plan generation (e.g., "I follow Stoeger's methodology" → weight his prescribed drills higher in plan generation).
- **The timer is the arbiter**: Regardless of training philosophy, the system measures objective performance. If Enos's flow approach produces faster transitions for a given user, the data will show it.

---

## 14. External Integrations

### 14.1 PractiScore

**Current reality:** PractiScore does not offer a public API for individual match result data. Results are posted to practiscore.com for viewing but are not easily exportable programmatically. The PractiScore Android app exports `.psc` match files.

**Integration approach (Phase 1):** Manual file import. The user exports a `.psc` file from the PractiScore app (via share/email) and imports it into the training app. The app parses the `.psc` file format to extract stage-level results.

**Integration approach (Phase 4):** Pursue a partnership or data-sharing agreement with PractiScore. If they open an API, integrate directly. If not, explore scraping the user's own data from practiscore.com with their authentication (with their explicit consent).

### 14.2 Ben Stoeger Standards

Stoeger's *Practical Shooting Training* and *Skills and Drills* provide the benchmark data. This is copyrighted content, so the integration approach is:

- Use published benchmarks as the basis for the internal classification targets
- Do not reproduce the books' content in the app
- Pursue a licensing or endorsement partnership — Stoeger already sells through benstoegerproshop.com and teaches classes; the app could be a distribution channel for his methodology
- Attribute properly: "Benchmarks derived from standards established by Ben Stoeger"

### 14.3 Lanny Bassham Mental Management (Phase 2+)

Mental game module that integrates Bassham's principles (from *With Winning in Mind*) into match preparation mode. Licensing required.

---

## 15. Monetization

### 15.1 Subscription Model

| Tier | Price | Features |
|---|---|---|
| **Free** | $0 | Basic drill library (10–15 drills), manual time entry only, basic session logging, no diagnostics |
| **Competitor** | $9.99/mo or $79.99/yr | Full drill library, BLE timer integration, XP system, leagues, diagnostic engine, training plans, match import |
| **Pro** | $19.99/mo or $149.99/yr | Everything in Competitor + coach features (manage up to 5 students), advanced analytics, match prep mode, priority support |

### 15.2 Instructor Tier

$39.99/mo — Unlimited students, white-label training plans, student progress dashboards, revenue sharing on student subscriptions referred through instructor.

### 15.3 Additional Revenue Streams

- **Equipment partnerships**: AMG Lab Commander bundle deals, referral commission
- **Premium content**: Paid drill packs from named instructors (Stoeger, etc.) with revenue share
- **Data licensing**: Anonymized, aggregated performance data could be valuable to ammunition manufacturers, equipment companies, or USPSA itself for classification calibration — but only with explicit user consent and privacy protections

---

## 16. Roadmap

### Phase 1: Core Platform (Months 1–6)

**Milestone: "It works at the range"**

- Android app with BLE AMG Lab Commander integration
- Skill graph v1 with Stoeger/Park corpus fully loaded (~40 drills, all benchmarks, encompassing weights)
- Content corpus architecture: `SOURCE`, `DRILL`, `DRILL_BENCHMARK`, `DRILL_SKILL_MAP` with multi-source support
- Session recording with shot string capture (live fire + dry fire as parallel first-class modes)
- Manual time entry fallback
- Basic XP system (effort-based: 1 XP ≈ 1 min focused training)
- Basic mastery % display (per-skill, per-fire-mode)
- Offline-first local data storage
- Basic performance dashboard (per-drill trends over time, cold vs. warm split)
- User accounts and cloud sync
- Points-down entry UX (required for XP on scored drills, optional for time-only drills)

### Phase 2: Intelligence & Gamification (Months 6–12)

**Milestone: "It tells me what to work on"**

- Graph-aware diagnostic assessment (placement test with information-maximizing drill selection)
- FIRe algorithm: implicit review credit flowing through skill graph
- Memory decay model with per-skill, per-user review scheduling
- Training plan generator (gap analysis + review urgency + ownership score prioritization)
- Ownership score tracking (cold/warm delta as first-class metric)
- League system with weekly promotion/demotion (XP-based, classification-segmented)
- Plateau detection with sub-drill prescription and root-cause hypothesis
- Second content source integration (Charlie Perez or Brian Enos corpus)
- Consensus benchmark computation across multiple sources
- Coach accounts (basic)
- PractiScore file import (`.psc` parser)
- Stage skill decomposition

### Phase 3: Advanced Features (Months 12–18)

**Milestone: "It's my training partner"**

- Match preparation mode
- Confirmation scheme mismatch detection (over/under-confirming diagnostic)
- Mental game module (Lanny Bassham integration)
- Advanced analytics (environmental correlation, plateau root-cause, transfer ratio dry→live)
- Instructor content authoring tool (web-based, for registered sources to submit drills/benchmarks)
- Community drill submission with moderator approval
- Instructor marketplace (premium drill packs with revenue share)
- Target photo capture + AI accuracy scoring (experimental)
- Military/LE marksmanship module (branch-specific standards)

### Phase 4: Scale & Integration (Months 18–24)

**Milestone: "It's the ecosystem"**

- PractiScore direct integration (pending partnership)
- Additional shot timer support (ProTimer BT, ShotMaxx, etc.) via timer abstraction layer
- iOS port
- Video analysis integration (future)
- International expansion (IPSC rules/standards)
- Enterprise licensing for ranges and training organizations
- Long-range shooting expansion (separate skill taxonomy and graph)

---

## 17. Risks & Mitigations

### Technical

| Risk | Severity | Mitigation |
|---|---|---|
| AMG Lab Commander BLE protocol changes in future firmware | Low | Protocol is documented and open. Reference implementation exists (MIT license). Abstraction layer isolates app from protocol changes. Maintain relationship with AMG Lab team. |
| BLE reliability in noisy RF environments (ranges with multiple shooters) | Medium | Bond to specific device. Implement retry logic. Fall back to manual entry. Test extensively at busy ranges. |
| Offline sync conflicts | Low | Client-authoritative for session data (timing data never modified server-side). Server-authoritative for league/social data. |
| Diagnostic engine accuracy | High | Start conservative — surface data and let users draw conclusions. Tighten algorithm based on real user feedback. Don't make specific claims until validated. |
| Encompassing weight accuracy | High | Incorrect weights cause the FIRe model to over- or under-credit implicit practice, leading to false confidence in component skills or unnecessary drilling. Mitigate by starting conservative (lower weights = more explicit assessment), tuning with user data, and expert validation. |
| Skill graph complexity | Medium | Math Academy's graph took years to build with a dedicated team. Our domain is smaller (~50 skills vs. 2,500 topics) but still requires significant domain expertise. Mitigate by launching with a minimal viable graph and expanding iteratively. |
| Multi-source benchmark conflicts | Low | Two experts may disagree on what constitutes "B class" performance. Consensus computation with variance tracking surfaces disagreements for manual review. |

### Market

| Risk | Severity | Mitigation |
|---|---|---|
| Niche market size | Medium | USPSA has ~35K active members, but addressable market includes IDPA, Steel Challenge, IPSC, and casual competitive shooters. Expand taxonomy to adjacent disciplines. |
| Adoption resistance ("I already use a notebook") | Medium | The XP/league system is the wedge — competitive shooters are inherently competitive. Make the gamification addictive enough to overcome habit inertia. |
| Stoeger/PractiScore partnership doesn't materialize | Medium | Build benchmarks from community data. Parse PractiScore files without their cooperation (it's the user's own data). |

### Legal

| Risk | Severity | Mitigation |
|---|---|---|
| Copyright on Stoeger's published benchmarks | Medium | Don't reproduce. Derive. Seek licensing. Build independent benchmark dataset from app user data over time. |
| Data privacy for performance data | Low | Standard data privacy practices. No PII beyond what's needed for the account. Clear privacy policy. GDPR-ready from day one even if US-only launch. |

---

## 18. Success Metrics

### North Star Metric

**Weekly Active Trainers (WAT)**: Users who complete at least one valid drill session per week.

### Leading Indicators

| Metric | Target (Month 6) | Target (Month 12) |
|---|---|---|
| Registered users | 500 | 2,500 |
| Weekly Active Trainers | 150 | 750 |
| Paid subscribers (Competitor+) | 75 | 400 |
| Avg sessions per active user per week | 2.5 | 3.0 |
| Avg drills per session | 4 | 6 |
| 30-day retention | 40% | 55% |
| NPS | 40+ | 50+ |

### Validation Metrics

- **Skill improvement correlation**: Do users who train with the app measurably improve their classification percentage over 6 months?
- **Diagnostic accuracy**: When the system says "your transitions are your biggest gap," do users who focus on transitions improve their match performance more than those who don't?
- **Engagement via gamification**: Do users in leagues train more consistently than users who opt out?

---

## 19. Open Questions

These are unresolved decisions that require further research or team input:

### Resolved

1. **~~Timer protocol~~** ✅ **RESOLVED**: The AMG Lab Commander has an open BLE protocol with developer access available on request. An MIT-licensed reference implementation exists on GitHub (DenisZhadan/AmgLabCommander). The remote-start capability also enables app-controlled drill workflows. First technical spike should focus on forking the reference implementation, confirming the GATT characteristic UUIDs, and building the abstraction layer for the `SESSION_RUN` data pipeline.

2. **~~Dry fire as secondary mode~~** ✅ **RESOLVED**: Dry fire is now a first-class parallel skill track with its own benchmarks (from Stoeger's PST dry fire tables), its own `USER_SKILL_PROFILE` rows (`fire_mode = dry_fire`), and a transfer ratio metric. The AMG Lab Commander supports dry fire detection (hammer/striker fall). The live/dry loop is the recommended training cycle.

3. **~~Single-source benchmarks~~** ✅ **RESOLVED**: Multi-source content corpus architecture with `SOURCE`, `DRILL_VARIANT`, consensus benchmark computation, and trust weights. See Section 13.

4. **~~XP rewards achievement not effort~~** ✅ **RESOLVED**: XP now measures effort (1 XP ≈ 1 minute focused training). Mastery % separately tracks achievement. Leagues are XP-based (effort). See Section 7.

### Open

5. **Encompassing weight calibration**: The FIRe model requires encompassing weights on every `DRILL_SKILL_MAP` and `SKILL_PREREQUISITE` edge. Math Academy's founder spent ~250 hours estimating weights for 1,500 topics. Our graph is smaller (~50 skills, ~40 drills initially) but the weights must be set by domain experts. **Who sets the initial weights?** Options: (a) recruit 2–3 GM-level shooters/instructors to estimate weights independently, average the results, (b) derive from the structural relationships in Stoeger's book (e.g., if El Prez explicitly isolates into 5 component drills, weight proportionally by time budget), (c) start with uniform weights and tune based on user data. Recommendation: (b) for launch, validated by (a), refined by (c) over time.

6. **Benchmark gaps**: Stoeger's PST provides benchmarks for Levels 2–4 but not Level 1 (no time standards). Some drills lack benchmarks at certain distances or for certain classifications. **How do we fill gaps?** Options: (a) interpolation from adjacent levels using observed ratios, (b) expert panel, (c) crowdsource from early users and compute percentiles dynamically. Recommendation: all three — (a) for launch, (b) for validation, (c) for ongoing calibration.

7. **Breakpoint detection sensitivity**: The 0.85 score threshold for declaring a breakpoint is a tunable parameter. Too aggressive (0.95) and every shooter has breakpoints everywhere; too lenient (0.70) and real weaknesses go undetected. **Should the threshold vary by classification?** A C-class shooter might reasonably score 0.75 at 15 yards without it being a "breakpoint" — they're expected to be weak there. An M-class shooter at 0.75 on the same drill has a real problem. Recommendation: classification-relative thresholds — breakpoint = score below `(target_classification_floor / GM_benchmark)`, meaning "you're underperforming relative to where you should be at your level."

8. **Accuracy scoring friction**: The timer only captures time, not accuracy. Points-down must be user-entered. This halves the diagnostic signal when omitted. **Current design**: points-down is required for XP on scored drills; missing accuracy defaults to 0.95 multiplier (slight penalty to incentivize entry). **Phase 3 option**: target photo capture + AI scoring. **Open question**: Is the 0.95 default too generous or too punitive? Needs user testing.

9. **Confirmation scheme detection**: Section 5.5 describes detecting over/under-confirmation from split times vs. target distances. **Is this actually feasible from timer data alone?** The timer gives splits but doesn't know which target the shooter is engaging or at what distance. This diagnostic may require the user to specify target distances per drill setup, or may only work on drills with known, fixed target arrangements. Needs prototyping.

10. **Community content quality control**: Phase 2+ allows community drill submissions. **What's the moderation workflow?** Options: (a) admin approval only, (b) instructor-tier users can approve, (c) upvote/downvote with quality threshold. **Skill-tagging accuracy** is the hardest part — community users are unlikely to correctly assign encompassing weights. Recommendation: community submits drill setup and benchmarks only; skill tagging and encompassing weights are set by system admins.

11. **Stoeger/Perez/Enos licensing**: Each source's content is copyrighted. The system derives benchmarks rather than reproducing content, but partnerships would enable deeper integration (video content, drill explanations, corrective diagrams). **Priority**: Stoeger first (most structured data), Perez second (active in community), Enos third (philosophical framework more than drill data).

12. **Name**: The app needs a name. Working title only.

---

*End of specification.*
