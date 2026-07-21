#!/usr/bin/env bash
# Build the static export that Capacitor bundles into the iOS app (out/).
#
# The web app has one server route (/api/version, a deploy-verification endpoint
# that reads a runtime env). `output: export` can't host a dynamic route handler,
# and the native app doesn't need it, so we relocate src/app/api during the
# export and always restore it — even on failure or Ctrl-C.
set -euo pipefail
cd "$(dirname "$0")/.."

API_DIR="src/app/api"
STASH=".api-stash"

restore() {
  if [ -d "$STASH" ]; then
    rm -rf "$API_DIR"
    mv "$STASH" "$API_DIR"
  fi
}
trap restore EXIT INT TERM

if [ -d "$API_DIR" ]; then
  rm -rf "$STASH"
  mv "$API_DIR" "$STASH"
fi

BUILD_TARGET=capacitor npx next build

echo "Static export written to out/"
