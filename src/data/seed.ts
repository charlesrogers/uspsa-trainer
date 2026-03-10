// Complete seed data from:
//   1. Ben Stoeger & Joel Park, "Practical Shooting Training" (2021)
//   2. Ben Stoeger, "Skills and Drills Reloaded" (2018)
//   3. Ben Stoeger, "Dry Fire Reloaded" (2018)

export interface Source {
  id: string;
  name: string;
  type: "expert_author" | "community" | "system_generated";
  trust_weight: number;
  attribution: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "fundamentals" | "transitions" | "reloads" | "movement" | "stage_craft" | "single_hand" | "confirmation" | "other";
  description: string;
  parentId: string | null;
  prerequisites?: string[];  // Cross-category skill IDs this skill depends on (DAG edges)
  levelIntroduced: number;
}

export interface Drill {
  id: string;
  name: string;
  sourceId: string;
  developer: string | null;
  description: string;
  setupInstructions: string;
  roundCount: number;
  targetCount: number;
  distances: number[];
  mode: "live_fire" | "dry_fire" | "both";
  category: "marksmanship" | "transition_vision" | "stage_movement" | "special";
  levelIntroduced: number;
}

export interface DrillSkillMap {
  drillId: string;
  skillId: string;
  encompassingWeight: number;
  isPrimary: boolean;
}

export interface DrillBenchmark {
  drillId: string;
  classification: "C" | "B" | "A" | "M" | "GM";
  fireMode: "live_fire" | "dry_fire";
  distanceYards: number;
  targetTime: number;
  targetAccuracy: string;
  drawTime: number | null;
  reloadTime: number | null;
}

// ─────────────────────────────────────────
// SOURCES
// ─────────────────────────────────────────
export const sources: Source[] = [
  {
    id: "src-stoeger-park",
    name: "Ben Stoeger & Joel Park",
    type: "expert_author",
    trust_weight: 1.0,
    attribution: "Practical Shooting Training (2021)",
  },
  {
    id: "src-stoeger-sdr",
    name: "Ben Stoeger",
    type: "expert_author",
    trust_weight: 1.0,
    attribution: "Skills and Drills Reloaded (2018)",
  },
  {
    id: "src-stoeger-dfr",
    name: "Ben Stoeger",
    type: "expert_author",
    trust_weight: 1.0,
    attribution: "Dry Fire Reloaded (2018)",
  },
];

