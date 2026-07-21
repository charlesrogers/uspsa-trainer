import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**"],
      // Transport I/O (Web Bluetooth / native BLE) and the React hook can't run
      // headless — the pure protocol (amgProtocol.ts) IS covered directly.
      // useBle.ts is a React hook.
      exclude: [
        "src/lib/timer/bleBackend.web.ts", // raw Web Bluetooth I/O
        "src/lib/timer/bleBackend.native.ts", // raw Capacitor BLE I/O (A4)
        "src/lib/timer/index.ts", // wiring/singleton
        "src/lib/useBle.ts",
        "src/lib/__tests__/**",
      ],
      thresholds: { lines: 80 },
      reporter: ["text", "json-summary"],
    },
  },
});
