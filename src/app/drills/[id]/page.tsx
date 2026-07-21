// Server wrapper for the drill-detail route. Drill ids are known at build time
// (the seed corpus), so we enumerate them for static export — every drill page
// pre-renders and keeps its clean, shareable /drills/<id> URL. The client
// component reads the id via useParams and loads run data from IndexedDB.

import { drills } from "@/data/seed";
import DrillDetail from "./DrillDetail";

export function generateStaticParams() {
  return drills.map((d) => ({ id: d.id }));
}

export default function DrillDetailPage() {
  return <DrillDetail />;
}
