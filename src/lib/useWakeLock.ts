"use client";

import { useEffect } from "react";

// Hold a screen wake lock while `active` is true. A shooter sets the phone down
// between strings; the screen must not sleep mid-session. The lock is released
// by the browser when the tab is hidden, so we re-acquire on visibilitychange.
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let released = false;

    const acquire = async () => {
      try {
        sentinel = await (navigator as Navigator & { wakeLock: WakeLock }).wakeLock.request("screen");
      } catch {
        /* denied (e.g. low battery) — degrade silently, not a session blocker */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !released) acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisibility);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
