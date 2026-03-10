// PractiScore Import — parse CSV/text match data and convert to Session + SessionRun format

import type { Session, SessionRun } from "./store";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface PractiScoreStage {
  stageName: string;
  stageNumber: number;
  time: number;
  hitFactor: number;
  aHits: number;
  cHits: number;
  dHits: number;
  misses: number;
  noShoots: number;
  procedurals: number;
  points: number;
  maxPoints: number;
  stagePercent: number;
}

export interface PractiScoreMatch {
  matchName: string;
  matchDate: string;
  division: string;
  classification?: string;
  stages: PractiScoreStage[];
  overallPercent?: number;
  overallHF?: number;
}

export interface ImportedMatch {
  id: string;
  matchName: string;
  matchDate: string;
  division: string;
  stageCount: number;
  sessionId: string;
  importedAt: string;
}

// ─────────────────────────────────────────
// STORAGE — imported match history
// ─────────────────────────────────────────
const IMPORTED_MATCHES_KEY = "uspsa_imported_matches";

export function getImportedMatches(): ImportedMatch[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(IMPORTED_MATCHES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveImportedMatches(matches: ImportedMatch[]) {
  localStorage.setItem(IMPORTED_MATCHES_KEY, JSON.stringify(matches));
}

export function addImportedMatch(match: ImportedMatch) {
  const matches = getImportedMatches();
  matches.unshift(match);
  saveImportedMatches(matches);
}

export function deleteImportedMatch(matchId: string) {
  const matches = getImportedMatches().filter((m) => m.id !== matchId);
  saveImportedMatches(matches);
}

export function isDuplicateMatch(matchName: string, matchDate: string): boolean {
  return getImportedMatches().some(
    (m) => m.matchName === matchName && m.matchDate === matchDate
  );
}

// ─────────────────────────────────────────
// COLUMN MATCHING — flexible header detection
// ─────────────────────────────────────────
type ColumnKey =
  | "stage"
  | "stageNumber"
  | "time"
  | "hitFactor"
  | "aHits"
  | "cHits"
  | "dHits"
  | "misses"
  | "noShoots"
  | "procedurals"
  | "points"
  | "maxPoints"
  | "stagePercent"
  | "shooter"
  | "division";

const COLUMN_ALIASES: Record<ColumnKey, string[]> = {
  stage: ["stage", "stage name", "stagename", "name"],
  stageNumber: ["stage number", "stagenumber", "stage #", "stage_number", "stg", "stg #", "stg#"],
  time: ["time", "stage time", "stagetime", "total time", "raw time", "rawtime"],
  hitFactor: ["hf", "hit factor", "hitfactor", "hit_factor", "stage hf"],
  aHits: ["a", "a hits", "ahits", "a_hits", "alpha"],
  cHits: ["c", "c hits", "chitss", "c_hits", "charlie"],
  dHits: ["d", "d hits", "dhits", "d_hits", "delta"],
  misses: ["m", "miss", "misses", "mike", "mikes"],
  noShoots: ["ns", "no shoot", "no-shoot", "no shoots", "no-shoots", "noshoots", "no_shoots", "penalty"],
  procedurals: ["proc", "procedural", "procedurals", "procs", "pe"],
  points: ["points", "pts", "stage points", "stagepoints", "score", "total points"],
  maxPoints: ["max points", "maxpoints", "max pts", "max_points", "max", "possible"],
  stagePercent: ["stage %", "stage%", "percent", "pct", "stage pct", "stagepercent", "%"],
  shooter: ["shooter", "competitor", "name", "shooter name"],
  division: ["division", "div", "class"],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[_\-]/g, " ");
}

function matchColumn(header: string): ColumnKey | null {
  const norm = normalizeHeader(header);
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES) as [ColumnKey, string[]][]) {
    if (aliases.includes(norm)) return key;
  }
  return null;
}

// ─────────────────────────────────────────
// DELIMITER DETECTION
// ─────────────────────────────────────────
function detectDelimiter(text: string): string {
  const firstLine = text.split("\n")[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount) return "\t";
  if (semiCount > commaCount) return ";";
  return ",";
}

// ─────────────────────────────────────────
// CSV LINE PARSER (handles quoted fields)
// ─────────────────────────────────────────
function parseCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

// ─────────────────────────────────────────
// MAIN CSV PARSER
// ─────────────────────────────────────────
export interface ParseResult {
  match: PractiScoreMatch;
  warnings: string[];
}

