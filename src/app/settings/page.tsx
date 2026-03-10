"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getProfile, saveProfile, createSession, addRun, getSessions, getRuns } from "@/lib/store";
import type { UserProfile } from "@/lib/store";
import { useBle } from "@/lib/useBle";
import {
  parsePractiScoreCSV,
  convertToSessionRuns,
  getImportedMatches,
  addImportedMatch,
  deleteImportedMatch,
  isDuplicateMatch,
} from "@/lib/practiscoreImport";
import type {
  PractiScoreMatch,
  ImportedMatch,
  ParseResult,
} from "@/lib/practiscoreImport";

// ─────────────────────────────────────────
// PractiScore Import Component
// ─────────────────────────────────────────
function PractiScoreImport() {
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<{ stages: number; rounds: number } | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [importedMatches, setImportedMatches] = useState<ImportedMatch[]>([]);
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pasteText, setPasteText] = useState("");
  const [matchName, setMatchName] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [division, setDivision] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImportedMatches(getImportedMatches());
  }, []);

  const resetState = useCallback(() => {
    setParseResult(null);
    setParseError(null);
    setImportSuccess(null);
    setDuplicateWarning(false);
  }, []);

  const processText = useCallback(
    (text: string) => {
      resetState();
      try {
        const overrides: { matchName?: string; matchDate?: string; division?: string } = {};
        if (matchName.trim()) overrides.matchName = matchName.trim();
        if (matchDate.trim()) overrides.matchDate = matchDate.trim();
        if (division.trim()) overrides.division = division.trim();

        const result = parsePractiScoreCSV(text, overrides);
        setParseResult(result);

        if (isDuplicateMatch(result.match.matchName, result.match.matchDate)) {
          setDuplicateWarning(true);
        }
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Failed to parse data");
      }
    },
    [matchName, matchDate, division, resetState]
  );

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          processText(text);
        }
      };
      reader.readAsText(file);
    },
    [processText]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleImport = useCallback(() => {
    if (!parseResult) return;

    const { session, runs, totalRounds } = convertToSessionRuns(parseResult.match);

    // Save to localStorage
    createSession(session);
    for (const run of runs) {
      addRun(run);
    }

    // Track import
    const importRecord: ImportedMatch = {
      id: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      matchName: parseResult.match.matchName,
      matchDate: parseResult.match.matchDate,
      division: parseResult.match.division,
      stageCount: parseResult.match.stages.length,
      sessionId: session.id,
      importedAt: new Date().toISOString(),
    };
    addImportedMatch(importRecord);
    setImportedMatches(getImportedMatches());

    setImportSuccess({ stages: runs.length, rounds: totalRounds });
    setParseResult(null);
    setPasteText("");
  }, [parseResult]);

  const handleDeleteImport = useCallback((matchId: string) => {
    deleteImportedMatch(matchId);
    setImportedMatches(getImportedMatches());
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("upload"); resetState(); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "upload"
              ? "bg-surface-200 text-surface-900"
              : "bg-transparent text-surface-400 hover:text-surface-300"
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => { setMode("paste"); resetState(); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "paste"
              ? "bg-surface-200 text-surface-900"
              : "bg-transparent text-surface-400 hover:text-surface-300"
          }`}
        >
          Paste Data
        </button>
      </div>

      {/* Match Metadata Fields */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-surface-500 mb-1 block">Match Name</label>
          <input
            type="text"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
            placeholder="e.g., USPSA Area 1"
            className="w-full px-3 py-2 bg-[var(--bg-input)] border border-surface-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-surface-500 mb-1 block">Match Date</label>
          <input
            type="date"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg-input)] border border-surface-200 rounded-lg text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-surface-500 mb-1 block">Division (optional)</label>
        <input
          type="text"
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          placeholder="e.g., Production, Carry Optics"
          className="w-full px-3 py-2 bg-[var(--bg-input)] border border-surface-200 rounded-lg text-sm"
        />
      </div>

      {/* File Upload Mode */}
      {mode === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-[var(--brand-600)] bg-[var(--brand-950)]/20"
              : "border-surface-300 hover:border-surface-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.tsv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <svg className="w-8 h-8 mx-auto mb-2 text-surface-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-surface-400">
            {isDragging ? (
              <span className="text-[var(--brand-400)]">Drop file here</span>
            ) : (
              <>Drop CSV/TXT file here or <span className="text-[var(--brand-400)]">browse</span></>
            )}
          </p>
          <p className="text-xs text-surface-500 mt-1">.csv, .txt, .tsv supported</p>
        </div>
      )}

      {/* Paste Mode */}
      {mode === "paste" && (
        <div className="space-y-2">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={"Paste match results here...\n\nFormat: CSV or tab-separated with headers like:\nStage, Time, A, C, D, M, NS, HF, Points\n\nExample:\nStage,Time,A,C,D,M,NS,HF\nStage 1,5.23,8,2,0,0,0,8.41\nStage 2,12.45,18,4,1,0,0,7.87"}
            rows={8}
            className="w-full px-3 py-2 bg-[var(--bg-input)] border border-surface-200 rounded-lg text-sm font-mono resize-y"
          />
          <button
            onClick={() => {
              if (pasteText.trim()) processText(pasteText);
            }}
            disabled={!pasteText.trim()}
            className="w-full py-2 bg-surface-200 text-surface-900 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-surface-300 transition-colors"
          >
            Parse Data
          </button>
        </div>
      )}

      {/* Parse Error */}
      {parseError && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-400">Parse Error</p>
              <p className="text-xs text-red-400/80 mt-0.5">{parseError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {parseResult && (
        <div className="space-y-3">
          {/* Warnings */}
          {parseResult.warnings.length > 0 && (
            <div className="bg-amber-900/20 border border-amber-900/50 rounded-xl p-3">
              <p className="text-xs font-medium text-amber-400 mb-1">Warnings</p>
              {parseResult.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-400/80">{w}</p>
              ))}
            </div>
          )}

          {/* Duplicate Warning */}
          {duplicateWarning && (
            <div className="bg-amber-900/20 border border-amber-900/50 rounded-xl p-3">
              <p className="text-xs text-amber-400">
                A match with this name and date has already been imported. Importing again will create duplicate entries.
              </p>
            </div>
          )}

          {/* Match Summary */}
          <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-surface-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">{parseResult.match.matchName}</h4>
              <span className="text-xs text-surface-400">{parseResult.match.matchDate}</span>
            </div>
            <div className="flex gap-3 text-xs text-surface-400">
              <span>{parseResult.match.division}</span>
              <span>{parseResult.match.stages.length} stages</span>
              {parseResult.match.overallHF !== undefined && (
                <span>HF: {parseResult.match.overallHF}</span>
              )}
            </div>
          </div>

          {/* Stage Table */}
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-surface-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left px-3 py-2 text-surface-500 font-medium">Stage</th>
                    <th className="text-right px-3 py-2 text-surface-500 font-medium">Time</th>
                    <th className="text-right px-3 py-2 text-surface-500 font-medium">HF</th>
                    <th className="text-right px-3 py-2 text-surface-500 font-medium">A</th>
                    <th className="text-right px-3 py-2 text-surface-500 font-medium">C</th>
                    <th className="text-right px-3 py-2 text-surface-500 font-medium">D</th>
                    <th className="text-right px-3 py-2 text-surface-500 font-medium">M</th>
                    <th className="text-right px-3 py-2 text-surface-500 font-medium">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.match.stages.map((stage, i) => (
                    <tr key={i} className="border-b border-surface-200/50 last:border-b-0">
                      <td className="px-3 py-2 text-surface-300 truncate max-w-[120px]">{stage.stageName}</td>
                      <td className="px-3 py-2 text-right font-mono text-surface-300">{stage.time.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-mono text-surface-300">{stage.hitFactor.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--brand-400)]">{stage.aHits || "-"}</td>
                      <td className="px-3 py-2 text-right font-mono text-surface-300">{stage.cHits || "-"}</td>
                      <td className="px-3 py-2 text-right font-mono text-amber-400">{stage.dHits || "-"}</td>
                      <td className="px-3 py-2 text-right font-mono text-red-400">{stage.misses || "-"}</td>
                      <td className="px-3 py-2 text-right font-mono text-surface-300">{stage.points || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            className="w-full py-2.5 bg-[var(--brand-600)] text-black font-semibold rounded-xl text-sm hover:bg-[var(--brand-500)] transition-colors"
          >
            Import {parseResult.match.stages.length} Stages
          </button>
        </div>
      )}

      {/* Import Success */}
      {importSuccess && (
        <div className="bg-green-900/20 border border-green-900/50 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-400">Import Complete</p>
              <p className="text-xs text-green-400/80 mt-0.5">
                {importSuccess.stages} stages imported (~{importSuccess.rounds} rounds)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Import History */}
      {importedMatches.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-surface-500 mb-2 uppercase tracking-wider">Import History</h4>
          <div className="space-y-1.5">
            {importedMatches.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between bg-[var(--bg-elevated)] rounded-lg px-3 py-2 border border-surface-200/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-surface-300 truncate">{m.matchName}</p>
                  <div className="flex gap-2 text-xs text-surface-500">
                    <span>{m.matchDate}</span>
                    <span>{m.stageCount} stages</span>
                    <span>{m.division}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteImport(m.id)}
                  className="text-surface-500 hover:text-red-400 ml-2 flex-shrink-0 transition-colors"
                  title="Remove import record"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// SETTINGS PAGE
// ─────────────────────────────────────────
export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const ble = useBle();

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  if (!profile) return null;

  const update = (key: keyof UserProfile, value: string | number) => {
    setProfile({ ...profile, [key]: value });
    setSaved(false);
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = profile.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const classifications = [
    { value: "D", label: "D Class" },
    { value: "C", label: "C Class" },
    { value: "B", label: "B Class" },
    { value: "A", label: "A Class" },
    { value: "M", label: "Master" },
    { value: "GM", label: "Grand Master" },
  ];

  const targetClassifications = classifications.filter(
    (c) => ["B", "A", "M", "GM"].includes(c.value)
  );

  const divisions = [
    "Production",
    "Carry Optics",
    "Limited",
    "Open",
    "PCC",
    "Single Stack",
    "Revolver",
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Profile & Settings</h1>

      <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-4">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center text-xl font-bold text-surface-500">
            {initials || "?"}
          </div>
          <div>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              placeholder="Your Name"
              className="font-semibold text-lg bg-transparent border-none focus:outline-none"
            />
            <div className="flex items-center gap-1">
              <span className="text-sm text-surface-400">USPSA #:</span>
              <input
                type="text"
                value={profile.uspsa_number}
                onChange={(e) => update("uspsa_number", e.target.value)}
                placeholder="TY12345"
                className="text-sm text-surface-400 bg-transparent border-none focus:outline-none w-24"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Classification */}
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1 block">
              Current Classification
            </label>
            <select
              value={profile.classification}
              onChange={(e) => update("classification", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-input)] border border-surface-200 rounded-lg text-sm"
            >
              {classifications.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Classification */}
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1 block">
              Target Classification
            </label>
            <select
              value={profile.targetClassification}
              onChange={(e) => update("targetClassification", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-input)] border border-surface-200 rounded-lg text-sm"
            >
              {targetClassifications.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Division */}
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1 block">Division</label>
            <select
              value={profile.division}
              onChange={(e) => update("division", e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-input)] border border-surface-200 rounded-lg text-sm"
            >
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment */}
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1 block">Equipment</label>
            <input
              type="text"
              value={profile.equipment}
              onChange={(e) => update("equipment", e.target.value)}
              placeholder="e.g., CZ Shadow 2, CompTac holster"
              className="w-full px-3 py-2 bg-[var(--bg-input)] border border-surface-200 rounded-lg text-sm"
            />
          </div>

          {/* Optic */}
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1 block">Optic</label>
            <div className="flex gap-2">
              <button
                onClick={() => update("optic", "iron")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  profile.optic === "iron"
                    ? "bg-surface-900 text-white"
                    : "bg-surface-100 text-surface-600"
                }`}
              >
                Iron Sights
              </button>
              <button
                onClick={() => update("optic", "red_dot")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  profile.optic === "red_dot"
                    ? "bg-surface-900 text-white"
                    : "bg-surface-100 text-surface-600"
                }`}
              >
                Red Dot
              </button>
            </div>
          </div>

          {/* Daily XP Goal */}
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1 block">Daily XP Goal</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="60"
                value={profile.dailyXpGoal}
                onChange={(e) => update("dailyXpGoal", parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono font-medium text-sm w-12 text-right">
                {profile.dailyXpGoal} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Settings */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-4">
        <h3 className="font-semibold mb-3">Shot Timer</h3>
        <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              ble.isConnected ? "bg-green-900/40" : "bg-surface-200"
            }`}>
              <svg className={`w-5 h-5 ${ble.isConnected ? "text-green-400" : "text-surface-400"}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
              </svg>
            </div>
            <div>
              {ble.isConnected ? (
                <>
                  <div className="text-sm font-medium text-green-400">{ble.deviceName}</div>
                  <div className="text-xs text-green-400">Connected</div>
                </>
              ) : ble.state === "scanning" || ble.state === "connecting" ? (
                <>
                  <div className="text-sm font-medium text-surface-600">
                    {ble.state === "scanning" ? "Scanning..." : "Connecting..."}
                  </div>
                  <div className="text-xs text-surface-400">AMG Lab Commander</div>
                </>
              ) : (
                <>
                  <div className="text-sm font-medium text-surface-500">
                    {ble.lastDevice ? `Last: ${ble.lastDevice}` : "No timer paired"}
                  </div>
                  <div className="text-xs text-surface-400">AMG Lab Commander supported</div>
                </>
              )}
            </div>
          </div>
          {ble.isConnected ? (
            <button
              onClick={() => ble.disconnect()}
              className="text-sm text-red-400 font-medium bg-red-900/30 px-3 py-1.5 rounded-lg"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => ble.scanAndConnect()}
              disabled={ble.state === "scanning" || ble.state === "connecting"}
              className="text-sm text-brand-400 font-medium bg-brand-900/30 px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              {ble.state === "scanning" || ble.state === "connecting" ? "..." : "Scan"}
            </button>
          )}
        </div>
        {ble.error && (
          <p className="text-xs text-red-500 mt-2">{ble.error}</p>
        )}
        {!ble.isSupported && (
          <p className="text-xs text-amber-400 mt-2">
            Web Bluetooth not available. Use Chrome on Android or desktop with flags enabled.
          </p>
        )}
      </div>

      {/* Data */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-4">
        <h3 className="font-semibold mb-3">Data</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              const data = {
                profile: getProfile(),
                sessions: JSON.parse(localStorage.getItem("uspsa_sessions") || "[]"),
                runs: JSON.parse(localStorage.getItem("uspsa_runs") || "[]"),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `uspsa-trainer-export-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full text-left px-3 py-2 hover:bg-[var(--bg-elevated)] rounded-lg text-sm flex items-center justify-between"
          >
            <span>Export all data (JSON)</span>
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* PractiScore Import */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-4">
        <h3 className="font-semibold mb-3">PractiScore Import</h3>
        <p className="text-xs text-surface-400 mb-3">
          Import match results from PractiScore CSV exports or paste results directly.
        </p>
        <PractiScoreImport />
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-2 text-sm font-medium rounded-xl transition-colors ${
          saved
            ? "bg-green-900/30 text-green-400"
            : "text-brand-400 hover:bg-brand-900/20"
        }`}
      >
        {saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}
