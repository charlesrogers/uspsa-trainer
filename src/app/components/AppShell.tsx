"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfile } from "@/lib/store";
import { useBle } from "@/lib/useBle";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [classification, setClassification] = useState("C");
  const [initials, setInitials] = useState("");
  const { state: bleState, deviceName: bleDevice } = useBle();

  useEffect(() => {
    const p = getProfile();
    setClassification(p.classification);
    const name = p.displayName || "";
    setInitials(
      name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    );
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const headerTitle = () => {
    if (pathname === "/") return null;
    if (pathname.startsWith("/drills")) return "Drill Library";
    if (pathname.startsWith("/session/active")) return "Active Session";
    if (pathname.startsWith("/session")) return "New Session";
    if (pathname.startsWith("/history")) return "History";
    if (pathname.startsWith("/settings")) return "Settings";
    return null;
  };

  // Hide bottom nav during active session
  const hideNav = pathname === "/session/active";

  const pageTitle = headerTitle();

  return (
    <>
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{
          background: "#0a0a0f",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Left: Logo + App Name */}
        <div className="flex items-center gap-2.5">
          {/* Crosshair / target SVG logo */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            {/* Outer circle */}
            <circle cx="14" cy="14" r="12" stroke="#555" strokeWidth="1" />
            {/* Inner circle */}
            <circle cx="14" cy="14" r="6" stroke="#777" strokeWidth="1" />
            {/* Center dot */}
            <circle cx="14" cy="14" r="1.5" fill="#00dc82" />
            {/* Crosshair lines */}
            <line x1="14" y1="0" x2="14" y2="8" stroke="#555" strokeWidth="1" />
            <line x1="14" y1="20" x2="14" y2="28" stroke="#555" strokeWidth="1" />
            <line x1="0" y1="14" x2="8" y2="14" stroke="#555" strokeWidth="1" />
            <line x1="20" y1="14" x2="28" y2="14" stroke="#555" strokeWidth="1" />
          </svg>

          <div className="flex items-center gap-2">
            <span
              className="text-[13px] font-light tracking-[0.2em] uppercase"
              style={{ color: "#e0e0e8" }}
            >
              Trainer
            </span>
            {pageTitle && (
              <>
                <span style={{ color: "#3a3a48" }} className="text-[13px]">/</span>
                <span
                  className="text-[13px] font-light"
                  style={{ color: "#6b6b80" }}
                >
                  {pageTitle}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: BLE dot + Classification */}
        <div className="flex items-center gap-3">
          {bleState === "connected" && (
            <Link
              href="/settings"
              className="flex items-center"
              title={bleDevice || "Timer"}
            >
              <span
                className="block w-2 h-2 rounded-full"
                style={{ background: "#00dc82", boxShadow: "0 0 6px #00dc82" }}
              />
            </Link>
          )}
          <div
            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#8a8a9a",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {classification}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50"
          style={{
            background: "rgba(19, 19, 26, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid #2a2a38",
          }}
        >
          <div className="flex">
            {/* Home */}
            <Link
              href="/"
              className="flex-1 flex flex-col items-center py-2.5"
            >
              <svg
                className="w-[22px] h-[22px]"
                fill="none"
                stroke={isActive("/") ? "#00dc82" : "#6b6b80"}
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span
                className="text-[10px] mt-1 font-medium"
                style={{ color: isActive("/") ? "#00dc82" : "#6b6b80" }}
              >
                Home
              </span>
            </Link>

            {/* Drills */}
            <Link
              href="/drills"
              className="flex-1 flex flex-col items-center py-2.5"
            >
              <svg
                className="w-[22px] h-[22px]"
                fill="none"
                stroke={isActive("/drills") ? "#00dc82" : "#6b6b80"}
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span
                className="text-[10px] mt-1 font-medium"
                style={{ color: isActive("/drills") ? "#00dc82" : "#6b6b80" }}
              >
                Drills
              </span>
            </Link>

            {/* Train (center) */}
            <Link
              href="/session"
              className="flex-1 flex flex-col items-center py-2.5"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center -mt-5"
                style={{
                  background: isActive("/session")
                    ? "#00dc82"
                    : "rgba(0, 220, 130, 0.15)",
                  boxShadow: isActive("/session")
                    ? "0 2px 12px rgba(0, 220, 130, 0.3)"
                    : "none",
                  border: isActive("/session")
                    ? "none"
                    : "1px solid rgba(0, 220, 130, 0.25)",
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke={isActive("/session") ? "#0a0a0f" : "#00dc82"}
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
                  />
                </svg>
              </div>
              <span
                className="text-[10px] mt-1 font-medium"
                style={{
                  color: isActive("/session") ? "#00dc82" : "#6b6b80",
                }}
              >
                Train
              </span>
            </Link>

            {/* History */}
            <Link
              href="/history"
              className="flex-1 flex flex-col items-center py-2.5"
            >
              <svg
                className="w-[22px] h-[22px]"
                fill="none"
                stroke={isActive("/history") ? "#00dc82" : "#6b6b80"}
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                className="text-[10px] mt-1 font-medium"
                style={{ color: isActive("/history") ? "#00dc82" : "#6b6b80" }}
              >
                History
              </span>
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className="flex-1 flex flex-col items-center py-2.5"
            >
              <svg
                className="w-[22px] h-[22px]"
                fill="none"
                stroke={isActive("/settings") ? "#00dc82" : "#6b6b80"}
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span
                className="text-[10px] mt-1 font-medium"
                style={{
                  color: isActive("/settings") ? "#00dc82" : "#6b6b80",
                }}
              >
                Settings
              </span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
