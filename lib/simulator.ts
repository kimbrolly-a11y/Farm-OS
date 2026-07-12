// lib/simulator.ts — the sensor simulator (CLAUDE.md build step 2).
// Emits realistic readings on an interval and evolves energy/water. The twin is
// mutated in place; swap this feed for real MQTT/HA when integration.simulated
// flips to false — nothing downstream changes.

import { getTwin, recomputeLoad } from "./store";
import { deriveInsights } from "./insights";
import { updateEnergySources } from "./energy";
import type { SensorReading, Twin, Vertical } from "./types";

const TICK_MS = 3000;
const MAX_HISTORY = 60; // readings kept per sensor (for sparklines)

/** Baseline + healthy band + jitter per metric. Values mean-revert to baseline. */
interface MetricModel {
  base: number;
  jitter: number; // per-tick random step
  min: number;
  max: number;
  decimals: number;
}

const METRIC_MODELS: Record<string, MetricModel> = {
  dissolved_oxygen: { base: 6.6, jitter: 0.15, min: 3.5, max: 9, decimals: 2 },
  ph: { base: 6.9, jitter: 0.04, min: 5.5, max: 8.5, decimals: 2 },
  water_temp: { base: 26.5, jitter: 0.2, min: 22, max: 32, decimals: 1 },
  ammonia: { base: 0.25, jitter: 0.03, min: 0, max: 2, decimals: 2 },
  temperature: { base: 29, jitter: 0.3, min: 22, max: 40, decimals: 1 },
  humidity: { base: 72, jitter: 1.2, min: 45, max: 95, decimals: 0 },
  ec: { base: 1.8, jitter: 0.05, min: 0.8, max: 3, decimals: 2 },
  soil_moisture: { base: 46, jitter: 0.8, min: 12, max: 85, decimals: 0 },
  soil_ec: { base: 1.2, jitter: 0.04, min: 0.4, max: 2.5, decimals: 2 },
  cold_room_temp: { base: 3.4, jitter: 0.25, min: 1, max: 12, decimals: 1 },
  methane: { base: 55, jitter: 1.0, min: 30, max: 70, decimals: 0 },
  hive_weight: { base: 42, jitter: 0.08, min: 30, max: 60, decimals: 2 },
  hive_temp: { base: 34.8, jitter: 0.15, min: 30, max: 38, decimals: 1 },
  rainfall: { base: 0, jitter: 0.4, min: 0, max: 30, decimals: 1 },
  // palm plantation
  groundwater: { base: 8.2, jitter: 0.05, min: 2, max: 12, decimals: 2 },
  canopy_temp: { base: 31, jitter: 0.3, min: 24, max: 40, decimals: 1 },
  ffb_yield: { base: 2.6, jitter: 0.08, min: 0, max: 6, decimals: 2 },
  // food processing
  retort_temp: { base: 121, jitter: 0.8, min: 20, max: 130, decimals: 1 },
  retort_pressure: { base: 205, jitter: 2, min: 100, max: 260, decimals: 0 },
  throughput: { base: 1200, jitter: 25, min: 0, max: 1800, decimals: 0 },
  chamber_temp: { base: -34, jitter: 0.6, min: -50, max: 20, decimals: 1 },
  vacuum_pressure: { base: 60, jitter: 6, min: 8, max: 1000, decimals: 0 },
  batch_moisture: { base: 7.5, jitter: 0.4, min: 2, max: 25, decimals: 1 },
  power_kw: { base: 4.5, jitter: 0.3, min: 0.5, max: 12, decimals: 1 },
  // twin-core part 2
  co2: { base: 800, jitter: 40, min: 400, max: 2000, decimals: 0 },
  water_level: { base: 65, jitter: 1, min: 5, max: 100, decimals: 0 },
  nitrate: { base: 40, jitter: 3, min: 5, max: 120, decimals: 0 },
  leaf_wetness: { base: 30, jitter: 3, min: 0, max: 100, decimals: 0 },
  freezer_temp: { base: -19, jitter: 0.4, min: -25, max: 5, decimals: 1 },
  compost_temp: { base: 58, jitter: 1, min: 20, max: 75, decimals: 0 },
  o2: { base: 18, jitter: 0.5, min: 0, max: 21, decimals: 1 },
  tank_level: { base: 55, jitter: 1, min: 5, max: 100, decimals: 0 },
  bee_activity: { base: 45, jitter: 6, min: 0, max: 200, decimals: 0 },
  // livestock expansion
  milk_yield: { base: 210, jitter: 6, min: 0, max: 400, decimals: 0 },
  rumination: { base: 480, jitter: 8, min: 300, max: 620, decimals: 0 },
  activity: { base: 65, jitter: 4, min: 0, max: 100, decimals: 0 },
};

