// lib/tools/actions.ts — the agent's action tools. Each mutates the twin, records
// an AgentAction (with the agent's stated reasoning), and returns a result string.
// Shared by both the Claude tool-runner path and the offline rule-engine fallback.

import { getTwin, recomputeLoad } from "../store";
import type { OnOff, Severity, Twin } from "../types";
import { logAction } from "./log";
import { getAutomations } from "../automations";
import { gate } from "../autonomy";

/** Life-support / never_shed assets can never be shed. Returns true if protected. */
export function isProtected(twin: Twin, assetId: string): boolean {
  if (twin.loadShedding.neverShed.includes(assetId)) return true;
  const asset = twin.assets.find((a) => a.id === assetId);
  return asset?.criticality === "life_support";
}

export function getFarmState() {
  const t = getTwin();
  // Compact snapshot for the agent — enough to decide, small enough to be cheap.
  return {
    farm: t.farm.name,
    online: t.online,
    energy: t.resources.energy,
    water: t.resources.water,
    loadShedding: t.loadShedding,
    assets: t.assets.map((a) => ({
      id: a.id,
      vertical: a.verticalId,
      type: a.type,
      criticality: a.criticality,
      powerDraw: a.powerDraw,
      state: a.state,
    })),
    verticals: t.verticals.map((v) => ({
      id: v.id,
      name: v.name,
      status: v.status,
      headline: v.headline,
      insights: v.insights,
    })),
    automations: getAutomations(t).map((a) => ({
      id: a.id,
      name: a.name,
      autonomy: a.autonomy,
      state: a.state,
    })),
    openAlerts: t.alerts.filter((a) => !a.acknowledged).length,
  };
}

export function shedLoad(assetId: string, reasoning: string, force = false): string {
  const twin = getTwin();
  const asset = twin.assets.find((a) => a.id === assetId);
  if (!asset) return `error: no asset "${assetId}"`;

  if (isProtected(twin, assetId)) {
    const result = `REFUSED — ${assetId} is life-support / never_shed and must stay powered`;
    logAction(twin, {
      decision: `Declined to shed ${assetId}`,
      reasoning,
      toolCalled: "shedLoad",
      params: { assetId },
      result,
    });
    return result;
  }

  if (asset.state === "off") return `${assetId} already shed`;

  const held = gate("energy", "shedLoad", { assetId }, reasoning, `shed ${assetId} (−${asset.powerDraw} W)`, force);
  if (held) return held;

  asset.state = "off";
  const loadKw = recomputeLoad(twin);
  const result = `shed ${assetId} (−${asset.powerDraw} W) · load now ${loadKw} kW`;
  logAction(twin, {
    decision: `Shed ${assetId}`,
    reasoning,
    toolCalled: "shedLoad",
    params: { assetId, powerDraw: asset.powerDraw },
    result,
  });
  return result;
}

export function restoreLoad(assetId: string, reasoning: string, force = false): string {
  const twin = getTwin();
  const asset = twin.assets.find((a) => a.id === assetId);
  if (!asset) return `error: no asset "${assetId}"`;
  if (asset.state === "on") return `${assetId} already on`;

  const held = gate("energy", "restoreLoad", { assetId }, reasoning, `restore ${assetId} (+${asset.powerDraw} W)`, force);
  if (held) return held;

  asset.state = "on";
  const loadKw = recomputeLoad(twin);
  const result = `restored ${assetId} (+${asset.powerDraw} W) · load now ${loadKw} kW`;
  logAction(twin, {
    decision: `Restored ${assetId}`,
    reasoning,
    toolCalled: "restoreLoad",
    params: { assetId },
    result,
  });
  return result;
}

export function setActuator(assetId: string, state: OnOff, reasoning: string, force = false): string {
  const twin = getTwin();
  const asset = twin.assets.find((a) => a.id === assetId);
  if (!asset) return `error: no asset "${assetId}"`;
  if (state === "off" && isProtected(twin, assetId)) {
    const result = `REFUSED — cannot turn off life-support asset ${assetId}`;
    logAction(twin, {
      decision: `Declined to turn off ${assetId}`,
      reasoning,
      toolCalled: "setActuator",
      params: { assetId, state },
      result,
    });
    return result;
  }

  const held = gate("climate", "setActuator", { assetId, state }, reasoning, `set ${assetId} → ${state}`, force);
  if (held) return held;

  asset.state = state;
  const loadKw = recomputeLoad(twin);
  const result = `${assetId} → ${state} · load now ${loadKw} kW`;
  logAction(twin, {
    decision: `Set ${assetId} ${state}`,
    reasoning,
    toolCalled: "setActuator",
    params: { assetId, state },
    result,
  });
  return result;
}

export function scheduleIrrigation(
  zoneId: string,
  when: string,
  volumeL: number,
  reasoning: string,
  force = false
): string {
  const twin = getTwin();
  const zone = twin.zones.find((z) => z.id === zoneId);
  if (!zone) return `error: no zone "${zoneId}"`;

  const held = gate("irrigation", "scheduleIrrigation", { zoneId, when, volumeL }, reasoning, `irrigate ${zoneId}: ${volumeL} L @ ${when}`, force);
  if (held) return held;

  const result = `irrigation scheduled for ${zoneId}: ${volumeL} L @ ${when}`;
  logAction(twin, {
    decision: `Scheduled irrigation for ${zoneId}`,
    reasoning,
    toolCalled: "scheduleIrrigation",
    params: { zoneId, when, volumeL },
    result,
  });
  return result;
}

export function createAlert(
  severity: Severity,
  message: string,
  reasoning: string
): string {
  const twin = getTwin();
  // Malaysia = WhatsApp for critical (config alerts.severity_to_channel)
  const channel = severity === "critical" ? "whatsapp" : "dashboard";
  const queued = !twin.online && channel === "whatsapp";
  globalThis.__FARMOS_ALERT_SEQ__ = (globalThis.__FARMOS_ALERT_SEQ__ ?? 0) + 1;
  twin.alerts.push({
    id: `alert-${globalThis.__FARMOS_ALERT_SEQ__}`,
    timestamp: new Date().toISOString(),
    severity,
    message,
    channel,
    acknowledged: false,
    queued,
  });
  const result = queued
    ? `alert queued (offline) → ${channel}: ${message}`
    : `alert sent → ${channel}: ${message}`;
  logAction(twin, {
    decision: `Raised ${severity} alert`,
    reasoning,
    toolCalled: "createAlert",
    params: { severity, message, channel },
    result,
  });
  return result;
}

export function assignTask(
  assignee: string,
  description: string,
  verticalId: string | undefined,
  reasoning: string
): string {
  const twin = getTwin();
  globalThis.__FARMOS_TASK_SEQ__ = (globalThis.__FARMOS_TASK_SEQ__ ?? 0) + 1;
  twin.tasks.push({
    id: `task-${globalThis.__FARMOS_TASK_SEQ__}`,
    timestamp: new Date().toISOString(),
    assignee,
    description,
    verticalId,
    status: "open",
  });
  const result = `task assigned to ${assignee}: ${description}`;
  logAction(twin, {
    decision: `Assigned task to ${assignee}`,
    reasoning,
    toolCalled: "assignTask",
    params: { assignee, description, verticalId },
    result,
  });
  return result;
}

declare global {
  // eslint-disable-next-line no-var
  var __FARMOS_ALERT_SEQ__: number | undefined;
  // eslint-disable-next-line no-var
  var __FARMOS_TASK_SEQ__: number | undefined;
}
