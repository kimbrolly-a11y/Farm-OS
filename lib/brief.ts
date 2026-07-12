// lib/brief.ts — the Morning Brief (spec P5 #25): "What my company did while I
// slept." A synthesized digest of overnight agent activity, today's plan, risks
// on the horizon and the money picture — the founder's one-minute morning read.
// Deterministic and offline-safe: computed from the twin, no LLM call needed.

import { getBusiness } from "./economics";
import { getHospitality } from "./hospitality";
import { forwardSimulate } from "./predict";
import type { Twin } from "./types";

export interface BriefSection {
  title: string;
  items: Array<{ icon: string; text: string; detail?: string }>;
}

export interface MorningBrief {
  generatedAt: string;
  headline: string;
  stats: Array<{ label: string; value: string }>;
  sections: BriefSection[];
}

export function getMorningBrief(twin: Twin): MorningBrief {
  const actions = twin.actions;
  const sheds = actions.filter((a) => a.toolCalled === "shedLoad").length;
  const restores = actions.filter((a) => a.toolCalled === "restoreLoad").length;
  const alerts = actions.filter((a) => a.toolCalled === "createAlert").length;
  const tasksAssigned = actions.filter((a) => a.toolCalled === "assignTask").length;
  const irrigations = actions.filter((a) => a.toolCalled === "scheduleIrrigation").length;
  const automations = actions.filter((a) => a.toolCalled === "runAutomation").length;

  const biz = getBusiness(twin);
  const hosp = getHospitality(twin);
  const pred = forwardSimulate(twin, { hours: 12 });
  const soc = Math.round(twin.resources.energy.batterySoC);
  const sources = twin.resources.energy.sources;

  // --- what happened ---
  const happened: BriefSection = {
    title: "While you slept",
    items: [],
  };
  if (sheds + restores > 0) {
    happened.items.push({
      icon: "⚡",
      text: `Managed the power envelope: ${sheds} load${sheds === 1 ? "" : "s"} shed, ${restores} restored.`,
      detail: "life-support was never touched — the guard refuses those calls",
    });
  }
  if (automations > 0) {
    happened.items.push({
      icon: "🤖",
      text: `Dispatched ${automations} equipment automation${automations === 1 ? "" : "s"} (feeders, dosing, fertigation).`,
    });
  }
  if (irrigations > 0) {
    happened.items.push({
      icon: "💧",
      text: `Scheduled ${irrigations} irrigation run${irrigations === 1 ? "" : "s"} against the rain forecast.`,
    });
  }
  if (alerts > 0) {
    happened.items.push({
      icon: "🔔",
      text: `Raised ${alerts} alert${alerts === 1 ? "" : "s"} — ${twin.alerts.filter((a) => !a.acknowledged).length} still open.`,
    });
  }
  if (tasksAssigned > 0) {
    happened.items.push({
      icon: "📋",
      text: `Queued ${tasksAssigned} task${tasksAssigned === 1 ? "" : "s"} that need human hands.`,
    });
  }
  const lastAction = actions[actions.length - 1];
  if (lastAction) {
    happened.items.push({
      icon: "🧠",
      text: `Last decision: ${lastAction.toolCalled}`,
      detail: lastAction.reasoning.slice(0, 140),
    });
  }
  if (happened.items.length === 0) {
    happened.items.push({
      icon: "😴",
      text: "A quiet night — everything stayed inside healthy bands. No intervention needed.",
    });
  }

  // --- today ---
  const openTasks = twin.tasks.filter((t) => t.status === "open");
  const arrivals = hosp.bookings.filter((b) => b.status === "arriving-today");
  const today: BriefSection = {
    title: "Today's plan",
    items: [
      ...arrivals.map((b) => ({
        icon: "🧳",
        text: `${b.guest} arrive — ${b.party} pax, ${b.tier}.`,
        detail: b.note,
      })),
      ...openTasks.slice(0, 4).map((t) => ({
        icon: "🔧",
        text: t.description,
        detail: `assigned to ${t.assignee}`,
      })),
    ],
  };
  if (today.items.length === 0) {
    today.items.push({ icon: "🌱", text: "No arrivals or open tasks — a farm day." });
  }

  // --- risks ---
  const riskInsights = twin.verticals
    .flatMap((v) => (v.insights ?? []).map((i) => ({ v: v.name, i })))
    .filter((x) => x.i.level === "risk");
  const risks: BriefSection = {
    title: "On the horizon",
    items: [
      {
        icon: pred.minsToCritical !== null ? "🟠" : "🟢",
        text: pred.summary,
      },
      ...riskInsights.slice(0, 3).map((x) => ({
        icon: "⚠️",
        text: `${x.v}: ${x.i.label} at ${x.i.value}${x.i.unit}.`,
      })),
    ],
  };
  const lowTanks = twin.resources.water.tanks.filter((t) => t.levelPct < 30);
  if (lowTanks.length) {
    risks.items.push({
      icon: "🚱",
      text: `${lowTanks.map((t) => t.id).join(", ")} below 30% — shortage ladder may engage.`,
    });
  }

  const occupiedUnits = hosp.tiers.reduce((s, t) => s + t.occupied, 0);
  return {
    generatedAt: new Date().toISOString(),
    headline:
      sheds > 0
        ? "Your company defended the battery overnight — and kept every animal safe."
        : "Your company ran itself overnight. All systems nominal.",
    stats: [
      { label: "battery", value: `${soc}%` },
      { label: "renewable", value: `${sources?.renewablePct ?? 100}%` },
      { label: "margin /day", value: `${biz.currency} ${biz.farm.margin.toLocaleString()}` },
      { label: "guests on site", value: `${hosp.guestsOnSite}` },
      { label: "units occupied", value: `${occupiedUnits}` },
      { label: "open alerts", value: `${twin.alerts.filter((a) => !a.acknowledged).length}` },
    ],
    sections: [happened, today, risks],
  };
}
