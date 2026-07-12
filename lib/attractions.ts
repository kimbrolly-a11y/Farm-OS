// lib/attractions.ts — the "Verdant World" attraction layer (spec §8).
// Breadth over depth: the full funworld roster with live-ish ticketing derived
// from guests on site. Safety-critical activities are explicitly human-staffed
// (spec §9 — the AI runs the farm; lifeguards and range marshals are people).

import { getHospitality } from "./hospitality";
import type { Twin } from "./types";

export interface Attraction {
  id: string;
  name: string;
  category: "Farm & Animals" | "Water & Adventure" | "Learning & Craft" | "Events & Seasonal";
  priceRm: number;
  status: "open" | "staffed-hours" | "seasonal" | "phase-4";
  humanStaffed: boolean;
  note?: string;
}

export interface AttractionsReport {
  attractions: Attraction[];
  categories: string[];
  ticketsToday: number;
  ticketRevenueToday: number;
  currency: string;
}

const ROSTER: Attraction[] = [
  // Farm & Animals
  { id: "farm-tour", name: "Buggy farm tour", category: "Farm & Animals", priceRm: 35, status: "open", humanStaffed: false, note: "self-guided AR route or guided buggy" },
  { id: "petting-zoo", name: "Petting zoo & animal encounters", category: "Farm & Animals", priceRm: 25, status: "open", humanStaffed: true, note: "milking, egg-collecting, feed-the-animals" },
  { id: "pony", name: "Horse & pony rides", category: "Farm & Animals", priceRm: 45, status: "staffed-hours", humanStaffed: true },
  { id: "adopt", name: "Adopt-an-animal", category: "Farm & Animals", priceRm: 120, status: "open", humanStaffed: false, note: "track your animal in the guest app" },
  { id: "picking", name: "Fruit & mushroom picking", category: "Farm & Animals", priceRm: 30, status: "seasonal", humanStaffed: false, note: "durian season books out" },
  // Water & Adventure
  { id: "fishing", name: "Fishing & prawning ponds", category: "Water & Adventure", priceRm: 40, status: "open", humanStaffed: false },
  { id: "canoe", name: "Lake canoeing & SUP", category: "Water & Adventure", priceRm: 35, status: "staffed-hours", humanStaffed: true },
  { id: "waterpark", name: "Mini waterpark · lazy river · natural pool", category: "Water & Adventure", priceRm: 55, status: "phase-4", humanStaffed: true, note: "plant-filtered natural swimming-pond tech" },
  { id: "atv", name: "ATV trail", category: "Water & Adventure", priceRm: 80, status: "staffed-hours", humanStaffed: true },
  { id: "archery", name: "Archery & pellet range", category: "Water & Adventure", priceRm: 45, status: "staffed-hours", humanStaffed: true, note: "range marshal required" },
  { id: "zipline", name: "Canopy walk · zip-line · high ropes", category: "Water & Adventure", priceRm: 95, status: "phase-4", humanStaffed: true },
  // Learning & Craft
  { id: "discovery", name: "Sustainability discovery center", category: "Learning & Craft", priceRm: 15, status: "open", humanStaffed: false, note: "walk the circular loops — ESG education" },
  { id: "workshops", name: "Craft workshops", category: "Learning & Craft", priceRm: 65, status: "staffed-hours", humanStaffed: true, note: "cheese, soap, charcoal, beekeeping, batik" },
  { id: "cooking", name: "Chef's table & cooking class", category: "Learning & Craft", priceRm: 150, status: "staffed-hours", humanStaffed: true, note: "farm-to-table, harvest-to-plate" },
  { id: "farm-school", name: "Kids' farm school + junior-farmer badge", category: "Learning & Craft", priceRm: 50, status: "open", humanStaffed: true },
  // Events & Seasonal
  { id: "weddings", name: "Weddings & events venue", category: "Events & Seasonal", priceRm: 8000, status: "open", humanStaffed: true, note: "150–300 pax · lawn + hall" },
  { id: "camps", name: "Corporate retreats & church camps", category: "Events & Seasonal", priceRm: 4500, status: "open", humanStaffed: true },
  { id: "night", name: "Night safari · firefly walk · stargazing", category: "Events & Seasonal", priceRm: 40, status: "staffed-hours", humanStaffed: true },
  { id: "cinema", name: "Outdoor cinema & bonfire", category: "Events & Seasonal", priceRm: 20, status: "seasonal", humanStaffed: false },
];

export function getAttractions(twin: Twin): AttractionsReport {
  const guests = getHospitality(twin).guestsOnSite;
  // each guest buys ~1.4 tickets/day at an average RM 42
  const ticketsToday = Math.round(guests * 1.4);
  const ticketRevenueToday = Math.round(ticketsToday * 42);

  return {
    attractions: ROSTER,
    categories: ["Farm & Animals", "Water & Adventure", "Learning & Craft", "Events & Seasonal"],
    ticketsToday,
    ticketRevenueToday,
    currency: "RM",
  };
}
