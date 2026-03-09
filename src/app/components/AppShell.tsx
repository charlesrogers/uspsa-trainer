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

  const navActive = (path: string) =>
    isActive(path)
      ? "text-brand-600 border-brand-600"
      : "text-surface-400 border-transparent";

  const headerTitle = () => {
    if (pathname === "/") return "USPSA Trainer";
    if (pathname.startsWith("/drills")) return "Drill Library";
    if (pathname.startsWith("/session/active")) return "Active Session";
    if (pathname.startsWith("/session")) return "New Session";
    if (pathname.startsWith("/history")) return "History";
    if (pathname.startsWith("/settings")) return "Settings";
    return "USPSA Trainer";
  };

  // Hide bottom nav during active session
  const hideNav = pathname === "/session/active";

  return (
    <>
      <header className="bg-surface-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-sm font-bold">
            U
          </div>
          <span className="font-bold text-lg tracking-tight">{headerTitle()}</span>
        </div>
        <div className="flex items-center gap-3">
          {bleState === "connected" && (
            <Link href="/settings" className="flex items-center gap-1 text-xs bg-green-700 text-green-100 px-2 py-1 rounded-full" title={bleDevice || "Timer"}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
              </svg>
              <span className="max-w-[60px] truncate">{bleDevice || "Timer"}</span>
            </Link>
          )}
          <div className="text-xs bg-surface-700 px-2 py-1 rounded-full">
            {classification} Class
          </div>
          <Link
            href="/settings"
            className="w-8 h-8 bg-surface-700 rounded-full flex items-center justify-center text-xs font-medium"
          >
            {initials || "?"}
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">{children}</main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 max-w-md mx-auto z-50">
          <div className="flex">
            <Link
              href="/"
              className={`flex-1 flex flex-col items-center py-2 border-t-2 ${navActive("/")}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-0.5">Home</span>
            </Link>
            <Link
              href="/drills"
              className={`flex-1 flex flex-col items-center py-2 border-t-2 ${navActive("/drills")}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-xs mt-0.5">Drills</span>
            </Link>
            <Link
              href="/session"
              className={`flex-1 flex flex-col items-center py-2 border-t-2 ${navActive("/session")}`}
            >
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center -mt-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 6v12m6-6H6" />
                </svg>
              </div>
              <span className="text-xs mt-0.5">Train</span>
            </Link>
            <Link
              href="/history"
              className={`flex-1 flex flex-col items-center py-2 border-t-2 ${navActive("/history")}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs mt-0.5">History</span>
            </Link>
            <Link
              href="/settings"
              className={`flex-1 flex flex-col items-center py-2 border-t-2 ${navActive("/settings")}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-xs mt-0.5">Settings</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
