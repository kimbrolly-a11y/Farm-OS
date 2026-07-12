// lib/automations.ts — the AI-automation & autonomous-equipment layer.
// Each entry maps a real automation/robot to its twin asset, an autonomy level,
// and the trigger that fires it. The agent can dispatch these via runAutomation.

import { getTwin } from "./store";
import type { Twin } from "./types";
import { logAction } from "./tools/log";

export type Autonomy = "autonomous" | "assisted" | "manual";
export type AutomationKind =
  | "irrigation"
  | "dosing"
  | "feeding"
  | "robot"
  | "vision"
  | "climate"
  | "deterrent"
  | "door";

export interface Automation {
  id: string;
  name: string;
  verticalId: string;
  assetId: string;
  kind: AutomationKind;
  autonomy: Autonomy;
  trigger: string;
}

export const AUTOMATIONS: Automation[] = [
  { id: "auto-palm1-fert", name: "Autonomous fertigation — Block 1", verticalId: "palm_oil", assetId: "palm1_fertigation", kind: "dosing", autonomy: "autonomous", trigger: "soil moisture < 25% or scheduled dose" },
  { id: "auto-palm-cam", name: "FFB ripeness vision AI", verticalId: "palm_oil", assetId: "palm_ripeness_cam", kind: "vision", autonomy: "assisted", trigger: "continuous CV scan; flags ripe bunches for harvest" },
  { id: "auto-orchard-mower", name: "Robotic mower", verticalId: "fruit_orchard", assetId: "orchard_mower", kind: "robot", autonomy: "autonomous", trigger: "daily schedule, dry weather" },
  { id: "auto-orchard-bird", name: "AI bird deterrent", verticalId: "fruit_orchard", assetId: "orchard_bird_deterrent", kind: "deterrent", autonomy: "autonomous", trigger: "vision/motion detection of flocks" },
  { id: "auto-orchard-fert", name: "Autonomous drip irrigation — Block B", verticalId: "fruit_orchard", assetId: "orchard_fertigation_b", kind: "irrigation", autonomy: "autonomous", trigger: "soil moisture < 30%, low rain probability" },
  { id: "auto-farmbot", name: "FarmBot CNC crop robot", verticalId: "hydroponics", assetId: "hydro1_farmbot", kind: "robot", autonomy: "autonomous", trigger: "seed / weed / water schedule" },
  { id: "auto-hydro-doser", name: "Autonomous nutrient dosing", verticalId: "hydroponics", assetId: "hydro1_doser", kind: "dosing", autonomy: "autonomous", trigger: "pH or EC drifts out of band" },
  { id: "auto-aqua-feeder", name: "Auto fish feeder", verticalId: "aquaponics", assetId: "aqua1_feeder", kind: "feeding", autonomy: "autonomous", trigger: "feed schedule, adjusted by water temp" },
  { id: "auto-coop-feeder", name: "Auto poultry feeder", verticalId: "poultry", assetId: "coop1_feeder", kind: "feeding", autonomy: "autonomous", trigger: "feed schedule" },
  { id: "auto-coop-door", name: "Automatic coop door", verticalId: "poultry", assetId: "coop1_door", kind: "door", autonomy: "autonomous", trigger: "sunrise / sunset" },
  { id: "auto-zoo-mist", name: "Auto misting cooling", verticalId: "petting_zoo", assetId: "zoo_misting_fan", kind: "climate", autonomy: "autonomous", trigger: "barn temperature > 32°C" },
];

export interface AutomationView extends Automation {
  state: "on" | "off" | "n/a";
  verticalName: string;
}

export function getAutomations(twin: Twin = getTwin()): AutomationView[] {
  return AUTOMATIONS.map((a) => {
    const asset = twin.assets.find((x) => x.id === a.assetId);
    const vert = twin.verticals.find((v) => v.id === a.verticalId);
    return {
      ...a,
      state: asset ? asset.state : "n/a",
      verticalName: vert?.name ?? a.verticalId,
    };
  });
}

export function runAutomation(id: string, reasoning = "Operator dispatched automation"): string {
  const twin = getTwin();
  const a = AUTOMATIONS.find((x) => x.id === id);
  if (!a) return `error: no automation "${id}"`;
  const asset = twin.assets.find((x) => x.id === a.assetId);
  if (!asset) return `error: no asset for "${id}"`;
  asset.state = "on";
  const result = `dispatched ${a.name} (${a.autonomy}) → ${a.assetId} running`;
  logAction(twin, {
    decision: `Ran automation: ${a.name}`,
    reasoning,
    toolCalled: "runAutomation",
    params: { automationId: id, assetId: a.assetId, autonomy: a.autonomy },
    result,
  });
  return result;
}
