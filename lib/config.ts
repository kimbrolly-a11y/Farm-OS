// lib/config.ts — parse farm.config.yaml into a seeded digital twin.
// Server-only (uses fs). The same parser will drive a real farm when
// integration.simulated flips to false; only the readings source changes.

import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type {
  Asset,
  Criticality,
  LoadShedding,
  Resources,
  SensorSpec,
  Twin,
  Vertical,
  WaterTank,
  Zone,
} from "./types";

/** Simulated electrical draw per asset type, in watts. */
const POWER_DRAW: Record<string, number> = {
  fan: 150,
  incubator: 300,
  aerator: 120,
  pump: 250,
  fish_feeder: 20,
  feeder: 30,
  coop_door: 15,
  dosing_pump: 40,
  grow_light: 600,
  robot: 200,
  irrigation_valve: 25,
  hvac: 1500,
  water_heater: 2000,
  cold_storage: 900,
  water_valve: 20,
  weather_station: 5,
  digester: 50,
  bioconversion: 10,
};

function drawFor(type: string): number {
  return POWER_DRAW[type] ?? 100;
}

interface RawConfig {
  farm: {
    name: string;
    area_acres: number;
    location: { country: string; lat: number; lon: number; timezone: string };
  };
  integration: { simulated: boolean };
  resources: {
    energy: {
      solar_array_kw: number;
      battery: { capacity_kwh: number; soc_pct: number };
    };
    water: {
      tanks: Array<{
        id: string;
        product?: string;
        protocol?: string;
        ha_entity?: string;
        capacity_l: number;
        level_pct: number;
      }>;
      well: { status?: string };
    };
  };
  verticals: Array<{
    id: string;
    name: string;
    zones: Array<{
      id: string;
      assets: Array<{
        id: string;
        type: string;
        criticality: Criticality;
        hardware?: string;
        protocol?: string;
        ha_entity?: string;
      }>;
      sensors: Array<{
        metric: string;
        unit: string;
        product?: string;
        protocol?: string;
        ha_entity?: string;
      }>;
    }>;
  }>;
  load_shedding: {
    shed_first: string[];
    shed_next: string[];
    never_shed: string[];
  };
}

export function configPath(): string {
  return path.join(process.cwd(), "farm.config.yaml");
}

export function loadRawConfig(file = configPath()): RawConfig {
  const text = fs.readFileSync(file, "utf8");
  return YAML.parse(text) as RawConfig;
}

/** Build a fresh Twin from a config file. */
export function seedTwin(file = configPath()): Twin {
  const cfg = loadRawConfig(file);
  const now = new Date().toISOString();

  const verticals: Vertical[] = [];
  const zones: Zone[] = [];
  const assets: Asset[] = [];
  const sensors: SensorSpec[] = [];

  for (const v of cfg.verticals) {
    const zoneIds: string[] = [];
    for (const z of v.zones ?? []) {
      const assetIds: string[] = [];
      const sensorIds: string[] = [];

      for (const a of z.assets ?? []) {
        assets.push({
          id: a.id,
          verticalId: v.id,
          zoneId: z.id,
          type: a.type,
          criticality: a.criticality,
          hardware: a.hardware,
          protocol: a.protocol,
          haEntity: a.ha_entity,
          powerDraw: drawFor(a.type),
          state: "on",
        });
        assetIds.push(a.id);
      }

      for (const s of z.sensors ?? []) {
        const sensorId = `${z.id}:${s.metric}`;
        sensors.push({
          id: sensorId,
          verticalId: v.id,
          zoneId: z.id,
          metric: s.metric,
          unit: s.unit,
          product: s.product,
          protocol: s.protocol,
          haEntity: s.ha_entity,
        });
        sensorIds.push(sensorId);
      }

      zones.push({
        id: z.id,
        verticalId: v.id,
        name: z.id,
        assetIds,
        sensorIds,
      });
      zoneIds.push(z.id);
    }

    verticals.push({
      id: v.id,
      name: v.name,
      status: "ok",
      zoneIds,
      kpis: {},
    });
  }

  const tanks: WaterTank[] = (cfg.resources.water.tanks ?? []).map((t) => ({
    id: t.id,
    product: t.product,
    protocol: t.protocol,
    haEntity: t.ha_entity,
    capacityL: t.capacity_l,
    levelPct: t.level_pct,
  }));

  const loadKw =
    assets
      .filter((a) => a.state === "on")
      .reduce((sum, a) => sum + a.powerDraw, 0) / 1000;

  const resources: Resources = {
    energy: {
      solarArrayKw: cfg.resources.energy.solar_array_kw,
      solarInputKw: 0,
      batteryCapacityKwh: cfg.resources.energy.battery.capacity_kwh,
      batterySoC: cfg.resources.energy.battery.soc_pct,
      loadKw,
    },
    water: {
      tanks,
      wellStatus:
        (cfg.resources.water.well?.status as "idle" | "running") ?? "idle",
    },
  };

  const loadShedding: LoadShedding = {
    shedFirst: cfg.load_shedding.shed_first,
    shedNext: cfg.load_shedding.shed_next,
    neverShed: cfg.load_shedding.never_shed,
  };

  return {
    farm: {
      name: cfg.farm.name,
      areaAcres: cfg.farm.area_acres,
      location: cfg.farm.location,
    },
    online: true,
    simulated: cfg.integration.simulated,
    resources,
    verticals,
    zones,
    assets,
    sensors,
    readings: [],
    actions: [],
    alerts: [],
    tasks: [],
    loadShedding,
    lastSeededAt: now,
  };
}
