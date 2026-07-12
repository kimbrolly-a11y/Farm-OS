// lib/scenario.ts — the two demo scenarios (CLAUDE.md §7).
import { getTwin, recomputeLoad } from "./store";
import { runAgent } from "./agent";
import { logAction, setTrigger } from "./tools/log";

/** CRISIS — "cloudy day, battery low": SoC 22%, heavy cloud, then run the agent. */
export async function armCrisis() {
  const twin = getTwin();
  twin.sim.scenario = "crisis";
  twin.sim.cloudCover = 0.95;
  twin.resources.energy.batterySoC = 22;
  twin.resources.energy.solarInputKw = 1.8; // heavy cloud
  recomputeLoad(twin);

  setTrigger("crisis: cloudy day, battery low");
  logAction(twin, {
    decision: "Crisis scenario armed",
    reasoning:
      "Operator triggered the crisis drill: battery at 22% under heavy cloud cover with minimal solar recovery.",
    toolCalled: "scenario",
    params: { batterySoC: 22, cloudCover: 0.95 },
    result: "battery 22% · forecast cloudy · handing off to the agent",
  });

  const result = await runAgent("crisis: cloudy day, battery low");

  // never_shed loads are protected by definition — none can be shed.
  const protectedOn = twin.loadShedding.neverShed;
  const shed = twin.assets.filter((a) => a.state === "off").map((a) => a.id);

  return { ...result, protectedOn, shed, batterySoC: twin.resources.energy.batterySoC };
}

/** RESET — back to a healthy normal state; restore every shed load. */
export function resetScenario() {
  const twin = getTwin();
  twin.sim.scenario = "normal";
  twin.sim.cloudCover = 0.2;
  twin.resources.energy.batterySoC = 68;
  for (const a of twin.assets) a.state = "on";
  recomputeLoad(twin);

  setTrigger("scenario reset");
  logAction(twin, {
    decision: "Reset to normal",
    reasoning: "Operator reset the demo — restored all loads, cleared the crisis, battery back to a healthy level.",
    toolCalled: "scenario",
    params: { batterySoC: 68 },
    result: "all loads restored · scenario normal",
  });
  return { scenario: "normal", batterySoC: 68, loadKw: twin.resources.energy.loadKw };
}
