"use client";

import { useEffect, useState } from "react";
import { getProfile, saveProfile } from "@/lib/store";
import type { UserProfile } from "@/lib/store";
import { useBle } from "@/lib/useBle";

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
          <div className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between text-surface-400">
            <span>Import PractiScore (.psc)</span>
            <span className="text-xs">Coming soon</span>
          </div>
        </div>
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
