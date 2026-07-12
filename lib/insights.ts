// lib/insights.ts — AI/computer-vision-derived monitoring signals per vertical.
// In the real farm these come from edge-AI (disease-detection CV, animal-health
// scoring, ripeness vision, water-quality models). Here they're derived
// deterministically from the live sensor twin so the agent can reason over them.

import type { AiInsight, Twin } from "./types";

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}
function level(good: boolean, watch: boolean): AiInsight["level"] {
  return good ? "good" : watch ? "watch" : "risk";
}

export function deriveInsights(twin: Twin): void {
  const val = (sensorId: string): number | undefined => {
    for (let i = twin.readings.length - 1; i >= 0; i--) {
      if (twin.readings[i].sensorId === sensorId) return twin.readings[i].value;
    }
    return undefined;
  };
  const mk = (
    key: string,
    label: string,
    value: number,
    unit: string,
    goodAbove?: number,
    watchAbove?: number,
    invert = false
  ): AiInsight => {
    const v = Math.round(value);
    let lv: AiInsight["level"] = "good";
    if (goodAbove !== undefined && watchAbove !== undefined) {
      lv = invert
        ? level(v <= goodAbove, v <= watchAbove)
        : level(v >= goodAbove, v >= watchAbove);
    }
    return { key, label, value: v, unit, level: lv };
  };

  for (const vert of twin.verticals) {
    const out: AiInsight[] = [];
    switch (vert.id) {
      case "poultry": {
        const t = val("coop-1:temperature") ?? 29;
        const nh3 = val("coop-1:ammonia") ?? 0.25;
        const co2 = val("coop-1:co2") ?? 800;
        const health = clamp(100 - Math.max(0, (t - 31) * 8) - Math.max(0, (nh3 - 12) * 4) - Math.max(0, (co2 - 1500) / 30));
        out.push(mk("flock_health", "Flock health (CV)", health, "/100", 80, 60));
        out.push(mk("disease_risk", "Respiratory risk", clamp((nh3 - 8) * 6 + (co2 - 1000) / 40), "%", 20, 40, true));
        break;
      }
      case "aquaponics": {
        const dov = val("fishtank-1:dissolved_oxygen") ?? 6.5;
        const ph = val("fishtank-1:ph") ?? 6.9;
        const nh3 = val("fishtank-1:ammonia") ?? 0.25;
        const wq = clamp(100 - Math.max(0, (5.5 - dov) * 18) - Math.abs(ph - 7) * 12 - Math.max(0, (nh3 - 0.5) * 40));
        out.push(mk("water_quality", "Water-quality index", wq, "/100", 80, 60));
        break;
      }
      case "hydroponics": {
        const ph = val("greenhouse-1:ph") ?? 6;
        const ec = val("greenhouse-1:ec") ?? 1.8;
        const vigor = clamp(100 - Math.abs(ph - 6) * 25 - Math.abs(ec - 1.8) * 20);
        out.push(mk("crop_vigor", "Crop vigor (CV)", vigor, "/100", 80, 60));
        break;
      }
      case "fruit_orchard": {
        const leaf = val("orchard-block-b:leaf_wetness") ?? 30;
        const sm = val("orchard-block-a:soil_moisture") ?? 45;
        out.push(mk("fungal_risk", "Fungal disease risk", clamp(leaf * 0.9), "%", 40, 65, true));
        out.push(mk("water_stress", "Water stress", clamp(60 - sm), "%", 25, 45, true));
        break;
      }
      case "palm_oil": {
        const ffb = val("plantation-block-3:ffb_yield") ?? 2.5;
        const sm = val("plantation-block-1:soil_moisture") ?? 45;
        out.push(mk("ripeness", "FFB ripeness (vision)", clamp(55 + ffb * 12), "%", 70, 50));
        out.push(mk("canopy_stress", "Canopy water stress", clamp(55 - sm), "%", 25, 45, true));
        break;
      }
      case "restaurant": {
        const cold = val("kitchen:cold_room_temp") ?? 3.5;
        const frz = val("prep-line:freezer_temp") ?? -19;
        out.push(mk("cold_chain", "Cold-chain integrity", clamp(100 - Math.max(0, (cold - 5) * 15) - Math.max(0, (frz + 15) * 6)), "/100", 85, 60));
        break;
      }
      case "food_processing": {
        const chamber = val("freeze-dryer:chamber_temp") ?? -34;
        const moist = val("freeze-dryer:batch_moisture") ?? 7;
        out.push(mk("batch_integrity", "Freeze-dry batch integrity", clamp(100 - Math.max(0, (chamber + 20) * 4) - Math.max(0, (moist - 10) * 5)), "/100", 85, 60));
        break;
      }
      case "petting_zoo": {
        const t = val("barn-1:temperature") ?? 29;
        out.push(mk("animal_comfort", "Animal comfort (CV)", clamp(100 - Math.max(0, (t - 32) * 10)), "/100", 80, 60));
        break;
      }
      case "beekeeping": {
        const act = val("apiary-2:bee_activity") ?? 45;
        const w = val("apiary-1:hive_weight") ?? 42;
        out.push(mk("colony_health", "Colony health", clamp(50 + act * 0.4 + (w - 40) * 3), "/100", 75, 55));
        break;
      }
      case "recycling": {
        const ch4 = val("digester:methane") ?? 55;
        out.push(mk("digester_health", "Digester efficiency", clamp(ch4 * 1.4), "/100", 75, 55));
        break;
      }
      case "lodging": {
        const t = val("cabin-2:temperature") ?? 26;
        out.push(mk("guest_comfort", "Guest comfort index", clamp(100 - Math.abs(t - 24) * 8), "/100", 80, 60));
        break;
      }
      case "dairy_cattle": {
        const rum = val("cattle-barn:rumination") ?? 480;
        const t = val("cattle-barn:temperature") ?? 29;
        out.push(mk("herd_health", "Herd health (collar+CV)", clamp((rum - 300) / 3 - Math.max(0, (t - 30) * 6)), "/100", 80, 60));
        break;
      }
      case "dairy_goats": {
        const a = val("goat-barn:activity") ?? 65;
        out.push(mk("herd_health", "Herd health", clamp(40 + a * 0.8), "/100", 80, 60));
        break;
      }
      case "sheep": {
        const a = val("pasture-a:activity") ?? 65;
        out.push(mk("flock_wellbeing", "Flock wellbeing", clamp(40 + a * 0.8), "/100", 80, 60));
        break;
      }
      case "ducks": {
        const t = val("duck-house:temperature") ?? 29;
        out.push(mk("flock_health", "Flock health", clamp(100 - Math.max(0, (t - 32) * 9)), "/100", 80, 60));
        break;
      }
      case "rabbits": {
        const t = val("rabbitry:temperature") ?? 28;
        const h = val("rabbitry:humidity") ?? 70;
        out.push(mk("comfort", "Rabbitry comfort", clamp(100 - Math.max(0, (t - 29) * 10) - Math.max(0, (h - 75) * 1.5)), "/100", 80, 60));
        break;
      }
      case "horses": {
        const t = val("stables:temperature") ?? 29;
        out.push(mk("welfare", "Equine welfare", clamp(100 - Math.max(0, (t - 32) * 9)), "/100", 80, 60));
        break;
      }
      case "aquaculture": {
        const dov = val("pond-1:dissolved_oxygen") ?? 6.5;
        const nh3 = val("pond-1:ammonia") ?? 0.25;
        out.push(mk("water_quality", "Pond water quality", clamp(100 - Math.max(0, (5.5 - dov) * 18) - Math.max(0, (nh3 - 0.5) * 40)), "/100", 80, 60));
        break;
      }
      default:
        break;
    }
    vert.insights = out;
  }
}
