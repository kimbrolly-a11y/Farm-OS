// lib/economics.ts — the Manage layer: turns the live twin into a per-vertical
// P&L + production readout, so FarmOS is a management system, not just telemetry.
// Revenue is driven by live production sensors where possible (eggs, FFB yield,
// canning throughput, occupancy); costs blend a baseline operating cost with the
// live energy cost of each vertical's powered assets. All figures are per-day.

import type { Twin } from "./types";
import { LOAD_DIVERSITY } from "./config";

const CURRENCY = "RM"; // Malaysian ringgit
const ENERGY_TARIFF = 0.45; // RM / kWh (grid-equivalent value of self-generated solar)

interface VerticalEconomics {
  /** flat baseline revenue/day (RM) for output not tied to a single sensor */
  baseRevenue: number;
  baseCost: number;
  production: { label: string; unit: string };
  /** optional live driver: revenue += latest(sensorId) * rate */
  driver?: { sensorId: string; rate: number };
}

const ECONOMICS: Record<string, VerticalEconomics> = {
  poultry: {
    baseRevenue: 45,
    baseCost: 55,
    production: { label: "Eggs today", unit: "eggs" },
    driver: { sensorId: "coop-1:eggs_today", rate: 0.6 },
  },
  aquaponics: { baseRevenue: 120, baseCost: 58, production: { label: "Fish + greens", unit: "kg/day" } },
  hydroponics: { baseRevenue: 95, baseCost: 44, production: { label: "Leafy greens", unit: "kg/day" } },
  fruit_orchard: { baseRevenue: 70, baseCost: 32, production: { label: "Fruit", unit: "kg/day" } },
  lodging: {
    baseRevenue: 0,
    baseCost: 60,
    production: { label: "Cabins occupied", unit: "nights" },
    driver: { sensorId: "__occupancy__", rate: 250 }, // special-cased below
  },
  restaurant: { baseRevenue: 380, baseCost: 205, production: { label: "Covers", unit: "/day" } },
  petting_zoo: { baseRevenue: 60, baseCost: 24, production: { label: "Visitors", unit: "/day" } },
  palm_oil: {
    baseRevenue: 0,
    baseCost: 90,
    production: { label: "FFB yield", unit: "t/day" },
    driver: { sensorId: "plantation-block-3:ffb_yield", rate: 800 },
  },
  recycling: { baseRevenue: 25, baseCost: 10, production: { label: "Biogas + compost", unit: "value" } },
  beekeeping: { baseRevenue: 35, baseCost: 8, production: { label: "Honey", unit: "kg/day" } },
  food_processing: {
    baseRevenue: 0,
    baseCost: 200,
    production: { label: "Cans / day", unit: "cans" },
    driver: { sensorId: "canning-line:throughput", rate: 0.42 }, // cans/hr → RM/day
  },
};

function latest(twin: Twin, sensorId: string): number {
  for (let i = twin.readings.length - 1; i >= 0; i--) {
    if (twin.readings[i].sensorId === sensorId) return twin.readings[i].value;
  }
  return 0;
}

function occupiedCabins(twin: Twin): number {
  return ["cabin-1:occupancy", "cabin-2:occupancy"].reduce(
    (n, id) => n + (latest(twin, id) ? 1 : 0),
    0
  );
}

/** live energy cost/day for a vertical's currently-powered assets */
function energyCost(twin: Twin, verticalId: string): number {
  const watts = twin.assets
    .filter((a) => a.verticalId === verticalId && a.state === "on")
    .reduce((s, a) => s + a.powerDraw, 0);
  return Math.round(((watts / 1000) * LOAD_DIVERSITY * 24 * ENERGY_TARIFF) * 100) / 100;
}

export interface VerticalBusiness {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  margin: number;
  energyCost: number;
  production: { label: string; value: number; unit: string };
  status: Twin["verticals"][number]["status"];
}

export interface Business {
  currency: string;
  farm: { revenue: number; cost: number; margin: number };
  verticals: VerticalBusiness[];
}

export function getBusiness(twin: Twin): Business {
  const verticals: VerticalBusiness[] = twin.verticals.map((v) => {
    const e = ECONOMICS[v.id] ?? { baseRevenue: 0, baseCost: 0, production: { label: "—", unit: "" } };

    let driverValue = 0;
    let revenue = e.baseRevenue;
    if (e.driver) {
      driverValue = e.driver.sensorId === "__occupancy__" ? occupiedCabins(twin) : latest(twin, e.driver.sensorId);
      revenue += driverValue * e.driver.rate;
    }
    revenue = Math.round(revenue);

    const energy = energyCost(twin, v.id);
    const cost = Math.round(e.baseCost + energy);
    const production =
      e.driver && e.driver.sensorId !== "__occupancy__"
        ? driverValue
        : e.driver
        ? occupiedCabins(twin)
        : e.baseRevenue > 0
        ? Math.round(e.baseRevenue / 10)
        : 0;

    return {
      id: v.id,
      name: v.name,
      revenue,
      cost,
      margin: revenue - cost,
      energyCost: energy,
      production: { label: e.production.label, value: production, unit: e.production.unit },
      status: v.status,
    };
  });

  const farm = verticals.reduce(
    (acc, v) => ({
      revenue: acc.revenue + v.revenue,
      cost: acc.cost + v.cost,
      margin: acc.margin + v.margin,
    }),
    { revenue: 0, cost: 0, margin: 0 }
  );

  return { currency: CURRENCY, farm, verticals };
}
