// Runtime deploy-verification endpoint for the WEB build (reads APP_VERSION, set
// as a runtime env in the Docker runner). The Capacitor static export doesn't
// include this route — scripts/build-capacitor.sh relocates it during that
// build — so this stays a plain force-dynamic handler.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { sha: process.env.APP_VERSION ?? "dev" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
