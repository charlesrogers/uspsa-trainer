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
  // ══════════════════════════════════════════════════════════════
  // GRIP — FIRING HAND (sk-grip)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-grip", quote: "You need to get the same grip on your pistol every single time. If your grip is off by even a few millimeters, your sights will not come to the target in alignment. You must then either spend a few tenths of a second correcting the sight alignment or fire a poorly aimed shot. Grip consistency is key.", source: "SDR", context: "On grip consistency" },
  { targetId: "sk-grip", quote: "I like to experiment with grip pressure quite a bit. I get the best trigger speed if I don't crush down that hard with my strong hand, but with my weak hand I get better control if I crank down on the gun.", source: "SDR", context: "On optimal grip pressure by hand" },
  { targetId: "sk-grip", quote: "Grip, trigger control, and the draw are all closely interrelated. If you screw up any part of the process, you will have a poor performance. Missing your grip on the draw or slapping the trigger carelessly will be a big problem.", source: "SDR", context: "On the grip-trigger-draw chain" },
  { targetId: "sk-grip", quote: "A common problem especially among lower-level shooters is a constant struggle with hand pressures. The normal tendency is to grip the gun extremely hard with your dominant hand. The tighter you hold your pistol with your dominant hand, the more difficult it becomes to isolate your trigger finger and move it by itself.", source: "PST", context: "On firing hand pressure problems" },
  { targetId: "sk-grip", quote: "It is better to hold the gun tightly and do a lot of the recoil management with your support hand, but that requires that you be using different amounts of pressure with each hand. It takes time and training to perfect this skill.", source: "PST", context: "On differential hand pressure" },
  { targetId: "sk-grip", quote: "The most important cue to pay attention to is the tactile feel of your firing hand on the gun. If the grip feels right, the sights will be where you expect them. If it feels wrong, you know before you even look.", source: "PST", context: "On grip feel as a diagnostic" },
  { targetId: "sk-grip", quote: "From the 25 yard line, there really isn't much you can do to shoot super-fast. What you should be doing is making sure you nail the grip when you draw and reload. I like to feel for an index point on the gun — getting your thumb in a specific spot, or some other index point. If you hit your index point, you really increase your chance of hitting a good grip.", source: "SDR", context: "On using a thumb index point" },
  { targetId: "sk-grip", quote: "First, you need to get a good grip on your pistol. If you have a nice consistent grip, the gun will aim wherever you look — especially at close ranges. If you miss your grip, it will likely end up pointing slightly in the wrong direction. If you bring the pistol up to eye level and see the front sight isn't sitting in the notch, you probably missed your grip.", source: "SDR", context: "On grip driving natural index" },
  { targetId: "sk-grip", quote: "Make sure you grip your gun 'for real.' Make sure you are watching your sights for real. If you dry-fire with a loose grip, you are training yourself to shoot with a loose grip. That's not what you want.", source: "DFR", context: "On realistic dry-fire grip" },
  { targetId: "sk-grip", quote: "It is important to think of this exercise as a grip exercise first and foremost. Pay attention to the feel of your hands as you are shooting. When you feel an errant shot happen because you pushed the gun sideways, you will generally stop making that mistake. It is counterintuitive, but focus on your hands and don't worry so much about the sight picture.", source: "PST", context: "On prioritizing grip feel over sight picture" },
  { targetId: "sk-grip", quote: "Low/left hits are almost always caused by moving the gun with the firing hand while shooting.", source: "PST", context: "On diagnosing firing hand errors from shot placement" },
  { targetId: "sk-grip", quote: "The first step to ingraining the right technique is to make a conscious choice as to the technique you want to use. You need to systematically work out every little detail. Where do you put your hands when you are drawing the gun? Are you going to grip the gun high with your non-dominant hand by wrapping fingers up the trigger guard or stop at the trigger guard?", source: "DFR", context: "On deciding grip technique details" },
  { targetId: "sk-grip", quote: "From a technique perspective, you should pay very close attention to your hands. I pay very little mind to sight alignment — that is the easy part. What does matter is feeling a rock solid grip on the gun, and then feeling my firing hand discharge the gun without pushing it around. Master that, and you master this drill.", source: "SDR", context: "On grip feel trumping sight focus" },

  // ══════════════════════════════════════════════════════════════
  // GRIP — SUPPORT HAND (sk-grip-support)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-grip-support", quote: "It is better to hold the gun tightly and do a lot of the recoil management with your support hand, but that requires that you be using different amounts of pressure with each hand. It takes time and training to perfect this skill.", source: "PST", context: "On support hand as primary recoil manager" },
  { targetId: "sk-grip-support", quote: "High hits generally come from insufficient support hand pressure or from shifting your grip as you shoot. The result is a mix of pushing on the gun and not maintaining support hand pressure as it fires.", source: "PST", context: "On diagnosing support hand pressure errors" },
  { targetId: "sk-grip-support", quote: "Your non-dominant hand should be giving 100% of available grip strength and should be positioned properly on the gun. This needs to be done as soon as the gun hits your eyeline so you can fire when you see the sights where you want them. There shouldn't be any time spent cleaning up your grip when the gun is already up. That needs to be done on the way up to your eyes.", source: "DFR", context: "On crush grip timing during the draw" },
  { targetId: "sk-grip-support", quote: "If they want to grip harder with their support hand while shooting, reading that information in a book will be of little help. They need to actually perform training repetitions and consciously direct that force into their hand exactly the way they want it. After a few thousand repetitions, they will see their grip in the place they want it to be without needing to think about it.", source: "PST", context: "On training support hand pressure through reps" },
  { targetId: "sk-grip-support", quote: "Pay attention to your hands. Notice how the sights track differently as you adjust your hand pressure. The gun is telling you a story as it moves in recoil — you need to keep your eyes open to be aware of the story.", source: "PST", context: "On using sight tracking to tune support hand" },
  { targetId: "sk-grip-support", quote: "After confirming your sights are in alignment on the center of the target you fire a rapid fire pair, as fast as you can pull the trigger. The second shot is not aimed in the conventional sense. Instead, you are counting on your strong grip and your shooting platform to take care of recoil mitigation so the second shot will still hit.", source: "PST", context: "On how support hand grip enables predictive shooting" },

  // ══════════════════════════════════════════════════════════════
  // HAND TENSION (sk-tension)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-tension", quote: "You need to learn variable hand tension. Grip the gun really hard when you are pulling the trigger, and only when you are pulling the trigger. At every other time (like when you are reloading), it is much better to be a bit 'loose.' It is counter-intuitive and difficult — your every instinct is going to be to clamp down during live-fire and loosen up during dry-fire.", source: "DFR", context: "On variable hand tension" },
  { targetId: "sk-tension", quote: "Remember, it is counter intuitive and difficult to manage your hand tension like this. Your every instinct is going to be to clamp down during live-fire and loosen up during dry-fire. It is against your human nature to easily master this, but with conscious practice it can happen.", source: "DFR", context: "On the counterintuitive nature of tension management" },
  { targetId: "sk-tension", quote: "Dryfiring the gun with a relaxed posture and grip can be counterproductive to being a good shooter. If you subconsciously relax your grip while you do dry training, you are not training yourself to do what you want to do in competition.", source: "PST", context: "On matching dry-fire tension to live-fire" },
  { targetId: "sk-tension", quote: "Clamping down your firing hand when the targets are extremely close is a common mistake. The problem at extreme close range usually turns out to be the reload — when people are going crazy, shedding lead as fast as they can, it causes their hands and forearms to get tense. It is tough to then go from tensed down to relaxed hands that can dexterously grab the next mag.", source: "SDR", context: "On tension killing reload dexterity" },
  { targetId: "sk-tension", quote: "The easiest way to summarize tension issues: the faster you go the more tense you get, and that tension causes problems with trigger control, reloads, and overall gun handling. Awareness is the first step.", source: "PST", context: "On the universal tension problem" },
  { targetId: "sk-tension", quote: "'Trigger Freeze' (the inability to reset the trigger for a second shot) is caused by an over tense firing hand in most cases. Relax your firing hand. Death gripping the gun or over tension will induce trigger freeze.", source: "PST", context: "On tension causing trigger freeze" },
  { targetId: "sk-tension", quote: "It is much easier to perform drills with very little tension in your body. However, this is not the correct way to perform in a match. You need to grip the gun firmly when shooting.", source: "DFR", context: "On not practicing with artificially low tension" },
  { targetId: "sk-tension", quote: "Another thing that can be a problem is building up excess tension during this drill. You need to hold the gun hard to shoot effectively, but if that tension makes its way down into your arms it will almost certainly cause missed reloads and slow times. Focus on only holding the gun with your hands and keeping your arms and upper body a bit looser.", source: "DFR", context: "On isolating tension to hands only" },

  // ══════════════════════════════════════════════════════════════
  // DRAW PRESENTATION (sk-draw)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-draw", quote: "The key times to focus on are draw times and reload times. They have a big effect on the overall classifier time. Most A class shooters pull the trigger at roughly the same speed as GMs. The difference is in the draw, reloads, and target transitions.", source: "SDR", context: "On what separates classifications" },
  { targetId: "sk-draw", quote: "Your draw is an important element to master. I have found that draw speed and consistency are strongly correlated with speed on all sorts of stages. When you draw, you look to a spot on a target and put the sights on that spot as quickly as you can. This is the same concept as a normal target transition.", source: "DFR", context: "On draw speed correlating with overall speed" },
  { targetId: "sk-draw", quote: "Your draw is where your grip and sight alignment converge to create something many people call an 'index.' You need that index, so you can look to a spot and have the sights show up in alignment on that spot quickly and consistently.", source: "DFR", context: "On the draw as an 'index' skill" },
  { targetId: "sk-draw", quote: "In terms of sight picture, you want to see the sights come up and settle into the center of the target. You don't want to see the sight come down onto the target from above — that means the gun went over the target and came down. It is a waste of energy to bring the gun up only to bring it down again.", source: "DFR", context: "On gun settling into target, not overshooting" },
  { targetId: "sk-draw", quote: "The sight picture shouldn't bounce around wildly when the gun gets to the target. This is indicative of 'throwing' the gun up and not bringing it up in a controlled fashion. The idea is to get the gun into a position where you can realistically shoot it. Being out of control does you no good.", source: "DFR", context: "On controlled presentation vs throwing the gun" },
  { targetId: "sk-draw", quote: "I think it is counterproductive to slow your draw stroke down for tougher targets, at least until you get the gun close to being on target. It does make sense to let the gun settle into the target as opposed to jamming it into position. When I see the sights gently settle into the A box, I know I am doing this correctly.", source: "DFR", context: "On not slowing the draw for hard targets" },
  { targetId: "sk-draw", quote: "Conventionally, you get a firing grip on your pistol while it is in the holster and pull it out and present it to the target. With a 'scoop' technique, you grab the pistol and pull it from the holster immediately and sort your grip out as you bring it up. This technique is 0.1 or 0.2 seconds faster but also a lot more error prone.", source: "PST", context: "On conventional draw vs scoop technique" },
  { targetId: "sk-draw", quote: "If I miss my grip when I draw, the gun will come to the target without the sights in alignment. If the gun comes up to the target wrong, then I end up dropping points.", source: "SDR", context: "On grip errors cascading into point loss" },
  { targetId: "sk-draw", quote: "The draw time doesn't really come down to how fast you can turn; it is how fast you can get the gun up to the target. I prefer to throw my weight around and get my head looking to the first target as soon as I can.", source: "SDR", context: "On El Presidente draw technique" },

  // ── Draw Micro Drills ──
  { targetId: "sk-draw", quote: "Start with your hands relaxed at sides. Get a firing grip on your pistol and move your non-dominant hand over to your dominant side. Your goal is a 0.4 second par time. Then: start with a firing grip and non-dominant hand in position. Draw and aim at the target. Goal: 0.5 second par time.", source: "DFR", context: "On draw micro drill breakdown" },

  // ── First Shot Draw (sk-draw-first) ──
  { targetId: "sk-draw-first", quote: "A good rule of thumb: most people have a total time on Bill Drills that is about double their draw time. If the draw time reads 1.59 seconds, the total time will usually be about 3.2 seconds.", source: "SDR", context: "On draw time as a predictor of total time" },
  { targetId: "sk-draw-first", quote: "I get a good grip on my pistol, push up to the target, and when I see my front fiber visible through the rear notch, I cut loose and start shooting. A reasonable goal is 1.2 seconds.", source: "SDR", context: "On sight confirmation threshold for first shot" },
  { targetId: "sk-draw-first", quote: "At the tone, engage the very center of the A zone. Fire one round only. Note the time on the timer. This is a baseline measurement of your draw speed and your ability to deliver an accurate first shot under time pressure.", source: "PST", context: "On the first-shot draw drill" },
  { targetId: "sk-draw-first", quote: "First, the draw is extremely important. You need to snatch the gun from the holster quickly. You can't screw around at all if you want to make the two second time limit. For most shooters, the draw time will be 1.3 or 1.4 seconds, leaving the remainder for the follow-up shot.", source: "SDR", context: "On aggressive draw speed at 25 yards" },

  // ══════════════════════════════════════════════════════════════
  // TRIGGER CONTROL (sk-trigger)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-trigger", quote: "The key to good group shooting is accepting that there is some wobble in your sight picture. If the sights are slightly wobbling, you need to ignore that and just work the trigger straight on back.", source: "SDR", context: "On accepting wobble and pressing through" },
  { targetId: "sk-trigger", quote: "When people shoot as fast as they can pull the trigger, they often push the gun down as they fire the second shot, pull the trigger sideways, pull the trigger with their whole hand, or hold the gun too loose and let it fly all over the place.", source: "SDR", context: "On common trigger errors at speed" },
  { targetId: "sk-trigger", quote: "People have a strong tendency to tense up their firing hand to try and control recoil, and it causes problems in a major way. I call this 'firing the gun with your whole hand.' This problem doesn't usually manifest during slow fire, but when you try to make a tight time limit, it becomes a problem.", source: "SDR", context: "On whole-hand trigger press under pressure" },
  { targetId: "sk-trigger", quote: "I really like to focus on the sensation of moving your trigger finger in isolation. So many people have an ingrained habit where they pull the trigger using muscles from their whole hand. By doing dry-fire, you can get a sense of what it feels like to fire an accurate shot. Watching the sights will tell you the whole story about what your hand is doing. If you see the sights wiggle when pressing the trigger, you are doing it wrong.", source: "DFR", context: "On trigger finger isolation in dry fire" },
  { targetId: "sk-trigger", quote: "The really important element is learning to break the trigger without disturbing the sights. This is a tactile skill — you need to feel it, not think about it.", source: "DFR", context: "On trigger press as a tactile skill" },
  { targetId: "sk-trigger", quote: "Try applying pressure slowly and continually until the trigger breaks, opposed to prepping the trigger back to its break point and then adding pressure. The continuous press is faster because there is no cognitive delay recognizing the prep point.", source: "PST", context: "On continuous press vs trigger prep" },
  { targetId: "sk-trigger", quote: "An example of a technical crutch is trigger prepping — pressing your trigger back to the 'wall' prior to firing. The problem with trigger prepping is it is slow. If you are to consciously recognize that you have prepped the trigger, this will add about 0.2 seconds for your brain to process it. The thing that worked well was that it made you press the trigger straight — the rest created a speed barrier.", source: "PST", context: "On why trigger prep is a crutch" },
  { targetId: "sk-trigger", quote: "Most commonly shots will be pressed down and left for a right-handed shooter. Hold your hand still. Isolate your trigger finger. Putting more attention on the sights will not help — the fix is in the hands.", source: "PST", context: "On diagnosing low-left misses" },
  { targetId: "sk-trigger", quote: "You can start the drill with your finger out of the trigger guard and try to match the same time it took with your finger in the trigger guard. By doing this you stress pressing the trigger straight on back.", source: "PST", context: "On finger-out drill for trigger discipline" },
  { targetId: "sk-trigger", quote: "You should pay attention to trigger finger placement on the face of the trigger. This should help you feel the way you are pressing the trigger back into the frame of the gun. Is the trigger going straight back? Typically, shooters get a better result by grabbing a bit more trigger and getting more leverage.", source: "DFR", context: "On trigger finger placement and leverage" },
  { targetId: "sk-trigger", quote: "When you are pressing a 'dead' trigger in dry fire, you should press the trigger hard. This provides a good simulation for live-fire where people fight recoil and press hard. If you subconsciously press lightly during dry-fire, you are not training the trigger press you will use under recoil.", source: "DFR", context: "On pressing the dead trigger hard" },
  { targetId: "sk-trigger", quote: "'Trigger Freeze' — the inability to reset the trigger for a second shot — is caused by an over tense firing hand in most cases. The best dry-fire method to overcome this is to deliberately press the trigger really hard during dry-fire. Take how hard you think you need to press and double it.", source: "DFR", context: "On overcoming trigger freeze in dry fire" },
  { targetId: "sk-trigger", quote: "People have a natural tendency to grip down even harder when shooting with only one hand. This does help with recoil control, but often people get in the habit of sympathetically tensing up their trigger finger along with the rest of their hand. Pay attention to moving your trigger finger independently.", source: "DFR", context: "On sympathetic trigger tension" },
  { targetId: "sk-trigger", quote: "What shooters need to learn is the ability to hold the gun very firm, but move the trigger finger independently of that. When you start firing real bullets, it may cause your whole body to tense up. With dry-fire training where you pay attention to managing your hand pressure, you can counteract much of that natural tendency.", source: "DFR", context: "On firm grip with independent trigger finger" },
  { targetId: "sk-trigger", quote: "At seven yards, I start to worry about trigger control. I bear down on my grip and work that trigger straight back. If you see your sights dip out of the front notch, you will likely not get an A.", source: "SDR", context: "On trigger control at 7 yards" },

  // ══════════════════════════════════════════════════════════════
  // SIGHT ALIGNMENT / SIGHT PICTURE (sk-sight-align)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-sight-align", quote: "For better or worse, you hit where you look. This is a concept that is too simple for many people to accept. If you look at the outside shape of the target or the target's color, you will be less accurate than if you drive your vision to a specific point.", source: "PST", context: "On driving vision to a specific point" },
  { targetId: "sk-sight-align", quote: "Most shooters are taught to focus on the front sight with iron sights. Iron sight shooters will soon figure out they are too slow shooting front sight focus all the time. You need to develop the ability to shift between target focus and sight focus depending on distance and difficulty.", source: "PST", context: "On front sight focus being too slow for everything" },
  { targetId: "sk-sight-align", quote: "What you should develop is continual awareness of what your sights are doing. How are they moving in recoil? Do you see the dot dip below the point of aim after the first shot? What EXACTLY are you seeing? You need to know. The concept of continual sight awareness is intertwined with predictive shooting.", source: "PST", context: "On continual sight awareness" },
  { targetId: "sk-sight-align", quote: "Reactive shooting ties every single round you fire to your own human reaction time. This means every shot adds about 0.2 seconds to perceive your sights return and then decide to fire. There is no way around the math. Reaction takes time. Predictive shooting eliminates this delay.", source: "PST", context: "On reactive vs predictive shooting math" },
  { targetId: "sk-sight-align", quote: "Shooting close targets with a 'target focus' is usually faster than a 'sight focus.' Instead of shooting with a front sight focus at some distance, try target focus. That method will produce faster times, but in theory you will drop more points. Selecting a faster aiming method is one way to push the time down.", source: "SDR", context: "On target focus vs sight focus" },
  { targetId: "sk-sight-align", quote: "On the close target, I do the usual 'look through the gun' thing and drive the gun as hard as possible. It is important to find the center of the close targets with your eyes, then drive the gun to that spot. At only five yards, it is possible to shoot all A's pretty much as fast as you can pull the trigger.", source: "SDR", context: "On 'look through the gun' at close range" },
  { targetId: "sk-sight-align", quote: "I like to see just how little 'sight picture' I can get away with and still shoot A's. Seeing the outline of the gun on the target is usually enough at 3 yards.", source: "SDR", context: "On minimal sight picture at 3 yards" },
  { targetId: "sk-sight-align", quote: "I get a good grip on my pistol, push up to the target, and when I see my front fiber visible through the rear notch, I cut loose and start shooting. A reasonable goal at 7 yards is 1.2 seconds.", source: "SDR", context: "On the threshold sight picture at 7 yards" },
  { targetId: "sk-sight-align", quote: "At 15 yards, things start getting really complicated. This distance is close enough that a competent shooter can still pull fast split times, but far enough that having your sights misaligned will cause serious problems. I can use either a target focus or a front sight focus at this distance, and it doesn't seem to affect the results a whole lot.", source: "SDR", context: "On 15 yards as the inflection point" },
  { targetId: "sk-sight-align", quote: "At 20 yards, the pendulum starts to swing heavily toward deliberate shooting and a hard front sight focus. Draw at the same speed you would up close, then just spend the extra time refining your sight picture and carefully working the trigger.", source: "SDR", context: "On hard front sight focus at 20 yards" },
  { targetId: "sk-sight-align", quote: "At closer ranges (25 yards and less) you will find that your sights can have a certain degree of motion in them. Your sights never really need to perfectly settle down — you can hit A's with rock solid trigger control. However, at the 50 yard line, everything really does need to be perfect.", source: "SDR", context: "On acceptable sight movement by distance" },
  { targetId: "sk-sight-align", quote: "Watching your front sight move up in recoil, then using your hand muscles to return the sight, then breaking the next shot is a cycle that you go through time after time. You need to manage the gun in recoil over the course of every shot.", source: "SDR", context: "On the sight tracking cycle" },
  { targetId: "sk-sight-align", quote: "A good rule of thumb for taking targets while moving is to imagine that they are 50 percent further than their actual distance and get an appropriate sight picture for that. So pretend 10-yard targets are actually at 15 yards.", source: "DFR", context: "On sight picture adjustment while moving" },
  { targetId: "sk-sight-align", quote: "You should consciously decide what type of sight picture you require on each target. Decide whether you are going to shoot that target sight focused or target focused. The whole idea is to seamlessly change gears between targets of different difficulty levels.", source: "SDR", context: "On choosing aiming scheme per target" },
  { targetId: "sk-sight-align", quote: "The phrase I have in my head when working on transitions is 'shoot sooner, not faster.' It isn't about how quickly you are jamming the trigger. What you should be thinking about is getting started as soon as possible on each target. Do not 'sit on' a good sight picture. When you see what you need to see, it is time to shoot.", source: "SDR", context: "On shoot sooner, not faster" },

  // ══════════════════════════════════════════════════════════════
  // RECOIL MANAGEMENT (sk-recoil)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-recoil", quote: "Most people have an incorrect concept of recoil control. They believe it will take a lot of muscle mass, force and effort to control the recoil of their pistol. You do not need to work that hard. The muzzle should only marginally rise when you fire a shot. The main issue is battling your tendency to overcorrect or overcontrol.", source: "PST", context: "On the overcorrection problem" },
  { targetId: "sk-recoil", quote: "What will work best for most people is to hold onto their gun firmly with good grip technique and then let the gun do what the gun is going to do. You should not try to stop the recoil from happening. Instead, accept the recoil will move the gun a little bit and ensure that the gun is returning to the same spot.", source: "PST", context: "On letting the gun return naturally" },
  { targetId: "sk-recoil", quote: "Watching your front sight move up in recoil, then using your hand muscles to return the sight, then breaking the next shot is a cycle that you go through time after time. If your hand slips off the grip, or something else happens, you are going to be in trouble.", source: "SDR", context: "On the sight-return-fire cycle" },
  { targetId: "sk-recoil", quote: "At 20 yards, you may find yourself needing to 'muscle' the gun back down in the A zone. If you shoot 'too relaxed,' you may not have the control you need to return the gun and fire the shots to make the goal time.", source: "SDR", context: "On muscling the gun at distance" },
  { targetId: "sk-recoil", quote: "Five yards is very close. You should be able to fire the gun as fast as you can pull the trigger and still hold every shot in the A zone. Experiment with grip pressure — best trigger speed comes from not crushing with the strong hand, but cranking down with the weak hand.", source: "SDR", context: "On recoil management at close range" },
  { targetId: "sk-recoil", quote: "People have a strong tendency to tense up their firing hand to try and control recoil. I call this 'firing the gun with your whole hand.' Be warned, this problem doesn't manifest during slow fire, but when you try to make a tight time limit, it becomes a problem.", source: "SDR", context: "On whole-hand recoil control mistake" },
  { targetId: "sk-recoil", quote: "When you actually shoot live ammo, you are probably going to press forward into the recoil and try to keep the gun from recoiling up. Prepare yourself for that sensation by pressing hard during dry-fire so you can see if you will be pushing shots down.", source: "DFR", context: "On simulating recoil management in dry fire" },
  { targetId: "sk-recoil", quote: "You can refine your grip and stance to maximize recoil control and shoot the gun accurately nearly as fast as you can pull the trigger.", source: "PST", context: "On grip and stance as recoil solution" },
  { targetId: "sk-recoil", quote: "It is likely that once they get the sight picture the way they want it they are snatching the trigger or pressing their gun down in anticipation of recoil. They have associated tough shots with lots of aiming, but also with smashing the trigger.", source: "PST", context: "On flinch and recoil anticipation" },

  // ══════════════════════════════════════════════════════════════
  // CADENCE / SPLIT TIMES (sk-cadence)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-cadence", quote: "Split guidelines by distance: 5yd = 0.20s (95% Alpha), 10yd = 0.22s (90% Alpha), 15yd = 0.25s, 20yd = 0.30s, 25yd = 0.40s. These are reasonable benchmarks for a skilled shooter.", source: "SDR", context: "On split time benchmarks by distance" },
  { targetId: "sk-cadence", quote: "A very reasonable goal time for the Bill Drill at 7 yards is two seconds. That breaks down to a one second draw and 0.2 second splits.", source: "SDR", context: "On Bill Drill cadence at 7 yards" },
  { targetId: "sk-cadence", quote: "At 10 yards, I have selected 2.2 seconds as a reasonable goal. The extra time comes from letting your sights settle down a little and perhaps backing off on trigger speed. At 10 yards, most people can't shoot as fast as they can pull the trigger and still hit all A's.", source: "SDR", context: "On 10-yard cadence adjustment" },
  { targetId: "sk-cadence", quote: "15 yards has been described by Brian Enos as 'the ultimate distance.' It is just far enough that you need to aim pretty hard, but not so far that you can't get on the gas. This is why I've selected 2.5 seconds as the goal time.", source: "SDR", context: "On 15 yards as the 'ultimate distance'" },
  { targetId: "sk-cadence", quote: "A good rule of thumb: most people have a total time on Bill Drills that is about double their draw time. If the draw reads 1.59 seconds, the total will usually be about 3.2 seconds.", source: "SDR", context: "On draw-to-total time ratio" },
  { targetId: "sk-cadence", quote: "There is no specific time limit for this drill, but that doesn't excuse you from shooting fast. When the sights come out of recoil, you should begin to fire the next shot. You shoot the speed of your sights — no faster and no slower.", source: "SDR", context: "On shooting the speed of your sights" },
  { targetId: "sk-cadence", quote: "Follow up shots should be in the range of 0.3 to 0.6 seconds. If much faster than 0.3, you are likely shooting without any visual confirmation. If much slower than 0.6, you are likely over-confirming.", source: "PST", context: "On follow-up shot timing window" },
  { targetId: "sk-cadence", quote: "Reactive shooting ties every single round to your own human reaction time — about 0.2 seconds per shot. There is no way around the math. Predictive shooting eliminates this delay by trusting grip and platform.", source: "PST", context: "On the 0.2s reaction time floor" },
  { targetId: "sk-cadence", quote: "Establish a rhythm in your mind you are going to shoot. Each shot must be evenly spaced — same split and transition time. As you speed up, you will eventually be pulling the trigger without visual confirmation. The idea is that keeping to a rhythm forces your eyes and gun to be where they need to be.", source: "PST", context: "On rhythm drill for cadence" },
  { targetId: "sk-cadence", quote: "There is a pacing issue in this drill. Many people fire three or four shots and everything looks good. They then start working the trigger faster. If shots get broken too quickly, it is common to sling shots over the top of the target because the gun will not return out of recoil.", source: "SDR", context: "On cadence creep during strings" },

  // ══════════════════════════════════════════════════════════════
  // PACING (sk-pacing)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-pacing", quote: "The whole idea is to seamlessly change gears between targets of different difficulty levels. Maybe you just look through the gun up close, get a hard front sight focus at 25 yards, and do something in the middle at 15 yards. You need to go between all those modes without there being a hitch.", source: "SDR", context: "On seamless gear changes" },
  { targetId: "sk-pacing", quote: "If your split times are the same at 7 yards as they are at 25 yards, that should tell you something. If you don't pick up speed as you go from the back target to the front, something is wrong. You may be shooting everything at hose speed, or unable to transition from distance shooting into close range blasting.", source: "SDR", context: "On diagnosing pacing from split times" },
  { targetId: "sk-pacing", quote: "You should be sure to distinguish between changing techniques and simply 'going faster.' Going faster without changing your aiming method just means sloppy execution. True pacing means selecting the appropriate technique for each target's difficulty.", source: "SDR", context: "On technique change vs just going faster" },
  { targetId: "sk-pacing", quote: "Often, I like to 'just shoot' a drill. I am not trying to go all out, nor am I playing it conservative. I simply step to the line and do what I know how to do. You just let your body run its natural pace. This is the ideal way to shoot matches.", source: "SDR", context: "On 'just shooting' as the ideal match pace" },
  { targetId: "sk-pacing", quote: "Pushing is when you run a drill faster than you feel comfortable going. When you push, don't just think 'go faster' — think about utilizing a technique that will produce a faster time. For example, switch from front sight focus to target focus. That's a technique-driven push.", source: "SDR", context: "On pushing with technique, not just speed" },
  { targetId: "sk-pacing", quote: "The opposite of pushing is to 'play it safe.' When people try to execute the same techniques but just go slower, they still make mistakes. If you instead decide to press the trigger really carefully, you will likely have a slower time but better points.", source: "SDR", context: "On playing it safe with technique change" },
  { targetId: "sk-pacing", quote: "If you make the par time every repetition without fail, then you are laying back and need to push harder. If you are 'perfect,' you aren't pushing and thus aren't advancing your skill level.", source: "DFR", context: "On using failure to calibrate effort" },
  { targetId: "sk-pacing", quote: "On the distant target, the most common error is firing the second shot before the gun settles back out of recoil. It is very common to sling shots over the top. Patience is absolutely key on this target. Shoot this drill in every order — left to right, right to left, near to far, far to near — to practice your gear changes.", source: "SDR", context: "On patience at distance and practicing all orders" },
  { targetId: "sk-pacing", quote: "If you are aiming, you will feel slow. A big part of most people's training is to get comfortable with that feeling. You need to learn to 'take your time in a hurry.' Shoot quickly, but don't rush.", source: "PST", context: "On taking your time in a hurry" },

  // ══════════════════════════════════════════════════════════════
  // SHOT CALLING (sk-shot-call)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-shot-call", quote: "Shot calling — knowing where rounds will impact at the moment you fire them — is a desirable and useful skill. You don't need separate drills to work on shot calling. You should always be striving to call your shots. If you are watching your sights closely, you will notice if things don't look right.", source: "SDR", context: "On always practicing shot calling" },
  { targetId: "sk-shot-call", quote: "Call your shots by sight and not sound if at all possible. You can't wait to hear audible confirmation from steel — that is way too slow. You need to accurately assess what is happening at the speed of your eyes and your sights.", source: "SDR", context: "On calling by sight, not sound" },
  { targetId: "sk-shot-call", quote: "If you are interested in testing your shot calling, work at targets far enough away that you can't see the holes from the firing line. Mentally call the shot before walking up. For closer targets, shoot at a chewed up target with a fresh one stapled behind. Call before looking at the back target.", source: "SDR", context: "On testing shot calling ability" },
  { targetId: "sk-shot-call", quote: "Paper targets don't let you know if you missed them — you need to call the shots off your sights. Some shooters that practice primarily on steel develop a reliance on feedback. If you feel yourself becoming reliant on steel feedback, switch to paper.", source: "SDR", context: "On not relying on steel feedback" },
  { targetId: "sk-shot-call", quote: "If you make mistakes but are unaware of them, then you are likely to repeat those mistakes in the future. Shot calling is the mechanism by which you become aware of errors in real time.", source: "DFR", context: "On shot calling as error awareness" },
  { targetId: "sk-shot-call", quote: "Get in the habit of recalling what you observed as you were shooting. As you learn to recall flashes of the sight pictures you were seeing, the hits on targets will not be anywhere near as mysterious.", source: "PST", context: "On recalling sight pictures after strings" },
  { targetId: "sk-shot-call", quote: "You should be continually aware of what the sights are doing. Keep both eyes open. Try not to flinch or blink. See everything as much as you can. How are the sights moving in recoil? Do you see the dot dip down below aim after the first shot? What EXACTLY are you seeing? You need to know.", source: "PST", context: "On continual sight awareness for shot calling" },
  { targetId: "sk-shot-call", quote: "Many shooters are able to hold their guns on target during rapid fire, but are unable to read the sights fast enough to take advantage of it. With training, this issue can be minimized or even totally overcome.", source: "DFR", context: "On developing speed of sight reading" },

  // ══════════════════════════════════════════════════════════════
  // DISCIPLINE / MENTAL GAME (sk-discipline)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-discipline", quote: "I had one of the most important breakthroughs in my shooting career when I realized that practice isn't about confirming what you can already do — it is about finding and fixing what you can't do.", source: "SDR", context: "On the purpose of practice" },
  { targetId: "sk-discipline", quote: "The directions do not call for one good string every now and then. They instruct you to do it correctly, consistently, every time.", source: "SDR", context: "On the standard being consistency" },
  { targetId: "sk-discipline", quote: "I don't want you to just get a GM card; I want you to become a GM.", source: "SDR", context: "On the difference between a card and ability" },
  { targetId: "sk-discipline", quote: "One of the less productive axioms in shooting sports is the idea that 'smooth is fast.' This can be used as a justification for going slowly. If you want to be fast and accurate, you need to train with a time element.", source: "SDR", context: "On 'smooth is fast' as a crutch" },
  { targetId: "sk-discipline", quote: "Being able to make tight shots at speed is the most critical skill for doing well in competition. Everything else is secondary.", source: "SDR", context: "On what matters most in competition" },
  { targetId: "sk-discipline", quote: "You can't give up. I personally went through a two year phase where I didn't make any real progress. If you are working hard and smart, the results will come.", source: "SDR", context: "On persistence through plateaus" },
  { targetId: "sk-discipline", quote: "When you are training, focus up! You need to be mentally engaged, not just going through the motions. Every rep counts.", source: "SDR", context: "On mental engagement in training" },
  { targetId: "sk-discipline", quote: "Pushing comes after you are able to do it consistently. If you can't consistently execute a skill, you have no business pushing it faster. Get consistent first, then push.", source: "SDR", context: "On consistency before speed" },
  { targetId: "sk-discipline", quote: "I learned that I could practice pretty much everything to do with shooting, except putting rounds downrange. All the manipulation, movement, and transitions can be trained in dry fire.", source: "DFR", context: "On the scope of dry fire practice" },
  { targetId: "sk-discipline", quote: "I have learned that simply shooting more rounds doesn't make you better. You need deliberate, focused practice with clear goals for each session.", source: "DFR", context: "On deliberate practice" },
  { targetId: "sk-discipline", quote: "You need to hunt down your weaknesses and relentlessly crush them. If it is hard for you to do, that's exactly what you need to be practicing.", source: "DFR", context: "On attacking weaknesses" },
  { targetId: "sk-discipline", quote: "The most important point about mistakes is that you shouldn't fear them. Mistakes during training are information. They tell you exactly what needs work.", source: "DFR", context: "On mistakes as information" },
  { targetId: "sk-discipline", quote: "If you are aiming, you will feel slow. A big part of training is getting comfortable with that feeling. You need to learn to 'take your time in a hurry.'", source: "PST", context: "On getting comfortable feeling slow" },
  { targetId: "sk-discipline", quote: "In order to improve, you will be battling your own habits, predispositions and subconscious tendencies. The path forward requires conscious effort to override what feels natural.", source: "PST", context: "On overriding natural tendencies" },
  { targetId: "sk-discipline", quote: "Different people need different feedback at different times. The drills in this book provide a structured framework, but you need to be your own coach and figure out what you need to work on today.", source: "PST", context: "On self-coaching" },

  // ══════════════════════════════════════════════════════════════
  // VISUAL CONFIRMATION (sk-confirm-1, sk-confirm-2, sk-confirm-3)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-confirm-1", quote: "Confirmation 1: Kinesthetic alignment only. You 'feel' your arms are pointed in the correct place and then you shoot. NO VISUAL CONFIRMATION. This is for extremely close targets where your index is reliable enough to fire without seeing sights.", source: "PST", context: "On kinesthetic (Type 1) confirmation" },
  { targetId: "sk-confirm-1", quote: "I like to see just how little sight picture I can get away with and still shoot A's. Seeing the outline of the gun on the target is usually enough at 3 yards. At 5 yards, seeing the fiber dot come onto the target as you draw is usually enough.", source: "SDR", context: "On minimal visual confirmation at close range" },
  { targetId: "sk-confirm-2", quote: "Confirmation 2: You react to the color of your sight crossing your intended aiming area. With an optic you shoot as soon as you see the optical color. This is a fast, reactive confirmation — you see color in the right zone and fire.", source: "PST", context: "On color-based (Type 2) confirmation" },
  { targetId: "sk-confirm-2", quote: "A big time waster when engaging steel is any lack of confidence about where your shots are going. You can't wait to hear audible confirmation — that is way too slow. Assess what is happening at the speed of your eyes. If you need a follow-up, fire it immediately.", source: "SDR", context: "On fast confirmation on steel" },
  { targetId: "sk-confirm-3", quote: "Confirmation 3: Your dot is stopped and stable in your intended aiming area. Your dot should appear as a dot and not as a streak. With iron sights you see the front sight stopped through the rear notch. This is for precision shots at distance.", source: "PST", context: "On precision (Type 3) confirmation" },
  { targetId: "sk-confirm-3", quote: "At 20 yards, the pendulum swings heavily toward deliberate shooting and a hard front sight focus. Draw at the same speed you would up close, then spend the extra time refining your sight picture and carefully working the trigger. A reasonable goal for two A's is 1.8 seconds.", source: "SDR", context: "On full confirmation at 20 yards" },
  { targetId: "sk-confirm-1", quote: "Do not over aim or over confirm on close-ranged, open targets. Shoot immediately when you recognize the gun is on target. While training ask yourself, 'Could I have been shooting sooner?'", source: "PST", context: "On not over-confirming close targets" },
  { targetId: "sk-confirm-2", quote: "When doing this drill, be sure you get your sight picture on the targets and then immediately move to the next one. Do not stare at a good sight picture confirming what you already know. The instant the sights look good, you should be looking to the next target.", source: "DFR", context: "On not staring at good sight pictures" },
  { targetId: "sk-confirm-3", quote: "If your follow up shots start to get long — 0.6 seconds or more — then it is likely you are over confirming your sight picture. When the sights come back you need to shoot. Sitting on that sight picture will not help you.", source: "PST", context: "On over-confirmation as a time waste" },
  { targetId: "sk-confirm-2", quote: "Constantly evaluate the aiming scheme you are using for each target. Are you over or under confirming for the given target? Look for opportunities to increase your speed or optimize your points scored.", source: "PST", context: "On evaluating confirmation per target" },
  { targetId: "sk-confirm-1", quote: "When people are pressed for time, they stop confirming with their sights. Be on guard for undisciplined shooting. Apply the correct aiming scheme for each target. Do not over or under confirm.", source: "PST", context: "On under-confirmation causing misses" },

  // ══════════════════════════════════════════════════════════════
  // TRANSITIONS (sk-trans-close through sk-trans-exit-entry)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-trans-close", quote: "On close targets, the transition time should be very fast because you don't need much visual confirmation. Drive the gun aggressively and shoot as soon as you perceive color in the right place.", source: "SDR", context: "On close transition speed" },
  { targetId: "sk-trans-close", quote: "The phrase I have in my head when working on transitions is 'shoot sooner, not faster.' It isn't about how quickly you jam the trigger — think about getting started as soon as possible on each target. Do not 'sit on' a good sight picture.", source: "SDR", context: "On shoot sooner, not faster" },
  { targetId: "sk-trans-med", quote: "At 15 yards, I can use either a target focus or a front sight focus, and it doesn't affect the results a whole lot. The feel of those methods is very different — target focused feels aggressive and rock solid, sight focused feels like more work but you can tell exactly where bullets will strike.", source: "SDR", context: "On medium distance transition aiming" },
  { targetId: "sk-trans-far", quote: "On the distant target, the most common error is firing the second shot before the gun settles out of recoil. It is very common to sling shots over the top. Patience is absolutely key on this target.", source: "SDR", context: "On patience in far transitions" },
  { targetId: "sk-trans-near-far", quote: "I recommend you shoot this drill in every order — left to right, right to left, near to far, and far to near. This gives you practice with your 'gear changes' — the ability to shift from aggressive close shooting to deliberate distance shooting.", source: "SDR", context: "On practicing all transition orders" },
  { targetId: "sk-trans-far-near", quote: "If you don't pick up speed as you go from the back target to the front, something is wrong. You may be shooting everything at 'hose' speed, or you may be unable to transition from distance shooting into close range blasting.", source: "SDR", context: "On speeding up for close targets" },
  { targetId: "sk-trans-wide", quote: "For wide transitions where the gun has to travel a long way, your eyes need to lead the gun to the target. Look where you want to shoot before the gun arrives. The gun should follow your vision, not the other way around.", source: "SDR", context: "On eyes leading gun in wide transitions" },
  { targetId: "sk-trans-exit-entry", quote: "Drag on/drag off transitions are the most common issue. As you speed up to 0.18 to 0.20 pace of splits, it is very difficult to keep your vision under control. It is very natural to mentally leave a target before you are done shooting it, or to be too slow getting the gun to the next target.", source: "PST", context: "On drag-on/drag-off transition errors" },
  { targetId: "sk-trans-low", quote: "Low targets require you to change your body mechanics — bend at the knees and waist to bring the gun down while maintaining your grip pressure and trigger control. Don't just push the gun down with your arms.", source: "DFR", context: "On low target transition technique" },
  { targetId: "sk-trans-steel", quote: "A big time waster when engaging steel is lack of confidence about where shots are going. You need to accurately assess what is happening at the speed of your eyes. If you need a follow-up on steel, fire it immediately.", source: "SDR", context: "On steel engagement confidence" },
  { targetId: "sk-trans-steel", quote: "Paper targets don't let you know if you missed them — you need to call the shots off your sights. Some shooters that practice primarily on steel develop a reliance on the audible or visual feedback. If you feel yourself becoming reliant on steel feedback, switch to paper for a while.", source: "SDR", context: "On not relying on steel feedback" },

  // ══════════════════════════════════════════════════════════════
  // RELOADS (sk-reload-stand, sk-reload-move, sk-reload-entry)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-reload-stand", quote: "One thing that is very critical is learning how to position your gun for the reload. For guns without a magwell, most shooters will want to drop the gun down a bit and angle it toward the magazine pouches — more like a 45-degree angle. I find that angle to be absolutely critical to a good performance.", source: "DFR", context: "On gun angle for standing reload" },
  { targetId: "sk-reload-stand", quote: "The biggest challenge during reload drills is the urge to tense up. When you are tense, it is almost impossible to quickly and consistently hit your reloads. Make sure you start with a firm and realistic firing grip, reload, then finish back on a realistic firing grip.", source: "DFR", context: "On tension as the enemy of reloads" },
  { targetId: "sk-reload-stand", quote: "Be sure you prepare for common circumstances. You need to be able to drop an empty magazine as well as a full one. You need to quickly actuate the slide stop if the slide is open. Don't only practice slide-forward reloads with full magazines. Be ready for anything.", source: "DFR", context: "On preparing for all reload scenarios" },
  { targetId: "sk-reload-stand", quote: "When people are going crazy, shedding lead as fast as they can pull the trigger, it causes their hands and forearms to get tense. It is tough to then go from tensed down on the pistol to relaxed hands that can dexterously grab the next mag and stuff it into the gun. I take deep, relaxing breaths when I am on the line.", source: "SDR", context: "On tension killing reload speed" },
  { targetId: "sk-reload-stand", quote: "You need to hold the gun hard to shoot effectively, but if that tension makes its way down into your arms it will almost certainly cause missed reloads and slow times. Focus on holding the gun with your hands only and keeping your arms and upper body looser.", source: "DFR", context: "On isolating grip tension from arm tension" },
  { targetId: "sk-reload-stand", quote: "Start with your pistol aimed at the target. At the signal, eject the magazine and bring the fresh magazine just to the edge of the magwell. Goal: 0.6 seconds. Then: start with a magazine at the edge of the magwell. Seat it, reacquire grip, get a sight picture. Goal: 0.6 seconds.", source: "DFR", context: "On reload micro drill breakdown" },

  { targetId: "sk-reload-move", quote: "What you are working on here is your 'flow.' Shooters frequently stop moving when they reload, or look 'herky-jerky.' The idea is to have as little downtime as possible. The instant you finish the first targets, focus shifts to the reload. As soon as that's done, you are back up on target.", source: "SDR", context: "On reload flow during movement" },
  { targetId: "sk-reload-move", quote: "I like to have my reload time on this drill run within 0.1 to 0.2 seconds of a static reload on an equally distant target. If you usually run a 1.1 or 1.2 second reload at the seven yard line, then you should run a 1.2 or 1.3 reload on a seven yard target while moving.", source: "SDR", context: "On moving reload time standard" },
  { targetId: "sk-reload-move", quote: "Pushing 100% movement aggression will mean you get to where you need to go with the reload still not finished. Back off your movement aggression just a little and focus on getting the reload finished. Balance movement speed with reload completion.", source: "SDR", context: "On balancing movement speed and reload" },
  { targetId: "sk-reload-move", quote: "Set up a circular pattern of markers on the ground. Run around the circle at top speed while executing a reload every 2 or 3 seconds. Go through all the magazines on your belt. Get comfortable with running top speed and executing reloads while you do it.", source: "DFR", context: "On running reload drill" },

  { targetId: "sk-reload-entry", quote: "Gain the ability to aggressively push from one position to another while getting the gun reloaded. The more aggressive the movement, the harder it is to reload quickly. Move a bit less aggressively and get that reload done. Make sure you direct your attention to the gun as you are getting the reload done.", source: "DFR", context: "On entry reload with aggressive movement" },
  { targetId: "sk-reload-entry", quote: "If you choose to reload between firing positions, it will likely restrict how aggressively you can move. Instead of pushing 100%, back off movement just enough to get the reload finished before you arrive at the next position.", source: "SDR", context: "On entry reload movement tradeoff" },

  // ══════════════════════════════════════════════════════════════
  // MOVEMENT (sk-move-entry through sk-move-lean)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-move-entry", quote: "Move as aggressively as possible, set up ready to move again, be ready to shoot when you arrive in position. Have the gun mounted and ready to shoot as you are approaching the next shooting position. Run aggressively enough that you get winded quickly.", source: "PST", context: "On aggressive position entry" },
  { targetId: "sk-move-entry", quote: "Faster running means you need to apply the brakes sooner. You cannot learn everything you need to unless you are truly going aggressively. Proper movement training will cause you to tire quickly. If you are going slowly, you are not training correctly.", source: "PST", context: "On going hard enough to get tired" },
  { targetId: "sk-move-entry", quote: "Make sure that every time you stop you are ready to move. Your feet should be spread apart, knees bent, 50/50 weight distribution, ready to spring to the next place. Consciously check each movement to make sure you are getting the outcome you want.", source: "PST", context: "On stance on arrival" },
  { targetId: "sk-move-entry", quote: "If it feels like it is taking ages to get started shooting when you get to a new position, you might be late getting the gun mounted. If you notice your gun is not yet up in front of you, make a point to get it gripped properly and mounted a step or two sooner as you come into position.", source: "PST", context: "On getting the gun up early" },
  { targetId: "sk-move-entry", quote: "Slow down into the shooting position gently. Use soft steps to come to a clean stop so you can start engaging targets when your sights dictate. If you see your sights bouncing excessively when slowing to a stop, fix it with your lower body mechanics.", source: "PST", context: "On soft steps into position" },
  { targetId: "sk-move-entry", quote: "If you feel like you are stopping rough into a shooting position, take short steps as you approach to help you decelerate. If you attempt to stop in the space of a single step, you will likely be unable to control your body.", source: "PST", context: "On deceleration technique" },
  { targetId: "sk-move-entry", quote: "Have your gun up ready to shoot as you enter a shooting position. You should see your sights in your field of view just before you mean to start shooting. It is not good enough just to have the gun up — you need to be actually seeing the sights. You save time by starting to shoot earlier.", source: "PST", context: "On sights ready before arrival" },
  { targetId: "sk-move-entry", quote: "The idea is to not only have your gun up, but to be ready. The best way to be ready is to be aiming down the sights at the first target you plan to shoot. Keep fighting to stabilize your sight picture.", source: "DFR", context: "On being truly ready at entry" },
  { targetId: "sk-move-entry", quote: "The second and more important cue is to have your feet stop momentarily but have your body continue moving. This 'soft stop' will feel like you are falling through the position, but it allows you to shoot very accurately and save time.", source: "PST", context: "On the soft stop technique" },

  { targetId: "sk-move-exit", quote: "On this drill, you are working on getting out of position explosively. I strive for a feeling of pushing with both feet to get out of position. I want to use all the muscles at my disposal to exit that initial shooting position.", source: "DFR", context: "On explosive position exit" },
  { targetId: "sk-move-exit", quote: "At the instant you call that last shot, put everything you have into moving out of position. On closer range targets, it is sometimes appropriate to 'cheat' a little and start leaning out of position as you fire the last couple shots — without picking up your feet. As soon as a foot comes off the ground it disrupts balance.", source: "DFR", context: "On lean-exit technique" },
  { targetId: "sk-move-exit", quote: "Make sure you do not have extraneous steps when you exit a shooting position. Taking small steps to change your stance, coiling your body, or drop stepping should not occur. You should stop and stabilize in a position already 'pre-loaded' and ready to move.", source: "PST", context: "On eliminating false steps" },
  { targetId: "sk-move-exit", quote: "The 'drop step' technique is only needed when you are getting out of a leaning position. If you're not leaning, you should already be loaded and ready to push off in the direction you need to go.", source: "PST", context: "On when to drop step vs push" },

  { targetId: "sk-shoot-move", quote: "When there is movement involved — you moving or the target moving — it is necessary to shoot with your vision focused on the target. This is the most missed element of shooting on the move. If you shoot focused on your front sight or dot, you will tend to 'drag' hits in the same direction you are moving.", source: "PST", context: "On target focus while moving" },
  { targetId: "sk-shoot-move", quote: "When shooting on the move, disregard what you think you know about predictive shooting. Your ability to predict how the gun tracks is greatly diminished when you add movement. Switch to reactive shooting. Do NOT rush — you are saving time by shooting as you move, so maximum pace is not necessary.", source: "PST", context: "On reactive shooting while moving" },
  { targetId: "sk-shoot-move", quote: "Bend your knees and get down nice and low. Use your lower body to maintain stability. If you see your sights bouncing an unacceptable amount, you will fix that with lower body mechanics.", source: "PST", context: "On lower body for stability on the move" },
  { targetId: "sk-shoot-move", quote: "Perform short movements with the gun mounted and ready to fire. Shoot as the sights dictate. Focus on blending positions together rather than moving between them quickly. Finish in a proper stance — wide, low, and 50/50 weight distribution.", source: "PST", context: "On mounted movement technique" },
  { targetId: "sk-shoot-move", quote: "A good rule of thumb for taking targets while moving is to imagine that they are 50 percent further than their actual distance and get an appropriate sight picture for that.", source: "DFR", context: "On sight picture adjustment while moving" },

  { targetId: "sk-move-mounted", quote: "For mounted movement: have the gun up and ready to fire as you move. Short movements between close targets should be done with the gun in your shooting position. You should be able to shoot at any point during the movement.", source: "PST", context: "On mounted movement" },
  { targetId: "sk-move-unmounted", quote: "For longer movements between positions, dismount the gun and run. Get the gun back up and mounted as you approach the next shooting position — at least one or two steps before you plan to start shooting.", source: "PST", context: "On unmounted movement" },

  { targetId: "sk-move-aggression", quote: "If you move as aggressively as you can, that's all anyone can ask. Most lower level shooters do not move at their maximum aggression level, far from it. When I push students to move faster, they usually start losing their balance and sliding. If you actually move at 100% capacity, you will learn to control your body.", source: "DFR", context: "On 100% movement aggression" },

  { targetId: "sk-move-direction", quote: "I recommend you shoot this drill in every order — left to right, right to left, near to far, far to near. Practice your gear changes and direction changes to build versatility.", source: "SDR", context: "On practicing all movement directions" },

  { targetId: "sk-move-short", quote: "For short movements, keep the gun mounted. You should be able to shoot as soon as you arrive — there is no time to get the gun up and find your sights on a 2-yard shuffle.", source: "PST", context: "On short movement technique" },

  { targetId: "sk-move-lean", quote: "Start leaning out of position as you fire the last couple shots — without picking up your feet. As soon as a foot comes off the ground it disrupts your balance, and you can't use that foot to push yourself to the next position.", source: "DFR", context: "On lean technique" },
  { targetId: "sk-move-lean", quote: "The drop step technique is only needed when you are getting out of a leaning position. Pre-load your stance so you're already in position to push off.", source: "PST", context: "On drop step from lean" },

  { targetId: "sk-move-soft", quote: "Have your feet stop momentarily but your body continue moving. This 'soft stop' will feel like you are falling through the position. However, it allows you to shoot very accurately and save time. Simply stopping your feet in place for a moment and allowing yourself to continue moving will feel strange at first.", source: "PST", context: "On the soft stop technique" },

  { targetId: "sk-move-prone", quote: "Getting into and out of prone is a significant time investment. Practice the transition from standing to prone and back frequently so you can do it without wasted motion.", source: "PST", context: "On prone transitions" },

  // ══════════════════════════════════════════════════════════════
  // STAGE CRAFT (sk-stage-plan, sk-stage-hf, sk-stage-pressure, etc.)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-stage-plan", quote: "Constantly evaluate the aiming scheme you are using for each target. Are you over or under confirming? Look for opportunities to increase speed or optimize points.", source: "PST", context: "On per-target planning" },
  { targetId: "sk-stage-plan", quote: "You should consciously decide what type of sight picture you require on each target in your scenario. Decide whether to shoot sight focused or target focused. The whole idea is to seamlessly change gears between targets of different difficulty.", source: "SDR", context: "On pre-planning sight picture per target" },

  { targetId: "sk-stage-hf", quote: "Being able to make tight shots at speed is the most critical skill for doing well in competition. Hit factor is the single number that matters — points divided by time.", source: "SDR", context: "On hit factor as the measure" },
  { targetId: "sk-stage-hf", quote: "Often, I like to 'just shoot.' I am not trying to go all out, nor playing it conservative. I simply step to the line and do what I know how to do. This is the ideal way to shoot matches.", source: "SDR", context: "On ideal match pace for hit factor" },

  { targetId: "sk-stage-pressure", quote: "You need to be in control of your mindset at all times. Either you are keeping the right thoughts in your head, or the wrong ones creep in.", source: "SDR", context: "On mental control under pressure" },
  { targetId: "sk-stage-pressure", quote: "In order to improve, you will be battling your own habits, predispositions and subconscious tendencies. The path forward requires conscious effort.", source: "PST", context: "On overcoming subconscious habits" },

  { targetId: "sk-stage-classifier", quote: "The key times to focus on are draw times and reload times. They have a big effect on the overall classifier time. Most A class shooters pull the trigger at roughly the same speed as GMs. The difference is in the draw, reloads, and transitions.", source: "SDR", context: "On what separates classifications" },

  { targetId: "sk-stage-port", quote: "For port shooting, gun positioning and body alignment to the port are critical. You need to pre-plan your body position relative to the port so you can acquire targets quickly.", source: "PST", context: "On port shooting setup" },

  { targetId: "sk-stage-skip", quote: "Skipping targets and coming back to them is a valid stage strategy when movement efficiency demands it. Plan your stage so you minimize total movement distance.", source: "PST", context: "On skip-target strategy" },

  // ══════════════════════════════════════════════════════════════
  // SINGLE HAND (sk-one-hand-sho, sk-one-hand-who, sk-one-hand-pickup)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-one-hand-sho", quote: "At seven yards with strong hand only, I bear down on my grip and work that trigger straight back. If you see your sights dip out of the front notch, you will likely not get an A.", source: "SDR", context: "On SHO trigger control at 7 yards" },
  { targetId: "sk-one-hand-sho", quote: "Since you will be shooting one handed, gripping as hard as you can, you should work that into your training. Grip down hard when the gun is getting on target.", source: "DFR", context: "On crush grip for SHO" },
  { targetId: "sk-one-hand-sho", quote: "People have a natural tendency to grip down even harder when shooting one-handed. This helps with recoil but causes sympathetic trigger finger tension. Pay attention to moving your trigger finger independently.", source: "DFR", context: "On sympathetic tension in SHO" },

  { targetId: "sk-one-hand-who", quote: "Weak hand only is where most shooters lose the most points in classifiers. The trick is to maintain trigger finger independence despite gripping as hard as possible with your non-dominant hand.", source: "SDR", context: "On WHO as a point drain" },
  { targetId: "sk-one-hand-who", quote: "What I think shooters need to learn is the ability to hold the gun very firm, but move the trigger finger independently. When you start firing real bullets one-handed, it may cause your whole body to tense up. Dry-fire with attention to hand pressure management is the fix.", source: "DFR", context: "On training WHO trigger independence" },

  { targetId: "sk-one-hand-pickup", quote: "Practice picking up the gun and establishing a proper one-handed grip quickly. The transition from table to shooting position should be smooth and end with a solid grip — don't rush to the point where you miss your grip.", source: "DFR", context: "On gun pickup technique" },

  // ══════════════════════════════════════════════════════════════
  // OTHER SKILLS (empty-start, table-start, mover)
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-empty-start", quote: "For empty gun starts, the load and make ready sequence needs to be fast and smooth. Practice the entire sequence — magazine insertion, slide release, and first shot — as one fluid motion.", source: "DFR", context: "On empty start sequence" },
  { targetId: "sk-table-start", quote: "The toughest thing about a seated start is to nail your draw. As soon as you start standing up it moves your holster. The easiest way to handle it is to stay seated until you get your strong hand on the gun. If you choose to start standing right away, it will be tough to nail your grip.", source: "DFR", context: "On seated/table start draw timing" },
  { targetId: "sk-mover", quote: "A good rule of thumb for moving targets is to imagine they are 50 percent further than their actual distance and get an appropriate sight picture for that distance.", source: "DFR", context: "On moving target sight picture" },

  // ══════════════════════════════════════════════════════════════
  // DRILL-SPECIFIC QUOTES
  // ══════════════════════════════════════════════════════════════

  { targetId: "bill", quote: "The Bill Drill is not about shooting fast — it is about managing the gun while shooting fast. The challenge is maintaining grip, trigger control, and recoil management over six consecutive shots while pushing your speed.", source: "SDR", context: "On the Bill Drill's purpose" },
  { targetId: "bill", quote: "A very reasonable goal time at 7 yards is two seconds — a one second draw and 0.2 second splits. At 10 yards: 2.2 seconds. At 15 yards: 2.5 seconds. At 20 yards: 3.2 seconds. At 25 yards: 4.0 seconds.", source: "SDR", context: "On Bill Drill benchmarks by distance" },

  { targetId: "blake", quote: "The Blake Drill tests transitions, accuracy, and pacing. Focus on driving the gun directly between targets without wasted motion.", source: "SDR", context: "On the Blake Drill" },

  { targetId: "elprez", quote: "The El Presidente combines turning, drawing, shooting, reloading, and shooting again. When people are going crazy shedding lead, it causes hands and forearms to get tense. Then going from tense to relaxed for the reload is the hardest part.", source: "SDR", context: "On El Presidente's challenge" },
  { targetId: "elprez", quote: "The draw time doesn't come down to how fast you turn — it is how fast you get the gun up to the target. Throw your weight around and get your head looking to the first target as soon as possible.", source: "SDR", context: "On El Prez turn technique" },

  { targetId: "pairs", quote: "Follow up shots should be in the range of 0.3 to 0.6 seconds. After confirming sights are in alignment, fire a rapid pair — the second shot relies on grip and platform, not aimed in the conventional sense.", source: "PST", context: "On the pairs drill" },

  { targetId: "practical-accuracy", quote: "When people shoot as fast as they can pull the trigger, they often push the gun down, pull the trigger sideways, or pull the trigger with their whole hand. This drill teaches you to run the trigger correctly at speed.", source: "SDR", context: "On the Practical Accuracy drill" },

  { targetId: "dots", quote: "Dot drills are about precision trigger control. The dots are small enough that any trigger error will cause a miss. Use these to train the isolated trigger press.", source: "SDR", context: "On the Dots drill" },

  { targetId: "accelerator", quote: "On the close target, do the usual 'look through the gun' thing. The whole idea is to seamlessly change gears between close and far targets — look through the gun up close, hard front sight focus at distance.", source: "SDR", context: "On the Accelerator drill" },
  { targetId: "accelerator", quote: "Pay attention to split times on each target. If your splits are the same at 7 yards as at 25 yards, something is wrong. You need to pick up speed as you go from back to front.", source: "SDR", context: "On Accelerator diagnostics" },

  { targetId: "distance-changeup", quote: "On the distant target, the most common error is firing the second shot before the gun settles. It is very common to sling shots over the top. Patience is absolutely key. Shoot this in every order to practice gear changes.", source: "SDR", context: "On the Distance Changeup drill" },

  { targetId: "4aces", quote: "One thing that is very critical is learning how to position your gun for the reload. Angle the magwell toward the pouches at about 45 degrees. I find that angle to be absolutely critical.", source: "DFR", context: "On 4 Aces reload technique" },
  { targetId: "4aces", quote: "The biggest challenge during these drills is the urge to tense up. When tense, it is almost impossible to quickly and consistently hit your reloads.", source: "DFR", context: "On 4 Aces tension management" },

  { targetId: "shoot-move", quote: "Bend your knees and get low. Use your lower body to maintain stability. When there is movement, shoot with vision focused on the target — if you focus on the sight, you will drag hits in the direction you are moving.", source: "PST", context: "On shoot-and-move drill" },

  { targetId: "moving-reload", quote: "What you are working on is your 'flow.' Have as little downtime as possible. The instant you finish the first targets, shift focus to the reload. As soon as that's done, you are back up on target.", source: "SDR", context: "On the Moving Reload drill" },

  { targetId: "confirmation", quote: "Confirmation 1: Kinesthetic alignment — feel your arms are pointed right and shoot. Confirmation 2: React to sight color crossing your aiming area. Confirmation 3: Dot stopped and stable. Learn which level to apply for each target difficulty.", source: "PST", context: "On the Confirmation drill" },

  { targetId: "sight-tracking", quote: "Aim your gun safely. Watch the sights closely as you fire. Assess how they move. Pay attention to your hands. Notice how sights track differently as you adjust hand pressure. The gun is telling you a story as it moves in recoil — keep your eyes open.", source: "PST", context: "On the Sight Tracking drill" },

  { targetId: "rhythm", quote: "Establish a rhythm in your mind. Each shot must be evenly spaced — same split and transition time. As you speed up, you will eventually pull the trigger without visual confirmation. The idea is that keeping to a rhythm forces your eyes and gun to be where they need to be.", source: "PST", context: "On the Rhythm drill" },

  { targetId: "mock-stage", quote: "When people are pressed for time, they stop confirming with their sights. Be on guard for undisciplined shooting. Apply the correct aiming scheme for each target. Do not over or under confirm.", source: "PST", context: "On the Mock Stage drill" },

  { targetId: "singles", quote: "This drill is about consistency of the draw and first shot. Every repetition should have the same draw time and the same point of impact. If your draw varies by more than 0.1 seconds, there is a consistency problem to fix.", source: "SDR", context: "On the Singles drill" },

  { targetId: "doubles", quote: "At 3 yards, seeing the outline of the gun is enough. At 7 yards, front fiber visible through the rear notch. At 15 yards, target focus or sight focus both work. At 20 yards, hard front sight focus required. At 50 yards, everything must be perfect.", source: "SDR", context: "On Doubles sight picture progression" },

  { targetId: "groups", quote: "The key to good group shooting is accepting that there is some wobble in your sight picture. If the sights are slightly wobbling, ignore that and just work the trigger straight on back. The groups will tell you about your trigger control.", source: "SDR", context: "On the Groups drill" },

  { targetId: "2at25", quote: "From the 25 yard line, make sure you nail the grip when you draw. Feel for an index point — getting your thumb in a specific spot. If you hit your index point, you really increase your chance of hitting a good grip. Then simply execute the fundamental mechanics.", source: "SDR", context: "On the 2at25 drill" },

  { targetId: "seated-start", quote: "The toughest thing is to nail your draw. As soon as you start standing up, your holster moves. Stay seated until you get your strong hand on the gun. If you choose to start standing right away, it will be tough to nail your grip.", source: "DFR", context: "On the Seated Start drill" },

  { targetId: "wide-trans", quote: "For wide transitions, your eyes need to lead the gun. Look where you want to shoot before the gun arrives. The gun follows your vision, not the other way around.", source: "SDR", context: "On the Wide Transition drill" },

  { targetId: "90-trans", quote: "90-degree transitions require significant body rotation. Pre-plan your foot position so your body naturally faces the next target array when you turn.", source: "SDR", context: "On 90-degree transitions" },

  { targetId: "measurement", quote: "This drill measures your current baseline performance. Don't try to set records — just execute your normal technique. The time and accuracy tell you where you are today.", source: "PST", context: "On the Measurement drill" },

  { targetId: "bar-hop", quote: "This drill combines movement and multiple shooting positions. Focus on your position entries and exits. Every fraction of a second saved in movement translates directly to a better stage time.", source: "SDR", context: "On the Bar Hop drill" },

  { targetId: "triple-reloads", quote: "Three reloads in one drill is a brutal test of your ability to relax your hands between strings. If tension builds through the drill, your third reload will be significantly worse than your first.", source: "SDR", context: "On the Triple Reloads drill" },

  { targetId: "back-forth", quote: "Running back and forth tests your entry and exit mechanics under fatigue. As you get tired, your position entries will degrade — watch for it and fight to maintain quality.", source: "SDR", context: "On the Back and Forth drill" },

  { targetId: "soft-stops", quote: "Have your feet stop momentarily but your body continue moving. This soft stop feels like falling through the position, but it allows very accurate shooting while saving time.", source: "PST", context: "On the Soft Stops drill" },

  { targetId: "distance-draw", quote: "I think it is counterproductive to slow your draw stroke down for tougher targets. It does make sense to let the gun settle into the target as opposed to jamming it. When the sights gently settle into the A box, you know you are doing it correctly.", source: "DFR", context: "On the Distance Draw drill" },

  // ══════════════════════════════════════════════════════════════
  // PARENT/UMBRELLA SKILL QUOTES
  // ══════════════════════════════════════════════════════════════

  { targetId: "sk-draw-grip", quote: "Your draw is where your grip and sight alignment converge to create an 'index.' If you miss your grip on the draw, the gun will come to the target without the sights in alignment. This is an issue most easily fixed during dry-fire practice.", source: "DFR", context: "On grip establishment during draw" },
  { targetId: "sk-draw-grip", quote: "When the gun comes up onto the target you want a 'crush' grip. Your non-dominant hand should be giving 100% grip strength, positioned properly, as soon as the gun hits your eyeline. There shouldn't be time spent cleaning up your grip when the gun is already up.", source: "DFR", context: "On completing grip before eyeline" },
  { targetId: "sk-draw-grip", quote: "Getting your grip right is extremely important. You may have to adjust your grip when you are already on target, or shoot slowly as you fight to keep your sights in the center, or just drop a lot of points. In any event, getting your grip right on the draw is critical.", source: "SDR", context: "On consequences of missing the draw grip" },

  { targetId: "sk-draw-speed", quote: "Start with your hands relaxed at sides. Get a firing grip on your pistol and move your non-dominant hand over to your dominant side. Goal: 0.4 second par time. Then draw and aim at the target from a pre-gripped position. Goal: 0.5 second par time.", source: "DFR", context: "On draw speed micro drills" },
  { targetId: "sk-draw-speed", quote: "You need to snatch the gun from the holster quickly. The draw is extremely important — you can't screw around at all if you want to make tight time limits.", source: "SDR", context: "On aggressive draw speed" },

  { targetId: "sk-grip-strength", quote: "Your non-dominant hand should be giving 100% of available grip strength. When the gun hits your eyeline, you want a 'crush' grip. This needs to be done immediately so you can fire when you see the sights.", source: "DFR", context: "On initial crush grip strength" },
  { targetId: "sk-grip-strength", quote: "From a technique perspective, pay close attention to your hands. What matters is feeling a rock solid grip on the gun, and then feeling your firing hand discharge the gun without pushing it around.", source: "SDR", context: "On what grip strength feels like" },

  { targetId: "sk-grip-recoil", quote: "If your hand slips off the grip during rapid fire, you are going to be in trouble. The cycle of watching your front sight move up in recoil, using hand muscles to return it, then breaking the next shot must be maintained consistently.", source: "SDR", context: "On grip consistency under recoil" },
  { targetId: "sk-grip-recoil", quote: "Hold onto your gun firmly with good grip technique and let the gun do what it is going to do. Do not try to stop the recoil. Ensure that the gun is returning to the same spot every time.", source: "PST", context: "On maintaining grip through recoil" },

  { targetId: "sk-trigger-press", quote: "Try applying pressure slowly and continually until the trigger breaks, opposed to prepping the trigger back to its break point. The continuous press is faster because there is no cognitive delay recognizing the prep point.", source: "PST", context: "On continuous trigger press" },
  { targetId: "sk-trigger-press", quote: "Focus on the sensation of moving your trigger finger in isolation. So many people pull the trigger using muscles from their whole hand. Watching the sights will tell you the whole story — if you see them wiggle when pressing the trigger, you are doing it wrong.", source: "DFR", context: "On isolated trigger press" },

  { targetId: "sk-trigger-reset", quote: "Trigger Freeze — the inability to reset the trigger for a second shot — is caused by an over tense firing hand. The fix is to deliberately press the trigger really hard during dry-fire. Take how hard you think you need to press and double it.", source: "DFR", context: "On trigger reset and freeze prevention" },
  { targetId: "sk-trigger-reset", quote: "Many people have a hard time learning to run the trigger quickly under recoil. They get too tense and the muscles don't respond properly. This leads to trigger freeze.", source: "DFR", context: "On trigger reset under recoil" },

  { targetId: "sk-sight", quote: "For better or worse, you hit where you look. If you look at the outside shape of the target or the target's color, you will be less accurate than if you drive your vision to a specific point.", source: "PST", context: "On vision driving accuracy" },
  { targetId: "sk-sight", quote: "You should consciously decide what type of sight picture you require on each target. The whole idea is to seamlessly change gears between targets of different difficulty levels.", source: "SDR", context: "On selecting sight picture per target" },

  { targetId: "sk-sight-pickup", quote: "When the gun comes up onto the target, you should see the sights settle into the center — not come down from above. If the sights bounce wildly, you are throwing the gun up, not bringing it up in a controlled fashion.", source: "DFR", context: "On fast sight pickup on presentation" },
  { targetId: "sk-sight-pickup", quote: "Have your gun up ready to shoot as you enter a shooting position. You should see your sights in your field of view just before you mean to start shooting. You save time by starting to shoot earlier.", source: "PST", context: "On visual pickup speed at position entry" },

  { targetId: "sk-sight-track", quote: "Watching your front sight move up in recoil, then using your hand muscles to return it, then breaking the next shot is a cycle you go through time after time. This sight tracking is the foundation of fast accurate shooting.", source: "SDR", context: "On the sight tracking cycle" },
  { targetId: "sk-sight-track", quote: "Aim your gun safely. Watch the sights closely as you fire. Assess how they move. Pay attention to your hands. Notice how the sights track differently as you adjust hand pressure. The gun is telling you a story.", source: "PST", context: "On reading the sight tracking story" },

  { targetId: "sk-recoil-return", quote: "The muzzle of your pistol should only marginally rise when you fire a shot. The main issue is battling your tendency to overcorrect or overcontrol that recoil. You do not need to work that hard to bring your pistol down.", source: "PST", context: "On minimal muzzle rise" },
  { targetId: "sk-recoil-return", quote: "Instead of trying to stop the gun from moving, ensure that the gun is returning to the same spot. Accept the recoil will move the gun a little bit and allow it to happen.", source: "PST", context: "On consistent muzzle return" },

  { targetId: "sk-dot-track", quote: "What you should develop is continual awareness of what your sights are doing. How are they moving in recoil? Do you see the dot dip down? What EXACTLY are you seeing? You need to know.", source: "PST", context: "On dot tracking awareness" },
  { targetId: "sk-dot-track", quote: "Many shooters can hold their guns on target during rapid fire, but are unable to read the sights fast enough to take advantage of it. With training, this can be minimized or overcome.", source: "DFR", context: "On developing dot reading speed" },

  { targetId: "sk-confirm", quote: "Confirmation 1: Kinesthetic feel only. Confirmation 2: React to sight color crossing your aiming area. Confirmation 3: Dot stopped and stable. Learn which level each target requires and apply it without hesitation.", source: "PST", context: "On confirmation scheme selection" },
  { targetId: "sk-confirm", quote: "Constantly evaluate the aiming scheme you are using for each target. Are you over or under confirming? Look for opportunities to increase speed or optimize points.", source: "PST", context: "On evaluating confirmation per target" },

  { targetId: "sk-trans", quote: "The phrase I have in my head for transitions is 'shoot sooner, not faster.' It isn't about how quickly you jam the trigger — it's about getting started on each target as soon as possible. Do not sit on a good sight picture.", source: "SDR", context: "On the core transition principle" },
  { targetId: "sk-trans", quote: "Drag on/drag off transitions are the most common issue. As you speed up, it becomes very difficult to keep your vision under control. It is natural to mentally leave a target before you are done shooting it.", source: "PST", context: "On common transition errors" },

  { targetId: "sk-move-shoot", quote: "When there is movement involved, shoot with your vision focused on the target. If you shoot focused on your front sight or dot while moving, you will drag hits in the direction of movement.", source: "PST", context: "On target focus while moving" },
  { targetId: "sk-move-shoot", quote: "When shooting on the move, switch to reactive shooting. Your ability to predict gun tracking is greatly diminished with movement. Do NOT rush — you are saving time by shooting as you move.", source: "PST", context: "On reactive mode while moving" },

  { targetId: "sk-sho", quote: "Since you will be shooting one handed, gripping as hard as you can is important. But people get in the habit of sympathetically tensing up their trigger finger along with the rest of their hand. Pay attention to moving your trigger finger independently.", source: "DFR", context: "On SHO technique" },
  { targetId: "sk-sho", quote: "At seven yards strong hand only, bear down on your grip and work that trigger straight back. If you see your sights dip out of the front notch, you will likely not get an A.", source: "SDR", context: "On SHO at 7 yards" },

  { targetId: "sk-who", quote: "Weak hand only is where most shooters lose the most points in classifiers. The trick is maintaining trigger finger independence despite gripping as hard as possible with your non-dominant hand.", source: "SDR", context: "On WHO as a point drain" },
  { targetId: "sk-who", quote: "What shooters need to learn is holding the gun very firm but moving the trigger finger independently. When firing one-handed, your whole body may tense up. Dry-fire with attention to hand pressure management is the fix.", source: "DFR", context: "On WHO trigger independence" },
];
