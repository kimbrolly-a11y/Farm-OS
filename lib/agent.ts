// lib/agent.ts — the FarmOS supervisor agent.
// Primary path: Claude Fable 5 with real tool-use via the SDK tool runner
// (server-side refusal fallback to claude-opus-4-8); every action tool takes a
// `reasoning` argument that is written to the Activity Log. Fallback path: the
// deterministic rule engine, used when the farm is offline, when no
// ANTHROPIC_API_KEY is set, or if the API call fails — so the crisis and
// resilience demos are always bulletproof.

import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { getTwin } from "./store";
import { setTrigger } from "./tools/log";
import { getTwinForecast } from "./tools/getForecast";
import { getBusiness } from "./economics";
import { forwardSimulate } from "./predict";
import { getAutomations, runAutomation } from "./automations";
import { getInventory } from "./inventory";
import {
  assignTask,
  createAlert,
  getFarmState,
  restoreLoad,
  scheduleIrrigation,
  setActuator,
  shedLoad,
} from "./tools/actions";
import { runRuleEngine } from "./ruleEngine";

export const MODEL = "claude-fable-5";
// Fable 5: thinking is always on (adaptive) — never send {type:"disabled"};
// no temperature/top_p/top_k; safety classifiers can return stop_reason
// "refusal", so we opt into the server-side fallback chain to Opus 4.8.
export const FALLBACK_MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are the operations team for a one-person, off-grid eco-farm in Malaysia (Crown Eagles Eco Farm). \
Your priorities, in order: (1) protect life-support loads and animals, (2) preserve water and battery through monsoon/cloud spells, \
(3) keep guests comfortable and revenue flowing, (4) minimise the founder's manual work. \
Explain every decision in one or two sentences. NEVER shed a life_support load or anything in the never_shed list.

Work concisely: call getFarmState and getForecast first, decide what (if anything) needs to change, take the actions through tools, \
then give a 2-3 sentence summary of what you did and why. Do not take actions that aren't warranted by the state. \
Every action tool requires a "reasoning" argument — state the specific sensor value or forecast fact that justifies the action.`;

interface AgentResult {
  mode: "claude" | "rules" | "offline-rules";
  summary: string;
  actionsAdded: number;
  actions: ReturnType<typeof getTwin>["actions"];
}

