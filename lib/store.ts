// lib/store.ts — the single server-side source of truth for the twin.
// Held in-memory (per CLAUDE.md: keep state server-side / in-memory, swappable
// for real MQTT/HA later). Pinned on globalThis so Next's dev hot-reload and all
// route handlers share one instance.

import { seedTwin, LOAD_DIVERSITY } from "./config";
import type { Twin } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __FARMOS_TWIN__: Twin | undefined;
}

export function getTwin(): Twin {
  if (!globalThis.__FARMOS_TWIN__) {
    globalThis.__FARMOS_TWIN__ = seedTwin();
  }
  return globalThis.__FARMOS_TWIN__;
}

/** Re-seed from farm.config.yaml, discarding all runtime state. */
export function reseed(): Twin {
  globalThis.__FARMOS_TWIN__ = seedTwin();
  return globalThis.__FARMOS_TWIN__;
}

/** Recompute live total load (kW) from currently-powered assets. */
export function recomputeLoad(twin: Twin = getTwin()): number {
  const watts = twin.assets
    .filter((a) => a.state === "on")
    .reduce((sum, a) => sum + a.powerDraw, 0);
  twin.resources.energy.loadKw =
    Math.round((watts / 1000) * LOAD_DIVERSITY * 100) / 100;
  return twin.resources.energy.loadKw;
}
