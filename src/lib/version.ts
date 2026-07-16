// Single source of truth for the app version stamped into backups. The build
// injects the git SHA via APP_VERSION; falls back to "dev" locally.
export const APP_VERSION = process.env.APP_VERSION ?? process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
