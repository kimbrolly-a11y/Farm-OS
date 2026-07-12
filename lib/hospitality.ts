// lib/hospitality.ts — lodging at resort scale (spec §8, phase 3) + a bookings
// stub. Live occupancy comes from the twin's booking-sync sensors (Beds24-class
// in the hardware map); the hotel opens in phases so the demo shows a real
// growth story: 20 of 60 rooms open today, bungalows under construction.

import type { Twin } from "./types";

export interface LodgingTier {
  id: string;
  name: string;
  unitsDesign: number;
  unitsOpen: number;
  occupied: number;
  ratePerNight: number; // RM
  phase: string;
}

export interface Booking {
  id: string;
  guest: string;
  party: number;
  tier: string;
  nights: number;
  checkIn: string; // ISO date
  status: "arriving-today" | "in-house" | "upcoming" | "enquiry";
  note?: string;
}

export interface HospitalityReport {
  tiers: LodgingTier[];
  occupancyPct: number;
  guestsOnSite: number;
  revenueTonight: number;
  currency: string;
  bookings: Booking[];
}

function latest(twin: Twin, sensorId: string, fallback = 0): number {
  for (let i = twin.readings.length - 1; i >= 0; i--) {
    if (twin.readings[i].sensorId === sensorId) return twin.readings[i].value;
  }
  return fallback;
}

function iso(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

export function getHospitality(twin: Twin): HospitalityReport {
  const hotelOcc = Math.round(latest(twin, "hotel-block-a:occupancy_count", 13));
  const glampOcc = Math.round(latest(twin, "glamping-grove:occupancy_count", 5));
  const cabinOcc =
    (latest(twin, "cabin-1:occupancy") ? 1 : 0) + (latest(twin, "cabin-2:occupancy") ? 1 : 0);

  const tiers: LodgingTier[] = [
    {
      id: "hotel",
      name: "Hotel — Block A",
      unitsDesign: 60,
      unitsOpen: 20,
      occupied: hotelOcc,
      ratePerNight: 320,
      phase: "block A open · blocks B–C phase 3",
    },
    {
      id: "bungalows",
      name: "Garden bungalows",
      unitsDesign: 12,
      unitsOpen: 0,
      occupied: 0,
      ratePerNight: 450,
      phase: "under construction",
    },
    {
      id: "glamping",
      name: "Glamping grove",
      unitsDesign: 8,
      unitsOpen: 8,
      occupied: glampOcc,
      ratePerNight: 280,
      phase: "open",
    },
    {
      id: "cabins",
      name: "Farm cabins (Airbnb)",
      unitsDesign: 2,
      unitsOpen: 2,
      occupied: cabinOcc,
      ratePerNight: 250,
      phase: "open — the original two",
    },
  ];

  const open = tiers.reduce((s, t) => s + t.unitsOpen, 0);
  const occupied = tiers.reduce((s, t) => s + t.occupied, 0);
  const revenueTonight = tiers.reduce((s, t) => s + t.occupied * t.ratePerNight, 0);

  const bookings: Booking[] = [
    { id: "bk-1041", guest: "Tan family", party: 4, tier: "Hotel — Block A", nights: 2, checkIn: iso(0), status: "arriving-today", note: "kids' farm camp add-on" },
    { id: "bk-1042", guest: "A. Rahman", party: 2, tier: "Glamping grove", nights: 3, checkIn: iso(0), status: "arriving-today" },
    { id: "bk-1035", guest: "Lee & co.", party: 6, tier: "Hotel — Block A", nights: 4, checkIn: iso(-2), status: "in-house", note: "ATV + fishing booked" },
    { id: "bk-1046", guest: "Chong wedding", party: 120, tier: "Events lawn", nights: 1, checkIn: iso(9), status: "enquiry", note: "150–300 pax venue — quote sent" },
    { id: "bk-1048", guest: "GreenTech retreat", party: 28, tier: "Hotel — Block A", nights: 2, checkIn: iso(14), status: "upcoming", note: "corporate — sustainability tour requested" },
  ];

  return {
    tiers,
    occupancyPct: open ? Math.round((occupied / open) * 100) : 0,
    guestsOnSite: occupied * 2 + 3,
    revenueTonight,
    currency: "RM",
    bookings,
  };
}