function localHour(twin: Twin): number {
  // Asia/Kuala_Lumpur ≈ UTC+8; derive without extra deps.
  const utcH = new Date().getUTCHours() + new Date().getUTCMinutes() / 60;
  return (utcH + 8) % 24;
}

/** Solar input in kW from time-of-day and cloud cover. */
function solarInput(twin: Twin): number {
  const hour = localHour(twin);
  // daylight window ~7:00–19:00, peak near 13:00
  const daylight = Math.max(0, Math.sin(((hour - 7) / 12) * Math.PI));
  const clear = twin.resources.energy.solarArrayKw * 0.85;
  const cloudFactor = 1 - 0.8 * twin.sim.cloudCover;
  const noise = 1 + (Math.random() - 0.5) * 0.1;
  return Math.max(0, Math.round(clear * daylight * cloudFactor * noise * 100) / 100);
}

function latestValue(twin: Twin, sensorId: string, fallback: number): number {
  for (let i = twin.readings.length - 1; i >= 0; i--) {
    if (twin.readings[i].sensorId === sensorId) return twin.readings[i].value;
  }
  return fallback;
}

function step(current: number, m: MetricModel): number {
  // mean-reverting random walk toward baseline
  const revert = (m.base - current) * 0.08;
  const noise = (Math.random() - 0.5) * 2 * m.jitter;
  let next = current + revert + noise;
  next = Math.min(m.max, Math.max(m.min, next));
  return Math.round(next * 10 ** m.decimals) / 10 ** m.decimals;
}

function nextReading(twin: Twin, sensorId: string, metric: string): number | null {
  if (metric === "eggs_today") {
    const hour = localHour(twin);
    const prev = latestValue(twin, sensorId, 0);
    // lay through the morning, reset overnight
    if (hour < 5) return 0;
    if (hour > 6 && hour < 15 && Math.random() < 0.15) return prev + 1;
    return prev;
  }
  if (metric === "occupancy") {
    const prev = latestValue(twin, sensorId, 1);
    if (Math.random() < 0.03) return prev === 1 ? 0 : 1; // rare check-in/out
    return prev;
  }
  const model = METRIC_MODELS[metric];
  if (!model) return null;
  const prev = latestValue(twin, sensorId, model.base);
  return step(prev, model);
}

/** Derive each vertical's headline KPI + status from the latest readings. */
function updateVerticals(twin: Twin) {
  const val = (sensorId: string): number | undefined => {
    for (let i = twin.readings.length - 1; i >= 0; i--) {
      if (twin.readings[i].sensorId === sensorId) return twin.readings[i].value;
    }
    return undefined;
  };

  const set = (
    v: Vertical,
    label: string,
    value: number | string | undefined,
    unit: string,
    status: Vertical["status"]
  ) => {
    if (value !== undefined) v.headline = { label, value, unit };
    v.status = status;
  };

  for (const v of twin.verticals) {
    switch (v.id) {
      case "aquaponics": {
        const doVal = val("fishtank-1:dissolved_oxygen");
        const status =
          doVal === undefined ? "ok" : doVal < 4 ? "critical" : doVal < 5 ? "warning" : "ok";
        set(v, "Dissolved O₂", doVal, "mg/L", status);
        break;
      }
      case "poultry": {
        const t = val("coop-1:temperature");
        const status = t === undefined ? "ok" : t > 35 ? "critical" : t > 33 ? "warning" : "ok";
        set(v, "Coop temp", t, "°C", status);
        break;
      }
      case "restaurant": {
        const t = val("kitchen:cold_room_temp");
        const status = t === undefined ? "ok" : t > 8 ? "critical" : t > 5 ? "warning" : "ok";
        set(v, "Cold room", t, "°C", status);
        break;
      }
      case "hydroponics": {
        const ph = val("greenhouse-1:ph");
        const status = ph === undefined ? "ok" : ph < 5.5 || ph > 7 ? "warning" : "ok";
        set(v, "Nutrient pH", ph, "pH", status);
        break;
      }
      case "fruit_orchard": {
        const sm = val("orchard-block-a:soil_moisture");
        const status = sm === undefined ? "ok" : sm < 20 ? "warning" : "ok";
        set(v, "Soil moisture", sm, "%", status);
        break;
      }
      case "petting_zoo": {
        const t = val("barn-1:temperature");
        set(v, "Barn temp", t, "°C", "ok");
        break;
      }
      case "palm_oil": {
        const ffb = val("plantation-block-3:ffb_yield");
        const soil = val("plantation-block-1:soil_moisture");
        const status = soil === undefined ? "ok" : soil < 25 ? "warning" : "ok";
        set(v, "FFB yield", ffb, " t/day", status);
        break;
      }
      case "food_processing": {
        const cph = val("canning-line:throughput");
        const chamber = val("freeze-dryer:chamber_temp");
        // freeze-dryer chamber warming above -10°C puts the batch at risk
        const status =
          chamber === undefined ? "ok" : chamber > -10 ? "warning" : "ok";
        set(v, "Line throughput", cph, " cans/hr", status);
        break;
      }
      case "dairy_cattle": {
        const milk = val("cattle-barn:milk_yield");
        const rum = val("cattle-barn:rumination");
        const status = rum === undefined ? "ok" : rum < 380 ? "warning" : "ok";
        set(v, "Milk yield", milk, " L/day", status);
        break;
      }
      case "dairy_goats": {
        const milk = val("goat-barn:milk_yield");
        set(v, "Milk yield", milk, " L/day", "ok");
        break;
      }
      case "sheep": {
        const act = val("pasture-a:activity");
        set(v, "Flock activity", act, " idx", "ok");
        break;
      }
      case "ducks": {
        const eggs = val("duck-house:eggs_today");
        set(v, "Eggs today", eggs, "", "ok");
        break;
      }
      case "rabbits": {
        const t = val("rabbitry:temperature");
        const status = t === undefined ? "ok" : t > 30 ? "warning" : "ok";
        set(v, "Rabbitry temp", t, "°C", status);
        break;
      }
      case "horses": {
        const t = val("stables:temperature");
        set(v, "Stable temp", t, "°C", "ok");
        break;
      }
      case "aquaculture": {
        const doVal = val("pond-1:dissolved_oxygen");
        const status =
          doVal === undefined ? "ok" : doVal < 4 ? "critical" : doVal < 5 ? "warning" : "ok";
        set(v, "Pond O₂", doVal, " mg/L", status);
        break;
      }
      case "recycling": {
        const ch4 = val("digester:methane");
        set(v, "Biogas CH₄", ch4, "%", "ok");
        break;
      }
      case "beekeeping": {
        const w = val("apiary-1:hive_weight");
        set(v, "Hive weight", w, "kg", "ok");
        break;
      }
      case "lodging": {
        const occ = val("cabin-1:occupancy");
        set(v, "Cabin 1", occ === undefined ? undefined : occ ? "Occupied" : "Vacant", "", "ok");
        break;
      }
      default:
        v.status = "ok";
    }
  }
}

