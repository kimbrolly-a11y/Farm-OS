// lib/energy.ts — the multi-source energy layer (spec §5).
// Solar is primary; biogas (POME + manure + food waste digester) is renewable
// baseload whose output tracks digester CH4; a small wind turbine is an optional
// bonus; the diesel genset is LAST RESORT only — it auto-starts at SoC <= 10%
// (life-support protection floor) and stops once the battery recovers to 25%.
// The design goal surfaced to the UI: islandable / 100%-renewable-capable.

import type { EnergySources, Twin } from "./types";

const GENSET_START_SOC = 10;
const GENSET_STOP_SOC = 25;

export function defaultEnergySources(
  caps: { biogasCapKw?: number; gensetCapKw?: number; windCapKw?: number } = {}
): EnergySources {
  return {
    biogasCapKw: caps.biogasCapKw ?? 12,
    biogasKw: 0,
    gensetCapKw: caps.gensetCapKw ?? 20,
    gensetKw: 0,
    gensetOn: false,
    windCapKw: caps.windCapKw ?? 3,
    windKw: 0,
    renewablePct: 100,
    offGridCapable: true,
  };
}

/** Lazy migration for twins seeded before the sources field existed. */
export function ensureEnergySources(twin: Twin): EnergySources {
  if (!twin.resources.energy.sources) {
    twin.resources.energy.sources = defaultEnergySources();
  }
  return twin.resources.energy.sources;
}

function latestValue(twin: Twin, sensorId: string, fallback: number): number {
  for (let i = twin.readings.length - 1; i >= 0; i--) {
    if (twin.readings[i].sensorId === sensorId) return twin.readings[i].value;
  }
  return fallback;
}

/**
 * Advance the non-solar sources one tick and return total generation.
 * Called by the simulator with the solar input it just computed.
 */
export function updateEnergySources(twin: Twin, solarKw: number): { totalKw: number } {
  const s = ensureEnergySources(twin);
  const e = twin.resources.energy;

  // Biogas: feedstock-driven baseload. Digester CH4 (%, ~55 healthy) gates output.
  const ch4 = latestValue(twin, "digester:methane", 55);
  const feedstockFactor = Math.min(1, Math.max(0, (ch4 - 30) / 40)); // 30% CH4 → 0, 70% → 1
  s.biogasKw = Math.round(s.biogasCapKw * feedstockFactor * 0.9 * 100) / 100;

  // Wind: weak lowland resource — a small stochastic trickle.
  const gust = Math.max(0, Math.min(1, (s.windKw / Math.max(s.windCapKw, 0.1)) + (Math.random() - 0.5) * 0.2));
  s.windKw = Math.round(s.windCapKw * gust * 0.5 * 100) / 100;

  // Genset: last resort with hysteresis, never the first answer.
  if (!s.gensetOn && e.batterySoC <= GENSET_START_SOC) s.gensetOn = true;
  if (s.gensetOn && e.batterySoC >= GENSET_STOP_SOC) s.gensetOn = false;
  s.gensetKw = s.gensetOn ? Math.round(s.gensetCapKw * 0.75 * 100) / 100 : 0;

  const renewableKw = solarKw + s.biogasKw + s.windKw;
  const totalKw = renewableKw + s.gensetKw;
  s.renewablePct = totalKw <= 0 ? 100 : Math.round((renewableKw / totalKw) * 100);
  // Islanded design: solar + battery + biogas carry the farm; genset exists but is emergency-only.
  s.offGridCapable = true;

  return { totalKw };
}

/** Firm (weather-independent) generation the forward simulation can count on. */
export function firmGenerationKw(twin: Twin): number {
  const s = twin.resources.energy.sources;
  if (!s) return 0;
  return s.biogasKw + s.windKw * 0.5; // discount wind — it is not dependable here
}
