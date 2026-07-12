// GET /api/state — full digital-twin snapshot (getFarmState over HTTP).
// Serverless-friendly: if the background interval has been frozen (Vercel
// pauses timers between invocations), catch the simulation up on demand so the
// deployed twin still lives and breathes whenever anyone is watching.
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { tickOnce } from "@/lib/simulator";

export const dynamic = "force-dynamic";

const TICK_MS = 3000;
const MAX_CATCHUP = 5;

export async function GET() {
  const twin = getTwin();
  const last = twin.sim.lastTickAt ? new Date(twin.sim.lastTickAt).getTime() : 0;
  const behind = Date.now() - last;
  if (behind > TICK_MS * 2) {
    const ticks = Math.min(MAX_CATCHUP, Math.floor(behind / TICK_MS));
    for (let i = 0; i < ticks; i++) tickOnce(twin);
  }
  return NextResponse.json(twin);
}
