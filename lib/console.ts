// lib/console.ts — the natural-language console (spec P3 #19).
// "Ask your farm anything" — why did margin drop? what's at risk overnight?
// plan tomorrow. With an ANTHROPIC_API_KEY it is full Claude Fable 5 tool-use
// over the same 12 tools as the supervisor (it can ACT if you ask it to);
// keyless/offline it falls back to a deterministic answerer over the live twin
// so the demo never breaks.

import Anthropic from "@anthropic-ai/sdk";
import { buildTools, FALLBACK_MODEL, MODEL } from "./agent";
import { getBusiness } from "./economics";
import { getHospitality } from "./hospitality";
import { forwardSimulate } from "./predict";
import { getSustainability } from "./sustainability";
import { getTwin } from "./store";
import { setTrigger } from "./tools/log";
import { getWaterReport } from "./water";
import type { Twin } from "./types";

const CONSOLE_PROMPT = `You are the operations console for Verdant Acres, a one-person, off-grid eco-farm in Malaysia, \
speaking directly with the owner. Answer their question using the tools; be concrete and cite live numbers. \
Take ACTIONS only when the owner explicitly asks for one (e.g. "shed the pool pump", "schedule irrigation") — \
questions get answers, not side effects. NEVER shed a life_support / never_shed load. \
Keep answers under 150 words unless asked for detail.`;

export interface ConsoleResult {
  mode: "claude" | "rules";
  answer: string;
  actionsAdded: number;
}

export async function askConsole(question: string): Promise<ConsoleResult> {
  const twin = getTwin();
  const before = twin.actions.length;

  if (twin.online && process.env.ANTHROPIC_API_KEY) {
    try {
      setTrigger(`console: "${question.slice(0, 60)}"`);
      const client = new Anthropic();
      const finalMessage = await client.beta.messages.toolRunner({
        model: MODEL,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        betas: ["server-side-fallback-2026-06-01"],
        fallbacks: [{ model: FALLBACK_MODEL }],
        system: CONSOLE_PROMPT,
        tools: buildTools(),
        max_iterations: 10,
        messages: [{ role: "user", content: question }],
      } as never);

      const answer =
        (finalMessage as Anthropic.Beta.BetaMessage).content
          .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
          .map((b) => b.text)
          .join(" ")
          .trim() || "Done.";
      return { mode: "claude", answer, actionsAdded: twin.actions.length - before };
    } catch (e) {
      console.error("[console] Claude path failed, using deterministic answerer:", e);
    }
  }

  return {
    mode: "rules",
    answer: deterministicAnswer(question, twin),
    actionsAdded: twin.actions.length - before,
  };
}

/* ------------------------- keyless / offline answerer ------------------------- */

function deterministicAnswer(question: string, twin: Twin): string {
  const q = question.toLowerCase();
  const e = twin.resources.energy;

  if (/(batter|power|energy|solar|electric)/.test(q)) {
    const p = forwardSimulate(twin, { hours: 12 });
    const s = e.sources;
    return (
      `Battery is at ${Math.round(e.batterySoC)}% (${e.batteryCapacityKwh} kWh bank). ` +
      `Generation right now: ${e.solarInputKw} kW solar + ${s?.biogasKw ?? 0} kW biogas + ${s?.windKw ?? 0} kW wind` +
      `${s?.gensetOn ? ` + ${s.gensetKw} kW genset (EMERGENCY)` : ""} against ${e.loadKw} kW load. ` +
      p.summary
    );
  }

  if (/(margin|profit|revenue|money|p&l|pnl|earn)/.test(q)) {
    const b = getBusiness(twin);
    const sorted = [...b.verticals].sort((x, y) => y.margin - x.margin);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    return (
      `Today the farm is running at ${b.currency} ${b.farm.revenue.toLocaleString()} revenue vs ` +
      `${b.currency} ${b.farm.cost.toLocaleString()} cost → ${b.currency} ${b.farm.margin.toLocaleString()} margin/day. ` +
      `Best performer: ${top.name} (+${b.currency} ${top.margin.toLocaleString()}); ` +
      `weakest: ${bottom.name} (${bottom.margin < 0 ? "−" : "+"}${b.currency} ${Math.abs(bottom.margin).toLocaleString()}). ` +
      `Full breakdown on /manage.`
    );
  }

  if (/(water|tank|potable|drink)/.test(q)) {
    const w = getWaterReport(twin);
    return (
      `Storage is at ${w.storagePct}% across ${w.tanks.length} tanks; potable treatment is ` +
      `${w.treatment.potableOk ? "SAFE (all 4 barriers green)" : "flagged — check the train"}. ` +
      `Turbidity ${w.treatment.turbidityNtu} NTU, UV dose ${w.treatment.uvDose} mJ/cm². ` +
      `All ${w.ladder.length} ladder rungs currently: ${w.ladder.every((r) => r.status === "supplied") ? "supplied" : "restricted — see /water"}.`
    );
  }

  if (/(risk|overnight|tonight|worry|danger)/.test(q)) {
    const p = forwardSimulate(twin, { hours: 12 });
    const risks = twin.verticals
      .flatMap((v) => (v.insights ?? []).filter((i) => i.level === "risk").map((i) => `${v.name}: ${i.label}`))
      .slice(0, 3);
    return (
      p.summary +
      (risks.length ? ` Watch items: ${risks.join("; ")}.` : " No red AI signals across the verticals.") +
      ` ${twin.alerts.filter((a) => !a.acknowledged).length} unacknowledged alerts.`
    );
  }

  if (/(task|todo|work|do today)/.test(q)) {
    const open = twin.tasks.filter((t) => t.status === "open");
    return open.length
      ? `${open.length} open tasks: ` + open.map((t) => `${t.description} (${t.assignee})`).join("; ")
      : "No open tasks — the AI is handling everything routine.";
  }

  if (/(guest|book|occupan|room|stay|hotel|arriv|check.?in|visitor)/.test(q)) {
    const h = getHospitality(twin);
    return (
      `${h.guestsOnSite} guests on site, ${h.occupancyPct}% occupancy. Tonight's room revenue: ` +
      `${h.currency} ${h.revenueTonight.toLocaleString()}. Arrivals today: ` +
      (h.bookings.filter((b) => b.status === "arriving-today").map((b) => b.guest).join(", ") || "none") +
      `. Details on /attractions.`
    );
  }

  if (/(esg|sustain|carbon|green|renewable)/.test(q)) {
    const s = getSustainability(twin);
    return (
      `ESG score ${s.esgScore}. Running ${s.headline.renewablePct}% renewable right now, ` +
      `${s.headline.circularityPct}% circular, avoiding ~${s.headline.carbonAvoidedTonsYear} t CO₂e/yr. ` +
      `Full picture on /sustainability.`
    );
  }

  if (/(alert|alarm|warn)/.test(q)) {
    const open = twin.alerts.filter((a) => !a.acknowledged);
    return open.length
      ? `${open.length} open alerts: ` + open.slice(0, 4).map((a) => `[${a.severity}] ${a.message}`).join(" · ")
      : "No open alerts. All systems nominal.";
  }

  const criticals = twin.verticals.filter((v) => v.status === "critical").length;
  const warnings = twin.verticals.filter((v) => v.status === "warning").length;
  return (
    `Farm status: battery ${Math.round(e.batterySoC)}%, ${twin.verticals.length} verticals — ` +
    `${criticals} critical, ${warnings} warning. ` +
    `Add an ANTHROPIC_API_KEY to .env.local for full Claude answers; meanwhile try asking about: ` +
    `battery · margin · water · risks tonight · tasks · guests · ESG · alerts.`
  );
}
