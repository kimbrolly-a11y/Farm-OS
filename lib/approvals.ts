// lib/approvals.ts — one-click apply/dismiss for actions the trust dial held.
// Applying re-dispatches the original tool with force=true (the owner IS the
// approval); the life-support guard still applies — force never bypasses it.

import { getTwin } from "./store";
import { logAction, setTrigger } from "./tools/log";
import { restoreLoad, scheduleIrrigation, setActuator, shedLoad } from "./tools/actions";
import { runAutomation } from "./automations";
import type { OnOff } from "./types";

export function applyApproval(id: string): { ok: boolean; result: string } {
  const twin = getTwin();
  const appr = (twin.approvals ?? []).find((a) => a.id === id);
  if (!appr) return { ok: false, result: `no approval "${id}"` };
  if (appr.status !== "pending") return { ok: false, result: `approval ${id} is ${appr.status}` };

  setTrigger("owner approved recommendation");
  const p = appr.params;
  let result: string;
  switch (appr.toolCalled) {
    case "shedLoad":
      result = shedLoad(String(p.assetId), appr.reasoning, true);
      break;
    case "restoreLoad":
      result = restoreLoad(String(p.assetId), appr.reasoning, true);
      break;
    case "setActuator":
      result = setActuator(String(p.assetId), p.state as OnOff, appr.reasoning, true);
      break;
    case "scheduleIrrigation":
      result = scheduleIrrigation(String(p.zoneId), String(p.when), Number(p.volumeL), appr.reasoning, true);
      break;
    case "runAutomation":
      result = runAutomation(String(p.automationId), appr.reasoning, true);
      break;
    default:
      return { ok: false, result: `unknown tool "${appr.toolCalled}"` };
  }

  appr.status = "applied";
  return { ok: true, result };
}

export function dismissApproval(id: string): { ok: boolean; result: string } {
  const twin = getTwin();
  const appr = (twin.approvals ?? []).find((a) => a.id === id);
  if (!appr) return { ok: false, result: `no approval "${id}"` };
  if (appr.status !== "pending") return { ok: false, result: `approval ${id} is ${appr.status}` };
  appr.status = "dismissed";

  logAction(twin, {
    decision: `Dismissed recommendation: ${appr.summary}`,
    reasoning: "Owner declined the agent's recommendation.",
    toolCalled: "dismissApproval",
    params: { id: appr.id, toolCalled: appr.toolCalled },
    result: "dismissed",
  });
  return { ok: true, result: "dismissed" };
}
