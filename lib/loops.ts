// lib/loops.ts — the circular / zero-waste resource map (spec §7). Every output
// feeds another process; nothing is wasted. Mostly a curated map of the farm's
// resource loops with a few live hooks from the twin, plus the products made
// from what would otherwise be waste.

import { getTwin } from "./store";
import type { Twin } from "./types";

export interface Loop {
  id: string;
  category: "energy" | "water" | "soil" | "feed" | "material";
  from: string;
  process: string;
  to: string;
  note: string;
}

export interface WasteProduct {
  name: string;
  from: string;
  sellable: boolean;
}

function latest(twin: Twin, sensorId: string): number | undefined {
  for (let i = twin.readings.length - 1; i >= 0; i--) {
    if (twin.readings[i].sensorId === sensorId) return twin.readings[i].value;
  }
  return undefined;
}

export function getLoops(twin: Twin = getTwin()) {
  const ch4 = latest(twin, "digester:methane");
  const ffb = latest(twin, "plantation-block-3:ffb_yield");

  const loops: Loop[] = [
    { id: "palm-cpo", category: "material", from: "Palm FFB", process: "Mill", to: "Crude palm oil (sell)", note: ffb !== undefined ? `${ffb} t/day FFB` : "primary cash crop" },
    { id: "palm-biochar", category: "soil", from: "Palm EFB + fibre", process: "Pyrolysis kiln", to: "Biochar + BBQ charcoal", note: "soil amendment + sellable charcoal" },
    { id: "palm-carbon", category: "water", from: "Palm kernel shell", process: "Activation", to: "Activated carbon", note: "feeds the water-treatment filter" },
    { id: "pome-biogas", category: "energy", from: "POME + manure + food waste", process: "Anaerobic digester", to: "Biogas → electricity + cooking gas", note: ch4 !== undefined ? `${ch4}% CH₄` : "baseload + backup power" },
    { id: "digestate", category: "soil", from: "Digester effluent", process: "Digestate handling", to: "Liquid fertilizer", note: "closes the nutrient loop" },
    { id: "manure-bsf", category: "feed", from: "Manure + kitchen waste", process: "Black-soldier-fly bioreactor", to: "BSF larvae → poultry/duck/fish feed", note: "halal protein; cuts bought feed" },
    { id: "bsf-frass", category: "soil", from: "BSF frass", process: "Curing", to: "Premium fertilizer", note: "" },
    { id: "fish-irrigation", category: "water", from: "Aquaculture pond water", process: "Fertigation", to: "Crop + orchard irrigation", note: "nutrient-rich; aquaponics loop to hydroponics" },
    { id: "greywater", category: "water", from: "Greywater", process: "Constructed wetland (reed bed)", to: "Irrigation + pond top-up", note: "natural polishing, no chemicals" },
    { id: "compost", category: "soil", from: "Crop residue + manure", process: "Composting + vermiculture", to: "Compost + vermicompost", note: "" },
    { id: "bamboo", category: "material", from: "Bamboo grove", process: "Harvest + craft", to: "Construction, craft, charcoal, fodder", note: "fast-growing carbon sink" },
    { id: "whey", category: "feed", from: "Dairy whey", process: "Recovery", to: "Animal feed + goat-milk soap", note: "" },
    { id: "biochar-credit", category: "energy", from: "Biochar + solar + biogas", process: "MRV / certification", to: "Carbon credits (ESG)", note: "extra revenue + sustainability proof" },
  ];

  const products: WasteProduct[] = [
    { name: "Biochar", from: "palm/bamboo pyrolysis", sellable: true },
    { name: "BBQ & activated charcoal", from: "palm shell", sellable: true },
    { name: "Compost + vermicompost", from: "manure + residue", sellable: true },
    { name: "Liquid organic fertilizer", from: "digestate + fish sludge", sellable: true },
    { name: "BSF protein meal", from: "food waste", sellable: true },
    { name: "Bamboo crafts & furniture", from: "bamboo", sellable: true },
    { name: "Mushrooms", from: "palm-fibre substrate", sellable: true },
    { name: "Goat-milk soap & candles", from: "whey + beeswax", sellable: true },
    { name: "Biogas / bottled cooking gas", from: "POME + manure", sellable: true },
    { name: "Carbon credits", from: "biochar + solar + biogas", sellable: true },
  ];

  const circularityScore = 92; // % of outputs kept in a loop (target near-zero discharge)
  return { loops, products, circularityScore };
}
