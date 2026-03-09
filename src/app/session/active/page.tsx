"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getSessions,
  getSessionRuns,
  addRun,
  endSession,
  drills,
  getDrill,
  getDrillBenchmarkAtDistance,
  getDrillSkills,
  getProfile,
  computeClassificationPct,
} from "@/lib/store";
import type { Session, SessionRun } from "@/lib/store";
import { generateId, formatTime, pctColor } from "@/lib/utils";
import { useBle, useShotData } from "@/lib/useBle";
import type { ShotData } from "@/lib/ble";

export default function ActiveSessionPageWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-surface-400">Loading...</div>}>
      <ActiveSessionPage />
    </Suspense>
  );
}

function ActiveSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDrillId = searchParams.get("drillId");

  const [session, setSession] = useState<Session | null>(null);
  const [runs, setRuns] = useState<SessionRun[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [classification, setClassification] = useState("B");

  // Run entry form state
  const [selectedDrillId, setSelectedDrillId] = useState(preselectedDrillId || "dr-bill");
  const [selectedDistance, setSelectedDistance] = useState(7);
  const [totalTime, setTotalTime] = useState("");
  const [firstShotTime, setFirstShotTime] = useState("");
  const [splitsInput, setSplitsInput] = useState("");
  const [pointsDown, setPointsDown] = useState<number | null>(0);
  const [customPtsDown, setCustomPtsDown] = useState("");
  const [callGood, setCallGood] = useState("");
  const [callTotal, setCallTotal] = useState("");
  const [timerWaiting, setTimerWaiting] = useState(false);

  // BLE timer integration
  const ble = useBle();

  const handleShotData = useCallback((data: ShotData) => {
    // Only populate if it looks like a full string (not per-shot push updates during a string)
    // Per-shot pushes have shotCount=1; full strings from REQ STRING HEX have shotCount >= 1
    setTotalTime(data.totalTime.toString());
    if (data.firstShotTime) setFirstShotTime(data.firstShotTime.toString());
    if (data.splits.length > 0) setSplitsInput(data.splits.map(s => s.toFixed(2)).join(", "));
    setTimerWaiting(false);
  }, []);

  useShotData(handleShotData);

  useEffect(() => {
    setMounted(true);
    const sessions = getSessions();
    const active = sessions.find((s) => !s.endedAt);
    if (!active) {
      router.push("/session");
      return;
    }
    setSession(active);
    setRuns(getSessionRuns(active.id));
    setClassification(getProfile().classification);
  }, [router]);

  // Elapsed time timer
  useEffect(() => {
    if (!session) return;
    const start = new Date(session.startedAt).getTime();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 60000));
    }, 1000);
    return () => clearInterval(timer);
  }, [session]);

  // Update distances when drill changes
  const selectedDrill = getDrill(selectedDrillId);
  useEffect(() => {
    if (selectedDrill && !selectedDrill.distances.includes(selectedDistance)) {
      setSelectedDistance(selectedDrill.distances[0] || 7);
    }
  }, [selectedDrillId]);

  const refreshRuns = useCallback(() => {
    if (session) setRuns(getSessionRuns(session.id));
  }, [session]);

  // Detect cold run: first run in session for the drill's primary skill
  const detectCold = useCallback(() => {
    if (!session) return false;
    const currentRuns = getSessionRuns(session.id).filter((r) => r.isValid);
    const drillSkills = getDrillSkills(selectedDrillId);
    const primarySkill = drillSkills.find((s) => s.isPrimary);
    if (!primarySkill) return currentRuns.length === 0;

    // Check if any existing run's drill shares the same primary skill
    for (const run of currentRuns) {
      const runSkills = getDrillSkills(run.drillId);
      if (runSkills.some((s) => s.isPrimary && s.skillId === primarySkill.skillId)) {
        return false;
      }
    }
    return true;
  }, [session, selectedDrillId]);

  const handleSave = () => {
    if (!session || !totalTime) return;

    const time = parseFloat(totalTime);
    if (isNaN(time) || time <= 0) return;

    const isCold = detectCold();
    const splits = splitsInput
      .split(",")
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));

    const isDryFire = session.fireMode === "dry_fire";
    const pd = isDryFire ? null : (customPtsDown !== "" ? parseInt(customPtsDown) : pointsDown);
    const goodCalls = parseInt(callGood);
    const totalCalls = parseInt(callTotal);
    const callPct = isDryFire && !isNaN(goodCalls) && !isNaN(totalCalls) && totalCalls > 0
      ? Math.round((goodCalls / totalCalls) * 100)
      : null;

    const run: SessionRun = {
      id: generateId(),
      sessionId: session.id,
      drillId: selectedDrillId,
      runNumber: runs.length + 1,
      isValid: true,
      isCold,
      fireMode: session.fireMode,
      distanceYards: selectedDistance,
      totalTime: time,
      firstShotTime: firstShotTime ? parseFloat(firstShotTime) : null,
      splits,
      pointsDown: pd,
      dryFireCallPct: callPct,
      capturedAt: new Date().toISOString(),
    };

    addRun(run);
    refreshRuns();
    // Reset form
    setTotalTime("");
    setFirstShotTime("");
    setSplitsInput("");
    setPointsDown(0);
    setCustomPtsDown("");
    setCallGood("");
    setCallTotal("");
    // Refresh runs
    setRuns(getSessionRuns(session.id));
  };

  const handleDiscard = () => {
    if (!session || !totalTime) return;

    const time = parseFloat(totalTime);
    if (isNaN(time) || time <= 0) return;

    const run: SessionRun = {
      id: generateId(),
      sessionId: session.id,
      drillId: selectedDrillId,
      runNumber: runs.length + 1,
      isValid: false,
      isCold: false,
      fireMode: session.fireMode,
      distanceYards: selectedDistance,
      totalTime: time,
      firstShotTime: firstShotTime ? parseFloat(firstShotTime) : null,
      splits: [],
      pointsDown: null,
      dryFireCallPct: null,
      capturedAt: new Date().toISOString(),
    };

    addRun(run);
    setTotalTime("");
    setFirstShotTime("");
    setSplitsInput("");
    setPointsDown(0);
    setCustomPtsDown("");
    setCallGood("");
    setCallTotal("");
    setRuns(getSessionRuns(session.id));
  };

  const handleEndSession = () => {
    if (!session) return;
    endSession(session.id);
    router.push(`/history/${session.id}`);
  };

  if (!mounted || !session) return null;

  const benchmark = getDrillBenchmarkAtDistance(
    selectedDrillId,
    classification,
    selectedDistance,
    session.fireMode
  );

  return (
    <div>
      {/* Session header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Session Active</span>
          <span className="text-xs text-green-200">
            · {session.fireMode === "live_fire" ? "Live Fire" : "Dry Fire"} · {elapsed} min
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!ble.isConnected && ble.isSupported && (
            <button
              onClick={() => ble.scanAndConnect()}
              className="text-xs bg-green-700 hover:bg-green-800 px-2 py-1 rounded-lg font-medium flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
              </svg>
              Timer
            </button>
          )}
          <button
            onClick={handleEndSession}
            className="text-xs bg-green-700 hover:bg-green-800 px-3 py-1 rounded-lg font-medium"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Completed runs */}
        {runs.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-2">
              Completed Runs
            </h3>
            <div className="space-y-2">
              {runs.map((run) => {
                const drill = getDrill(run.drillId);
                const pct = run.isValid
                  ? computeClassificationPct(
                      run.totalTime,
                      run.drillId,
                      run.distanceYards,
                      classification,
                      run.fireMode
                    )
                  : null;

                return (
                  <div
                    key={run.id}
                    className={`bg-white rounded-xl border border-surface-200 p-3 ${
                      !run.isValid ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`font-medium text-sm ${!run.isValid ? "line-through" : ""}`}>
                          {drill?.name || "Unknown"}
                        </span>
                        <span className="text-xs text-surface-400 ml-1">@ {run.distanceYards}yd</span>
                        {run.isCold && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded ml-1">COLD</span>
                        )}
                        {!run.isValid && (
                          <span className="text-xs bg-red-100 text-red-700 px-1 rounded ml-1">INVALID</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-lg ${
                            !run.isValid ? "line-through text-surface-400" : ""
                          }`}
                        >
                          {formatTime(run.totalTime)}s
                        </span>
                        {run.isValid && pct !== null ? (
                          <div className={`text-xs ${pctColor(pct)}`}>
                            {Math.round(pct)}% of {classification}
                          </div>
                        ) : !run.isValid ? (
                          <div className="text-xs text-surface-400">Discarded</div>
                        ) : null}
                      </div>
                    </div>
                    {run.isValid && (
                      <div className="flex gap-3 mt-2 text-xs text-surface-500">
                        {run.firstShotTime && <span>1st: {formatTime(run.firstShotTime)}s</span>}
                        {run.splits.length > 0 && (
                          <span>Splits: {run.splits.map((s) => s.toFixed(2)).join(", ")}</span>
                        )}
                        {run.fireMode === "dry_fire" && run.dryFireCallPct !== null && (
                          <span className={
                            run.dryFireCallPct >= 90 ? "text-green-600" :
                            run.dryFireCallPct >= 70 ? "text-yellow-600" :
                            "text-red-600"
                          }>
                            {run.dryFireCallPct}% calls good
                          </span>
                        )}
                        {run.fireMode === "live_fire" && run.pointsDown !== null && (
                          <span>{run.pointsDown === 0 ? "Clean" : `${run.pointsDown} pts down`}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New Run Entry */}
        <div className="bg-white rounded-xl border-2 border-brand-200 p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center justify-between">
            <span>Log Run #{runs.length + 1}</span>
            {detectCold() && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">COLD RUN</span>
            )}
          </h3>

          {/* Drill selector */}
          <div className="mb-3">
            <label className="text-xs font-medium text-surface-500 mb-1 block">Drill</label>
            <select
              value={selectedDrillId}
              onChange={(e) => setSelectedDrillId(e.target.value)}
              className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {drills.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drill description & setup */}
          {selectedDrill && (
            <div className="mb-3 bg-surface-50 rounded-lg p-3 text-xs text-surface-600 space-y-1.5">
              <p>{selectedDrill.description}</p>
              <p className="text-surface-500 font-medium">Setup: {selectedDrill.setupInstructions}</p>
              <div className="flex gap-3 text-surface-400">
                <span>{selectedDrill.roundCount} rounds</span>
                <span>{selectedDrill.targetCount} targets</span>
                <span>{selectedDrill.mode === "both" ? "Dry/Live" : selectedDrill.mode === "dry_fire" ? "Dry fire" : "Live fire"}</span>
              </div>
            </div>
          )}

          {/* Distance */}
          {selectedDrill && (
            <div className="mb-3">
              <label className="text-xs font-medium text-surface-500 mb-1 block">Distance</label>
              <div className="flex gap-1.5">
                {selectedDrill.distances.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setSelectedDistance(dist)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                      selectedDistance === dist
                        ? "bg-surface-900 text-white"
                        : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                    }`}
                  >
                    {dist}yd
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BLE Timer Controls */}
          {ble.isConnected && (
            <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${ble.timerRunning || timerWaiting ? "bg-orange-500 animate-pulse" : "bg-green-500"}`} />
                  <span className="text-xs font-medium text-green-700">{ble.deviceName}</span>
                </div>
                {(timerWaiting || ble.timerRunning) && (
                  <button
                    onClick={() => setTimerWaiting(false)}
                    className="text-xs text-surface-400 hover:text-surface-600"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {timerWaiting ? (
                <div className="text-center py-2">
                  <p className="text-sm font-medium text-orange-600 animate-pulse">
                    {ble.timerRunning ? "Timer running — shoot!" : "Waiting for timer start..."}
                  </p>
                  <p className="text-xs text-surface-400 mt-1">
                    Times auto-populate when string completes
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setTimerWaiting(true);
                      await ble.startTimer();
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    Start Timer
                  </button>
                  <button
                    onClick={() => ble.requestShotData()}
                    className="px-3 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition-colors text-sm"
                    title="Pull last shot string from timer"
                  >
                    Pull Last String
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Time entry */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1 block">
                Total Time <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={totalTime}
                  onChange={(e) => setTotalTime(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-400">sec</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1 block">First Shot</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={firstShotTime}
                  onChange={(e) => setFirstShotTime(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-400">sec</span>
              </div>
            </div>
          </div>

          {/* Splits */}
          <div className="mb-3">
            <label className="text-xs font-medium text-surface-500 mb-1 block">
              Splits <span className="text-surface-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., .26, .29, .27, .30, .28"
              value={splitsInput}
              onChange={(e) => setSplitsInput(e.target.value)}
              className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Accuracy: Points Down (live fire) or Call Quality (dry fire) */}
          {session.fireMode === "dry_fire" ? (
            <div className="mb-4">
              <label className="text-xs font-medium text-surface-500 mb-1 block">
                Call Quality <span className="text-surface-400 font-normal">— acceptable sight pictures at break</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-1.5 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="8"
                    value={callGood}
                    onChange={(e) => setCallGood(e.target.value)}
                    className="w-12 bg-transparent text-sm font-mono text-center focus:outline-none"
                  />
                  <span className="text-surface-400 text-sm">of</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={callTotal}
                    onChange={(e) => setCallTotal(e.target.value)}
                    className="w-12 bg-transparent text-sm font-mono text-center focus:outline-none"
                  />
                  <span className="text-surface-400 text-sm">good</span>
                </div>
                {callGood && callTotal && parseInt(callTotal) > 0 && (
                  <div className={`text-sm font-bold px-2 ${
                    (parseInt(callGood) / parseInt(callTotal)) >= 0.9 ? "text-green-600" :
                    (parseInt(callGood) / parseInt(callTotal)) >= 0.7 ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {Math.round((parseInt(callGood) / parseInt(callTotal)) * 100)}%
                  </div>
                )}
              </div>
              <p className="text-xs text-surface-400 mt-1">
                Was the sight/dot on your aiming point when the striker fell?
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <label className="text-xs font-medium text-surface-500 mb-1 block">Points Down</label>
              <div className="flex gap-1.5">
                {[
                  { label: "0 (Clean)", value: 0 },
                  { label: "1", value: 1 },
                  { label: "2", value: 2 },
                  { label: "3+", value: 3 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPointsDown(opt.value);
                      setCustomPtsDown("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      pointsDown === opt.value && customPtsDown === ""
                        ? opt.value === 0
                          ? "bg-green-100 text-green-700 border-2 border-green-300"
                          : "bg-surface-800 text-white"
                        : "bg-surface-100 text-surface-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="w-16">
                  <input
                    type="number"
                    min="0"
                    placeholder="#"
                    value={customPtsDown}
                    onChange={(e) => {
                      setCustomPtsDown(e.target.value);
                      setPointsDown(null);
                    }}
                    className="w-full py-2 rounded-lg text-sm font-mono text-center bg-surface-100 border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Benchmark */}
          {benchmark && (
            <div className="bg-surface-50 rounded-lg p-3 mb-4 text-center">
              <div className="text-xs text-surface-400 mb-1">
                {classification}-class benchmark @ {selectedDistance}yd
              </div>
              <div className="font-mono text-lg font-bold text-surface-700">
                {formatTime(benchmark.targetTime)}s
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!totalTime}
              className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Save Run
            </button>
            <button
              onClick={handleDiscard}
              disabled={!totalTime}
              className="px-4 py-3 bg-surface-100 hover:bg-surface-200 disabled:opacity-50 text-surface-600 font-medium rounded-xl transition-colors text-sm"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
