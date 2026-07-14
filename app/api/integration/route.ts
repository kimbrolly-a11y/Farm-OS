// GET /api/integration — real-sensor integration status: mode (sim/live), how many
// sensors are live vs simulated, per-vertical breakdown, and per-device health.
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { integrationStatus } from "@/lib/integration";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(integrationStatus(getTwin()));
}
