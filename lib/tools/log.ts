// lib/tools/log.ts — shared helper: record an AgentAction with the agent's reasoning.
import type { AgentAction, Twin } from "../types";

declare global {
  // eslint-disable-next-line no-var
  var __FARMOS_TRIGGER__: string | undefined;
  // eslint-disable-next-line no-var
  var __FARMOS_ACTION_SEQ__: number | undefined;
}

export function currentTrigger(): string {
  return globalThis.__FARMOS_TRIGGER__ ?? "manual run";
}

export function setTrigger(t: string): void {
  globalThis.__FARMOS_TRIGGER__ = t;
}

/** Append an AgentAction and return it. Newest-first is handled at render time. */
export function logAction(
  twin: Twin,
  a: {
    decision: string;
    reasoning: string;
    toolCalled: string;
    params: Record<string, unknown>;
    result: string;
  }
): AgentAction {
  globalThis.__FARMOS_ACTION_SEQ__ = (globalThis.__FARMOS_ACTION_SEQ__ ?? 0) + 1;
  const action: AgentAction = {
    id: `act-${globalThis.__FARMOS_ACTION_SEQ__}`,
    timestamp: new Date().toISOString(),
    trigger: currentTrigger(),
    decision: a.decision,
    reasoning: a.reasoning,
    toolCalled: a.toolCalled,
    params: a.params,
    result: a.result,
  };
  twin.actions.push(action);
  return action;
}