export function buildTools() {
  const reasoning = {
    type: "string",
    description: "One sentence citing the sensor value or forecast fact that justifies this action.",
  } as const;

  return [
    betaTool({
      name: "getFarmState",
      description: "Full snapshot of the farm: energy, water, every asset with criticality/state, vertical statuses, load-shedding ladder.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      run: async () => JSON.stringify(getFarmState()),
    }),
    betaTool({
      name: "getForecast",
      description: "Weather forecast (Open-Meteo). cloud_cover + shortwave_radiation drive solar/battery decisions; precipitation drives irrigation. Uses cached data when offline.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      run: async () => JSON.stringify(await getTwinForecast(getTwin())),
    }),
    betaTool({
      name: "getBusinessState",
      description: "Live per-vertical P&L (revenue, cost, margin, energy cost) + production, in RM/day. Use to weigh the financial impact of a decision — e.g. what revenue a load carries before shedding it.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      run: async () => JSON.stringify(getBusiness(getTwin())),
    }),
    betaTool({
      name: "getInventory",
      description: "Current stock levels (fresh/processed/inputs, with low-stock flags) and production batches with food-safety (HACCP) status. Use to factor stock into decisions (e.g. cold storage full → prioritise processing; input low → assign a restock task).",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      run: async () => JSON.stringify(getInventory(getTwin())),
    }),
    betaTool({
      name: "simulateForward",
      description: "Non-destructively project the battery/energy trajectory forward (default 12h) at the current load. Returns when SoC would hit 20% (critical) or 0% (empty). Use this to act BEFORE a crisis. Optionally pass cloudCover (0..1) to test a weather assumption.",
      inputSchema: {
        type: "object",
        properties: {
          hours: { type: "number", description: "horizon in hours (default 12)" },
          cloudCover: { type: "number", description: "0 clear .. 1 overcast" },
        },
        additionalProperties: false,
      },
      run: async (i: { hours?: number; cloudCover?: number }) => {
        const p = forwardSimulate(getTwin(), { hours: i.hours, cloudCover: i.cloudCover });
        // trim the trajectory for the model — the summary + key timings are what matter
        return JSON.stringify({
          summary: p.summary,
          minsToCritical: p.minsToCritical,
          minsToEmpty: p.minsToEmpty,
          socFloor: p.socFloor,
          socAtHorizon: p.socAtHorizon,
          loadKw: p.loadKw,
        });
      },
    }),
    betaTool({
      name: "shedLoad",
      description: "Turn OFF a non-life-support asset to save power. Refuses to shed life_support / never_shed assets.",
      inputSchema: {
        type: "object",
        properties: { assetId: { type: "string" }, reasoning },
        required: ["assetId", "reasoning"],
        additionalProperties: false,
      },
      run: async (i: { assetId: string; reasoning: string }) => shedLoad(i.assetId, i.reasoning),
    }),
    betaTool({
      name: "restoreLoad",
      description: "Turn a previously-shed asset back ON when power allows.",
      inputSchema: {
        type: "object",
        properties: { assetId: { type: "string" }, reasoning },
        required: ["assetId", "reasoning"],
        additionalProperties: false,
      },
      run: async (i: { assetId: string; reasoning: string }) => restoreLoad(i.assetId, i.reasoning),
    }),
    betaTool({
      name: "setActuator",
      description: "Set an actuator on/off (fans, aerators, pumps, valves, lights). Refuses to turn off life-support.",
      inputSchema: {
        type: "object",
        properties: {
          assetId: { type: "string" },
          state: { type: "string", enum: ["on", "off"] },
          reasoning,
        },
        required: ["assetId", "state", "reasoning"],
        additionalProperties: false,
      },
      run: async (i: { assetId: string; state: "on" | "off"; reasoning: string }) =>
        setActuator(i.assetId, i.state, i.reasoning),
    }),
    betaTool({
      name: "scheduleIrrigation",
      description: "Schedule irrigation for a zone.",
      inputSchema: {
        type: "object",
        properties: {
          zoneId: { type: "string" },
          when: { type: "string", description: "e.g. '05:00' or 'now'" },
          volumeL: { type: "number" },
          reasoning,
        },
        required: ["zoneId", "when", "volumeL", "reasoning"],
        additionalProperties: false,
      },
      run: async (i: { zoneId: string; when: string; volumeL: number; reasoning: string }) =>
        scheduleIrrigation(i.zoneId, i.when, i.volumeL, i.reasoning),
    }),
    betaTool({
      name: "runAutomation",
      description: "Dispatch an autonomous-equipment automation (fertigation, robotic mower, FarmBot, auto-feeder, nutrient dosing, misting, ripeness vision). Get valid ids from getFarmState's automations, or common ones like auto-orchard-fert, auto-hydro-doser, auto-aqua-feeder.",
      inputSchema: {
        type: "object",
        properties: { automationId: { type: "string" }, reasoning },
        required: ["automationId", "reasoning"],
        additionalProperties: false,
      },
      run: async (i: { automationId: string; reasoning: string }) => runAutomation(i.automationId, i.reasoning),
    }),
    betaTool({
      name: "createAlert",
      description: "Raise an alert. critical → WhatsApp + dashboard; warning/info → dashboard. Queued when offline.",
      inputSchema: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["critical", "warning", "info"] },
          message: { type: "string" },
          reasoning,
        },
        required: ["severity", "message", "reasoning"],
        additionalProperties: false,
      },
      run: async (i: { severity: "critical" | "warning" | "info"; message: string; reasoning: string }) =>
        createAlert(i.severity, i.message, i.reasoning),
    }),
    betaTool({
      name: "assignTask",
      description: "Assign a manual task to the founder or a worker.",
      inputSchema: {
        type: "object",
        properties: {
          assignee: { type: "string" },
          description: { type: "string" },
          verticalId: { type: "string" },
          reasoning,
        },
        required: ["assignee", "description", "reasoning"],
        additionalProperties: false,
      },
      run: async (i: { assignee: string; description: string; verticalId?: string; reasoning: string }) =>
        assignTask(i.assignee, i.description, i.verticalId, i.reasoning),
    }),
  ];
}

export async function runAgent(trigger = "manual run"): Promise<AgentResult> {
  const twin = getTwin();
  setTrigger(trigger);
  const before = twin.actions.length;

  const hasKey = !!process.env.ANTHROPIC_API_KEY;

  // Offline or no key → deterministic engine.
  if (!twin.online || !hasKey) {
    const r = await runRuleEngine();
    return {
      mode: r.mode as AgentResult["mode"],
      summary: r.summary,
      actionsAdded: twin.actions.length - before,
      actions: twin.actions.slice(before),
    };
  }

  // Online + key → real Claude tool-use.
  try {
    const client = new Anthropic();
    const finalMessage = await client.beta.messages.toolRunner({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      betas: ["server-side-fallback-2026-06-01"],
      fallbacks: [{ model: FALLBACK_MODEL }],
      system: SYSTEM_PROMPT,
      tools: buildTools(),
      max_iterations: 12,
      messages: [
        {
          role: "user",
          content: `Trigger: ${trigger}. Run an operations review of the farm now. Assess current state and the forecast, take any actions that are clearly warranted, and summarise.`,
        },
      ],
    } as never);

    const summary =
      (finalMessage as Anthropic.Beta.BetaMessage).content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join(" ")
        .trim() || "Agent completed its review.";

    return {
      mode: "claude",
      summary,
      actionsAdded: twin.actions.length - before,
      actions: twin.actions.slice(before),
    };
  } catch (e) {
    // Any API failure → fall back to rules so the demo never breaks.
    console.error("[agent] Claude path failed, falling back to rules:", e);
    const r = await runRuleEngine();
    return {
      mode: r.mode as AgentResult["mode"],
      summary: `(Claude unavailable — used rule engine) ${r.summary}`,
      actionsAdded: twin.actions.length - before,
      actions: twin.actions.slice(before),
    };
  }
}
