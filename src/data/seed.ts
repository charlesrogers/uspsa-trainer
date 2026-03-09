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
  { id: "sk-confirm-1", name: "Kinesthetic Alignment", category: "confirmation", description: "Fire on feel of alignment, no visual confirmation", parentId: "sk-confirm", levelIntroduced: 3 },
  { id: "sk-confirm-2", name: "Color Reaction", category: "confirmation", description: "React to color of sight/dot crossing aiming area", parentId: "sk-confirm", levelIntroduced: 2 },
  { id: "sk-confirm-3", name: "Full Sight Picture", category: "confirmation", description: "Dot stopped and stable, perfect sight picture", parentId: "sk-confirm", levelIntroduced: 1 },

  // Transitions
  { id: "sk-trans", name: "Target-to-Target Transition", category: "transitions", description: "Moving between targets efficiently", parentId: null, levelIntroduced: 1 },
  { id: "sk-trans-close", name: "Close Transition (<10yd)", category: "transitions", description: "Transitions between close targets", parentId: "sk-trans", levelIntroduced: 1 },
  { id: "sk-trans-med", name: "Medium Transition (10-20yd)", category: "transitions", description: "Transitions at medium distance", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-far", name: "Far Transition (>20yd)", category: "transitions", description: "Transitions between distant targets", parentId: "sk-trans", levelIntroduced: 3 },
  { id: "sk-trans-near-far", name: "Near-to-Far Transition", category: "transitions", description: "Transitioning from close to far target (distance changeup)", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-far-near", name: "Far-to-Near Transition", category: "transitions", description: "Transitioning from far to close target", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-wide", name: "Wide Transition (90°+)", category: "transitions", description: "Large-angle transitions between target arrays", parentId: "sk-trans", levelIntroduced: 3 },
  { id: "sk-trans-exit-entry", name: "Transition Exit/Entry", category: "transitions", description: "Visual pickup timing when leaving and arriving at targets", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-low", name: "Low Target Transitions", category: "transitions", description: "Transitioning to/from targets placed low (angled stands, ground level)", parentId: "sk-trans", levelIntroduced: 2 },
  { id: "sk-trans-steel", name: "Steel/Paper Transitions", category: "transitions", description: "Transitioning between steel and paper targets — calling by sight, not sound", parentId: "sk-trans", levelIntroduced: 2 },

  // Reloads
  { id: "sk-reload-stand", name: "Standing Reload", category: "reloads", description: "Reloading while stationary", parentId: null, levelIntroduced: 1 },
  { id: "sk-reload-move", name: "Reload on the Move", category: "reloads", description: "Reloading while moving between positions", parentId: null, levelIntroduced: 3 },
  { id: "sk-reload-entry", name: "Reload in Position Entry", category: "reloads", description: "Reloading while entering a shooting position", parentId: null, levelIntroduced: 3 },

  // Movement
  { id: "sk-move-entry", name: "Position Entry", category: "movement", description: "Decelerating into a shooting position with proper stance", parentId: null, levelIntroduced: 2 },
  { id: "sk-move-exit", name: "Position Exit", category: "movement", description: "Accelerating out of position without false steps — start moving while engaging last target", parentId: null, levelIntroduced: 2 },
  { id: "sk-move-mounted", name: "Mounted Movement", category: "movement", description: "Moving with gun up, blending positions (1-4 steps)", parentId: null, levelIntroduced: 3 },
  { id: "sk-move-unmounted", name: "Unmounted Movement", category: "movement", description: "Sprinting with gun down between positions (5+ steps)", parentId: null, levelIntroduced: 3 },
  { id: "sk-move-shoot", name: "Shooting on the Move", category: "movement", description: "Engaging targets while moving (target-focused, reactive)", parentId: null, levelIntroduced: 3 },
  { id: "sk-move-soft", name: "Soft Stops", category: "movement", description: "Brief pauses where center of gravity never fully stops", parentId: null, levelIntroduced: 4 },
  { id: "sk-move-direction", name: "Direction Change", category: "movement", description: "Changing direction without drop steps", parentId: null, levelIntroduced: 3 },
  { id: "sk-move-short", name: "Short Moves", category: "movement", description: "Quick lateral moves of 2-3 steps while keeping gun mounted at eyeline", parentId: null, levelIntroduced: 2 },
  { id: "sk-move-prone", name: "Prone", category: "movement", description: "Getting into and shooting from prone position — knowing your POI shift", parentId: null, levelIntroduced: 3 },
  { id: "sk-move-lean", name: "Lean / Barricade", category: "movement", description: "Leaning around barricades to access targets while maintaining stable platform", parentId: null, levelIntroduced: 2 },

  // Stage craft
  { id: "sk-stage-plan", name: "Stage Planning", category: "stage_craft", description: "Planning target engagement order and movement", parentId: null, levelIntroduced: 2 },
  { id: "sk-stage-hf", name: "Hit Factor Optimization", category: "stage_craft", description: "Speed vs. accuracy decision-making for scoring", parentId: null, levelIntroduced: 3 },
  { id: "sk-stage-pressure", name: "Shooting Under Pressure", category: "stage_craft", description: "Maintaining performance under match stress", parentId: null, levelIntroduced: 2 },
  { id: "sk-stage-classifier", name: "Classifier Execution", category: "stage_craft", description: "Cold performance on classifier stages", parentId: null, levelIntroduced: 2 },
  { id: "sk-stage-port", name: "Port Shooting", category: "stage_craft", description: "Engaging targets through ports and narrow openings — positioning, keeping gun out of port", parentId: null, levelIntroduced: 2 },
  { id: "sk-stage-skip", name: "Skipping Targets", category: "stage_craft", description: "Complex engagement sequences where visible targets must be skipped from certain positions", parentId: "sk-stage-plan", levelIntroduced: 3 },

  // Single hand
  { id: "sk-sho", name: "Strong Hand Only", category: "single_hand", description: "Shooting with dominant hand only", parentId: null, levelIntroduced: 1 },
  { id: "sk-who", name: "Weak Hand Only", category: "single_hand", description: "Shooting with non-dominant hand only", parentId: null, levelIntroduced: 1 },
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
