// POST /api/tick — advance the simulator one step (deterministic / testing).
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { tickOnce } from "@/lib/simulator";

export const dynamic = "force-dynamic";

export async function POST() {
  const twin = getTwin();
  tickOnce(twin);
  return NextResponse.json({
    tickCount: twin.sim.tickCount,
    batterySoC: twin.resources.energy.batterySoC,
    solarInputKw: twin.resources.energy.solarInputKw,
    loadKw: twin.resources.energy.loadKw,
    readings: twin.readings.length,
  });
}