export function parsePractiScoreCSV(csvText: string, overrides?: { matchName?: string; matchDate?: string; division?: string }): ParseResult {
  const warnings: string[] = [];
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row.");
  }

  const delimiter = detectDelimiter(csvText);
  const headers = parseCSVLine(lines[0], delimiter);

  // Map column indices
  const colMap: Partial<Record<ColumnKey, number>> = {};
  headers.forEach((h, i) => {
    const key = matchColumn(h);
    if (key) colMap[key] = i;
  });

  // Validate minimum required columns
  if (colMap.time === undefined) {
    throw new Error("Could not find a 'Time' column. Found headers: " + headers.join(", "));
  }

  // Extract metadata from overrides or try to detect from data
  let matchName = overrides?.matchName || "";
  let matchDate = overrides?.matchDate || new Date().toISOString().slice(0, 10);
  let division = overrides?.division || "";

  const stages: PractiScoreStage[] = [];
  let stageCounter = 0;

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i], delimiter);
    if (fields.length < 2) continue;

    const getNum = (key: ColumnKey): number => {
      const idx = colMap[key];
      if (idx === undefined || idx >= fields.length) return 0;
      const val = parseFloat(fields[idx]);
      return isNaN(val) ? 0 : val;
    };

    const getStr = (key: ColumnKey): string => {
      const idx = colMap[key];
      if (idx === undefined || idx >= fields.length) return "";
      return fields[idx].trim();
    };

    const time = getNum("time");
    if (time <= 0) {
      warnings.push(`Row ${i + 1}: Skipped — time is 0 or missing`);
      continue;
    }

    stageCounter++;
    const stageName = getStr("stage") || `Stage ${stageCounter}`;
    const stageNumber = getNum("stageNumber") || stageCounter;

    const aHits = getNum("aHits");
    const cHits = getNum("cHits");
    const dHits = getNum("dHits");
    const misses = getNum("misses");
    const noShoots = getNum("noShoots");

    const totalRoundHits = aHits + cHits + dHits;
    const calculatedPoints = (aHits * 5) + (cHits * 4) + (dHits * 2);
    const maxPointsFromHits = totalRoundHits > 0 ? totalRoundHits * 5 : 0;

    const points = getNum("points") || calculatedPoints;
    const maxPoints = getNum("maxPoints") || maxPointsFromHits;
    const hitFactor = getNum("hitFactor") || (time > 0 ? parseFloat((points / time).toFixed(4)) : 0);
    const stagePercent = getNum("stagePercent");
    const procedurals = getNum("procedurals");

    // Detect division from first row if available
    if (!division && getStr("division")) {
      division = getStr("division");
    }

    stages.push({
      stageName,
      stageNumber,
      time,
      hitFactor,
      aHits,
      cHits,
      dHits,
      misses,
      noShoots,
      procedurals,
      points,
      maxPoints,
      stagePercent,
    });
  }

  if (stages.length === 0) {
    throw new Error("No valid stage data found. Make sure your CSV has at least one row with a Time value.");
  }

  // Sort by stage number
  stages.sort((a, b) => a.stageNumber - b.stageNumber);

  const totalPoints = stages.reduce((s, st) => s + st.points, 0);
  const totalTime = stages.reduce((s, st) => s + st.time, 0);

  const match: PractiScoreMatch = {
    matchName: matchName || "Imported Match",
    matchDate: matchDate,
    division: division || "Unknown",
    stages,
    overallHF: totalTime > 0 ? parseFloat((totalPoints / totalTime).toFixed(4)) : undefined,
  };

  return { match, warnings };
}

// ─────────────────────────────────────────
// AUTO-FORMAT DETECTION (CSV vs tab-separated)
// ─────────────────────────────────────────
export function detectFormat(text: string): "csv" | "tsv" | "unknown" {
  const firstLine = text.split("\n")[0];
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;

  if (tabs >= 2) return "tsv";
  if (commas >= 2) return "csv";
  return "unknown";
}

// ─────────────────────────────────────────
// DRILL MAPPING — map stage characteristics to pseudo-drill IDs
// ─────────────────────────────────────────
function estimateRoundCount(stage: PractiScoreStage): number {
  const fromHits = stage.aHits + stage.cHits + stage.dHits + stage.misses;
  if (fromHits > 0) return fromHits;
  // Estimate from max points (5 points per round for USPSA)
  if (stage.maxPoints > 0) return Math.round(stage.maxPoints / 5);
  return 10; // default estimate
}

function mapStageToDrillId(stage: PractiScoreStage): string {
  const rounds = estimateRoundCount(stage);
  if (rounds <= 8) return "match-stage-short";
  if (rounds <= 16) return "match-stage-medium";
  return "match-stage-long";
}

// ─────────────────────────────────────────
// CONVERT TO SESSION + RUNS
// ─────────────────────────────────────────
export function convertToSessionRuns(match: PractiScoreMatch): {
  session: Session;
  runs: SessionRun[];
  totalRounds: number;
} {
  const sessionId = `ps-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const matchDateISO = new Date(match.matchDate + "T12:00:00").toISOString();

  const session: Session = {
    id: sessionId,
    startedAt: matchDateISO,
    endedAt: matchDateISO,
    fireMode: "live_fire",
    location: match.matchName,
    notes: `PractiScore import — ${match.division}${match.classification ? `, ${match.classification}` : ""}. ${match.stages.length} stages.${match.overallHF ? ` Overall HF: ${match.overallHF}` : ""}`,
  };

  let totalRounds = 0;
  const runs: SessionRun[] = match.stages.map((stage, idx) => {
    const rounds = estimateRoundCount(stage);
    totalRounds += rounds;
    const pointsDown =
      (stage.cHits * 1) + (stage.dHits * 3) + (stage.misses * 10) + (stage.noShoots * 10);

    return {
      id: `ps-run-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      sessionId,
      drillId: mapStageToDrillId(stage),
      runNumber: idx + 1,
      isValid: true,
      isCold: idx === 0,
      fireMode: "live_fire" as const,
      distanceYards: 15,
      totalTime: stage.time,
      firstShotTime: null,
      splits: [],
      pointsDown,
      dryFireCallPct: null,
      capturedAt: matchDateISO,
    };
  });

  return { session, runs, totalRounds };
}
