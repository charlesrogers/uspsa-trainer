"use client";

import { useEffect, useState } from "react";

// Registers the offline service worker and surfaces a non-intrusive "new
// version — reload" prompt when an update is waiting. Activation is deferred
// (SKIP_WAITING on demand) so an update never interrupts an active session.
export default function ServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [onActiveSession, setOnActiveSession] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // avoid dev caching headaches

    let cancelled = false;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (cancelled) return;
        if (reg.waiting) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) setWaiting(nw);
          });
        });
      })
      .catch(() => {
        /* offline install failures are non-fatal */
      });

    // Reload once the new worker takes control.
    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const checkSession = () => setOnActiveSession(window.location.pathname.startsWith("/session/active"));
    checkSession();
    window.addEventListener("popstate", checkSession);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("popstate", checkSession);
    };
  }, []);

  // Never nag mid-session — an update can wait until the shooter is done.
  if (!waiting || onActiveSession) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm">
      <div
        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-[13px]"
        style={{ background: "#13131a", border: "1px solid #2a2a38", color: "#e0e0e8" }}
      >
        <span>A new version is ready.</span>
        <button
          onClick={() => waiting.postMessage("SKIP_WAITING")}
          className="font-semibold rounded-lg px-3 py-1.5"
          style={{ background: "#00dc82", color: "#0a0a0f" }}
        >
          Reload
        </button>
      </div>
    </div>
  );
}
