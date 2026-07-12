// GET /api/predict — forward projection of the energy trajectory.
// Optional what-if params: ?hours=12&cloud=0.8&loadDelta=2.5
import { NextRequest, NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { forwardSimulate } from "@/lib/predict";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const hours = q.has("hours") ? Number(q.get("hours")) : 12;
  const cloud = q.has("cloud") ? Number(q.get("cloud")) : undefined;
  const loadDelta = q.has("loadDelta") ? Number(q.get("loadDelta")) : 0;

  return NextResponse.json(
    forwardSimulate(getTwin(), {
      hours: Number.isFinite(hours) ? Math.min(48, Math.max(1, hours)) : 12,
      cloudCover:
        cloud !== undefined && Number.isFinite(cloud)
          ? Math.min(1, Math.max(0, cloud))
          : undefined,
      loadDeltaKw: Number.isFinite(loadDelta) ? Math.min(50, Math.max(-20, loadDelta)) : 0,
    })
  );
}