/** Advance the whole twin one tick. Safe to call manually or on an interval. */
export function tickOnce(twin: Twin = getTwin()): void {
  const now = new Date().toISOString();

  // 1. sensor readings
  for (const s of twin.sensors) {
    const value = nextReading(twin, s.id, s.metric);
    if (value === null) continue;
    const r: SensorReading = {
      id: `${s.id}@${twin.sim.tickCount}`,
      sensorId: s.id,
      verticalId: s.verticalId,
      zoneId: s.zoneId,
      metric: s.metric,
      value,
      unit: s.unit,
      timestamp: now,
    };
    twin.readings.push(r);
  }
  // bound history per sensor
  if (twin.readings.length > MAX_HISTORY * twin.sensors.length) {
    twin.readings.splice(0, twin.readings.length - MAX_HISTORY * twin.sensors.length);
  }

  // 2. energy: solar + biogas + wind (+ emergency genset), battery integrates (gen - load)
  const solar = solarInput(twin);
  twin.resources.energy.solarInputKw = solar;
  const { totalKw: generationKw } = updateEnergySources(twin, solar);
  const loadKw = recomputeLoad(twin);
  const netKw = generationKw - loadKw;
  const dSoC = (netKw * (TICK_MS / 3600000) / twin.resources.energy.batteryCapacityKwh) * 100;
  twin.resources.energy.batterySoC = Math.min(
    100,
    Math.max(0, Math.round((twin.resources.energy.batterySoC + dSoC) * 100) / 100)
  );

  // 3. water: tanks drift down with slow usage; rain refills the rain tank
  const rain = latestValue(twin, "plantation-block-1:rainfall", 0);
  for (const tank of twin.resources.water.tanks) {
    let level = tank.levelPct - 0.05; // steady draw
    if (tank.id.includes("rain") && rain > 1) level += rain * 0.1;
    tank.levelPct = Math.min(100, Math.max(0, Math.round(level * 10) / 10));
  }

  // 4. derived KPIs + statuses + AI insight signals
  updateVerticals(twin);
  deriveInsights(twin);

  twin.sim.tickCount += 1;
  twin.sim.lastTickAt = now;
}

declare global {
  // eslint-disable-next-line no-var
  var __FARMOS_SIM__: NodeJS.Timeout | undefined;
}

/** Start the interval once per server process (idempotent, hot-reload safe). */
export function startSimulator(): void {
  if (globalThis.__FARMOS_SIM__) return;
  const twin = getTwin();
  tickOnce(twin); // seed first readings immediately
  globalThis.__FARMOS_SIM__ = setInterval(() => {
    try {
      tickOnce(getTwin());
    } catch (e) {
      console.error("[simulator] tick failed", e);
    }
  }, TICK_MS);
  console.log("[simulator] started @", TICK_MS, "ms");
}
