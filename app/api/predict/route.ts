// GET /api/predict — 12h forward projection of the energy trajectory.
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { forwardSimulate } from "@/lib/predict";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(forwardSimulate(getTwin(), { hours: 12 }));
}
