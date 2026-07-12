// lib/scenario.ts — the two demo scenarios (CLAUDE.md §7).
import { getTwin, recomputeLoad } from "./store";
import { runAgent } from "./agent";
import { defaultAutonomy } from "./autonomy";
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

/** OUTAGE — grid + internet down: run degraded, queue external syncs, keep life-support. */
export async function goOffline() {
  const twin = getTwin();
  twin.online = false;
  const now = new Date().toISOString();
  // cloud integrations can't be reached — defer them
  twin.syncQueue = [
    { id: "sync-beds24", type: "bookings", label: "Beds24 booking sync", queuedAt: now },
    { id: "sync-pos", type: "pos", label: "Loyverse POS upload", queuedAt: now },
    { id: "sync-weather", type: "weather", label: "Open-Meteo forecast refresh", queuedAt: now },
    { id: "sync-accounting", type: "accounting", label: "Wave accounting export", queuedAt: now },
  ];

  setTrigger("grid + internet outage");
  logAction(twin, {
    decision: "Entered offline mode",
    reasoning:
      "Grid and internet are down. FarmOS runs autonomously on cached rules + last forecast; external syncs and cloud alerts are queued until reconnect.",
    toolCalled: "scenario",
    params: { online: false },
    result: `degraded mode · ${twin.syncQueue.length} syncs queued · life-support protected`,
  });

  const result = await runAgent("grid + internet outage");
  return {
    online: false,
    queued: twin.syncQueue.length,
    queue: twin.syncQueue,
    ...result,
  };
}

/** RECONNECT — flush the queued syncs + cloud alerts. */
export function goOnline() {
  const twin = getTwin();
  twin.online = true;
  const flushedSyncs = twin.syncQueue.length;
  const queue = twin.syncQueue;
  twin.syncQueue = [];
  const queuedAlerts = twin.alerts.filter((a) => a.queued);
  queuedAlerts.forEach((a) => (a.queued = false));

  setTrigger("reconnected");
  logAction(twin, {
    decision: "Reconnected — flushed queue",
    reasoning: `Connectivity restored. Flushed ${flushedSyncs} queued external syncs and sent ${queuedAlerts.length} deferred cloud alert(s).`,
    toolCalled: "scenario",
    params: { online: true },
    result: `flushed ${flushedSyncs} syncs + ${queuedAlerts.length} alerts`,
  });
  return { online: true, flushedSyncs, flushedAlerts: queuedAlerts.length, queue };
}

/** RESET — back to a healthy normal state; restore every shed load. */
export function resetScenario() {
  const twin = getTwin();
  twin.sim.scenario = "normal";
  twin.sim.cloudCover = 0.2;
  twin.online = true;
  twin.syncQueue = [];
  twin.resources.energy.batterySoC = 68;
  for (const a of twin.assets) a.state = "on";
  // trust dial back to full auto; clear anything still awaiting approval
  twin.autonomy = defaultAutonomy();
  twin.approvals = (twin.approvals ?? []).filter((a) => a.status !== "pending");
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
