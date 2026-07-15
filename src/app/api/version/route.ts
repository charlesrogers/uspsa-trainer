export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { sha: process.env.APP_VERSION ?? "dev" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
