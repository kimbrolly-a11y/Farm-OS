// lib/autopilot.ts — autonomous mode. When enabled, the supervisor agent runs
// itself on an interval (sense -> predict -> act) with no human in the loop.
// This is what makes FarmOS an autonomous operating system rather than a
// dashboard: the company runs itself, and the Activity Log fills as it works.

import { getTwin } from "./store";
import { runAgent } from "./agent";

const AUTOPILOT_MS = 30000; // the agent re-assesses every 30s

declare global {
  // eslint-disable-next-line no-var
  var __FARMOS_AUTOPILOT__: NodeJS.Timeout | undefined;
  // eslint-disable-next-line no-var
  var __FARMOS_AP_RUNNING__: boolean | undefined;
}

export function startAutopilot(): void {
  if (globalThis.__FARMOS_AUTOPILOT__) return;
  globalThis.__FARMOS_AUTOPILOT__ = setInterval(async () => {
    const twin = getTwin();
    if (!twin.sim.autopilot) return;
    if (globalThis.__FARMOS_AP_RUNNING__) return; // don't overlap runs
    globalThis.__FARMOS_AP_RUNNING__ = true;
    try {
      await runAgent("autopilot");
    } catch (e) {
      console.error("[autopilot] run failed", e);
    } finally {
      globalThis.__FARMOS_AP_RUNNING__ = false;
    }
  }, AUTOPILOT_MS);
  console.log("[autopilot] loop armed @", AUTOPILOT_MS, "ms");
}
