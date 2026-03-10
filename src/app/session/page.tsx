"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSession } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { useBle } from "@/lib/useBle";
import { getConstraints, saveConstraints, type SessionConstraints } from "@/lib/recommendations";
import { generateSessionPlan, savePlan } from "@/lib/sessionPlanner";
import ConstraintSelector from "@/app/components/ConstraintSelector";

export default function NewSessionPageWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-surface-400">Loading...</div>}>
      <NewSessionPage />
    </Suspense>
  );
}

function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const drillId = searchParams.get("drillId");
  const [fireMode, setFireMode] = useState<"live_fire" | "dry_fire">("live_fire");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const ble = useBle();
  const [constraints, setConstraints] = useState<SessionConstraints | null>(null);

  useEffect(() => {
    setConstraints(getConstraints());
  }, []);

  const handleConstraintsChange = (c: SessionConstraints) => {
    setConstraints(c);
    saveConstraints(c);
    // Sync fire mode with constraints
    setFireMode(c.fireMode);
  };

  const handleGenerateWorkout = () => {
    if (!constraints) return;
    // Generate the plan with current constraints
    const plan = generateSessionPlan({
      totalMinutes: constraints.timeMinutes,
      fireMode: constraints.fireMode,
      maxDistance: constraints.maxDistance,
      hasMovementSpace: constraints.movementAvailable,
    });
    savePlan(plan);
    router.push("/session/plan");
  };

  const handleStart = () => {
    const session = {
      id: generateId(),
      startedAt: new Date().toISOString(),
      endedAt: null,
      fireMode,
      location,
      notes,
    };
    createSession(session);
    const params = drillId ? `?drillId=${drillId}` : "";
    router.push(`/session/active${params}`);
  };

  return (
    <div>
      <div className="px-4 py-3 flex items-center gap-2">
        <Link href="/" className="text-brand-600 flex items-center gap-1 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      <div className="px-4">
        <h1 className="text-2xl font-bold mb-6">New Session</h1>

        <div className="space-y-4">
          {/* Fire Mode */}
          <div>
            <label className="text-sm font-medium text-surface-500 mb-2 block">Fire Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFireMode("live_fire")}
                className={`border-2 font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 ${
                  fireMode === "live_fire"
                    ? "border-brand-600 bg-[rgba(0,220,130,0.1)] text-brand-400"
                    : "border-surface-200 text-surface-600 hover:border-surface-300"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Live Fire
              </button>
              <button
                onClick={() => setFireMode("dry_fire")}
                className={`border-2 font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 ${
                  fireMode === "dry_fire"
                    ? "border-brand-600 bg-[rgba(0,220,130,0.1)] text-brand-400"
                    : "border-surface-200 text-surface-600 hover:border-surface-300"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Dry Fire
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-surface-500 mb-2 block">
              Location <span className="text-surface-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Outdoor Range, Home"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Timer */}
          <div>
            <label className="text-sm font-medium text-surface-500 mb-2 block">Shot Timer</label>
            <div className={`rounded-xl p-3 flex items-center justify-between ${
              ble.isConnected ? "bg-green-900/20 border border-green-800" : "bg-surface-100"
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  ble.isConnected ? "bg-green-900/40" : "bg-surface-200"
                }`}>
                  {ble.isConnected ? (
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  {ble.isConnected ? (
                    <>
                      <div className="text-sm font-medium text-green-400">{ble.deviceName}</div>
                      <div className="text-xs text-green-400">Connected — times auto-populate</div>
                    </>
                  ) : ble.state === "scanning" || ble.state === "connecting" ? (
                    <>
                      <div className="text-sm font-medium text-surface-500">
                        {ble.state === "scanning" ? "Scanning..." : "Connecting..."}
                      </div>
                      <div className="text-xs text-surface-400">Looking for timer</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-surface-500">
                        {ble.lastDevice ? `Last: ${ble.lastDevice}` : "No timer connected"}
                      </div>
                      <div className="text-xs text-surface-400">
                        {ble.isSupported ? "Using manual entry" : "Web Bluetooth not supported"}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {ble.isConnected ? (
                <button
                  onClick={() => ble.disconnect()}
                  className="text-xs text-green-400 font-medium hover:text-green-300"
                >
                  Disconnect
                </button>
              ) : ble.isSupported ? (
                <button
                  onClick={() => ble.scanAndConnect()}
                  disabled={ble.state === "scanning" || ble.state === "connecting"}
                  className="text-xs text-brand-600 font-medium hover:text-brand-800 disabled:text-surface-400"
                >
                  {ble.state === "scanning" || ble.state === "connecting" ? "..." : "Connect"}
                </button>
              ) : null}
            </div>
            {ble.error && (
              <p className="text-xs text-red-500 mt-1">{ble.error}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-surface-500 mb-2 block">
              Notes <span className="text-surface-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Weather, gear changes, focus areas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 h-20 resize-none"
            />
          </div>
        </div>

        {/* Generate Workout */}
        {constraints && (
          <div className="mt-6 bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Generate Workout</h3>
                <p className="text-xs text-surface-500">Get a structured plan based on your skill gaps</p>
              </div>
            </div>
            <ConstraintSelector
              constraints={constraints}
              onChange={handleConstraintsChange}
            />
            <button
              onClick={handleGenerateWorkout}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl mt-4 text-sm"
            >
              Generate Today&apos;s Workout
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mt-6 mb-2">
          <div className="flex-1 border-t border-surface-200" />
          <span className="text-xs text-surface-400 font-medium">or</span>
          <div className="flex-1 border-t border-surface-200" />
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-surface-100 hover:bg-surface-200 text-surface-600 font-semibold py-4 rounded-xl mt-2 text-lg transition-colors"
        >
          Free Practice
        </button>
      </div>
    </div>
  );
}
