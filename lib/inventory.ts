// lib/inventory.ts — production, inventory & farm-to-table traceability.
// Stock levels per product (some driven live by production sensors), plus
// production batches with lineage + HACCP food-safety checks. This closes the
// traceability/compliance gap that fragmented point-tools leave open.

import { getTwin } from "./store";
import type { Twin } from "./types";

export interface StockItem {
  id: string;
  verticalId: string;
  verticalName: string;
  product: string;
  qty: number;
  unit: string;
  category: "fresh" | "processed" | "input";
  status: "ok" | "low" | "expiring";
}

export interface Batch {
  id: string;
  product: string;
  verticalId: string;
  verticalName: string;
  qty: number;
  unit: string;
  lineage: string[];
  haccp: { check: string; ok: boolean }[];
  status: "complete" | "in_progress";
  date: string;
}

function latest(twin: Twin, sensorId: string): number {
  for (let i = twin.readings.length - 1; i >= 0; i--) {
    if (twin.readings[i].sensorId === sensorId) return twin.readings[i].value;
  }
  return 0;
}

export function getInventory(twin: Twin = getTwin()): {
  items: StockItem[];
  batches: Batch[];
  summary: { fresh: number; processed: number; inputsLow: number };
} {
  const name = (id: string) => twin.verticals.find((v) => v.id === id)?.name ?? id;

  const eggs = Math.round(300 + latest(twin, "coop-1:eggs_today"));
  const ffb = Math.round((4 + latest(twin, "plantation-block-3:ffb_yield")) * 10) / 10;
  const cans = Math.round(1000 + latest(twin, "canning-line:throughput"));

  const items: StockItem[] = [
    { id: "s-eggs", verticalId: "poultry", verticalName: name("poultry"), product: "Fresh eggs", qty: eggs, unit: "eggs", category: "fresh", status: "ok" },
    { id: "s-broiler", verticalId: "poultry", verticalName: name("poultry"), product: "Broiler birds", qty: 45, unit: "birds", category: "fresh", status: "ok" },
    { id: "s-tilapia", verticalId: "aquaponics", verticalName: name("aquaponics"), product: "Tilapia", qty: 180, unit: "kg", category: "fresh", status: "ok" },
    { id: "s-greens", verticalId: "aquaponics", verticalName: name("aquaponics"), product: "Water spinach", qty: 38, unit: "kg", category: "fresh", status: "ok" },
    { id: "s-lettuce", verticalId: "hydroponics", verticalName: name("hydroponics"), product: "Lettuce", qty: 120, unit: "heads", category: "fresh", status: "ok" },
    { id: "s-basil", verticalId: "hydroponics", verticalName: name("hydroponics"), product: "Basil", qty: 12, unit: "kg", category: "fresh", status: "expiring" },
    { id: "s-mango", verticalId: "fruit_orchard", verticalName: name("fruit_orchard"), product: "Mango", qty: 210, unit: "kg", category: "fresh", status: "ok" },
    { id: "s-ffb", verticalId: "palm_oil", verticalName: name("palm_oil"), product: "Fresh fruit bunches", qty: ffb, unit: "t", category: "fresh", status: "ok" },
    { id: "s-cpo", verticalId: "palm_oil", verticalName: name("palm_oil"), product: "Crude palm oil", qty: 1.1, unit: "t", category: "processed", status: "ok" },
    { id: "s-cans", verticalId: "food_processing", verticalName: name("food_processing"), product: "Canned goods", qty: cans, unit: "units", category: "processed", status: "ok" },
    { id: "s-fd", verticalId: "food_processing", verticalName: name("food_processing"), product: "Freeze-dried packs", qty: 380, unit: "packs", category: "processed", status: "ok" },
    { id: "s-honey", verticalId: "beekeeping", verticalName: name("beekeeping"), product: "Honey", qty: 62, unit: "kg", category: "processed", status: "ok" },
    { id: "s-compost", verticalId: "recycling", verticalName: name("recycling"), product: "Compost", qty: 1.4, unit: "t", category: "processed", status: "ok" },
    { id: "s-chickfeed", verticalId: "poultry", verticalName: name("poultry"), product: "Chicken feed", qty: 90, unit: "kg", category: "input", status: "low" },
    { id: "s-fishfeed", verticalId: "aquaponics", verticalName: name("aquaponics"), product: "Fish feed", qty: 120, unit: "kg", category: "input", status: "ok" },
    { id: "s-nutrient", verticalId: "hydroponics", verticalName: name("hydroponics"), product: "Nutrient solution", qty: 45, unit: "L", category: "input", status: "low" },
  ];

  const batches: Batch[] = [
    {
      id: "FD-0142",
      product: "Freeze-dried mango",
      verticalId: "food_processing",
      verticalName: name("food_processing"),
      qty: 240,
      unit: "packs",
      lineage: ["Orchard Block A — mango", "Prep kitchen — sliced", "Freeze-dryer 1 — 34h cycle", "Vacuum-sealed → packs"],
      haccp: [
        { check: "Chamber temp ≤ −30°C held", ok: true },
        { check: "Final moisture < 10%", ok: true },
        { check: "Seal integrity verified", ok: true },
      ],
      status: "complete",
      date: "2026-07-11",
    },
    {
      id: "CN-0311",
      product: "Canned pineapple",
      verticalId: "food_processing",
      verticalName: name("food_processing"),
      qty: 620,
      unit: "cans",
      lineage: ["Orchard — pineapple", "Prep line — cored", "Retort 1 — 121°C / 15 min", "Seamer → labelled"],
      haccp: [
        { check: "Retort 121°C for 15 min", ok: true },
        { check: "Seam integrity (double-seam)", ok: true },
        { check: "Cool-down < 40°C", ok: false },
      ],
      status: "in_progress",
      date: "2026-07-12",
    },
    {
      id: "AQ-0088",
      product: "Tilapia harvest",
      verticalId: "aquaponics",
      verticalName: name("aquaponics"),
      qty: 45,
      unit: "kg",
      lineage: ["Fish tank 1 — harvested", "Cold room 1 — chilled 0–4°C", "Restaurant / market"],
      haccp: [
        { check: "Cold chain 0–4°C maintained", ok: true },
        { check: "Water quality at harvest OK", ok: true },
      ],
      status: "complete",
      date: "2026-07-12",
    },
  ];

  const summary = {
    fresh: items.filter((i) => i.category === "fresh").length,
    processed: items.filter((i) => i.category === "processed").length,
    inputsLow: items.filter((i) => i.category === "input" && i.status === "low").length,
  };

  return { items, batches, summary };
}