// ─────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────
export const skills: Skill[] = [
  // Fundamentals
  { id: "sk-draw", name: "Draw Presentation", category: "fundamentals", description: "Drawing from holster to first shot on target", parentId: null, levelIntroduced: 1 },
  { id: "sk-draw-grip", name: "Grip Establishment", category: "fundamentals", description: "Acquiring proper grip during draw stroke", parentId: "sk-draw", levelIntroduced: 1 },
  { id: "sk-draw-speed", name: "Presentation Speed", category: "fundamentals", description: "Speed of holster to sights on target", parentId: "sk-draw", levelIntroduced: 2 },
  { id: "sk-draw-first", name: "First Shot", category: "fundamentals", description: "Presentation plus trigger break for first shot", parentId: "sk-draw", levelIntroduced: 1 },
  { id: "sk-grip", name: "Grip", category: "fundamentals", description: "Overall grip quality and consistency", parentId: null, levelIntroduced: 1 },
  { id: "sk-grip-strength", name: "Initial Grip Strength", category: "fundamentals", description: "Grip pressure at establishment", parentId: "sk-grip", levelIntroduced: 1 },
  { id: "sk-grip-recoil", name: "Grip Consistency Under Recoil", category: "fundamentals", description: "Maintaining grip through shot strings", parentId: "sk-grip", levelIntroduced: 2 },
  { id: "sk-grip-support", name: "Support Hand Engagement", category: "fundamentals", description: "Support hand pressure and placement", parentId: "sk-grip", levelIntroduced: 1 },
  { id: "sk-trigger", name: "Trigger Control", category: "fundamentals", description: "Trigger manipulation without disturbing sights", parentId: null, levelIntroduced: 1 },
  { id: "sk-trigger-press", name: "Trigger Press", category: "fundamentals", description: "Isolated trigger press quality", parentId: "sk-trigger", levelIntroduced: 1 },
  { id: "sk-trigger-reset", name: "Trigger Reset", category: "fundamentals", description: "Trigger reset for follow-up shots", parentId: "sk-trigger", levelIntroduced: 2 },
  { id: "sk-cadence", name: "Cadence Control", category: "fundamentals", description: "Maintaining consistent splits at varying tempos", parentId: "sk-trigger", levelIntroduced: 2 },
  { id: "sk-sight", name: "Sight Management", category: "fundamentals", description: "Visual management of sights/dot", parentId: null, levelIntroduced: 1 },
  { id: "sk-sight-pickup", name: "Visual Pickup Speed", category: "fundamentals", description: "Speed of acquiring visual on sights after recoil", parentId: "sk-sight", levelIntroduced: 2 },
  { id: "sk-sight-track", name: "Sight Tracking", category: "fundamentals", description: "Tracking sights through recoil cycle", parentId: "sk-sight", levelIntroduced: 2 },
  { id: "sk-recoil", name: "Recoil Management", category: "fundamentals", description: "Controlling muzzle rise and return", parentId: null, levelIntroduced: 2 },
  { id: "sk-recoil-return", name: "Muzzle Return to Zero", category: "fundamentals", description: "Speed of muzzle returning to original point of aim", parentId: "sk-recoil", levelIntroduced: 2 },
  { id: "sk-dot-track", name: "Dot Tracking", category: "fundamentals", description: "Tracking red dot through recoil (optic users)", parentId: "sk-recoil", levelIntroduced: 2 },
  { id: "sk-pacing", name: "Pacing / Gear Changes", category: "fundamentals", description: "Adjusting shooting speed based on target distance and difficulty — giving each target exactly the time it needs", parentId: null, levelIntroduced: 2 },
  { id: "sk-shot-call", name: "Shot Calling", category: "fundamentals", description: "Knowing where your shot went by reading the sights at the moment of firing, not by looking at the target", parentId: "sk-sight", levelIntroduced: 2 },
  { id: "sk-discipline", name: "Discipline / Consistency", category: "fundamentals", description: "Ability to perform at a consistent level across many repetitions without degradation — the 36/36 mentality", parentId: null, levelIntroduced: 1 },
  { id: "sk-tension", name: "Variable Hand Tension", category: "fundamentals", description: "Gripping hard only during trigger press, staying loose during manipulation (reloads, transitions) — dynamic tension management", parentId: "sk-grip", levelIntroduced: 2 },

  // Confirmation schemes
  { id: "sk-confirm", name: "Confirmation Scheme Selection", category: "confirmation", description: "Choosing the right aiming strategy for target distance/difficulty", parentId: null, levelIntroduced: 2 },
  { id: "sk-confirm-1", name: "Kinesthetic Alignment", category: "confirmation", description: "Fire on feel of alignment, no visual confirmation", parentId: "sk-confirm", prerequisites: ["sk-draw", "sk-cadence"], levelIntroduced: 3 },
  { id: "sk-confirm-2", name: "Color Reaction", category: "confirmation", description: "React to color of sight/dot crossing aiming area", parentId: "sk-confirm", levelIntroduced: 2 },
  { id: "sk-confirm-3", name: "Full Sight Picture", category: "confirmation", description: "Dot stopped and stable, perfect sight picture", parentId: "sk-confirm", levelIntroduced: 1 },

  // Transitions
  { id: "sk-trans", name: "Target-to-Target Transition", category: "transitions", description: "Moving between targets efficiently", parentId: null, levelIntroduced: 1 },
  { id: "sk-trans-close", name: "Close Transition (<10yd)", category: "transitions", description: "Transitions between close targets", parentId: "sk-trans", levelIntroduced: 1 },
  { id: "sk-trans-med", name: "Medium Transition (10-20yd)", category: "transitions", description: "Transitions at medium distance", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-far", name: "Far Transition (>20yd)", category: "transitions", description: "Transitions between distant targets", parentId: "sk-trans", levelIntroduced: 3 },
  { id: "sk-trans-near-far", name: "Near-to-Far Transition", category: "transitions", description: "Transitioning from close to far target (distance changeup)", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-far-near", name: "Far-to-Near Transition", category: "transitions", description: "Transitioning from far to close target", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-wide", name: "Wide Transition (90°+)", category: "transitions", description: "Large-angle transitions between target arrays", parentId: "sk-trans", prerequisites: ["sk-trans", "sk-move-short"], levelIntroduced: 3 },
  { id: "sk-trans-exit-entry", name: "Transition Exit/Entry", category: "transitions", description: "Visual pickup timing when leaving and arriving at targets", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-low", name: "Low Target Transitions", category: "transitions", description: "Transitioning to/from targets placed low (angled stands, ground level)", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-steel", name: "Steel/Paper Transitions", category: "transitions", description: "Transitioning between steel and paper targets — calling by sight, not sound", parentId: "sk-trans", levelIntroduced: 2 },

  // Reloads
  { id: "sk-reload-stand", name: "Standing Reload", category: "reloads", description: "Reloading while stationary", parentId: null, levelIntroduced: 1 },
  { id: "sk-reload-move", name: "Reload on the Move", category: "reloads", description: "Reloading while moving between positions", parentId: null, prerequisites: ["sk-reload-stand", "sk-move-unmounted"], levelIntroduced: 3 },
  { id: "sk-reload-entry", name: "Reload in Position Entry", category: "reloads", description: "Reloading while entering a shooting position", parentId: null, prerequisites: ["sk-reload-stand", "sk-move-entry"], levelIntroduced: 3 },

  // Movement
  { id: "sk-move-entry", name: "Position Entry", category: "movement", description: "Decelerating into a shooting position with proper stance", parentId: null, levelIntroduced: 2 },
  { id: "sk-move-exit", name: "Position Exit", category: "movement", description: "Accelerating out of position without false steps — start moving while engaging last target", parentId: null, levelIntroduced: 2 },
  { id: "sk-move-mounted", name: "Mounted Movement", category: "movement", description: "Moving with gun up, blending positions (1-4 steps)", parentId: null, prerequisites: ["sk-grip", "sk-sight", "sk-move-entry"], levelIntroduced: 3 },
  { id: "sk-move-unmounted", name: "Unmounted Movement", category: "movement", description: "Sprinting with gun down between positions (5+ steps)", parentId: null, levelIntroduced: 3 },
  { id: "sk-move-shoot", name: "Shooting on the Move", category: "movement", description: "Engaging targets while moving (target-focused, reactive)", parentId: null, prerequisites: ["sk-grip", "sk-cadence", "sk-move-entry"], levelIntroduced: 3 },
  { id: "sk-move-soft", name: "Soft Stops", category: "movement", description: "Brief pauses where center of gravity never fully stops", parentId: null, prerequisites: ["sk-move-shoot", "sk-move-entry"], levelIntroduced: 4 },
  { id: "sk-move-direction", name: "Direction Change", category: "movement", description: "Changing direction without drop steps", parentId: null, prerequisites: ["sk-move-entry", "sk-move-exit"], levelIntroduced: 3 },
  { id: "sk-move-short", name: "Short Moves", category: "movement", description: "Quick lateral moves of 2-3 steps while keeping gun mounted at eyeline", parentId: null, levelIntroduced: 2 },
  { id: "sk-move-prone", name: "Prone", category: "movement", description: "Getting into and shooting from prone position — knowing your POI shift", parentId: null, levelIntroduced: 3 },
  { id: "sk-move-lean", name: "Lean / Barricade", category: "movement", description: "Leaning around barricades to access targets while maintaining stable platform", parentId: null, levelIntroduced: 2 },

  // Stage craft
  { id: "sk-stage-plan", name: "Stage Planning", category: "stage_craft", description: "Planning target engagement order and movement", parentId: null, levelIntroduced: 2 },
  { id: "sk-stage-hf", name: "Hit Factor Optimization", category: "stage_craft", description: "Speed vs. accuracy decision-making for scoring", parentId: null, prerequisites: ["sk-shot-call", "sk-pacing", "sk-discipline"], levelIntroduced: 3 },
  { id: "sk-stage-pressure", name: "Shooting Under Pressure", category: "stage_craft", description: "Maintaining performance under match stress", parentId: null, prerequisites: ["sk-discipline", "sk-stage-plan"], levelIntroduced: 2 },
  { id: "sk-stage-classifier", name: "Classifier Execution", category: "stage_craft", description: "Cold performance on classifier stages", parentId: null, prerequisites: ["sk-stage-hf", "sk-stage-pressure"], levelIntroduced: 2 },
  { id: "sk-stage-port", name: "Port Shooting", category: "stage_craft", description: "Engaging targets through ports and narrow openings — positioning, keeping gun out of port", parentId: null, levelIntroduced: 2 },
  { id: "sk-stage-skip", name: "Skipping Targets", category: "stage_craft", description: "Complex engagement sequences where visible targets must be skipped from certain positions", parentId: "sk-stage-plan", prerequisites: ["sk-stage-plan", "sk-discipline"], levelIntroduced: 3 },

  // Single hand
  { id: "sk-sho", name: "Strong Hand Only", category: "single_hand", description: "Shooting with dominant hand only", parentId: null, prerequisites: ["sk-grip", "sk-trigger", "sk-recoil"], levelIntroduced: 1 },
  { id: "sk-who", name: "Weak Hand Only", category: "single_hand", description: "Shooting with non-dominant hand only", parentId: null, prerequisites: ["sk-trigger", "sk-sight"], levelIntroduced: 1 },
  { id: "sk-one-hand-pickup", name: "One-Handed Pickup", category: "single_hand", description: "Establishing proper grip when picking up gun with one hand", parentId: null, levelIntroduced: 2 },

  // Other skills
  { id: "sk-empty-start", name: "Empty Start / Table Pickup", category: "other", description: "Picking up unloaded gun, loading, and engaging targets efficiently", parentId: null, levelIntroduced: 2 },
  { id: "sk-table-start", name: "Table Start / Mag Stuff", category: "other", description: "Grabbing mags, stuffing pouches, loading gun on the move", parentId: null, levelIntroduced: 2 },
  { id: "sk-mover", name: "Moving Target Engagement", category: "other", description: "Timing and engaging swinging/moving targets — shoot by sight, not sound", parentId: null, levelIntroduced: 3 },
];

// ─────────────────────────────────────────
// DRILLS
// ─────────────────────────────────────────
const S = "src-stoeger-park";
const SDR = "src-stoeger-sdr";
const DFR = "src-stoeger-dfr";

export const drills: Drill[] = [
  // ══════════════════════════════════════════
  // STANDARD PRACTICE DRILLS (from both books)
  // ══════════════════════════════════════════
  {
    id: "dr-singles", name: "Singles", sourceId: S, developer: null,
    description: "Draw and engage each of 3 targets with 1 round each. Emphasizes draw speed and transitions. Tests pure transition speed since there's no split on any target.",
    setupInstructions: "3 USPSA targets, 1 yard apart center to center. Engage left to right (or right to left, be consistent).",
    roundCount: 3, targetCount: 3, distances: [3, 5, 7, 10, 15, 20, 25],
    mode: "both", category: "transition_vision", levelIntroduced: 1,
  },
  {
    id: "dr-pairs", name: "Pairs / Doubles", sourceId: S, developer: null,
    description: "Draw and engage a single target with 2 rounds. Tests draw, first shot, and split time. Fire PAIRS, not continuous — pause between pairs to simulate transitioning.",
    setupInstructions: "1 USPSA target. Draw and fire 2 rounds as fast as possible while holding the A-zone.",
    roundCount: 2, targetCount: 1, distances: [3, 5, 7, 10, 15, 20, 25, 50],
    mode: "both", category: "marksmanship", levelIntroduced: 1,
  },
  {
    id: "dr-4aces", name: "4 Aces", sourceId: S, developer: null,
    description: "Draw, fire 2 rounds, reload, fire 2 more rounds on a single target. Tests draw, splits, and reload speed. Rhythm is disrupted by having to fight for grip after reload — this is the point.",
    setupInstructions: "1 USPSA target. Draw, fire 2 rounds, emergency reload, fire 2 more rounds.",
    roundCount: 4, targetCount: 1, distances: [3, 5, 7, 10, 15, 20, 25, 50],
    mode: "both", category: "marksmanship", levelIntroduced: 1,
  },
  {
    id: "dr-bill", name: "Bill Drill", sourceId: S, developer: null,
    description: "Draw and fire 6 rounds on a single target as fast as possible while keeping all hits in the A-zone. The foundational test of grip, trigger control, and recoil management. Rule of thumb: total time ≈ 2x your draw time.",
    setupInstructions: "1 USPSA target. Draw and fire 6 rounds. All hits should be A-zone.",
    roundCount: 6, targetCount: 1, distances: [3, 5, 7, 10, 15, 20, 25, 50],
    mode: "both", category: "marksmanship", levelIntroduced: 1,
  },
  {
    id: "dr-bill-reload-bill", name: "Bill/Reload/Bill", sourceId: S, developer: null,
    description: "Draw, fire 6 rounds, reload, fire 6 more rounds on a single target. Extended Bill Drill testing reload under sustained fire. At close range, tension from going fast makes reload fumbles likely.",
    setupInstructions: "1 USPSA target. Draw, fire 6 rounds, emergency reload, fire 6 more rounds.",
    roundCount: 12, targetCount: 1, distances: [3, 5, 7, 10, 15, 20, 25, 50],
    mode: "both", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-blake", name: "Blake Drill", sourceId: S, developer: "Blake Miguez",
    description: "Draw and engage 3 targets with 2 rounds each. The primary test of transitions combined with split consistency. Key: program trigger to 0.2s splits, force yourself to get gun to next target before it fires again.",
    setupInstructions: "3 USPSA targets, 1 yard apart center to center. Draw, engage each target with 2 rounds, left to right.",
    roundCount: 6, targetCount: 3, distances: [3, 5, 7, 10, 15, 20, 25],
    mode: "both", category: "transition_vision", levelIntroduced: 1,
  },
  {
    id: "dr-elprez", name: "El Presidente", sourceId: S, developer: null,
    description: "Turn, draw, engage 3 targets with 2 rounds each, reload, re-engage each with 2 rounds. The master test combining draw, splits, transitions, and reload. Score: 11-12 HF = good Production, 14+ HF = heroic.",
    setupInstructions: "3 USPSA targets at 10 yards, 1 yard apart. Start facing uprange, wrists above shoulders. On signal: turn 180°, draw, fire 2 rounds each L→R, reload, fire 2 rounds each L→R.",
    roundCount: 12, targetCount: 3, distances: [3, 5, 7, 10, 15, 20, 25, 50],
    mode: "both", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-heads", name: "The Heads", sourceId: SDR, developer: null,
    description: "Draw and engage each of 3 head boxes with 2 rounds. Tests precision transitions and accuracy under time pressure. Scoring varies by distance: close = all A's; 15yd = B's OK; 25yd = any head hit OK.",
    setupInstructions: "3 USPSA targets, 1 yard apart. Draw and engage each head box with 2 rounds.",
    roundCount: 6, targetCount: 3, distances: [5, 7, 10, 15, 20, 25],
    mode: "both", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-crisscross", name: "Criss Cross", sourceId: S, developer: null,
    description: "Engage 3 targets alternating upper/lower A-zones, reload, engage remaining zones. Most complicated Standard Exercise drill. Score by hit factor. Don't attempt until you can make 20yd head shots at speed.",
    setupInstructions: "3 USPSA targets, 1 yard apart. Engage alternating upper/lower A-zones left to right, reload, engage remaining A-zones left to right.",
    roundCount: 12, targetCount: 3, distances: [5, 7, 10, 15, 20, 25],
    mode: "both", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-sho", name: "Strong Hand Only", sourceId: S, developer: null,
    description: "Engage 3 targets with 2 rounds each using strong hand only. Grip firmly. Don't tilt gun — gangsta tilt shifts POI at distance.",
    setupInstructions: "3 USPSA targets, 1 yard apart. Draw with strong hand only, engage each target with 2 rounds.",
    roundCount: 6, targetCount: 3, distances: [3, 5, 7, 10, 15, 20, 25, 50],
    mode: "both", category: "marksmanship", levelIntroduced: 1,
  },
  {
    id: "dr-who", name: "Weak Hand Only", sourceId: S, developer: null,
    description: "Engage 3 targets with 2 rounds each using weak hand only. About half the total time is draw + transfer. Focus on trigger control — firing the gun with your whole hand is the main error.",
    setupInstructions: "3 USPSA targets, 1 yard apart. Draw, transfer to weak hand, engage each target with 2 rounds.",
    roundCount: 6, targetCount: 3, distances: [3, 5, 7, 10, 15, 20, 25, 50],
    mode: "both", category: "marksmanship", levelIntroduced: 1,
  },

  // ══════════════════════════════════════════
  // MARKSMANSHIP DRILLS
  // ══════════════════════════════════════════
  {
    id: "dr-groups", name: "Group Shooting", sourceId: S, developer: null,
    description: "Slow-fire group shooting with no time limit. Focus on trigger control and sight alignment fundamentals. No time limit means NO time limit. Lower gun between shots if needed. Check both group size AND group location.",
    setupInstructions: "1 USPSA target. Fire 5+ round groups with no time limit. Focus on applying trigger pressure continuously without disturbing sights. Use a definitive aiming point.",
    roundCount: 5, targetCount: 1, distances: [7, 15, 25, 50],
    mode: "live_fire", category: "marksmanship", levelIntroduced: 1,
  },
  {
    id: "dr-trigger-speed", name: "Trigger Control at Speed", sourceId: S, developer: null,
    description: "Gun mounted, perfect sight picture, fire 1 shot at the buzzer in under 0.25s. Tests pure trigger speed without disturbing sights.",
    setupInstructions: "1 USPSA target at any distance. Mount gun with perfect sight picture. Finger just out of contact with trigger. At the tone, fire 1 shot under 0.25s or fail.",
    roundCount: 1, targetCount: 1, distances: [5, 7, 10],
    mode: "live_fire", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-practical-accuracy", name: "Practical Accuracy", sourceId: SDR, developer: null,
    description: "A-zone only target, 36 shots (6 strings of 6). PASS/FAIL — do NOT miss the A-zone once in 36 shots. Shoot the speed of your sights. Key drill for building discipline and consistency.",
    setupInstructions: "1 USPSA A-zone only target (paint around or cut out). Start at 10yd, progress to 15, 20, 25yd. Fire 6 strings of 6 rounds. Passing at 20yd = adequate for competition.",
    roundCount: 36, targetCount: 1, distances: [10, 15, 20, 25],
    mode: "live_fire", category: "marksmanship", levelIntroduced: 1,
  },
  {
    id: "dr-doubles", name: "Doubles", sourceId: SDR, developer: null,
    description: "4 pairs of 2 shots per string, 6 strings per distance. Isolates split speed and recoil management. Required split times are a hard requirement — focus on hands/grip, not sight alignment.",
    setupInstructions: "1 USPSA target. Fire 4 pairs of 2 shots per string. Each pair as fast as possible. Pause between pairs. Split goals: 5yd=0.20, 10yd=0.22, 15yd=0.25, 20yd=0.30, 25yd=0.35.",
    roundCount: 48, targetCount: 1, distances: [5, 7, 10, 15, 20, 25],
    mode: "live_fire", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-2at25", name: "2 at 25", sourceId: SDR, developer: null,
    description: "Draw and fire 2 rounds at 25 yards in 2.0 seconds. Draw time ~1.3-1.4s leaves only 0.6-0.7s for the split. Two shots eliminates the luck factor.",
    setupInstructions: "1 USPSA target at 25 yards. Draw and fire 2 rounds. Par time: 2.0 seconds. All A-zone.",
    roundCount: 2, targetCount: 1, distances: [25],
    mode: "live_fire", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-dots", name: "The Dots (Frank Garcia)", sourceId: SDR, developer: "Frank Garcia",
    description: "6 two-inch dots on a USPSA target at 7 yards. 36 shots total (6 strings of 6, one dot per string). PASS/FAIL: 36/36 hits or fail. Incredible pressure builds as you approach 36/36. THE discipline drill.",
    setupInstructions: "6 two-inch diameter dots on a USPSA target at 7 yards. Fire 6 strings of 6 rounds, one dot per string. Par time: 5.0 seconds per string (0.3s grace). Score like USPSA (bullet touching = hit). Start at 3-5yd if 7yd is too hard.",
    roundCount: 36, targetCount: 1, distances: [3, 5, 7, 10],
    mode: "live_fire", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-tight-shots", name: "Tight Shots", sourceId: SDR, developer: null,
    description: "3 partial targets at 30-40 yards with no-shoots covering roughly half the A-zone. Shoot 5-6 times without pasting — goal is zero penalties across all runs.",
    setupInstructions: "3 partial targets at 30-40 yards with no-shoots. 2 rounds per target. Shoot 5-6 runs without pasting. Calculate hit factor. Zero penalties is the goal.",
    roundCount: 6, targetCount: 3, distances: [30, 40],
    mode: "live_fire", category: "marksmanship", levelIntroduced: 3,
  },
  {
    id: "dr-fts-a", name: "Fixed Time Standards A", sourceId: SDR, developer: null,
    description: "3 strings, 4 seconds each. String 1: 30yd freestyle. String 2: 20yd SHO. String 3: 10yd WHO. Goal: 80 pts minor, 85 pts major. Learn to pace shots to fill allotted time.",
    setupInstructions: "3 targets, 1 yard apart. String 1: 6 rounds freestyle at 30yd. String 2: 6 rounds SHO at 20yd. String 3: 6 rounds WHO at 10yd. Par time: 4.0 seconds each.",
    roundCount: 18, targetCount: 3, distances: [10, 20, 30],
    mode: "live_fire", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-fts-b", name: "Fixed Time Standards B", sourceId: SDR, developer: null,
    description: "3 strings, 6 seconds each. String 1: 50yd freestyle. String 2: 40yd SHO. String 3: 30yd WHO. Goal: 75 pts minor, 80 pts major. The big brother of FTS-A.",
    setupInstructions: "3 targets, 1 yard apart. Start wrists above shoulders. String 1: 6 rounds freestyle at 50yd. String 2: 6 rounds SHO at 40yd. String 3: 6 rounds WHO at 30yd. Par time: 6.0 seconds each.",
    roundCount: 18, targetCount: 3, distances: [30, 40, 50],
    mode: "live_fire", category: "marksmanship", levelIntroduced: 3,
  },

  // ══════════════════════════════════════════
  // TRANSITION / VISION DRILLS
  // ══════════════════════════════════════════
  {
    id: "dr-spot-to-spot", name: "Spot to Spot Transitions", sourceId: S, developer: null,
    description: "Dry fire drill: practice moving vision to exact hit points on each target in sequence. No shots fired. Develops visual pickup speed.",
    setupInstructions: "3+ targets at any distance. Move eyes to the exact spot you want to hit on each target in sequence. Look at the exact spot, not the color or shape. Do not sweep or drag your gaze.",
    roundCount: 0, targetCount: 3, distances: [7, 10, 15],
    mode: "dry_fire", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-trans-exit-entry", name: "Transition Exit/Entry", sourceId: S, developer: null,
    description: "Two-part drill isolating transition timing. Part 1 (Exit): shoot target, transition away, don't fire. Part 2 (Entry): transition to target, fire one shot.",
    setupInstructions: "2 USPSA targets, 3 yards apart, 10 yards downrange. Exit drill: engage first target, transition to second, do NOT fire. Entry drill: transition to second target and fire.",
    roundCount: 2, targetCount: 2, distances: [10],
    mode: "both", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-basic-trans", name: "Basic Transitions", sourceId: SDR, developer: null,
    description: "Variable setup: targets at 5-15yd, 2 rounds each, all visible from one spot. No wide transitions, no extremely difficult targets. Key phrase: 'shoot sooner, not faster.' Vary start positions.",
    setupInstructions: "Set up targets at 5-15yd, all visible from one position. 2 rounds per target. Vary start position (hands at sides, wrists above shoulders, facing uprange). Watch for over-transitioning.",
    roundCount: 8, targetCount: 4, distances: [5, 7, 10, 15],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 1,
  },
  {
    id: "dr-low-targets", name: "Low Targets", sourceId: SDR, developer: null,
    description: "Targets placed low on angled stands near ground level. Practice going low-to-high and high-to-low. Swinging up to high targets is the harder direction.",
    setupInstructions: "Multiple targets at normal height plus low targets on 45-degree angled stands. 2 rounds per target. Practice low-to-high and high-to-low transitions.",
    roundCount: 8, targetCount: 4, distances: [5, 7, 10, 15],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-steel-paper", name: "Steel/Paper/Steel", sourceId: SDR, developer: null,
    description: "Mix of steel and paper targets. DO NOT wait for audible confirmation from steel — too slow. Call shots by sight. Steel-to-paper under 0.3s; paper-to-steel about 0.5s.",
    setupInstructions: "Mix of steel and paper targets at 7-15yd. Engage steel and paper in sequence. Call steel hits by sight, not sound. Track split times from steel-to-paper and paper-to-steel.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-accelerator", name: "Accelerator", sourceId: SDR, developer: null,
    description: "Stoeger's favorite drill. 3 targets at 7, 15, 25yd. Tests gear changes — if your splits are the same at 7yd and 25yd, something is wrong. Try all engagement orders.",
    setupInstructions: "3 targets at 7yd, 15yd, and 25yd, about 1 yard apart laterally. 2 rounds each, reload, 2 rounds each again. Under 6.0 seconds with good points. Check timer for split differences at each distance.",
    roundCount: 12, targetCount: 3, distances: [7, 15, 25],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-distance-changeup", name: "Distance Changeup", sourceId: SDR, developer: null,
    description: "2 close targets (5yd) + 1 head box at 15yd. Forces rapid switching between predictive (close) and reactive (far) shooting. Most common error: firing 2nd shot on far target before gun settles.",
    setupInstructions: "2 USPSA targets at 5 yards, 1 head box at 15 yards, 2yd spacing. 2 rounds per target. Under 3.0 seconds. Practice all engagement orders. Aim for A-box in head.",
    roundCount: 6, targetCount: 3, distances: [5, 15],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-dist-trans", name: "Distance Transitions", sourceId: SDR, developer: null,
    description: "Variable setup with targets at mixed distances and difficulties. Calculate goal time from known split and transition times. Experiment with different aiming methods per target.",
    setupInstructions: "Targets at varying distances (5-25yd) and difficulties (open and partial). 2 rounds per target. Calculate expected time from your data. Give each target exactly the time it needs.",
    roundCount: 8, targetCount: 4, distances: [5, 10, 15, 25],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-mxad", name: "MXAD (Matt Xray Alpha Drill)", sourceId: S, developer: null,
    description: "Target at 5 yards + target at 12 yards. 6 rounds on close, 2 on far. Tests switching between fast predictive pairs and precise far shots.",
    setupInstructions: "1 target at 5 yards, 1 target at 12 yards, minimal lateral offset. Draw, fire 6 rounds on close target, 2 rounds on far target.",
    roundCount: 8, targetCount: 2, distances: [5, 12],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-wide-trans", name: "Wide Transitions", sourceId: SDR, developer: null,
    description: "Wide bay, targets on each far side requiring near-180° swing. Over-transitioning is the #1 error. Consider pulling gun toward body during extreme transitions (120°+).",
    setupInstructions: "2 arrays of targets separated by 90°+ angle. 2 rounds per target. Engage one array, swing to the other. Practice 'attack and control' — fast swing, settle, shoot. Vary start positions.",
    roundCount: 8, targetCount: 4, distances: [5, 7, 10, 15],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 3,
  },
  {
    id: "dr-designated", name: "Designated Target", sourceId: S, developer: "Hwansik Kim",
    description: "3-5 targets of varied distance/difficulty. Designate one target and alternate between it and all others. Forces constant distance changes and confirmation scheme switching.",
    setupInstructions: "3-5 targets at varied distances. Pick one as 'designated.' Shoot sequence: designated-1-designated-2-designated-RELOAD-3-designated-4-designated.",
    roundCount: 12, targetCount: 5, distances: [5, 7, 10, 15, 20],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 3,
  },

  // ══════════════════════════════════════════
  // STAGE SKILLS / MOVEMENT DRILLS
  // ══════════════════════════════════════════
  {
    id: "dr-mock-stage", name: "Mock Stage Training", sourceId: S, developer: null,
    description: "Multi-position stage with varied targets. The key training drill for stage craft. Assess patterns: what mistakes happen repeatedly? Keep stages small (12-20 rounds).",
    setupInstructions: "Set up 2-3 positions with 4-8 targets at varying distances. Run the stage multiple times. Change target order every run at Level 3+. Focus on patterns of mistakes.",
    roundCount: 16, targetCount: 6, distances: [5, 7, 10, 15, 25],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 1,
  },
  {
    id: "dr-position-entry", name: "Position Entry", sourceId: SDR, developer: null,
    description: "2 positions ~5yd apart with vision barriers. Gun up and aimed at where target will appear. Bent knees as shock absorbers. Break first shot as soon as you're legal and can see target.",
    setupInstructions: "2 positions, ~5yd apart, with vision barriers. Shoot from position A, move to B, engage targets as soon as you arrive. Check stance at end of each run.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 2,
  },
  {
    id: "dr-position-exit", name: "Position Exit", sourceId: SDR, developer: null,
    description: "2 positions. Engage 2+ easy targets from A (shootable while moving), 1+ from B. Start moving feet while engaging last target at position A.",
    setupInstructions: "2 positions. Easy targets at position A, harder targets at B. Engage A targets while shifting weight toward B. Start moving before last A target shot.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 2,
  },
  {
    id: "dr-short-moves", name: "Short Moves", sourceId: SDR, developer: null,
    description: "Small shooting area, 2-3 steps between positions with wall section as vision barrier. Gun stays at eyeline the whole time. Push with both feet aggressively.",
    setupInstructions: "2 positions, 2-3 steps apart, wall as barrier. Keep gun mounted between positions. Get sight picture on next target before you're stable enough to fire.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 2,
  },
  {
    id: "dr-bar-hop", name: "Bar Hop", sourceId: S, developer: null,
    description: "Engage targets, step over a stick on the ground, re-engage. Blends two positions — gun stays up, continuous shooting sound with no movement gap.",
    setupInstructions: "Place a stick or bar on the ground between 2 shooting positions. Targets visible from both sides. Step over while maintaining gun position. No shoot-move-shoot mentality.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-unmounted-move", name: "Unmounted Movement", sourceId: S, developer: null,
    description: "2+ positions, 5+ steps apart. Dismount gun and run. Have gun up and sights visible before entering next position.",
    setupInstructions: "2 positions 5+ steps apart. Dismount gun, sprint between positions. Gun up and sights visible before you arrive. Finish in stance: knees bent, wide, 50/50 weight.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-mounted-move", name: "Mounted Movement", sourceId: S, developer: null,
    description: "2 positions, 1-4 steps apart. Keep gun up and ready, blend positions. Movement serves the shooting.",
    setupInstructions: "2 positions 1-4 steps apart. Keep gun mounted between positions. Blend the two positions into a continuous engagement. Switch from predictive to reactive when off balance.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-shoot-move", name: "Shooting on the Move", sourceId: SDR, developer: null,
    description: "2 positions 10+ yards apart with multiple easy targets available from anywhere. Put the gas pedal down — conservative roll step is too slow. D's and misses are never acceptable no matter how fast.",
    setupInstructions: "2 positions 10+ yards apart. Multiple easy targets available during movement, 1 target only from B. Engage while moving. Calculate hit factors. Watch for dead time (done shooting but still running).",
    roundCount: 6, targetCount: 3, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-moving-reload", name: "Moving Reload", sourceId: SDR, developer: null,
    description: "2 positions 10+ yards apart. Shoot 2 targets, reload while moving, shoot target 3, then target 4 from position B. Goal: moving reload within 0.1-0.2s of static reload time.",
    setupInstructions: "2 positions 10+ yards apart. Engage 2 targets, reload while moving to B, engage 2 more targets. Practice both left-to-right and right-to-left.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-hitting-spot", name: "Hitting the Spot", sourceId: SDR, developer: null,
    description: "Narrow slit (6 inches between barricades) with fault line. A game of finesse, not brute force. Find markers on ground for foot placement.",
    setupInstructions: "Start box, then narrow opening (6 inches between 2 barricades) with fault line 5yd uprange. Navigate between positions, engage targets through the opening. Do a walkthrough first.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-lean", name: "Lean", sourceId: SDR, developer: null,
    description: "2 positions, barricade at position B forcing lean to see targets. Stay back from barricade. Get outside foot positioned correctly first. Alternate lean sides.",
    setupInstructions: "2 positions. Position B has barricade requiring lean. Engage targets from both sides. Increase lean difficulty progressively. Stay back from barricade.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 2,
  },
  {
    id: "dr-port-setup", name: "Port Setup", sourceId: SDR, developer: null,
    description: "Position B is a shooting port (A-zone cut out of target). Be ready to shoot when you arrive. Keep gun OUT of the port. Always be able to see edge of next target.",
    setupInstructions: "2 positions ~5yd apart. Position B is a shooting port. Plan positioning before the run. Keep gun out of port. Match open-field pace.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 2,
  },
  {
    id: "dr-low-port", name: "Low Port", sourceId: SDR, developer: null,
    description: "3 positions. Position B is a low port that disrupts normal stance. Squatting vs. kneeling: kneeling is more stable but slower to exit.",
    setupInstructions: "3 positions. Position B requires kneeling or squatting to see targets through low port. Keep gun clearly safe during position changes.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-port-to-port", name: "Port to Port", sourceId: SDR, developer: null,
    description: "2 standing shooting ports close together. Engage targets through each. Set up for BOTH ports simultaneously if possible. Keep gun out of ports.",
    setupInstructions: "2 standing shooting ports close together. Engage targets through each port. Variation: reload between ports.",
    roundCount: 8, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-prone", name: "Prone", sourceId: SDR, developer: null,
    description: "Varied targets at varying difficulties, some partial. Most people hit LOW from prone — know your shift. Figure out how to get down (and back up) efficiently.",
    setupInstructions: "Variable targets at varying difficulties. Get into prone position and engage. Know your POI shift. Control foot placement for fault lines.",
    roundCount: 6, targetCount: 3, distances: [10, 15, 25],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-track-a", name: "Track the A Zone", sourceId: S, developer: "Hwansik Kim",
    description: "2 vision barriers 3 yards apart, 4 targets. Engage from 3 positions, tracking the A-zone through vision barriers.",
    setupInstructions: "2 vision barriers 3 yards apart. 4 targets: middle targets 2 yards apart, outside targets 1 yard from nearest middle target. Targets 7 yards from barriers. Engage from 3 positions.",
    roundCount: 8, targetCount: 4, distances: [7],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-go-stop", name: "Go/Stop", sourceId: S, developer: "Hwansik Kim",
    description: "4 positions with cones. Sequence: 1-2-1-3-1-4-1. Physically demanding 'smoker' drill testing movement quality when fatigued.",
    setupInstructions: "4 positions marked with cones. Run sequence: position 1→2→1→3→1→4→1. Must be out of breath. Wide, low stance at each stop. No extraneous steps.",
    roundCount: 12, targetCount: 4, distances: [7, 10],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-soft-stops", name: "Soft Stops", sourceId: S, developer: null,
    description: "3 positions: 1 and 3 require full stops; position 2 allows a 'soft stop' where center of gravity never fully stops. Must shoot target-focused and reactive.",
    setupInstructions: "3 positions. Positions 1 and 3: full stop and engage. Position 2: feet stop momentarily but body keeps moving. Shoot target-focused and reactive at position 2.",
    roundCount: 8, targetCount: 4, distances: [7, 10],
    mode: "live_fire", category: "stage_movement", levelIntroduced: 4,
  },

  // ══════════════════════════════════════════
  // OTHER SKILLS DRILLS (from S&D Reloaded)
  // ══════════════════════════════════════════
  {
    id: "dr-empty-start", name: "Empty Start", sourceId: SDR, developer: null,
    description: "Gun unloaded on table/barrel with magazines. Key is grip quality on pickup and magazine insertion. Stay relaxed — shake out hands before start signal.",
    setupInstructions: "Gun unloaded on table with magazines. Targets of mixed difficulty. On signal: pick up gun, insert magazine, rack slide, engage targets. Practice with gun in awkward positions.",
    roundCount: 6, targetCount: 3, distances: [7, 10, 15],
    mode: "live_fire", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-table-start", name: "Table Start / Mag Stuff", sourceId: SDR, developer: null,
    description: "Gun and mags on table, 2 positions. Must stow mags in pouches and load gun while moving. Look mags into pouches. Decide: load gun first or stuff ammo first?",
    setupInstructions: "Gun and loose mags on table. 2 shooting positions. Grab mags, stuff into pouches, load gun while moving to Position A. Engage targets from both positions.",
    roundCount: 12, targetCount: 4, distances: [7, 10, 15],
    mode: "live_fire", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-one-hand-shoot", name: "One Handed Shooting", sourceId: SDR, developer: null,
    description: "Variable difficulty targets, draw and engage SHO or WHO. Nail the grip on draw/transfer. Practice holding an object in non-firing hand.",
    setupInstructions: "Variable targets. Draw and engage SHO or WHO. Practice holding an object (bag, rope) in non-firing hand. Focus on grip establishment.",
    roundCount: 6, targetCount: 3, distances: [7, 10, 15],
    mode: "live_fire", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-one-hand-lean", name: "One Handed Lean", sourceId: SDR, developer: null,
    description: "Barricade, lean around it, engage targets SHO or WHO. Watch for eye dominance issues with barricade blocking one eye. Don't touch barricade unintentionally.",
    setupInstructions: "Barricade with targets on one side. Lean around barricade and engage targets SHO or WHO. Be aware of eye dominance issues.",
    roundCount: 6, targetCount: 3, distances: [7, 10, 15],
    mode: "live_fire", category: "special", levelIntroduced: 3,
  },
  {
    id: "dr-one-hand-pickup", name: "One Handed Pickup", sourceId: SDR, developer: null,
    description: "Gun on table, pick up with one hand only (non-firing hand stays on table). De-emphasize speed, prioritize perfect grip. Brace gun on table to adjust grip.",
    setupInstructions: "Gun on table. Pick up with one hand only (other hand stays on table). Keep finger out of trigger guard during pickup. Focus on grip quality over speed.",
    roundCount: 4, targetCount: 2, distances: [7, 10],
    mode: "live_fire", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-mover", name: "Mover (Basic)", sourceId: SDR, developer: null,
    description: "Popper to activate swinger, 1 static target near mover. Shoot popper, shoot static, then shoot mover (both shots on first swing). Battle the distraction of seeing mover start.",
    setupInstructions: "Popper to activate swinger. 1 static target near mover. On signal: shoot popper, engage static target, then mover on first swing. B class minimum.",
    roundCount: 6, targetCount: 3, distances: [10, 15],
    mode: "live_fire", category: "special", levelIntroduced: 3,
  },
  {
    id: "dr-mover-sequence", name: "Mover Sequence", sourceId: SDR, developer: null,
    description: "Complex: popper activator, swinger/drop turner, multiple static targets of varying difficulty. Plan first attempt optimally, then try other plans to confirm you chose best.",
    setupInstructions: "Popper activator, swinger/drop turner, multiple static targets left and right. Plan carefully. Execute optimal plan first, then test alternatives.",
    roundCount: 12, targetCount: 6, distances: [7, 10, 15, 25],
    mode: "live_fire", category: "special", levelIntroduced: 3,
  },
  {
    id: "dr-skip-targets", name: "Skipping Targets", sourceId: SDR, developer: null,
    description: "6 targets, 3 positions, complex engagement order (skip some targets from some positions). Best with partner who assigns random orders. Use landmarks to remember plan.",
    setupInstructions: "6 targets across 3 shooting positions. Assign specific targets to specific positions (skip visible targets you shouldn't engage). Randomize with die or training partner.",
    roundCount: 12, targetCount: 6, distances: [7, 10, 15],
    mode: "live_fire", category: "special", levelIntroduced: 3,
  },

  // ══════════════════════════════════════════
  // SPECIAL / CLASSIFIER DRILLS
  // ══════════════════════════════════════════
  {
    id: "dr-confirmation", name: "Confirmation Drill", sourceId: S, developer: "Hwansik Kim",
    description: "Single target at 5 yards, gun mounted. Test 4 different confirmation schemes with 10+ reps each to isolate the effect of aiming strategy on accuracy and time.",
    setupInstructions: "1 USPSA target at 5 yards. Gun mounted, aimed at bottom of target stand. Test each confirmation scheme: (1) Kinesthetic, (2) Color reaction, (2.5) Rough alignment, (3) Full sight picture. 10+ reps each.",
    roundCount: 40, targetCount: 1, distances: [5],
    mode: "live_fire", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-measurement", name: "Measurement Drill", sourceId: S, developer: "Hwansik Kim",
    description: "Fire 1 aimed shot, don't push gun down, fire 2nd shot where gun recoiled to. Measures actual muzzle rise distance — it rises less than you think.",
    setupInstructions: "1 USPSA target at 5 yards. Fire 1 aimed shot. Do NOT push gun down. Fire 2nd shot where gun naturally recoiled to. Measure the gap between holes.",
    roundCount: 10, targetCount: 1, distances: [5],
    mode: "live_fire", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-sight-tracking", name: "Sight Tracking", sourceId: S, developer: null,
    description: "No target needed. Fire into backstop while watching sights closely. Notice how grip pressure changes affect sight tracking through recoil.",
    setupInstructions: "No specific target needed. Fire into backstop. Watch sights closely through entire recoil cycle. Experiment with grip pressure and notice tracking changes.",
    roundCount: 10, targetCount: 0, distances: [5],
    mode: "live_fire", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-rhythm", name: "Rhythm Drill", sourceId: S, developer: null,
    description: "El Prez array, close (1yd apart), near (7yd). Establish even rhythm for all splits and transitions. WARNING: Training only, never shoot this way in a match.",
    setupInstructions: "3 USPSA targets, 1 yard apart, at 7 yards max. Fire all shots at an even rhythm (e.g., all 0.50s splits). Speed up until technique breaks, then back off slightly.",
    roundCount: 12, targetCount: 3, distances: [3, 5, 7],
    mode: "live_fire", category: "special", levelIntroduced: 3,
  },
  {
    id: "dr-classifier", name: "Classifier Training", sourceId: S, developer: null,
    description: "Run any USPSA classifier stage. The standard test of overall competitive readiness.",
    setupInstructions: "Set up any USPSA classifier per its official stage description. Run for score. Compare hit factor to national high hit factor percentages.",
    roundCount: 12, targetCount: 4, distances: [7, 10, 15, 25],
    mode: "live_fire", category: "special", levelIntroduced: 1,
  },

  // ── PLATE RACK DRILLS (from S&D Reloaded) ──
  {
    id: "dr-plate-straight", name: "Plate Rack: Straight Six", sourceId: SDR, developer: null,
    description: "Draw and knock down all 6 plates as fast as possible. The standard plate rack test.",
    setupInstructions: "6-plate rack. Draw and engage all 6 plates left to right (or right to left). Clean run = all 6 down.",
    roundCount: 6, targetCount: 6, distances: [10, 15, 20, 25],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-plate-pick2", name: "Plate Rack: Pick Two", sourceId: SDR, developer: null,
    description: "Draw and knock down 2 adjacent plates. Focus on draw quality and split.",
    setupInstructions: "6-plate rack. Draw and engage 2 adjacent plates only. Reset and change which 2 plates each run.",
    roundCount: 2, targetCount: 2, distances: [10, 15, 20, 25],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-plate-3load3", name: "Plate Rack: Three Load Three", sourceId: SDR, developer: null,
    description: "Draw, knock down 3 plates, reload, knock down remaining 3.",
    setupInstructions: "6-plate rack. Draw, engage 3 plates, reload, engage remaining 3 plates.",
    roundCount: 6, targetCount: 6, distances: [10, 15, 20, 25],
    mode: "live_fire", category: "transition_vision", levelIntroduced: 2,
  },

  // ══════════════════════════════════════════
  // DRY FIRE RELOADED DRILLS
  // ══════════════════════════════════════════
  {
    id: "dr-distance-draw", name: "Distance Draw", sourceId: DFR, developer: null,
    description: "Draw to sight picture appropriate for 25yd A-zone hit. Do NOT pull trigger — this isolates draw quality and sight alignment at distance. Par: 1.0s at 25yd, 1.3s at 50yd.",
    setupInstructions: "1 target at simulated 25 or 50 yards. Hands at sides. Draw and acquire sight picture appropriate for distance. Do NOT pull trigger. Check sight alignment quality.",
    roundCount: 0, targetCount: 1, distances: [25, 50],
    mode: "dry_fire", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-distance-draw-sho", name: "Distance Draw One-Handed", sourceId: DFR, developer: null,
    description: "Draw to sight picture at 25yd with one hand only. SHO par: 1.2s, WHO par: 1.8s. Do NOT pull trigger.",
    setupInstructions: "1 target at simulated 25 yards. Draw with one hand only and acquire appropriate sight picture. Do NOT pull trigger.",
    roundCount: 0, targetCount: 1, distances: [25],
    mode: "dry_fire", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-partials-df", name: "Partials", sourceId: DFR, developer: null,
    description: "3 half-A-zone partial targets at 25yd. Draw and engage each with 2 rounds. Tests precision under time at distance. GM par: 3.5s.",
    setupInstructions: "3 half-A-zone partial targets at simulated 25 yards. Draw and engage each target with 2 rounds. Alternate start positions (hands at sides, wrists above shoulders).",
    roundCount: 6, targetCount: 3, distances: [25],
    mode: "both", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-triple-reloads", name: "Triple Reloads", sourceId: DFR, developer: null,
    description: "Draw, fire 6 on target 1, reload, fire 6 on target 2, reload, fire 6 on target 3. Tests reload consistency under sustained cadence. GM par: 4.8s.",
    setupInstructions: "3 targets at 7yd. Draw, engage target 1 with 6 rounds, emergency reload, engage target 2 with 6 rounds, emergency reload, engage target 3 with 6 rounds.",
    roundCount: 18, targetCount: 3, distances: [7, 10],
    mode: "both", category: "marksmanship", levelIntroduced: 2,
  },
  {
    id: "dr-quick-step", name: "Quick Step", sourceId: DFR, developer: null,
    description: "Start outside a 1yd box. Draw and engage 3 targets with 2 rounds each, cross the box (cannot fire inside), engage 1 target with 2 more from the other side. GM par: 3.5s.",
    setupInstructions: "1-yard square box on ground. 3 targets at 10yd. Start outside box. Draw, engage targets, cross box without firing, engage final target from far side.",
    roundCount: 8, targetCount: 3, distances: [10],
    mode: "both", category: "stage_movement", levelIntroduced: 2,
  },
  {
    id: "dr-90-trans", name: "90° Transitions", sourceId: DFR, developer: null,
    description: "2 targets placed in corner requiring 90° swing. Engage each with 2 rounds. Must use legs to drive the transition, not just arms. Alternate engagement order.",
    setupInstructions: "2 targets at 90° angle from shooting position (e.g., corner of room). Draw, engage each with 2 rounds. Alternate which target first.",
    roundCount: 4, targetCount: 2, distances: [7, 10],
    mode: "both", category: "transition_vision", levelIntroduced: 3,
  },
  {
    id: "dr-180-trans", name: "180° Transitions", sourceId: DFR, developer: null,
    description: "2 targets at 180° separation. Start facing center. Extreme transition — consider pulling gun close to body during swing. Alternate engagement order.",
    setupInstructions: "2 targets at 180° from each other. Start facing between them. Draw, engage each with 2 rounds. Use footwork to drive the transition. Pull gun in close during swing.",
    roundCount: 4, targetCount: 2, distances: [7, 10],
    mode: "both", category: "transition_vision", levelIntroduced: 3,
  },
  {
    id: "dr-widen-trans", name: "Widening Transitions", sourceId: DFR, developer: null,
    description: "Progressive overload: start with 3 targets edge-to-edge. Set par time. Every few reps, widen spacing without changing par. Continue until failure. Finds your transition speed limit.",
    setupInstructions: "3 targets starting edge-to-edge. Set a par time for engaging each with 2 rounds. Every 3-4 reps, move targets wider apart. Do NOT change the par time. When you fail, that's your limit.",
    roundCount: 6, targetCount: 3, distances: [7, 10],
    mode: "both", category: "transition_vision", levelIntroduced: 2,
  },
  {
    id: "dr-skip-rope", name: "Skip Rope", sourceId: DFR, developer: null,
    description: "Line on floor perpendicular to target. Draw, get sight picture, push laterally across line, get sight picture. Repeat for 4 movements (5 sight pictures). GM par: 4.0s. Gun stays high.",
    setupInstructions: "Line or rope on floor perpendicular to target. 1 target at 7-10yd. Draw, get sight picture. Push laterally across line, get sight picture. 4 total lateral movements, 5 sight pictures.",
    roundCount: 0, targetCount: 1, distances: [7, 10],
    mode: "dry_fire", category: "stage_movement", levelIntroduced: 2,
  },
  {
    id: "dr-skip-rope-reload", name: "Skip Rope Reloads", sourceId: DFR, developer: null,
    description: "Same as Skip Rope but reload each time you cross the line. 4 movements + 4 reloads + 5 sight pictures. GM par: 6.0s. Tests reload during short lateral movement.",
    setupInstructions: "Same as Skip Rope. Each time you cross the line, execute a reload before acquiring next sight picture. 4 movements, 4 reloads, 5 sight pictures.",
    roundCount: 0, targetCount: 1, distances: [7, 10],
    mode: "dry_fire", category: "stage_movement", levelIntroduced: 2,
  },
  {
    id: "dr-running-reload", name: "Running Reloads", sourceId: DFR, developer: null,
    description: "Run a circular pattern at top speed, executing a reload every 2-3 seconds. Go through all belt magazines. Tests reload mechanics at full sprint — no aiming involved.",
    setupInstructions: "Set up markers in a circular pattern. Run the circle at full speed. Execute a reload every 2-3 seconds. Go through all belt magazines. Focus on clean magazine insertion at speed.",
    roundCount: 0, targetCount: 0, distances: [7],
    mode: "dry_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-back-forth", name: "Back and Forth", sourceId: DFR, developer: null,
    description: "2 positions 10+ feet apart, 1 target at each. Get sight picture, explode to opposite position, get sight picture. Repeat for 4 total movements. Tests explosive direction changes from stable stance.",
    setupInstructions: "2 positions at least 10 feet apart, 1 target at each. Get sight picture at position A, move explosively to B, get sight picture, return to A. 4 total movements.",
    roundCount: 0, targetCount: 2, distances: [7, 10],
    mode: "dry_fire", category: "stage_movement", levelIntroduced: 2,
  },
  {
    id: "dr-back-forth-reload", name: "Back and Forth Reloads", sourceId: DFR, developer: null,
    description: "Same as Back and Forth but reload on every movement. 4 movements + 4 reloads. Tests direction changes combined with magazine changes.",
    setupInstructions: "Same as Back and Forth. Execute a reload on every movement between positions. 4 movements, 4 reloads.",
    roundCount: 0, targetCount: 2, distances: [7, 10],
    mode: "dry_fire", category: "stage_movement", levelIntroduced: 3,
  },
  {
    id: "dr-seated-start", name: "Seated Start", sourceId: DFR, developer: null,
    description: "Start seated, butt on chair, hands on knees. Draw and engage targets with 2 rounds each. Must stand and draw simultaneously — watch muzzle safety and chair snag.",
    setupInstructions: "Chair, 2-3 targets at 10yd. Start seated with butt on chair, hands on knees. At signal, stand and draw, engage each target with 2 rounds. Watch for gun snagging on chair back.",
    roundCount: 6, targetCount: 3, distances: [7, 10],
    mode: "both", category: "special", levelIntroduced: 2,
  },
  {
    id: "dr-prop-manip", name: "Prop Manipulation", sourceId: DFR, developer: null,
    description: "Engage targets, reload, move a prop from one side of shooting area to the other, engage targets again. Tests smooth prop handling without disrupting shooting flow.",
    setupInstructions: "3 targets at 10yd. Prop (soda can, bag) placed outside shooting box. Draw, engage targets with 2 rounds each, reload, move prop across area, engage targets again with 2 rounds each.",
    roundCount: 12, targetCount: 3, distances: [7, 10],
    mode: "both", category: "special", levelIntroduced: 3,
  },
  {
    id: "dr-shoot-move-hard", name: "Shooting While Moving (Hard)", sourceId: DFR, developer: null,
    description: "3 targets at 10yd, engage HEAD BOXES with 2 rounds each while taking 3 large steps. The precision version of shooting on the move. GM par: 3.5s.",
    setupInstructions: "3 targets at 10yd with head boxes (or partial targets). Draw and engage head box of each target with 2 rounds while taking 3 large steps. Alternate direction.",
    roundCount: 6, targetCount: 3, distances: [10],
    mode: "both", category: "stage_movement", levelIntroduced: 3,
  },
];

// ─────────────────────────────────────────
// DRILL → SKILL MAPPINGS
// ─────────────────────────────────────────
export const drillSkillMaps: DrillSkillMap[] = [
  // Singles
  { drillId: "dr-singles", skillId: "sk-draw", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-singles", skillId: "sk-trans-close", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-singles", skillId: "sk-draw-first", encompassingWeight: 0.8, isPrimary: false },

  // Pairs / Doubles (standard)
  { drillId: "dr-pairs", skillId: "sk-draw", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-pairs", skillId: "sk-cadence", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-pairs", skillId: "sk-grip-recoil", encompassingWeight: 0.7, isPrimary: false },

  // 4 Aces
  { drillId: "dr-4aces", skillId: "sk-draw", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-4aces", skillId: "sk-reload-stand", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-4aces", skillId: "sk-cadence", encompassingWeight: 0.6, isPrimary: false },

  // Bill Drill
  { drillId: "dr-bill", skillId: "sk-draw", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-bill", skillId: "sk-grip", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-bill", skillId: "sk-trigger", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-bill", skillId: "sk-recoil", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-bill", skillId: "sk-cadence", encompassingWeight: 1.0, isPrimary: true },

  // Bill/Reload/Bill
  { drillId: "dr-bill-reload-bill", skillId: "sk-draw", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-bill-reload-bill", skillId: "sk-cadence", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-bill-reload-bill", skillId: "sk-reload-stand", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-bill-reload-bill", skillId: "sk-grip-recoil", encompassingWeight: 0.8, isPrimary: false },

  // Blake Drill
  { drillId: "dr-blake", skillId: "sk-draw", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-blake", skillId: "sk-trans", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-blake", skillId: "sk-cadence", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-blake", skillId: "sk-sight-pickup", encompassingWeight: 0.8, isPrimary: false },

  // El Presidente
  { drillId: "dr-elprez", skillId: "sk-draw", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-elprez", skillId: "sk-cadence", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-elprez", skillId: "sk-trans", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-elprez", skillId: "sk-reload-stand", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-elprez", skillId: "sk-stage-classifier", encompassingWeight: 1.0, isPrimary: true },

  // Heads
  { drillId: "dr-heads", skillId: "sk-draw", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-heads", skillId: "sk-trans", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-heads", skillId: "sk-confirm-3", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-heads", skillId: "sk-discipline", encompassingWeight: 0.7, isPrimary: false },

  // Criss Cross
  { drillId: "dr-crisscross", skillId: "sk-trans", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-crisscross", skillId: "sk-reload-stand", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-crisscross", skillId: "sk-sight", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-crisscross", skillId: "sk-confirm", encompassingWeight: 0.8, isPrimary: false },

  // SHO / WHO
  { drillId: "dr-sho", skillId: "sk-sho", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-sho", skillId: "sk-trigger", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-sho", skillId: "sk-recoil", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-who", skillId: "sk-who", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-who", skillId: "sk-trigger", encompassingWeight: 0.5, isPrimary: false },

  // Marksmanship drills
  { drillId: "dr-groups", skillId: "sk-trigger-press", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-groups", skillId: "sk-grip", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-groups", skillId: "sk-confirm-3", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-trigger-speed", skillId: "sk-trigger-press", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-trigger-speed", skillId: "sk-trigger-reset", encompassingWeight: 0.5, isPrimary: false },
  { drillId: "dr-practical-accuracy", skillId: "sk-sight-track", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-practical-accuracy", skillId: "sk-grip-recoil", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-practical-accuracy", skillId: "sk-discipline", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-doubles", skillId: "sk-cadence", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-doubles", skillId: "sk-recoil-return", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-doubles", skillId: "sk-grip-recoil", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-2at25", skillId: "sk-draw", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-2at25", skillId: "sk-trigger", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-2at25", skillId: "sk-grip", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-dots", skillId: "sk-discipline", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-dots", skillId: "sk-trigger-press", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-dots", skillId: "sk-confirm-3", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-tight-shots", skillId: "sk-confirm-3", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-tight-shots", skillId: "sk-stage-hf", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-fts-a", skillId: "sk-pacing", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-fts-a", skillId: "sk-sho", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-fts-a", skillId: "sk-who", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-fts-b", skillId: "sk-pacing", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-fts-b", skillId: "sk-sho", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-fts-b", skillId: "sk-who", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-fts-b", skillId: "sk-confirm-3", encompassingWeight: 0.7, isPrimary: false },

  // Transition/Vision drills
  { drillId: "dr-spot-to-spot", skillId: "sk-sight-pickup", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-spot-to-spot", skillId: "sk-trans-exit-entry", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-trans-exit-entry", skillId: "sk-trans-exit-entry", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-trans-exit-entry", skillId: "sk-sight-pickup", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-basic-trans", skillId: "sk-trans", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-basic-trans", skillId: "sk-draw", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-low-targets", skillId: "sk-trans-low", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-low-targets", skillId: "sk-trans", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-steel-paper", skillId: "sk-trans-steel", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-steel-paper", skillId: "sk-shot-call", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-accelerator", skillId: "sk-trans-near-far", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-accelerator", skillId: "sk-pacing", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-accelerator", skillId: "sk-confirm", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-accelerator", skillId: "sk-reload-stand", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-distance-changeup", skillId: "sk-trans-near-far", encompassingWeight: 0.9, isPrimary: true },
  { drillId: "dr-distance-changeup", skillId: "sk-confirm", encompassingWeight: 1.0, isPrimary: false },
  { drillId: "dr-dist-trans", skillId: "sk-pacing", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-dist-trans", skillId: "sk-trans-near-far", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-dist-trans", skillId: "sk-confirm", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-mxad", skillId: "sk-trans-near-far", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-mxad", skillId: "sk-cadence", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-mxad", skillId: "sk-confirm", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-wide-trans", skillId: "sk-trans-wide", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-wide-trans", skillId: "sk-trans", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-designated", skillId: "sk-trans", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-designated", skillId: "sk-trans-near-far", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-designated", skillId: "sk-confirm", encompassingWeight: 0.9, isPrimary: false },

  // Plate rack drills
  { drillId: "dr-plate-straight", skillId: "sk-trans-close", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-plate-straight", skillId: "sk-draw", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-plate-straight", skillId: "sk-shot-call", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-plate-pick2", skillId: "sk-draw", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-plate-pick2", skillId: "sk-cadence", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-plate-3load3", skillId: "sk-reload-stand", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-plate-3load3", skillId: "sk-trans-close", encompassingWeight: 0.8, isPrimary: false },

  // Movement drills
  { drillId: "dr-mock-stage", skillId: "sk-stage-plan", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-mock-stage", skillId: "sk-move-entry", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-mock-stage", skillId: "sk-move-exit", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-position-entry", skillId: "sk-move-entry", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-position-entry", skillId: "sk-draw", encompassingWeight: 0.5, isPrimary: false },
  { drillId: "dr-position-exit", skillId: "sk-move-exit", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-position-exit", skillId: "sk-move-entry", encompassingWeight: 0.5, isPrimary: false },
  { drillId: "dr-short-moves", skillId: "sk-move-short", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-short-moves", skillId: "sk-move-mounted", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-bar-hop", skillId: "sk-move-mounted", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-bar-hop", skillId: "sk-move-entry", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-unmounted-move", skillId: "sk-move-unmounted", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-unmounted-move", skillId: "sk-move-entry", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-unmounted-move", skillId: "sk-move-exit", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-mounted-move", skillId: "sk-move-mounted", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-hitting-spot", skillId: "sk-move-entry", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-hitting-spot", skillId: "sk-stage-port", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-lean", skillId: "sk-move-lean", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-lean", skillId: "sk-confirm-3", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-port-setup", skillId: "sk-stage-port", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-port-setup", skillId: "sk-move-entry", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-low-port", skillId: "sk-stage-port", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-low-port", skillId: "sk-move-prone", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-port-to-port", skillId: "sk-stage-port", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-port-to-port", skillId: "sk-move-short", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-prone", skillId: "sk-move-prone", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-prone", skillId: "sk-confirm-3", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-shoot-move", skillId: "sk-move-shoot", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-moving-reload", skillId: "sk-reload-move", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-moving-reload", skillId: "sk-move-unmounted", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-track-a", skillId: "sk-move-entry", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-track-a", skillId: "sk-trans", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-track-a", skillId: "sk-stage-plan", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-go-stop", skillId: "sk-move-entry", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-go-stop", skillId: "sk-move-exit", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-go-stop", skillId: "sk-move-direction", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-soft-stops", skillId: "sk-move-soft", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-soft-stops", skillId: "sk-move-shoot", encompassingWeight: 0.7, isPrimary: false },

  // Other skills drills
  { drillId: "dr-empty-start", skillId: "sk-empty-start", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-empty-start", skillId: "sk-draw-grip", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-table-start", skillId: "sk-table-start", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-table-start", skillId: "sk-reload-move", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-one-hand-shoot", skillId: "sk-sho", encompassingWeight: 0.8, isPrimary: true },
  { drillId: "dr-one-hand-shoot", skillId: "sk-who", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-one-hand-lean", skillId: "sk-move-lean", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-one-hand-lean", skillId: "sk-sho", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-one-hand-pickup", skillId: "sk-one-hand-pickup", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-mover", skillId: "sk-mover", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-mover", skillId: "sk-discipline", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-mover-sequence", skillId: "sk-mover", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-mover-sequence", skillId: "sk-stage-plan", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-skip-targets", skillId: "sk-stage-skip", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-skip-targets", skillId: "sk-stage-plan", encompassingWeight: 0.8, isPrimary: false },

  // Dry Fire Reloaded drills
  { drillId: "dr-distance-draw", skillId: "sk-draw", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-distance-draw", skillId: "sk-confirm-3", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-distance-draw-sho", skillId: "sk-sho", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-distance-draw-sho", skillId: "sk-who", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-distance-draw-sho", skillId: "sk-draw", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-partials-df", skillId: "sk-confirm-3", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-partials-df", skillId: "sk-draw", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-partials-df", skillId: "sk-trans", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-triple-reloads", skillId: "sk-reload-stand", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-triple-reloads", skillId: "sk-cadence", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-triple-reloads", skillId: "sk-tension", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-quick-step", skillId: "sk-move-short", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-quick-step", skillId: "sk-move-entry", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-quick-step", skillId: "sk-draw", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-90-trans", skillId: "sk-trans-wide", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-90-trans", skillId: "sk-draw", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-180-trans", skillId: "sk-trans-wide", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-180-trans", skillId: "sk-move-direction", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-widen-trans", skillId: "sk-trans", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-widen-trans", skillId: "sk-discipline", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-skip-rope", skillId: "sk-move-short", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-skip-rope", skillId: "sk-move-entry", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-skip-rope-reload", skillId: "sk-reload-move", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-skip-rope-reload", skillId: "sk-move-short", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-running-reload", skillId: "sk-reload-move", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-running-reload", skillId: "sk-tension", encompassingWeight: 0.7, isPrimary: false },
  { drillId: "dr-back-forth", skillId: "sk-move-direction", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-back-forth", skillId: "sk-move-entry", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-back-forth", skillId: "sk-move-exit", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-back-forth-reload", skillId: "sk-reload-move", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-back-forth-reload", skillId: "sk-move-direction", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-seated-start", skillId: "sk-empty-start", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-seated-start", skillId: "sk-draw", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-prop-manip", skillId: "sk-stage-plan", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-prop-manip", skillId: "sk-reload-stand", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-prop-manip", skillId: "sk-discipline", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-shoot-move-hard", skillId: "sk-move-shoot", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-shoot-move-hard", skillId: "sk-confirm-3", encompassingWeight: 0.8, isPrimary: false },

  // Special drills
  { drillId: "dr-confirmation", skillId: "sk-confirm", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-confirmation", skillId: "sk-confirm-1", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-confirmation", skillId: "sk-confirm-2", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-confirmation", skillId: "sk-confirm-3", encompassingWeight: 0.8, isPrimary: false },
  { drillId: "dr-measurement", skillId: "sk-recoil-return", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-sight-tracking", skillId: "sk-sight-track", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-sight-tracking", skillId: "sk-grip", encompassingWeight: 0.6, isPrimary: false },
  { drillId: "dr-rhythm", skillId: "sk-cadence", encompassingWeight: 0.9, isPrimary: false },
  { drillId: "dr-rhythm", skillId: "sk-trans-close", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-classifier", skillId: "sk-stage-classifier", encompassingWeight: 1.0, isPrimary: true },
  { drillId: "dr-classifier", skillId: "sk-stage-pressure", encompassingWeight: 0.8, isPrimary: false },
];

// ─────────────────────────────────────────
// BENCHMARKS
// Standard Practice Setup = 3 targets, 1 yard apart
// Times from Skills and Drills Reloaded (GM-level)
// plus B-class and M-class from both books
// ─────────────────────────────────────────

function b(drillId: string, classification: DrillBenchmark["classification"], dist: number, time: number, draw: number | null = null, reload: number | null = null, accuracy = "all A-zone"): DrillBenchmark {
  return { drillId, classification, fireMode: "live_fire", distanceYards: dist, targetTime: time, targetAccuracy: accuracy, drawTime: draw, reloadTime: reload };
}

export const benchmarks: DrillBenchmark[] = [
  // ── PAIRS / DOUBLES (Standard) ──
  // GM (from S&D Reloaded Standard Practice Setup)
  b("dr-pairs", "GM", 3, 1.0, 1.0), b("dr-pairs", "GM", 5, 1.1, 1.0), b("dr-pairs", "GM", 7, 1.2, 1.0),
  b("dr-pairs", "GM", 10, 1.3, 1.0), b("dr-pairs", "GM", 15, 1.5, 1.0), b("dr-pairs", "GM", 20, 1.8, 1.0),
  b("dr-pairs", "GM", 25, 2.0, 1.0), b("dr-pairs", "GM", 50, 3.0, 1.0),
  // B class
  b("dr-pairs", "B", 3, 1.3, 1.2), b("dr-pairs", "B", 5, 1.4, 1.2), b("dr-pairs", "B", 7, 1.5, 1.2),
  b("dr-pairs", "B", 10, 1.6, 1.2), b("dr-pairs", "B", 15, 1.8, 1.2), b("dr-pairs", "B", 20, 2.0, 1.2),
  b("dr-pairs", "B", 25, 2.5, 1.2),
  // M class (interpolated between B and GM)
  b("dr-pairs", "M", 3, 1.2, 1.0), b("dr-pairs", "M", 5, 1.2, 1.0), b("dr-pairs", "M", 7, 1.3, 1.0),
  b("dr-pairs", "M", 10, 1.4, 1.0), b("dr-pairs", "M", 15, 1.6, 1.0), b("dr-pairs", "M", 20, 1.9, 1.0),
  b("dr-pairs", "M", 25, 2.2, 1.0),

  // ── BILL DRILL ──
  // GM
  b("dr-bill", "GM", 3, 1.7, 1.0), b("dr-bill", "GM", 5, 1.8, 1.0), b("dr-bill", "GM", 7, 2.0, 1.0),
  b("dr-bill", "GM", 10, 2.2, 1.0), b("dr-bill", "GM", 15, 2.5, 1.0), b("dr-bill", "GM", 20, 3.2, 1.0),
  b("dr-bill", "GM", 25, 4.0, 1.0), b("dr-bill", "GM", 50, 6.0, 1.0),
  // B class
  b("dr-bill", "B", 3, 2.0, 1.2), b("dr-bill", "B", 5, 2.2, 1.2), b("dr-bill", "B", 7, 2.5, 1.2),
  b("dr-bill", "B", 10, 2.7, 1.2), b("dr-bill", "B", 15, 3.0, 1.2), b("dr-bill", "B", 20, 4.0, 1.2),
  b("dr-bill", "B", 25, 5.0, 1.2),
  // M class
  b("dr-bill", "M", 3, 1.8, 1.0), b("dr-bill", "M", 5, 2.0, 1.0), b("dr-bill", "M", 7, 2.2, 1.0),
  b("dr-bill", "M", 10, 2.4, 1.0), b("dr-bill", "M", 15, 2.8, 1.0), b("dr-bill", "M", 20, 3.5, 1.0),
  b("dr-bill", "M", 25, 4.5, 1.0),

  // ── BLAKE DRILL ──
  // GM
  b("dr-blake", "GM", 5, 1.8, 1.0), b("dr-blake", "GM", 7, 2.0, 1.0),
  b("dr-blake", "GM", 10, 2.2, 1.0), b("dr-blake", "GM", 15, 2.5, 1.0),
  // B class
  b("dr-blake", "B", 5, 2.2, 1.2), b("dr-blake", "B", 7, 2.5, 1.2),
  b("dr-blake", "B", 10, 2.8, 1.2), b("dr-blake", "B", 15, 3.5, 1.2),
  // M class
  b("dr-blake", "M", 5, 2.0, 1.0), b("dr-blake", "M", 7, 2.2, 1.0),
  b("dr-blake", "M", 10, 2.5, 1.0), b("dr-blake", "M", 15, 3.0, 1.0),

  // ── SINGLES ──
  // GM
  b("dr-singles", "GM", 3, 1.2, 1.0), b("dr-singles", "GM", 5, 1.3, 1.0), b("dr-singles", "GM", 7, 1.4, 1.0),
  b("dr-singles", "GM", 10, 1.6, 1.0), b("dr-singles", "GM", 15, 1.8, 1.0), b("dr-singles", "GM", 20, 2.2, 1.0),
  b("dr-singles", "GM", 25, 2.6, 1.0),
  // B class
  b("dr-singles", "B", 3, 1.5, 1.2), b("dr-singles", "B", 5, 1.7, 1.2), b("dr-singles", "B", 7, 1.9, 1.2),
  b("dr-singles", "B", 10, 2.1, 1.2), b("dr-singles", "B", 15, 2.5, 1.2), b("dr-singles", "B", 20, 3.0, 1.2),
  b("dr-singles", "B", 25, 3.5, 1.2),
  // M class
  b("dr-singles", "M", 3, 1.3, 1.0), b("dr-singles", "M", 5, 1.5, 1.0), b("dr-singles", "M", 7, 1.6, 1.0),
  b("dr-singles", "M", 10, 1.8, 1.0), b("dr-singles", "M", 15, 2.0, 1.0), b("dr-singles", "M", 20, 2.5, 1.0),
  b("dr-singles", "M", 25, 3.0, 1.0),

  // ── EL PRESIDENTE ──
  // GM
  b("dr-elprez", "GM", 7, 4.8, 1.1, 1.1), b("dr-elprez", "GM", 10, 5.0, 1.1, 1.1),
  b("dr-elprez", "GM", 15, 6.0, 1.1, 1.1), b("dr-elprez", "GM", 20, 7.0, 1.1, 1.1),
  b("dr-elprez", "GM", 25, 8.0, 1.1, 1.1), b("dr-elprez", "GM", 50, 12.0, 1.1, 1.1),
  // B class
  b("dr-elprez", "B", 7, 6.0, 1.5, 1.5), b("dr-elprez", "B", 10, 6.5, 1.5, 1.5),
  b("dr-elprez", "B", 15, 7.5, 1.5, 1.5), b("dr-elprez", "B", 25, 12.0, 1.5, 1.5),
  // M class
  b("dr-elprez", "M", 7, 5.2, 1.2, 1.2), b("dr-elprez", "M", 10, 5.5, 1.2, 1.2),
  b("dr-elprez", "M", 15, 6.5, 1.2, 1.2), b("dr-elprez", "M", 20, 7.5, 1.2, 1.2),
  b("dr-elprez", "M", 25, 9.0, 1.2, 1.2),

  // ── 4 ACES ──
  // GM
  b("dr-4aces", "GM", 3, 2.2, 1.0, 1.1), b("dr-4aces", "GM", 5, 2.3, 1.0, 1.1), b("dr-4aces", "GM", 7, 2.5, 1.0, 1.1),
  b("dr-4aces", "GM", 10, 2.7, 1.0, 1.1), b("dr-4aces", "GM", 15, 3.0, 1.0, 1.1), b("dr-4aces", "GM", 20, 3.5, 1.0, 1.1),
  b("dr-4aces", "GM", 25, 4.0, 1.0, 1.1), b("dr-4aces", "GM", 50, 6.0, 1.0, 1.1),
  // B class
  b("dr-4aces", "B", 3, 3.0, 1.2, 1.5), b("dr-4aces", "B", 5, 3.2, 1.2, 1.5), b("dr-4aces", "B", 7, 3.5, 1.2, 1.5),
  b("dr-4aces", "B", 10, 4.0, 1.2, 1.5), b("dr-4aces", "B", 15, 4.5, 1.2, 1.5), b("dr-4aces", "B", 20, 5.0, 1.2, 1.5),
  b("dr-4aces", "B", 25, 5.5, 1.2, 1.5),
  // M class
  b("dr-4aces", "M", 3, 2.5, 1.0, 1.2), b("dr-4aces", "M", 5, 2.7, 1.0, 1.2), b("dr-4aces", "M", 7, 2.8, 1.0, 1.2),
  b("dr-4aces", "M", 10, 3.2, 1.0, 1.2), b("dr-4aces", "M", 15, 3.5, 1.0, 1.2), b("dr-4aces", "M", 20, 4.0, 1.0, 1.2),
  b("dr-4aces", "M", 25, 4.5, 1.0, 1.2),

  // ── BILL/RELOAD/BILL ──
  // GM
  b("dr-bill-reload-bill", "GM", 3, 3.5, 1.0, 1.1), b("dr-bill-reload-bill", "GM", 5, 4.0, 1.0, 1.1),
  b("dr-bill-reload-bill", "GM", 7, 4.5, 1.0, 1.1), b("dr-bill-reload-bill", "GM", 10, 5.0, 1.0, 1.1),
  b("dr-bill-reload-bill", "GM", 15, 6.0, 1.0, 1.1), b("dr-bill-reload-bill", "GM", 20, 7.0, 1.0, 1.1),
  b("dr-bill-reload-bill", "GM", 25, 7.5, 1.0, 1.1), b("dr-bill-reload-bill", "GM", 50, 12.0, 1.0, 1.1),
  // B class
  b("dr-bill-reload-bill", "B", 3, 5.0, 1.2, 1.5), b("dr-bill-reload-bill", "B", 5, 5.5, 1.2, 1.5),
  b("dr-bill-reload-bill", "B", 7, 6.0, 1.2, 1.5), b("dr-bill-reload-bill", "B", 10, 6.5, 1.2, 1.5),
  b("dr-bill-reload-bill", "B", 15, 7.0, 1.2, 1.5), b("dr-bill-reload-bill", "B", 20, 9.0, 1.2, 1.5),
  b("dr-bill-reload-bill", "B", 25, 11.0, 1.2, 1.5),
  // M class
  b("dr-bill-reload-bill", "M", 3, 4.0, 1.0, 1.2), b("dr-bill-reload-bill", "M", 5, 4.5, 1.0, 1.2),
  b("dr-bill-reload-bill", "M", 7, 5.0, 1.0, 1.2), b("dr-bill-reload-bill", "M", 10, 5.5, 1.0, 1.2),
  b("dr-bill-reload-bill", "M", 15, 6.5, 1.0, 1.2), b("dr-bill-reload-bill", "M", 20, 8.0, 1.0, 1.2),
  b("dr-bill-reload-bill", "M", 25, 9.0, 1.0, 1.2),

  // ── STRONG HAND ONLY ──
  // GM
  b("dr-sho", "GM", 3, 2.0, 1.2), b("dr-sho", "GM", 5, 2.5, 1.2), b("dr-sho", "GM", 7, 3.0, 1.2),
  b("dr-sho", "GM", 10, 3.5, 1.2), b("dr-sho", "GM", 15, 4.0, 1.2), b("dr-sho", "GM", 20, 5.0, 1.2),
  b("dr-sho", "GM", 25, 6.0, 1.2), b("dr-sho", "GM", 50, 10.0, 1.2),
  // B class
  b("dr-sho", "B", 3, 3.0, 1.5), b("dr-sho", "B", 5, 3.5, 1.5), b("dr-sho", "B", 7, 4.0, 1.5),
  b("dr-sho", "B", 10, 4.5, 1.5), b("dr-sho", "B", 15, 5.0, 1.5), b("dr-sho", "B", 20, 6.5, 1.5),
  b("dr-sho", "B", 25, 8.0, 1.5),
  // M class
  b("dr-sho", "M", 3, 2.5, 1.3), b("dr-sho", "M", 5, 3.0, 1.3), b("dr-sho", "M", 7, 3.5, 1.3),
  b("dr-sho", "M", 10, 4.0, 1.3), b("dr-sho", "M", 15, 4.5, 1.3), b("dr-sho", "M", 20, 5.5, 1.3),
  b("dr-sho", "M", 25, 7.0, 1.3),

  // ── WEAK HAND ONLY ──
  // GM
  b("dr-who", "GM", 3, 3.0, 1.8), b("dr-who", "GM", 5, 3.5, 1.8), b("dr-who", "GM", 7, 4.0, 1.8),
  b("dr-who", "GM", 10, 4.5, 1.8), b("dr-who", "GM", 15, 5.0, 1.8), b("dr-who", "GM", 20, 6.0, 1.8),
  b("dr-who", "GM", 25, 8.0, 1.8), b("dr-who", "GM", 50, 12.0, 1.8),
  // B class
  b("dr-who", "B", 3, 4.0, 2.5), b("dr-who", "B", 5, 4.5, 2.5), b("dr-who", "B", 7, 5.0, 2.5),
  b("dr-who", "B", 10, 6.0, 2.5), b("dr-who", "B", 15, 6.5, 2.5), b("dr-who", "B", 20, 7.0, 2.5),
  b("dr-who", "B", 25, 10.0, 2.5),
  // M class
  b("dr-who", "M", 3, 3.5, 2.0), b("dr-who", "M", 5, 4.0, 2.0), b("dr-who", "M", 7, 4.5, 2.0),
  b("dr-who", "M", 10, 5.0, 2.0), b("dr-who", "M", 15, 5.5, 2.0), b("dr-who", "M", 20, 6.5, 2.0),
  b("dr-who", "M", 25, 9.0, 2.0),

  // ── THE HEADS ──
  // GM
  b("dr-heads", "GM", 5, 3.0, 1.0), b("dr-heads", "GM", 7, 3.5, 1.0),
  b("dr-heads", "GM", 10, 4.0, 1.0), b("dr-heads", "GM", 15, 5.0, 1.0),
  b("dr-heads", "GM", 20, 5.5, 1.0), b("dr-heads", "GM", 25, 6.0, 1.0),
  // B class
  b("dr-heads", "B", 5, 4.0, 1.2), b("dr-heads", "B", 7, 4.5, 1.2),
  b("dr-heads", "B", 10, 5.0, 1.2), b("dr-heads", "B", 15, 6.0, 1.2),
  b("dr-heads", "B", 25, 8.0, 1.2),
  // M class
  b("dr-heads", "M", 5, 3.5, 1.0), b("dr-heads", "M", 7, 4.0, 1.0),
  b("dr-heads", "M", 10, 4.5, 1.0), b("dr-heads", "M", 15, 5.5, 1.0),
  b("dr-heads", "M", 25, 7.0, 1.0),

  // ── CRISS CROSS ──
  // GM
  b("dr-crisscross", "GM", 5, 5.0, 1.0, 1.2), b("dr-crisscross", "GM", 7, 5.5, 1.0, 1.2),
  b("dr-crisscross", "GM", 10, 6.0, 1.0, 1.2), b("dr-crisscross", "GM", 15, 7.0, 1.0, 1.2),
  b("dr-crisscross", "GM", 20, 8.0, 1.0, 1.2),
  // B class
  b("dr-crisscross", "B", 5, 8.0, 1.2, 1.5), b("dr-crisscross", "B", 7, 8.5, 1.2, 1.5),
  b("dr-crisscross", "B", 10, 9.0, 1.2, 1.5), b("dr-crisscross", "B", 15, 10.0, 1.2, 1.5),
  b("dr-crisscross", "B", 20, 11.0, 1.2, 1.5),
  // M class
  b("dr-crisscross", "M", 5, 6.0, 1.0, 1.2), b("dr-crisscross", "M", 7, 6.5, 1.0, 1.2),
  b("dr-crisscross", "M", 10, 7.0, 1.0, 1.2), b("dr-crisscross", "M", 15, 8.0, 1.0, 1.2),

  // ── ACCELERATOR ──
  b("dr-accelerator", "GM", 7, 5.0, 1.0, 1.0),
  b("dr-accelerator", "B", 7, 8.0, 1.2, 1.5),
  b("dr-accelerator", "M", 7, 6.0, 1.0, 1.1),

  // ── DISTANCE CHANGEUP ──
  b("dr-distance-changeup", "GM", 7, 3.0, 1.0),
  b("dr-distance-changeup", "B", 7, 5.0, 1.2),
  b("dr-distance-changeup", "M", 7, 3.5, 1.0),

  // ── MXAD ──
  b("dr-mxad", "GM", 7, 2.3, 1.0),
  b("dr-mxad", "B", 7, 4.0, 1.2),
  b("dr-mxad", "M", 7, 2.75, 1.0),

  // ── 2 AT 25 ──
  b("dr-2at25", "GM", 25, 2.0, 1.0),
  b("dr-2at25", "B", 25, 3.0, 1.4),
  b("dr-2at25", "M", 25, 2.5, 1.2),

  // ── THE DOTS ──
  b("dr-dots", "GM", 7, 5.0, null, null, "36/36 hits on 2-inch dots"),
  b("dr-dots", "B", 7, 5.0, null, null, "30/36+ hits"),
  b("dr-dots", "M", 7, 5.0, null, null, "34/36+ hits"),

  // ── FIXED TIME STANDARDS A ──
  b("dr-fts-a", "GM", 30, 4.0, null, null, "80 pts minor"),
  b("dr-fts-a", "B", 30, 4.0, null, null, "65 pts minor"),
  b("dr-fts-a", "M", 30, 4.0, null, null, "75 pts minor"),

  // ── FIXED TIME STANDARDS B ──
  b("dr-fts-b", "GM", 50, 6.0, null, null, "75 pts minor"),
  b("dr-fts-b", "B", 50, 6.0, null, null, "55 pts minor"),
  b("dr-fts-b", "M", 50, 6.0, null, null, "65 pts minor"),

  // ── PLATE RACK: STRAIGHT SIX ──
  b("dr-plate-straight", "GM", 10, 2.5, 1.0), b("dr-plate-straight", "GM", 15, 3.0, 1.0),
  b("dr-plate-straight", "GM", 20, 4.0, 1.0), b("dr-plate-straight", "GM", 25, 5.0, 1.0),
  b("dr-plate-straight", "B", 10, 4.0, 1.2), b("dr-plate-straight", "B", 15, 5.0, 1.2),
  b("dr-plate-straight", "B", 20, 6.0, 1.2), b("dr-plate-straight", "B", 25, 7.5, 1.2),

  // ── PLATE RACK: PICK TWO ──
  b("dr-plate-pick2", "GM", 10, 1.5, 1.0), b("dr-plate-pick2", "GM", 15, 2.0, 1.0),
  b("dr-plate-pick2", "GM", 20, 2.5, 1.0), b("dr-plate-pick2", "GM", 25, 3.0, 1.0),
  b("dr-plate-pick2", "B", 10, 2.0, 1.2), b("dr-plate-pick2", "B", 15, 2.5, 1.2),
  b("dr-plate-pick2", "B", 20, 3.5, 1.2), b("dr-plate-pick2", "B", 25, 4.0, 1.2),

  // ── PLATE RACK: THREE LOAD THREE ──
  b("dr-plate-3load3", "GM", 10, 4.0, 1.0, 1.1), b("dr-plate-3load3", "GM", 15, 5.0, 1.0, 1.1),
  b("dr-plate-3load3", "GM", 20, 6.0, 1.0, 1.1), b("dr-plate-3load3", "GM", 25, 7.0, 1.0, 1.1),
  b("dr-plate-3load3", "B", 10, 6.0, 1.2, 1.5), b("dr-plate-3load3", "B", 15, 7.0, 1.2, 1.5),
  b("dr-plate-3load3", "B", 20, 8.5, 1.2, 1.5), b("dr-plate-3load3", "B", 25, 10.0, 1.2, 1.5),

  // ── TRIPLE RELOADS (live fire) ──
  b("dr-triple-reloads", "GM", 7, 5.5, 1.0, 1.1), b("dr-triple-reloads", "GM", 10, 6.0, 1.0, 1.1),
  b("dr-triple-reloads", "B", 7, 8.0, 1.2, 1.5), b("dr-triple-reloads", "B", 10, 9.0, 1.2, 1.5),
  b("dr-triple-reloads", "M", 7, 6.5, 1.0, 1.2), b("dr-triple-reloads", "M", 10, 7.0, 1.0, 1.2),

  // ── PARTIALS (live fire at 25yd) ──
  b("dr-partials-df", "GM", 25, 4.0, 1.0), b("dr-partials-df", "B", 25, 6.0, 1.2),
  b("dr-partials-df", "M", 25, 5.0, 1.0),

  // ── QUICK STEP (live fire) ──
  b("dr-quick-step", "GM", 10, 4.0, 1.0), b("dr-quick-step", "B", 10, 6.0, 1.2),
  b("dr-quick-step", "M", 10, 5.0, 1.0),

  // ── SHOOTING WHILE MOVING HARD (live fire) ──
  b("dr-shoot-move-hard", "GM", 10, 4.0, 1.0), b("dr-shoot-move-hard", "B", 10, 6.0, 1.2),
  b("dr-shoot-move-hard", "M", 10, 5.0, 1.0),
];

// ─────────────────────────────────────────
// DRY FIRE BENCHMARKS
// ─────────────────────────────────────────
function bDry(drillId: string, classification: DrillBenchmark["classification"], dist: number, time: number, draw: number | null = null, reload: number | null = null): DrillBenchmark {
  return { drillId, classification, fireMode: "dry_fire", distanceYards: dist, targetTime: time, targetAccuracy: "n/a", drawTime: draw, reloadTime: reload };
}

export const dryFireBenchmarks: DrillBenchmark[] = [
  // Dry fire benchmarks from Dry Fire Reloaded + Skills & Drills
  // GM: draw 0.7s (0.6s speed holster), reload 1.0s
  // M: draw 0.8s, reload 1.2s
  // B: draw 1.0s, reload 1.5s

  // ── Standard drills (dry fire par times from Dry Fire Reloaded) ──
  // Pairs
  bDry("dr-pairs", "B", 7, 1.3, 1.0),
  bDry("dr-pairs", "M", 7, 1.2, 0.8),
  bDry("dr-pairs", "GM", 7, 1.0, 0.7),

  // Bill Drill (dry fire GM par: 1.6s)
  bDry("dr-bill", "B", 7, 2.2, 1.0),
  bDry("dr-bill", "M", 7, 1.8, 0.8),
  bDry("dr-bill", "GM", 7, 1.6, 0.7),

  // 4 Aces (dry fire GM par: 1.8s)
  bDry("dr-4aces", "B", 7, 3.0, 1.0, 1.5),
  bDry("dr-4aces", "M", 7, 2.2, 0.8, 1.2),
  bDry("dr-4aces", "GM", 7, 1.8, 0.7, 1.0),

  // Blake Drill
  bDry("dr-blake", "B", 7, 2.5, 1.0),
  bDry("dr-blake", "M", 7, 2.0, 0.8),
  bDry("dr-blake", "GM", 7, 1.8, 0.7),

  // El Presidente (dry fire GM par: 4.0s)
  bDry("dr-elprez", "B", 10, 6.5, 1.0, 1.5),
  bDry("dr-elprez", "M", 10, 5.0, 0.8, 1.2),
  bDry("dr-elprez", "GM", 10, 4.0, 0.7, 1.0),

  // Singles
  bDry("dr-singles", "B", 7, 2.0, 1.0),
  bDry("dr-singles", "M", 7, 1.5, 0.8),
  bDry("dr-singles", "GM", 7, 1.3, 0.7),

  // SHO (dry fire, 3 targets 2 each at 10yd)
  bDry("dr-sho", "B", 10, 3.5, 1.5),
  bDry("dr-sho", "M", 10, 2.8, 1.3),
  bDry("dr-sho", "GM", 10, 2.2, 1.2),

  // WHO (dry fire, 3 targets 2 each at 10yd)
  bDry("dr-who", "B", 10, 4.5, 2.5),
  bDry("dr-who", "M", 10, 3.5, 2.0),
  bDry("dr-who", "GM", 10, 2.8, 1.8),

  // Bill/Reload/Bill
  bDry("dr-bill-reload-bill", "B", 7, 5.5, 1.0, 1.5),
  bDry("dr-bill-reload-bill", "M", 7, 4.0, 0.8, 1.2),
  bDry("dr-bill-reload-bill", "GM", 7, 3.2, 0.7, 1.0),

  // Heads
  bDry("dr-heads", "B", 7, 4.5, 1.0),
  bDry("dr-heads", "M", 7, 3.5, 0.8),
  bDry("dr-heads", "GM", 7, 3.0, 0.7),

  // Criss Cross
  bDry("dr-crisscross", "B", 7, 8.5, 1.0, 1.5),
  bDry("dr-crisscross", "M", 7, 6.5, 0.8, 1.2),
  bDry("dr-crisscross", "GM", 7, 5.0, 0.7, 1.0),

  // ── New Dry Fire Reloaded drills ──
  // Distance Draw (no trigger pull)
  bDry("dr-distance-draw", "B", 25, 1.3, 1.3),
  bDry("dr-distance-draw", "M", 25, 1.1, 1.1),
  bDry("dr-distance-draw", "GM", 25, 1.0, 1.0),
  bDry("dr-distance-draw", "B", 50, 1.6, 1.6),
  bDry("dr-distance-draw", "M", 50, 1.4, 1.4),
  bDry("dr-distance-draw", "GM", 50, 1.3, 1.3),

  // Distance Draw One-Handed
  bDry("dr-distance-draw-sho", "GM", 25, 1.2, 1.2), // SHO par
  bDry("dr-distance-draw-sho", "M", 25, 1.5, 1.5),
  bDry("dr-distance-draw-sho", "B", 25, 1.8, 1.8),

  // Partials (25yd, 3 half-A targets, 2 each)
  bDry("dr-partials-df", "GM", 25, 3.5, 0.7),
  bDry("dr-partials-df", "M", 25, 4.5, 0.8),
  bDry("dr-partials-df", "B", 25, 5.5, 1.0),

  // Triple Reloads (18 rounds, 2 reloads)
  bDry("dr-triple-reloads", "GM", 7, 4.8, 0.7, 1.0),
  bDry("dr-triple-reloads", "M", 7, 6.0, 0.8, 1.2),
  bDry("dr-triple-reloads", "B", 7, 7.5, 1.0, 1.5),

  // Quick Step
  bDry("dr-quick-step", "GM", 10, 3.5, 0.7),
  bDry("dr-quick-step", "M", 10, 4.5, 0.8),
  bDry("dr-quick-step", "B", 10, 5.5, 1.0),

  // Skip Rope
  bDry("dr-skip-rope", "GM", 7, 4.0, 0.7),
  bDry("dr-skip-rope", "M", 7, 5.0, 0.8),
  bDry("dr-skip-rope", "B", 7, 6.0, 1.0),

  // Skip Rope Reloads
  bDry("dr-skip-rope-reload", "GM", 7, 6.0, 0.7, 1.0),
  bDry("dr-skip-rope-reload", "M", 7, 7.5, 0.8, 1.2),
  bDry("dr-skip-rope-reload", "B", 7, 9.0, 1.0, 1.5),

  // Shooting While Moving Hard
  bDry("dr-shoot-move-hard", "GM", 10, 3.5, 0.7),
  bDry("dr-shoot-move-hard", "M", 10, 4.5, 0.8),
  bDry("dr-shoot-move-hard", "B", 10, 5.5, 1.0),
];

// Combine all benchmarks
export const allBenchmarks = [...benchmarks, ...dryFireBenchmarks];

// ─────────────────────────────────────────
// COACHING QUOTES (from all three books)
// Mapped to skill/drill IDs for the knowledge graph
// ─────────────────────────────────────────
export interface CoachingQuote {
  targetId: string;        // skill or drill ID
  quote: string;
  source: string;          // "PST" | "SDR" | "DFR"
  context?: string;
}

export const coachingQuotes: CoachingQuote[] = [
  // ══════════════════════════════════════════
  // SKILL QUOTES
  // ══════════════════════════════════════════

  // ── Draw Presentation (sk-draw) ──
  { targetId: "sk-draw", quote: "The key times to focus on are draw times and reload times. They have a big effect on the overall classifier time. Most A class shooters pull the trigger at roughly the same speed as GMs. The difference is in the draw, reloads, and target transitions.", source: "SDR", context: "Classifier analysis" },
  { targetId: "sk-draw", quote: "If I miss my grip when I draw, the gun will come to the target without the sights in alignment. If the gun comes up to the target wrong, then I end up dropping points.", source: "SDR", context: "Distance Changeup drill" },
  { targetId: "sk-draw", quote: "The draw time doesn't really come down to how fast you can turn; it is how fast you can get the gun up to the target. I prefer to throw my weight around and get my head looking to the first target as soon as I can.", source: "SDR", context: "El Presidente" },

  // ── Grip (sk-grip) ──
  { targetId: "sk-grip", quote: "You need to get the same grip on your pistol every single time. If your grip is off by even a few millimeters, your sights will not come to the target in alignment. You must then either spend a few tenths of a second correcting the sight alignment or fire a poorly aimed shot.", source: "SDR", context: "2at25 drill" },
  { targetId: "sk-grip", quote: "I like to experiment with grip pressure quite a bit. I get the best trigger speed if I don't crush down that hard with my strong hand, but with my weak hand I get better control if I crank down on the gun.", source: "SDR", context: "Bill Drill at 5 yards" },
  { targetId: "sk-grip", quote: "Grip, trigger control, and the draw are all closely interrelated. If you screw up any part of the process, you will have a poor performance on the drill.", source: "SDR", context: "Marksmanship fundamentals" },

  // ── Trigger Control (sk-trigger) ──
  { targetId: "sk-trigger", quote: "The key to good group shooting is accepting that there is some wobble in your sights, and trying to discharge the gun without making that wobble any worse. Any sort of flinch, trigger jerk, pre-ignition push will show up big time.", source: "SDR", context: "Group Shooting" },
  { targetId: "sk-trigger", quote: "When people shoot as fast as they can pull the trigger, they often push the gun down as they fire the second shot, pull the trigger sideways, pull the trigger with their whole hand, or hold the gun too loose and let it fly all over the place.", source: "SDR", context: "Doubles drill" },
  { targetId: "sk-trigger", quote: "People have a strong tendency to tense up their firing hand to try and control recoil, and it causes problems in a major way. I call this 'firing the gun with your whole hand.'", source: "SDR", context: "WHO at 7 yards" },

  // ── Cadence Control (sk-cadence) ──
  { targetId: "sk-cadence", quote: "Split guidelines by distance: 5yd = 0.20s (95% Alpha), 10yd = 0.22s (90% Alpha), 15yd = 0.25s (80% Alpha), 20yd = 0.30s (70% Alpha), 25yd = 0.35s (60% Alpha).", source: "SDR", context: "Doubles drill benchmarks" },
  { targetId: "sk-cadence", quote: "A good rule of thumb: most people have a total time on Bill Drills that is about double their draw time. So if your draw reads 1.59s, your total time will usually be about 3.2s.", source: "SDR", context: "25 Yard Bill Drill" },

  // ── Sight Management (sk-sight) ──
  { targetId: "sk-sight", quote: "It is important to realize how little 'traditional' sight focus you need at extreme close range. Drawing and firing two rounds can be accomplished in under one second.", source: "SDR", context: "Doubles at 3 yards" },
  { targetId: "sk-sight", quote: "I also think that you should consciously decide what type of sight picture you require on each target. Decide whether you are going to shoot that particular target sight focused or target focused.", source: "SDR", context: "Basic Transitions" },

  // ── Shot Calling (sk-shot-call) ──
  { targetId: "sk-shot-call", quote: "You don't need separate drills to work on shot calling, you should always be striving to call your shots. It is as simple as that.", source: "SDR", context: "Training philosophy" },
  { targetId: "sk-shot-call", quote: "Call your shots by sight and not sound if at all possible.", source: "SDR", context: "Steel/Paper/Steel drill" },

  // ── Pacing / Gear Changes (sk-pacing) ──
  { targetId: "sk-pacing", quote: "The whole idea is to seamlessly change gears between targets of different difficulty levels. Maybe you just look through the gun up close, get a hard front sight focus at 25 yards, and do something in the middle at 15 yards. You need to go between all those 'modes' without there being a hitch.", source: "SDR", context: "The Accelerator" },
  { targetId: "sk-pacing", quote: "If your split times are the same at 7 yards as they are at 25 yards, that should tell you something. If you don't pick up speed as you go from the back target to the front, something is wrong.", source: "SDR", context: "The Accelerator" },
  { targetId: "sk-pacing", quote: "You should be sure to distinguish between changing techniques and simply 'going faster.' When you are trying to learn the game, you need to figure out what sort of aiming methods produce what sort of points and time in any given situation.", source: "SDR", context: "Pacing vs. Technique" },

  // ── Discipline / Consistency (sk-discipline) ──
  { targetId: "sk-discipline", quote: "I had one of the most important breakthroughs in my shooting career when I realized why Ben is one of the best — it was his discipline in shooting.", source: "SDR", context: "Foreword by Hwansik Kim" },
  { targetId: "sk-discipline", quote: "The directions do not call for one good string every now and then. They instruct you to shoot string after string after string, and have them all be good. This builds the confidence to know that you can make tough shots without having to worry.", source: "SDR", context: "Practical Accuracy" },
  { targetId: "sk-discipline", quote: "You need to be in control of your mindset at all times. Either you are keeping things tight and disciplined, or you are pushing your limits. If you aren't consciously aware of what mindset you are exercising, you may find yourself cutting loose in a match and being way out of control.", source: "SDR", context: "Practice vs. Match Mindset" },

  // ── Variable Hand Tension (sk-tension) ──
  { targetId: "sk-tension", quote: "The problem at extreme close range usually turns out to be the reload. When people are going crazy, shedding lead as fast as they can pull the trigger, it causes their hands and forearms to get tense. It is tough to then go from tensed down on the pistol to relaxed hands that can dexterously grab the next mag.", source: "SDR", context: "Bill/Reload at 3 yards" },

  // ── Confirmation Schemes (sk-confirm) ──
  { targetId: "sk-confirm", quote: "Shooting close targets with a 'target focus' is usually faster than going with a 'sight focus.' The point is that you are going to have a hard time figuring that stuff out if you aren't in control of your pacing.", source: "SDR", context: "Pacing vs. Technique" },
  { targetId: "sk-confirm", quote: "The reality is that in order to be competitive you will not have time to consciously confirm each sight picture on close ranged targets. Accept that reality and work with it.", source: "SDR", context: "Doubles drill" },

  // ── Transitions (sk-trans) ──
  { targetId: "sk-trans", quote: "The phrase I have in my head when working on transitions is 'shoot sooner, not faster.' It isn't about how quickly you are jamming the trigger. What you should be thinking about is getting started as soon as possible on each target. When you 'see what you need to see,' then it is time to shoot. There can be no delay.", source: "SDR", context: "Basic Transitions" },
  { targetId: "sk-trans", quote: "Aside from gun manipulations like drawing and reloading, the thing holding back shooters in terms of raw speed is usually going to be target transitions.", source: "SDR", context: "Transition Drills overview" },
  { targetId: "sk-trans", quote: "For most shooters that are already proficient (B or A class), the thing they need to master to really move up is usually target transition speed. Mastering these drills is how you shoot faster, it's that simple.", source: "SDR", context: "Part 4: Transition Drills" },

  // ── Wide Transitions (sk-trans-wide) ──
  { targetId: "sk-trans-wide", quote: "The most common mistake is 'over-transitioning' — putting in too much muscle as you transition. Be very sensitive to your sight picture. If you see the sights go past your point of aim and then return, you over-transitioned.", source: "SDR", context: "Wide Transitions drill" },
  { targetId: "sk-trans-wide", quote: "You may want to consider pulling your gun in toward your body as you transition, and then pushing it back out on target. For extreme transitions (120 degrees or more), this technique can be more efficient and accurate.", source: "SDR", context: "Wide Transitions drill" },

  // ── Reloads (sk-reload-stand) ──
  { targetId: "sk-reload-stand", quote: "In order to be competitive, you don't need some insane reload time like a 0.75, but you do need to be able to reload the gun in about 1 second flat on a fairly consistent basis.", source: "SDR", context: "Four Aces at 7 yards" },
  { targetId: "sk-reload-stand", quote: "It is very common for misses to occur on the shot before you reload, and the shot you fire just after the reload. This is almost always due to rushing.", source: "SDR", context: "El Presidente at 10 yards" },

  // ── Reload on the Move (sk-reload-move) ──
  { targetId: "sk-reload-move", quote: "I like to have my reload time on this drill run within 0.1 to 0.2 seconds of a static reload on an equally distant target.", source: "SDR", context: "Moving Reload drill" },

  // ── Position Entry (sk-move-entry) ──
  { targetId: "sk-move-entry", quote: "As always, I like to make sure my knees are bent, and I use them as shock absorbers. I want to keep a nice stable sight picture so I am able to be accurate as I get out of that position.", source: "SDR", context: "Position Exit" },

  // ── Position Exit (sk-move-exit) ──
  { targetId: "sk-move-exit", quote: "Good movement in USPSA doesn't come down to foot speed, it comes down to efficiency. The idea is to get your movement started while you are still shooting. The movement part won't change; you are simply going to start it sooner.", source: "SDR", context: "Position Exit" },
  { targetId: "sk-move-exit", quote: "If you are shifting your weight toward Position B as you are firing, that counts as moving. Getting your center of gravity going certainly helps save time. Just get your shoulders headed toward Position B.", source: "SDR", context: "Position Exit" },

  // ── Shooting on the Move (sk-move-shoot) ──
  { targetId: "sk-move-shoot", quote: "The goal is to be able to move at just about a flat run and still hit A's on the targets.", source: "SDR", context: "Shooting on the Move" },
  { targetId: "sk-move-shoot", quote: "It may be tempting to do a very conservative 'roll step' on this drill, but honestly, it is just too slow. The best hit factors are going to be produced by putting the gas pedal down and moving.", source: "SDR", context: "Shooting on the Move" },

  // ── Short Moves (sk-move-short) ──
  { targetId: "sk-move-short", quote: "Most importantly, the gun should stay up high for the entirety of the drill. Keep the gun at your eyeline looking to the next target as you move.", source: "SDR", context: "Short Moves" },

  // ── SHO (sk-sho) ──
  { targetId: "sk-sho", quote: "You can shoot surprisingly fast with only one hand so long as you grip the pistol very firmly.", source: "SDR", context: "SHO drill" },
  { targetId: "sk-sho", quote: "For me, the biggest thing I work on is making sure I nail the grip. When I draw to strong hand shooting or transfer the gun to my weak hand, I need to be careful to get a proper grip. If you nail that step down, it makes things so much easier.", source: "SDR", context: "One Handed Shooting" },

  // ── WHO (sk-who) ──
  { targetId: "sk-who", quote: "When you are shooting with only one hand, trigger control is going to be much more difficult. I find my hand tensing up to control the recoil, and it makes it difficult to move the trigger finger independently.", source: "SDR", context: "High Standards classifier" },
  { targetId: "sk-who", quote: "Single handed shooting is a skill that most people don't practice a whole lot. If you want to consistently do well at major matches, you at least need to be proficient at this; there is no other way around it.", source: "SDR", context: "One Handed Shooting" },

  // ── Stage Planning (sk-stage-plan) ──
  { targetId: "sk-stage-plan", quote: "It isn't about moving fast, it is about shooting sooner.", source: "SDR", context: "Hitting the Spot" },

  // ── Hit Factor Optimization (sk-stage-hf) ──
  { targetId: "sk-stage-hf", quote: "The reality is that these people are kidding themselves. The best shooters in the game are there because they are the best at shooting. They are the fastest and the most accurate.", source: "SDR", context: "Debunking 'I just need stage skills'" },

  // ── Shooting Under Pressure (sk-stage-pressure) ──
  { targetId: "sk-stage-pressure", quote: "The people that are in the running to win a major championship time and time again tend to be consistent and disciplined.", source: "SDR", context: "Practice Mindset vs. Match Mindset" },

  // ── Recoil Management (sk-recoil) ──
  { targetId: "sk-recoil", quote: "Watching your front sight move up in recoil, then using your hand muscles to return the sight, then breaking the next shot is a cycle that you go through time after time. You need to manage the gun in recoil over the course of every shot.", source: "SDR", context: "25 Yard Bill Drill" },

  // ══════════════════════════════════════════
  // DRILL QUOTES
  // ══════════════════════════════════════════

  // ── Bill Drill (dr-bill) ──
  { targetId: "dr-bill", quote: "You need a fast draw, and you need that draw to end in a correct grip. If you miss your grip, you will have a hard time doing well on the drill. You may have to adjust your grip when you are already on target, or shoot slowly as you fight to keep your sights in the center.", source: "SDR", context: "Bill Drills" },

  // ── Blake Drill (dr-blake) ──
  { targetId: "dr-blake", quote: "I force myself to fire the shots within the goal time, and then focus on getting the gun from one target to the next. Essentially, I program my trigger finger to shoot 0.2 splits, and then force myself to get the gun to the next target before it goes off again.", source: "SDR", context: "Blake Drill technique" },
  { targetId: "dr-blake", quote: "First, you need to get a good grip on your pistol. If you have a nice consistent grip, the gun will aim wherever you look...especially at the close ranges that this drill is intended for.", source: "SDR", context: "Blake Drill at 5 yards" },

  // ── El Presidente (dr-elprez) ──
  { targetId: "dr-elprez", quote: "The top level shooters I know can consistently shoot this drill in the mid four second range during practice (with only a few C zone hits!). Most of them can break four seconds when they decide to 'go fast.'", source: "SDR", context: "El Presidente benchmarks" },
  { targetId: "dr-elprez", quote: "One thing that really helps me is to shoot this drill with a target focus. I see my sights on the target, but they are blurry. Then, I drive the gun around with my eyes, and run the gun as hard as I can.", source: "SDR", context: "El Presidente at 10 yards" },

  // ── Doubles / Pairs (dr-pairs) ──
  { targetId: "dr-pairs", quote: "The seven yard double is a good place to sort out your draw time. I get a good grip on my pistol, push up to the target, and when I see my front fiber visible through the rear notch, I cut loose and start shooting.", source: "SDR", context: "Doubles at 7 yards" },

  // ── Singles (dr-singles) ──
  { targetId: "dr-singles", quote: "At 15 yards, the most important element, time wise, is going to come down to your draw speed. It is important to draw at a '3 yard pace,' and only spend extra time on the sights making sure the gun gets lined up properly.", source: "SDR", context: "Singles at 15 yards" },

  // ── 4 Aces (dr-4aces) ──
  { targetId: "dr-4aces", quote: "This allows for a 1 second draw, a 1.1 second reload, and two 0.2 second splits.", source: "SDR", context: "Four Aces time breakdown" },

  // ── Practical Accuracy (dr-practical-accuracy) ──
  { targetId: "dr-practical-accuracy", quote: "Working on the fundamentals of shooting in the context of shooting at realistic 'match pace.' Grip, sight picture, and trigger control are the things you should be watching.", source: "SDR", context: "Purpose" },

  // ── The Dots (dr-dots) ──
  { targetId: "dr-dots", quote: "The goal here isn't just to shoot hits on the dots; it is to never shoot misses. To successfully go 36/36 on this drill requires you to be something of a machine.", source: "SDR", context: "The Dots purpose" },
  { targetId: "dr-dots", quote: "You need to be able to flip on that high level of accuracy and trigger control just like flipping a light switch, and this is the way to develop it.", source: "SDR", context: "The Dots" },

  // ── Accelerator (dr-accelerator) ──
  { targetId: "dr-accelerator", quote: "If your split times are the same at 7 yards as they are at 25 yards, that should tell you something. If you don't pick up speed as you go from the back target to the front, something is wrong.", source: "SDR", context: "The Accelerator" },

  // ── Shoot on the Move (dr-shoot-move) ──
  { targetId: "dr-shoot-move", quote: "It may be tempting to do a very conservative 'roll step' on this drill, but honestly, it is just too slow. The best hit factors are going to be produced by putting the gas pedal down and moving.", source: "SDR", context: "Shooting on the Move" },

  // ── Moving Reload (dr-moving-reload) ──
  { targetId: "dr-moving-reload", quote: "The instant you finish the first two targets, your focus should shift to the reload. As soon as that is done, you are back up on target and shooting.", source: "SDR", context: "Moving Reload" },

  // ── Group Shooting (dr-groups) ──
  { targetId: "dr-groups", quote: "When you are pushing to go fast, it tempts you to push down hard on the gun to try to control recoil. Sometimes, people pull the trigger with their whole hand instead of just the trigger finger.", source: "SDR", context: "Group Shooting" },

  // ── Doubles (dr-doubles) ──
  { targetId: "dr-doubles", quote: "From a technique perspective, you should pay very close attention to your hands. I pay very little mind to sight alignment. That is the easy part. What does matter is feeling a rock solid grip on the gun, and then feeling my firing hand discharge the gun without pushing it around.", source: "SDR", context: "Doubles drill" },

  // ── Distance Changeup (dr-distance-changeup) ──
  { targetId: "dr-distance-changeup", quote: "If I miss my grip when I draw, the gun will come to the target without the sights in alignment. So essentially, I focus on hitting my grip at high speed and getting the gun into the 'A' of the target before I break the shots.", source: "SDR", context: "Distance Changeup" },

  // ── Wide Transitions (dr-wide-trans) ──
  { targetId: "dr-wide-trans", quote: "Extremely wide transitions are a common obstacle in USPSA matches. It is not uncommon for me to observe transition times of well over a second, even among above average shooters. With a good amount of practice, you can reduce your transition times dramatically.", source: "SDR", context: "Wide Transitions" },

  // ── 2 at 25 (dr-2at25) ──
  { targetId: "dr-2at25", quote: "The draw is extremely important. For most shooters, the draw time will be 1.3 or 1.4 seconds, leaving the remainder of the time to return the gun out of recoil and make the second shot. A fast and consistent draw is critical.", source: "SDR", context: "2at25 drill" },
  { targetId: "dr-2at25", quote: "You need to develop a careful trigger press for this drill. If the sights are slightly wobbling, you need to ignore that and just work the trigger straight on back.", source: "SDR", context: "2at25 trigger control" },

  // ══════════════════════════════════════════
  // TRAINING PHILOSOPHY QUOTES (mapped to sk-discipline)
  // ══════════════════════════════════════════
  { targetId: "sk-discipline", quote: "I don't want you to just get a GM card; I want you to become a GM.", source: "SDR", context: "Training philosophy" },
  { targetId: "sk-discipline", quote: "One of the less productive axioms in shooting sports is the idea that smooth is fast...it isn't. Sometimes the best shooters look strange because they move so fast and explosively.", source: "SDR", context: "Debunking 'smooth is fast'" },
  { targetId: "sk-discipline", quote: "If you want to be fast and accurate, then you need to train with a time element. This stuff isn't going to happen on its own; you need to work for it.", source: "SDR", context: "Accuracy vs. Speed" },
  { targetId: "sk-discipline", quote: "Being able to make tight shots at speed is the most critical skill for doing well at high levels of competition. The people with the best fundamentals are the ones that tend to do the best, and there just isn't any way around it.", source: "SDR", context: "Part 3: Marksmanship Drills" },
  { targetId: "sk-discipline", quote: "You can't give up. I personally went through a two year phase where I didn't make much headway at all in the match results. Two years of intense training. No measurable difference. It takes a good bit of mental toughness to work through this without quitting.", source: "SDR", context: "Breaking the Plateau" },
  { targetId: "sk-discipline", quote: "When you are training, focus up! You need to be mentally engaged, not just going through the motions. You need to analyze every performance. You need to constantly be in problem solving mode.", source: "SDR", context: "Efficient Practice Sessions" },
  { targetId: "sk-discipline", quote: "Pushing comes after you are able to [do it consistently]. If you can't consistently nail reloads without some sort of hiccup, then it doesn't make sense to push for a really smoking reload time.", source: "SDR", context: "When to push" },

  // ══════════════════════════════════════════
  // PRACTICAL SHOOTING TRAINING QUOTES (PST)
  // ══════════════════════════════════════════

  // ── Confirmation Schemes ──
  { targetId: "sk-confirm-1", quote: "Kinesthetic alignment only. You 'feel' your arms are pointed in the correct place and then you shoot. NO VISUAL CONFIRMATION.", source: "PST", context: "Confirmation Drill definition" },
  { targetId: "sk-confirm-2", quote: "You react to the color of your sight crossing your intended aiming area. With an optic you shoot as soon as you see the optical color. With a fiber optic iron sight setup, you shoot when you see the color of your front sight.", source: "PST", context: "Confirmation Drill definition" },
  { targetId: "sk-confirm-3", quote: "Your dot is stopped and stable in your intended aiming area. Your dot should appear as a dot and not as a streak. With iron sights you see the front sight stopped through the rear notch. This is a near perfect sight picture sort of setup.", source: "PST", context: "Confirmation Drill definition" },
  { targetId: "sk-confirm", quote: "As you move up in confirmation it will take more time, but the result on the targets will be much cleaner.", source: "PST", context: "Confirmation scheme tradeoff" },
  { targetId: "sk-confirm", quote: "You can get to B class by getting a hard-front sight focus for every shot. The problem is, you are going to have a hard time moving up to M or GM if you hold onto a concept like that.", source: "PST", context: "Aiming scheme progression" },

  // ── Pacing / Gear Changes (PST) ──
  { targetId: "sk-pacing", quote: "Our shooter now needs to understand new aiming schemes, how to use them and when to use them. He decides to shoot close targets by reacting to the color of the fiber optic front sight. As soon as he sees that in the center of the target, he is going to shoot.", source: "PST", context: "Aiming scheme progression" },

  // ── Tension / Training Habits (PST) ──
  { targetId: "sk-tension", quote: "Clamping down your firing hand when the targets are extremely close is a common example. Associating tension with speed is a common issue that people create for themselves. Undoing that association takes dedicated time and attention.", source: "PST", context: "Subconscious habits" },

  // ── Movement (PST) ──
  { targetId: "sk-move-exit", quote: "Make sure you do not have extraneous steps or movement when you exit a shooting position. Small steps to change your stance, coiling your body up like a spring, or drop stepping should not occur. You should stop and stabilize already 'pre-loaded.'", source: "PST", context: "Position Exit" },
  { targetId: "sk-move-exit", quote: "As you exit a shooting position, make sure you are not making a 'false step' where you load up your weight and then take off. The 'drop step' technique is only needed when you are getting out of a leaning position.", source: "PST", context: "False step correction" },
  { targetId: "sk-move-entry", quote: "Stop so you can move again immediately. Build the habit of stopping with your feet wide apart, square to the target, knees bent, and 50/50 weight distribution.", source: "PST", context: "Position Entry stance" },

  // ── Sight Management (PST) ──
  { targetId: "sk-sight", quote: "The way to do business is both eyes open, target focused and looking for very specific aimpoints on each target.", source: "PST", context: "Vision fundamentals" },

  // ── Confirmation Drill (PST) ──
  { targetId: "dr-confirmation", quote: "Your only job is to ensure that you actually execute each shot using the desired confirmation. This means that you need to create good data for yourself, not necessarily a good result on the target. Make sure you rigidly enforce your desired confirmation level.", source: "PST", context: "Confirmation Drill purpose" },

  // ── Training Philosophy (PST) ──
  { targetId: "sk-discipline", quote: "Different people need different feedback at different times. The drills in this book are designed so you can work on the things you need to, when you need to, to improve.", source: "PST", context: "Layered training" },

  // ══════════════════════════════════════════
  // DRY FIRE RELOADED QUOTES (DFR)
  // ══════════════════════════════════════════

  // ── Dry Fire Philosophy ──
  { targetId: "sk-discipline", quote: "I learned that I could practice pretty much everything to do with shooting, except recoil control, just by doing dry-fire. If I wanted to get good, I could, and dry-fire was the way to do it.", source: "DFR", context: "Stoeger's dry fire journey" },
  { targetId: "sk-discipline", quote: "I have learned that simply shooting more rounds doesn't make you better. You need to diagnose and solve problems. That process is in many ways easier when you aren't shooting actual ammunition.", source: "DFR", context: "Training philosophy" },
  { targetId: "sk-discipline", quote: "My first season of shooting matches was very successful. I started winning club matches and earned a GM card. I had fired very few thousand rounds in my life at that point. But I was dry-firing hours a day, running 30 round dry-fire stages indoors.", source: "DFR", context: "Stoeger's origin story" },

  // ── DFR: Draw (sk-draw) ──
  { targetId: "sk-draw", quote: "Draw speed and consistency are strongly correlated with speed on all sorts of stages. When you draw, you look to a spot on a target and put the sights on that spot as quickly as you can. This is the same concept as a normal target transition.", source: "DFR", context: "Draw element" },
  { targetId: "sk-draw", quote: "You don't want to see the sight come down onto the target from above. This means the gun went over the target and came down. It is a bit of a waste of energy to bring the gun up only to bring it down again.", source: "DFR", context: "Draw element, common error" },

  // ── DFR: Grip ──
  { targetId: "sk-grip", quote: "Make sure you grip your gun 'for real.' Make sure you are watching your sights for every dry-fire shot. The whole point of dry-fire is to build habits that make you successful with real bullets.", source: "DFR", context: "What to Practice" },

  // ── DFR: Trigger ──
  { targetId: "sk-trigger", quote: "I really like to focus on the sensation of moving your trigger finger in isolation. So many people have an ingrained habit where they pull the trigger using muscles from their whole hand. Watching the sights will tell you the whole story about what your hand is actually doing.", source: "DFR", context: "Slow Fire Trigger Control" },
  { targetId: "sk-trigger", quote: "The really important element is learning to break the trigger without disturbing what sight picture you do have. That is really the tricky part.", source: "DFR", context: "Trigger Control at Speed" },

  // ── DFR: Tension ──
  { targetId: "sk-tension", quote: "You need to learn variable hand tension. Grip the gun really hard when you are pulling the trigger, and only when you are pulling the trigger. At every other time (like when you are reloading), it is much better to be a bit 'loose.'", source: "DFR", context: "Tension section" },
  { targetId: "sk-tension", quote: "It is much easier to perform the drills in this book with very little tension in your hands and forearms. You move more quickly and precisely when you are relaxed. But when you dry-fire, it is very tempting to use a loose grip — there is no recoil to manage, so there is no immediate incentive to grip the crap out of the gun.", source: "DFR", context: "Tension section" },

  // ── DFR: Transitions ──
  { targetId: "sk-trans", quote: "The instant the sights look good, you should be looking to the next target. You are going to train yourself to work faster than conscious thought.", source: "DFR", context: "Target Transitions" },
  { targetId: "sk-trans", quote: "It is critical that you keep most of your body loose. You only hold the gun with your hands! Adding tension in your abs, back, or shoulders makes it difficult to stop the gun in the center of any given target.", source: "DFR", context: "Target Transitions" },

  // ── DFR: Reloads ──
  { targetId: "sk-reload-stand", quote: "Generally speaking, you will be more consistent if you bring the gun lower down and closer to your body. I strongly recommend you pay close attention to how you angle the magwell — make sure to angle your gun so the magwell points at your mag pouches.", source: "DFR", context: "Reload element" },
  { targetId: "sk-reload-stand", quote: "The biggest challenge I have during these drills is the urge to tense up. When you are tense, it is almost impossible to quickly and consistently hit your reloads.", source: "DFR", context: "Reload element" },

  // ── DFR: Movement ──
  { targetId: "sk-move-entry", quote: "A couple steps before you are stopped, you should already be aiming at the first target you intend to shoot. The idea is that you want to prepare yourself to start shooting as soon as the sights tell you that you will get good center hits.", source: "DFR", context: "Movement element" },
  { targetId: "sk-move-exit", quote: "At the instant you call that last shot, you put everything you have into moving out of position.", source: "DFR", context: "Position Exit" },
  { targetId: "sk-move-exit", quote: "I like to strive for a feeling of pushing with both my feet to get out of position. I want to use all the muscles at my disposal to exit that initial shooting position.", source: "DFR", context: "Position Exit" },

  // ── DFR: SHO/WHO ──
  { targetId: "sk-sho", quote: "I think you should make a point to grip the gun as hard as you can when shooting with only one hand. That is a big part of my dry-fire focus. The gun needs to be locked into my hand as rock solid as I can get it.", source: "DFR", context: "One Handed Shooting" },
  { targetId: "sk-who", quote: "If anything, I take my time on the transfer to make sure I get my grip as close to perfect as possible, then I get out on target. If you miss your grip, you may well be hunting for your front sight when you hear the second beep.", source: "DFR", context: "Distance One Handed Draw" },

  // ── DFR: Shot Calling ──
  { targetId: "sk-shot-call", quote: "If you make mistakes, but are unaware of them, then you are likely to repeat those same mistakes. If you unknowingly repeat your mistakes enough, then those mistakes become habits. Self-awareness is key!", source: "DFR", context: "Mistakes section" },

  // ── DFR: Pacing ──
  { targetId: "sk-pacing", quote: "If you make the par time every repetition without fail, then you are laying back too much and you need to kick it up a notch.", source: "DFR", context: "Setting the Par Time" },
  { targetId: "sk-pacing", quote: "If you are 'perfect,' you aren't pushing and thus aren't advancing your skill level.", source: "DFR", context: "Mistakes section" },

  // ── DFR: Shooting on the Move ──
  { targetId: "sk-move-shoot", quote: "A good rule of thumb for taking targets while moving is to imagine that they are 50 percent further than their actual distance and get an appropriate sight picture for that.", source: "DFR", context: "Shooting While Moving" },

  // ── DFR: Drill-specific ──
  { targetId: "dr-distance-draw", quote: "I don't 'slam' the gun into position on difficult targets. I let the sights settle into the target much more gently. This doesn't mean you draw more slowly — you just need to finish the draw much more gently.", source: "DFR", context: "Distance Draw" },
  { targetId: "dr-90-trans", quote: "On this drill, you may feel a sensation of having the transition come from your legs. I think that is a good thing and it may help you be a bit faster from target to target.", source: "DFR", context: "90 Degree Transitions" },
  { targetId: "dr-180-trans", quote: "I strongly recommend that you pull the gun in close to your body when you transition to the second target. Pulling the gun in close, on wide transitions, is critical to your success on this drill.", source: "DFR", context: "180 Degree Transitions" },
  { targetId: "dr-widen-trans", quote: "This drill can be dangerous for newer shooters because, by definition, you are going to be pushed to the breaking point. You need to have the self-awareness to realize that you have hit that breaking point and stop yourself from building bad habits.", source: "DFR", context: "Widening Transitions" },
  { targetId: "dr-skip-rope", quote: "You need to hold the gun up high and be ready to get a clean sight picture on the target. Dropping the gun down will cost you time as you need to bring it back up.", source: "DFR", context: "Skip Rope" },
  { targetId: "dr-triple-reloads", quote: "Resist the temptation to slam a mag into the gun and then point your arms at the target and start whacking the trigger. Get a good sight picture. Pay attention to what you are doing. Make every shot count.", source: "DFR", context: "Triple Reloads" },
  { targetId: "dr-back-forth", quote: "It is very easy to 'cheat' on this drill by getting one foot into your firing position and then waving the gun at the target. Get set up into a wide and stable stance. You are only cheating yourself if you build bad habits.", source: "DFR", context: "Back and Forth" },
  { targetId: "dr-shoot-move-hard", quote: "This drill is designed to really challenge you. Keep in mind that these targets are difficult enough that it may not make sense to shoot them while moving in an actual match, but for practice it does make sense to push yourself to the absolute limit.", source: "DFR", context: "Shooting While Moving Hard" },
  { targetId: "dr-seated-start", quote: "The toughest thing to do correctly is to nail your draw. As soon as you start standing up it will start moving your holster. The easiest way to handle it is to stay seated until you get your strong hand on the gun.", source: "DFR", context: "Seated Start" },

  // ── DFR: Philosophy ──
  { targetId: "sk-discipline", quote: "You need to hunt down your weaknesses and relentlessly crush them. If it is hard for you, it is probably hard for everyone else too.", source: "DFR", context: "What to Practice" },
  { targetId: "sk-discipline", quote: "The most important point I can make about mistakes is that you shouldn't fear them. Decide you are going to develop blistering speed, and then do it. Your hand will get chewed up from missed draws. Don't worry, everyone who is really fast went through the same thing.", source: "DFR", context: "Mistakes section" },

  // ══════════════════════════════════════════
  // ADDITIONAL PST QUOTES
  // ══════════════════════════════════════════

  // ── PST: Grip ──
  { targetId: "sk-grip", quote: "The most important cue to pay attention to is the tactile feel of your firing hand. It is counterintuitive to pay attention to the feel of your hands instead of the visual component of sight alignment. In most cases you will get better results by focusing on the feel inside your hands.", source: "PST", context: "Grip fundamentals" },
  { targetId: "sk-grip", quote: "The tighter you hold your pistol with your dominant hand, the more difficult it becomes to isolate your trigger finger. It is better to hold the gun tightly and do a lot of the recoil management with your support hand.", source: "PST", context: "Why You Suck, tension problems" },

  // ── PST: Trigger ──
  { targetId: "sk-trigger", quote: "Try applying pressure slowly and continually until the trigger breaks opposed to going NOW on the trigger. Fight the urge to apply all four or five pounds of pressure instantly when you get the sights where you want them. Going NOW on the trigger will often move your sights off target.", source: "PST", context: "Group Shooting corrections" },
  { targetId: "sk-trigger", quote: "The problem with trigger prepping is it is slow. If you are to consciously recognize that you have prepped the trigger, this will add about .2 seconds to the shot.", source: "PST", context: "Why You Suck, crutches" },

  // ── PST: Sight / Vision ──
  { targetId: "sk-sight", quote: "For better or worse, you hit where you look. If you look at the outside shape of the target or the target's color, you will be less accurate than if you drive your vision to a specific point.", source: "PST", context: "Why You Suck, vision" },
  { targetId: "sk-sight", quote: "Keep looking at a particular spot on the target while you are shooting. The spot you look at should be the size of a coin. If you start to focus on your front sight or dot, your shots will tend to climb up higher.", source: "PST", context: "Practical Accuracy tips" },

  // ── PST: Recoil ──
  { targetId: "sk-recoil", quote: "Most people have an incorrect concept of recoil control. They believe it will take a lot of muscle mass, force and effort. The muzzle of your pistol should only marginally rise. The main issue is battling your tendency to overcorrect or overcontrol that recoil.", source: "PST", context: "Measurement Drill tips" },
  { targetId: "sk-recoil", quote: "Instead of trying to stop the gun from moving, ensure that the gun is returning to the same spot. Let the gun track up and down in recoil and see if it is a predictable pattern. If you insist on stopping the gun from recoiling at all, you will almost certainly push down and induce marksmanship errors.", source: "PST", context: "Why You Suck, conceptual problems" },

  // ── PST: Cadence ──
  { targetId: "sk-cadence", quote: "Follow up shots should be in the range of .3 to .6 seconds. If much faster than .3 seconds, you likely did not see the sight return. If longer than .6 seconds, you are likely over confirming your sight picture. When the sights come back you need to shoot.", source: "PST", context: "Practical Accuracy tips" },

  // ── PST: Transitions ──
  { targetId: "sk-trans", quote: "Lead with your eyes. Look exactly where you wish to hit. You should not be looking at a big brown target, but picking an exact spot to move the gun to. Do not muscle the gun around because it will cause the sights to stop imprecisely.", source: "PST", context: "Target Transitions cues" },
  { targetId: "sk-trans", quote: "Moving your eyes off a target before you are done shooting it will drag the hits off the target. This commonly happens on a target the shooter perceives to be lower difficulty.", source: "PST", context: "Target Transitions corrections" },

  // ── PST: Tension ──
  { targetId: "sk-tension", quote: "The easiest way to summarize tension issues: the faster you go the more tense you will get. Releasing unnecessary tension is the key to going faster. Figuring out what tension is productive and what is not will take time and experimentation.", source: "PST", context: "Why You Suck, tension" },
  { targetId: "sk-tension", quote: "'Trigger Freeze' (the inability to reset the trigger for a second shot) is caused by an over tense firing hand in almost all cases.", source: "PST", context: "Doubles drill corrections" },

  // ── PST: Movement ──
  { targetId: "sk-move-entry", quote: "Have your gun up ready to shoot as you enter a shooting position. You should see your sights in your field of view just before you mean to start shooting. It is not good enough just to have the gun up, you need to be actually seeing the sights.", source: "PST", context: "Unmounted Movement cues" },
  { targetId: "sk-move-unmounted", quote: "When you move, move as athletically and aggressively as possible. After four or five repetitions, you should be out of breath. If you do training in slow motion expect to overrun positions in real matches when you are shooting 'juiced up' from adrenaline.", source: "PST", context: "Unmounted Movement corrections" },
  { targetId: "sk-move-shoot", quote: "When there is movement involved, it is necessary to shoot with your vision focused on the target. If you shoot focused on your front sight or dot, you will tend to 'drag' hits in the same direction that you are moving.", source: "PST", context: "Shooting on the Move cues" },
  { targetId: "sk-move-shoot", quote: "When shooting on the move, disregard what you think you know about predictive shooting. Your ability to predict how the gun is going to track is greatly diminished. Switch to reactive shooting. Do NOT rush — you are saving time by shooting as you move.", source: "PST", context: "Shooting on the Move" },
  { targetId: "sk-move-mounted", quote: "Focus on blending the positions together rather than moving in between them quickly. The movement serves the shooting and not the other way around.", source: "PST", context: "Mounted Movement cues" },
  { targetId: "sk-move-mounted", quote: "When you are off balance, moving, or the circumstances are more challenging than normal, switch away from predictive shooting to reactive shooting. As you gain more stability (as your movement completes) you can switch to predictive shooting.", source: "PST", context: "Mounted Movement corrections" },
  { targetId: "sk-move-soft", quote: "Have your feet stop momentarily but have your body continue moving. It will feel like you are falling through the position. However, it will allow you to shoot very accurately and save time while you do it.", source: "PST", context: "Soft Stops drill cues" },

  // ── PST: Stage Craft ──
  { targetId: "sk-stage-plan", quote: "When you can see a first person 'GoPro' video of your stage run without needing to specifically think the stage through, you are ready to shoot it.", source: "PST", context: "Mock Stage Training" },
  { targetId: "sk-stage-plan", quote: "Ask yourself: What mistakes am I making repeatedly? What specific exercises should I do to mitigate these mistakes? Am I confident that I can perform to an acceptable level on a random set of competition stages?", source: "PST", context: "Mock Stage Training tips" },
  { targetId: "sk-stage-hf", quote: "It is important you understand how the scoring system will affect aiming strategies. You want to leverage your skills the best you can given the scoring system.", source: "PST", context: "Doubles drill evolution" },
  { targetId: "sk-stage-pressure", quote: "Going to a controlled training environment with unlimited attempts is in no way, shape, or form the same sort of thing as shooting in a scored competition.", source: "PST", context: "Measurement chapter" },

  // ── PST: Discipline ──
  { targetId: "sk-discipline", quote: "If you are aiming, you will feel slow. A big part of most people's training is teaching themselves the discipline to aim and press the trigger properly no matter how long it feels like it is taking. Believe me, you will feel slow.", source: "PST", context: "Single-handed Shooting tips" },
  { targetId: "sk-discipline", quote: "You need to learn to 'take your time in a hurry.' Shoot quickly, but don't rush. Aim carefully, but don't waste time. It is not an easy thing to learn.", source: "PST", context: "Distance Changeup corrections" },
  { targetId: "sk-discipline", quote: "In order to improve, you will be battling your own habits, predispositions and self-limiting ideas.", source: "PST", context: "Why You Suck conclusion" },

  // ── PST: Drill-specific ──
  { targetId: "dr-elprez", quote: "6 seconds is fast. 5 seconds is awesome. 4 seconds is legendary.", source: "PST", context: "Measurement chapter on El Prez" },
  { targetId: "dr-measurement", quote: "DO NOT PUSH THE GUN BACK DOWN AFTER FIRING THE SHOT. Fire a second shot at the point the gun recoiled to without re-aiming. The distance between the two shots is the information you are looking for.", source: "PST", context: "Measurement Drill instructions" },
  { targetId: "dr-sight-tracking", quote: "Keep your eyes open. If you are not sure what you just saw, you did not see enough. The gun is telling you a story as it moves in recoil, you need to keep your eyes open to be aware of the story.", source: "PST", context: "Sight Tracking corrections" },
  { targetId: "dr-rhythm", quote: "Establish a 'rhythm' in your mind you are going to shoot. Each shot must be evenly spaced. You are REQUIRED to shoot the selected rhythm irrespective of anything else. The idea is by keeping to a rhythm, your job becomes getting your eyes exactly where they need to be.", source: "PST", context: "Rhythm Drill" },
  { targetId: "dr-rhythm", quote: "As you speed up, there will be excess tension coming into your firing hand, your shoulders and your arms. If you can let go of that tension, you might be shocked how quickly and effectively you can transition the gun.", source: "PST", context: "Rhythm Drill cues" },
  { targetId: "dr-bar-hop", quote: "Your string of fire should sound like four targets being shot. From the sound alone there should be no indication that there is a stick you are stepping over.", source: "PST", context: "L4 Bar Hop cues" },
  { targetId: "dr-mock-stage", quote: "The way you shoot, your style, your inclinations and your habits are what you are assessing. You are not trying to accomplish anything specific. The larger goal is to see what happens and spot the 'big picture' trends.", source: "PST", context: "Mock Stage Training tips" },
  { targetId: "dr-confirmation", quote: "Learning how much 'perfect' sight picture you can trade away in order to go faster is one of the most important things that a practical shooter can do.", source: "PST", context: "Confirmation Drill tips" },
  { targetId: "dr-soft-stops", quote: "Have your feet stop momentarily but have your body continue moving. Simply stopping your feet in place for a moment and allowing yourself to continue moving will feel strange at first.", source: "PST", context: "Soft Stops drill" },
];
