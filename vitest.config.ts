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
      // ble.ts is Web Bluetooth runtime I/O (convertTime is tested directly);
      // useBle.ts is a React hook. Both are excluded per the M0 spec.
      exclude: ["src/lib/ble.ts", "src/lib/useBle.ts", "src/lib/__tests__/**"],
      thresholds: { lines: 80 },
      reporter: ["text", "json-summary"],
    },
  },
});
