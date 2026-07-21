import type { NextConfig } from "next";

// The Capacitor iOS build ships the web assets inside the app bundle, so it
// needs a static export (`out/`). The web build (Coolify) is unchanged and
// keeps its server features. Toggle with BUILD_TARGET=capacitor.
const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const nextConfig: NextConfig = {
  ...(isCapacitor ? { output: "export", images: { unoptimized: true } } : {}),
};

export default nextConfig;
