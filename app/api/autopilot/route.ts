// POST /api/autopilot { on } — toggle autonomous mode.
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { runAgent } from "@/lib/agent";
import { logAction, setTrigger } from "@/lib/tools/log";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const { on } = await req.json();
  const twin = getTwin();
  twin.sim.autopilot = !!on;
  setTrigger("autopilot");
  logAction(twin, {
    decision: twin.sim.autopilot ? "Autopilot engaged" : "Autopilot disengaged",
    reasoning: twin.sim.autopilot
      ? "Operator handed the farm to autonomous mode — the agent will sense, predict, and act on its own every 30s."
      : "Operator took back manual control.",
    toolCalled: "autopilot",
    params: { on: twin.sim.autopilot },
    result: twin.sim.autopilot ? "running autonomously" : "manual mode",
  });

  // kick off an immediate first run so the effect is instant
  if (twin.sim.autopilot) await runAgent("autopilot");
  return NextResponse.json({ autopilot: twin.sim.autopilot });
}
