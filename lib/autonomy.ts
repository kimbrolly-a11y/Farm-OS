// lib/autonomy.ts — the autonomy trust dial (spec P5 #24).
// Trust is the adoption blocker for autonomous ops, so FarmOS makes it a
// per-domain setting: advise → approve → auto. Every ACTION tool passes through
// gate(): at "auto" it executes as before; at "approve"/"advise" the action is
// converted into a pending approval the owner applies with one click. The
// life-support guard is upstream of this and can never be dialed away.

import { getTwin } from "./store";
import { logAction } from "./tools/log";
import type { AutonomyDomain, AutonomyLevel, PendingApproval, Twin } from "./types";

export const DOMAIN_META: Record<
  AutonomyDomain,
  { label: string; description: string; icon: string }
> = {
  energy: {
    label: "Energy",
    description: "load-shedding & restore decisions (solar/battery/biogas balancing)",
    icon: "⚡",
  },
  climate: {
    label: "Climate & actuators",
    description: "fans, pumps, aerators, lighting, doors — direct device control",
    icon: "🌡",
  },
  irrigation: {
    label: "Irrigation",
    description: "watering schedules for orchard, palm and greenhouse blocks",
    icon: "💧",
  },
  equipment: {
    label: "Equipment automations",
    description: "feeders, dosing, fertigation, robotic equipment dispatch",
    icon: "🤖",
  },
};

export const LEVELS: AutonomyLevel[] = ["advise", "approve", "auto"];

export const LEVEL_META: Record<AutonomyLevel, { label: string; description: string }> = {
  advise: { label: "Advise", description: "agent recommends only — you act" },
  approve: { label: "Approve", description: "agent prepares the action — one click to apply" },
  auto: { label: "Full auto", description: "agent acts on its own, everything logged" },
};

export function defaultAutonomy(): Record<AutonomyDomain, AutonomyLevel> {
  return { energy: "auto", climate: "auto", irrigation: "auto", equipment: "auto" };
}

/** Lazy migration for twins seeded before the trust dial existed. */
export function ensureAutonomy(twin: Twin): void {
  if (!twin.autonomy) twin.autonomy = defaultAutonomy();
  if (!twin.approvals) twin.approvals = [];
}

export function setAutonomy(twin: Twin, domain: AutonomyDomain, level: AutonomyLevel): void {
  ensureAutonomy(twin);
  twin.autonomy[domain] = level;
  logAction(twin, {
    decision: `Autonomy dial: ${DOMAIN_META[domain].label} → ${LEVEL_META[level].label}`,
    reasoning: `Owner set the ${domain} domain to "${level}" — ${LEVEL_META[level].description}.`,
    toolCalled: "setAutonomy",
    params: { domain, level },
    result: `${domain} now ${level}`,
  });
}

declare global {
  // eslint-disable-next-line no-var
  var __FARMOS_APPROVAL_SEQ__: number | undefined;
}

/**
 * The gate every action tool calls before mutating the twin.
 * Returns null when the action may proceed; otherwise queues a pending
 * approval, logs the recommendation, and returns the result string the
 * caller should surface to the agent.
 */
export function gate(
  domain: AutonomyDomain,
  toolCalled: string,
  params: Record<string, unknown>,
  reasoning: string,
  summary: string,
  force = false
): string | null {
  const twin = getTwin();
  ensureAutonomy(twin);
  const level = twin.autonomy[domain];
  if (force || level === "auto") return null;

  globalThis.__FARMOS_APPROVAL_SEQ__ = (globalThis.__FARMOS_APPROVAL_SEQ__ ?? 0) + 1;
  const approval: PendingApproval = {
    id: `appr-${globalThis.__FARMOS_APPROVAL_SEQ__}`,
    timestamp: new Date().toISOString(),
    domain,
    toolCalled,
    params,
    summary,
    reasoning,
    status: "pending",
  };
  twin.approvals.push(approval);

  const result = `queued for approval (${domain} autonomy is "${level}") — ${summary}`;
  logAction(twin, {
    decision: `Recommended: ${summary}`,
    reasoning,
    toolCalled: `${toolCalled} (recommended)`,
    params,
    result,
  });
  return result;
}

export function pendingApprovals(twin: Twin): PendingApproval[] {
  ensureAutonomy(twin);
  return twin.approvals.filter((a) => a.status === "pending");
}
