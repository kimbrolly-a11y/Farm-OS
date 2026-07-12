// lib/staff.ts — the lean human crew of Verdant Acres, and the alert→action
// dispatcher. The AI runs the farm; these are the few humans for safety-critical
// and hands-on work. Each unacknowledged alert maps to a recommended staff
// action; dispatching turns it into an assigned Task and acknowledges the alert.

import type { Alert, Task, Twin } from "./types";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  emoji: string;
  /** what they cover — matched against alert text and vertical ids */
  coverage: string[];
  shift: "day" | "night" | "on-call";
  phone: string;
}

export const STAFF: StaffMember[] = [
  { id: "founder", name: "Fred", role: "Founder · Farm manager", emoji: "🧑‍🌾", coverage: ["everything"], shift: "day", phone: "+60 12-000 0001" },
  { id: "livestock", name: "Aiman", role: "Livestock lead", emoji: "🐄", coverage: ["dairy_cattle", "dairy_goats", "sheep", "horses", "poultry", "ducks", "rabbits", "petting_zoo"], shift: "day", phone: "+60 12-000 0002" },
  { id: "aqua", name: "Mei Lin", role: "Aquaculture tech", emoji: "🐟", coverage: ["aquaculture", "aquaponics"], shift: "day", phone: "+60 12-000 0003" },
  { id: "grow", name: "Kumar", role: "Grow-systems tech", emoji: "🥬", coverage: ["hydroponics", "fruit_orchard", "palm_oil", "beekeeping"], shift: "day", phone: "+60 12-000 0004" },
  { id: "maint", name: "Hafiz", role: "Maintenance · energy & water", emoji: "🔧", coverage: ["energy", "water", "recycling", "equipment"], shift: "on-call", phone: "+60 12-000 0005" },
  { id: "hosp", name: "Sarah", role: "Hospitality manager", emoji: "🏨", coverage: ["lodging", "guest", "booking"], shift: "day", phone: "+60 12-000 0006" },
  { id: "chef", name: "Chef Wong", role: "Head chef · F&B", emoji: "🍳", coverage: ["restaurant", "food_processing", "cold"], shift: "day", phone: "+60 12-000 0007" },
  { id: "night", name: "Raju", role: "Night duty · security & animals", emoji: "🌙", coverage: ["everything"], shift: "night", phone: "+60 12-000 0008" },
  { id: "vet", name: "Dr. Tan", role: "Vet (on-call partner)", emoji: "🩺", coverage: ["animal health", "treatment", "culling"], shift: "on-call", phone: "+60 12-000 0009" },
];

/** Malaysia local hour → who is on duty right now. */
export function isOnDuty(m: StaffMember, date = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kuala_Lumpur" }).format(date)
  );
  const day = hour >= 7 && hour < 19;
  if (m.shift === "on-call") return true;
  return m.shift === "day" ? day : !day;
}

export interface AlertRecommendation {
  staffId: string;
  staffName: string;
  action: string;
}

/** Keyword rules: which human acts on this alert, and what they should do. */
const RULES: Array<{ re: RegExp; staffId: string; action: (a: Alert) => string }> = [
  { re: /aerator|dissolved|pond|fish|prawn|tilapia/i, staffId: "aqua", action: () => "Check pond aeration & dissolved O₂ on site; start backup aerator if below 4 mg/L and report fish behaviour." },
  { re: /incubator|brooder|coop|hen|poultry|egg|ammonia/i, staffId: "livestock", action: () => "Inspect the coop/incubator now — verify temperature, ventilation and water lines; move chicks to backup brooder if needed." },
  { re: /cattle|cow|milk|goat|sheep|horse|rabbit|animal|barn|vitals|collar/i, staffId: "livestock", action: () => "Do a physical welfare check on the flagged animals — water, feed, shade, ventilation; escalate to the vet if vitals stay abnormal." },
  { re: /treatment|sick|disease|vet|cull/i, staffId: "vet", action: () => "Clinical assessment required — examine the flagged animals and prescribe treatment; founder approval needed before any medication or culling." },
  { re: /batter|solar|load|shed|inverter|genset|biogas|power|energy/i, staffId: "maint", action: () => "Check the power room — verify battery bank, inverter and charge controllers; confirm shed loads are safe and genset is fuelled as backup." },
  { re: /tank|water|well|pump|irrigat|leak|pressure/i, staffId: "maint", action: () => "Inspect pumps, tank levels and lines for leaks; switch to backup source if a tank runs below reserve." },
  { re: /cold room|cold chain|fridge|freezer|chiller/i, staffId: "chef", action: () => "Check the cold room now — verify door seals and compressor; move stock to backup chiller if temperature keeps rising." },
  { re: /kitchen|restaurant|haccp|food/i, staffId: "chef", action: () => "Kitchen check — verify HACCP logs and the flagged equipment; pull affected stock if temperature was out of range." },
  { re: /guest|booking|check-in|room|lodging|glamp|cabin/i, staffId: "hosp", action: () => "Contact the affected guests, adjust bookings, and coordinate any room moves or comps." },
  { re: /greenhouse|hydro|nutrient|ph|orchard|palm|hive|bee/i, staffId: "grow", action: () => "Walk the flagged grow zone — verify dosing/irrigation hardware matches sensor readings and rebalance nutrients." },
  { re: /offline|internet|network|starlink|router/i, staffId: "maint", action: () => "Check the comms cabinet — power-cycle the router/Starlink; farm runs autonomously meanwhile, alerts are queued." },
];

export function recommendAction(alert: Alert): AlertRecommendation {
  for (const r of RULES) {
    if (r.re.test(alert.message)) {
      const m = STAFF.find((s) => s.id === r.staffId)!;
      return { staffId: m.id, staffName: m.name, action: r.action(alert) };
    }
  }
  const mgr = STAFF[0];
  return {
    staffId: mgr.id,
    staffName: mgr.name,
    action: "Review this alert in the command center and assign the right specialist.",
  };
}

/** Turn an alert into an assigned staff task and acknowledge it. */
export function dispatchAlert(twin: Twin, alertId: string): Task | null {
  const alert = twin.alerts.find((a) => a.id === alertId);
  if (!alert || alert.acknowledged) return null;
  const rec = recommendAction(alert);
  const task: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    assignee: rec.staffName,
    description: `[${alert.severity.toUpperCase()} alert] ${rec.action} (alert: ${alert.message})`,
    status: "open",
  };
  twin.tasks.unshift(task);
  alert.acknowledged = true;
  return task;
}
