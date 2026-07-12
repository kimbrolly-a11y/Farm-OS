// lib/water.ts — the off-grid water system (spec §6).
// Sources: rainwater harvesting (roof catchment) + solar-pumped well +
// greywater recycling through a constructed wetland. Potable treatment is
// multi-barrier and natural — sediment → biosand → farm-made activated carbon
// (palm-kernel-shell biochar) → solar UV-C — minimal/no chlorine.
// A shortage priority ladder (potable → animals → kitchen → hydro/aqua →
// irrigation → pool) mirrors the energy load-shedding ladder; the top two
// rungs are life-support and never cut.

import type { Twin, WaterTank } from "./types";

export interface TreatmentStage {
  id: string;
  name: string;
  detail: string;
  /** live metric shown on the stage card, if any */
  reading?: { label: string; value: number; unit: string };
  ok: boolean;
  /** twin asset backing this stage (for protected/live state) */
  assetId?: string;
}

export interface LadderRung {
  rank: number;
  use: string;
  detail: string;
  status: "supplied" | "reduce" | "cut";
  protected: boolean;
}

export interface WaterReport {
  sources: Array<{
    id: string;
    name: string;
    detail: string;
    stat: { label: string; value: number | string; unit: string };
    renewable: boolean;
  }>;
  treatment: {
    stages: TreatmentStage[];
    potableOk: boolean;
    flowLpm: number;
    turbidityNtu: number;
    uvDose: number;
    note: string;
  };
  tanks: WaterTank[];
  storagePct: number;
  ladder: LadderRung[];
  /** share of non-potable demand met by recycled (grey/pond) water, % */
  reusePct: number;
}

function latest(twin: Twin, sensorId: string, fallback: number): number {
  for (let i = twin.readings.length - 1; i >= 0; i--) {
    if (twin.readings[i].sensorId === sensorId) return twin.readings[i].value;
  }
  return fallback;
}

function assetOn(twin: Twin, id: string): boolean {
  return twin.assets.find((a) => a.id === id)?.state === "on";
}

export function getWaterReport(twin: Twin): WaterReport {
  const rainMm = latest(twin, "plantation-block-1:rainfall", 0);
  const turbidity = latest(twin, "water-plant:turbidity", 0.6);
  const flow = latest(twin, "water-plant:flow", 36);
  const uvDose = latest(twin, "water-plant:uv_dose", 44);
  const wellRunning = twin.resources.water.wellStatus === "running" || assetOn(twin, "well_pump");

  const tanks = twin.resources.water.tanks;
  const storagePct = tanks.length
    ? Math.round(tanks.reduce((s, t) => s + t.levelPct, 0) / tanks.length)
    : 0;

  // ~1200 m² of hotel/bungalow/barn roof catchment: 1 mm rain ≈ 1.2 kL harvested
  const rainHarvestKl = Math.round(rainMm * 1.2 * 10) / 10;
  const greywaterKl = 8.5; // steady design flow through the constructed wetland

  const uvOk = assetOn(twin, "uv_sterilizer") && uvDose >= 30;
  const biosandOk = assetOn(twin, "biosand_filter") && turbidity < 5;
  const carbonOk = assetOn(twin, "carbon_filter");
  const potableOk = uvOk && biosandOk && carbonOk;

  const stages: TreatmentStage[] = [
    {
      id: "sediment",
      name: "Sediment pre-filter",
      detail: "First-flush diverter + roughing filter",
      ok: true,
    },
    {
      id: "biosand",
      name: "Biosand filter",
      detail: "Slow-sand biological layer — pathogen removal, no chemicals",
      reading: { label: "Turbidity out", value: turbidity, unit: "NTU" },
      ok: biosandOk,
      assetId: "biosand_filter",
    },
    {
      id: "carbon",
      name: "Activated carbon",
      detail: "Farm-made from palm-kernel-shell biochar (circular loop)",
      ok: carbonOk,
      assetId: "carbon_filter",
    },
    {
      id: "uv",
      name: "Solar UV-C",
      detail: "Chemical-free primary disinfection",
      reading: { label: "UV dose", value: uvDose, unit: "mJ/cm²" },
      ok: uvOk,
      assetId: "uv_sterilizer",
    },
  ];

  // Shortage ladder — statuses derive from average storage.
  const cutBelow = (threshold: number): "supplied" | "reduce" | "cut" =>
    storagePct >= threshold ? "supplied" : storagePct >= threshold - 15 ? "reduce" : "cut";
  const ladder: LadderRung[] = [
    { rank: 1, use: "Potable (people)", detail: "Treated drinking water — guests + staff", status: "supplied", protected: true },
    { rank: 2, use: "Animals (drinking)", detail: "All livestock waterers — life support", status: "supplied", protected: true },
    { rank: 3, use: "Kitchen & food processing", detail: "Restaurant, canning, dairy CIP", status: cutBelow(15), protected: false },
    { rank: 4, use: "Hydro / aquaponics", detail: "Recirculating — low draw", status: cutBelow(25), protected: false },
    { rank: 5, use: "Orchard & palm irrigation", detail: "Pond + greywater first; mains cut early", status: cutBelow(40), protected: false },
    { rank: 6, use: "Pool / waterpark top-up", detail: "Recirculate only — first to cut", status: cutBelow(55), protected: false },
  ];

  return {
    sources: [
      {
        id: "rain",
        name: "Rainwater harvesting",
        detail: "Hotel + barn roof catchment → first-flush → poly tanks",
        stat: { label: "Harvest today", value: rainHarvestKl, unit: "kL" },
        renewable: true,
      },
      {
        id: "well",
        name: "Borehole well",
        detail: "Grundfos SQFlex solar pump — energy-free daylight pumping",
        stat: { label: "Pump", value: wellRunning ? "running" : "idle", unit: "" },
        renewable: true,
      },
      {
        id: "greywater",
        name: "Greywater recycling",
        detail: "Constructed wetland / reed beds → irrigation + pond top-up",
        stat: { label: "Reclaimed", value: greywaterKl, unit: "kL/day" },
        renewable: true,
      },
    ],
    treatment: {
      stages,
      potableOk,
      flowLpm: flow,
      turbidityNtu: turbidity,
      uvDose,
      note: "Multi-barrier natural treatment — minimal/no chlorine. Carbon media is made on-farm from palm-kernel shells.",
    },
    tanks,
    storagePct,
    ladder,
    reusePct: 38, // greywater + pond share of non-potable demand (design figure)
  };
}
