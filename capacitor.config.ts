import type { CapacitorConfig } from "@capacitor/cli";

// The iOS app wraps the static export in `out/` (built by `pnpm build:capacitor`).
// appId is effectively permanent once the app is on the store.
const config: CapacitorConfig = {
  appId: "com.autotrainer.app",
  appName: "AutoTrainer",
  webDir: "out",
  ios: {
    // A dark-themed app; keep the native background dark to avoid a white flash.
    backgroundColor: "#0a0a0f",
    contentInset: "always",
  },
};

export default config;
