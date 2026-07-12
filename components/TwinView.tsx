"use client";

// /twin — the living replica (HANDOFF §10 P1 #2 + #3).
// One screen that shows the whole company as a live system: generation flowing
// through the battery to the biggest loads, the water pipeline, twin fidelity,
// and an interactive what-if console over the forward simulator.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Twin } from "@/lib/types";
import type { SyncReport } from "@/lib/sync";
import type { WaterReport } from "@/lib/water";
import type { Prediction } from "@/lib/predict";

const DIVERSITY = 0.4; // keep in sync with lib/config LOAD_DIVERSITY

export function TwinView() {
  const [twin, setTwin] = useState<Twin | null>(null);
  const [sync, setSync] = useState<SyncReport | null>(null);
  const [water, setWater] = useState<WaterReport | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, b, c] = await Promise.all([
          fetch("/api/state", { cache: "no-store" }),
          fetch("/api/sync", { cache: "no-store" }),
          fetch("/api/water", { cache: "no-store" }),
        ]);
        if (a.ok) setTwin(await a.json());
        if (b.ok) setSync(await b.json());
        if (c.ok) setWater(await c.json());
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  if (!twin) return <div className="p-8 text-[--muted]">Materialising the twin…</div>;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">The Living Twin</h1>
          <p className="text-[--muted]">
            {twin.farm.name} as one live replica — energy & water flows, device fidelity, and
            what-if simulation.
          </p>
        </div>
        {sync && (
          <div className="flex gap-3 text-center">
            <Badge value={`${sync.fidelityPct}%`} label="fidelity" />
            <Badge value={`${sync.sensorsInSync}/${sync.sensorsTotal}`} label="sensors live" />
            <Badge value={`${sync.actuatorsMapped}/${sync.actuatorsTotal}`} label="actuators bound" />
            <Badge value={sync.mode} label={`feed · ${sync.hub}`} />
          </div>
        )}
      </header>

      <EnergyFlow twin={twin} />

      {water && <WaterFlow water={water} />}

      <WhatIf baseLoad={twin.resources.energy.loadKw} baseCloud={twin.sim.cloudCover} />

      <p className="mt-6 text-center text-xs text-[--muted]">
        Flip <code className="rounded bg-[--panel] px-1">integration.simulated: false</code> in{" "}
        <code className="rounded bg-[--panel] px-1">farm.config.yaml</code> and every device above
        binds to its real <code className="rounded bg-[--panel] px-1">ha_entity</code> — same twin,
        real farm.
      </p>
    </main>
  );
}

/* ---------------------------------- energy ---------------------------------- */

function EnergyFlow({ twin }: { twin: Twin }) {
  const e = twin.resources.energy;
  const s = e.sources;

  const sources = [
    { id: "solar", name: "Solar", kw: e.solarInputKw, color: "#e0a84a" },
    { id: "biogas", name: "Biogas", kw: s?.biogasKw ?? 0, color: "var(--accent)" },
    { id: "wind", name: "Wind", kw: s?.windKw ?? 0, color: "#3aa7ff" },
    { id: "genset", name: "Genset", kw: s?.gensetKw ?? 0, color: "var(--danger)" },
  ];

  const loads = useMemo(() => {
    const byVertical = new Map<string, number>();
    for (const a of twin.assets) {
      if (a.state !== "on") continue;
      byVertical.set(a.verticalId, (byVertical.get(a.verticalId) ?? 0) + a.powerDraw);
    }
    const names = new Map(twin.verticals.map((v) => [v.id, v.name]));
    return [...byVertical.entries()]
      .map(([id, w]) => ({
        id,
        name: names.get(id) ?? id,
        kw: Math.round(((w / 1000) * DIVERSITY) * 100) / 100,
      }))
      .sort((a, b) => b.kw - a.kw)
      .slice(0, 6);
  }, [twin]);

  const H = 300;
  const srcY = (i: number) => 45 + i * 62;
  const loadY = (i: number) => 32 + i * 45;
  const totalGen = sources.reduce((x, y) => x + y.kw, 0);

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
        Energy flow — {Math.round(totalGen * 10) / 10} kW generation → {e.loadKw} kW load
      </h2>
      <div className="rounded-xl border border-[--border] bg-[--panel] p-4">
        <svg viewBox={`0 0 760 ${H}`} className="w-full">
          {/* flows: sources -> battery */}
          {sources.map((src, i) =>
            src.kw > 0.05 ? (
              <path
                key={src.id}
                d={`M 150 ${srcY(i)} C 240 ${srcY(i)}, 260 150, 330 150`}
                fill="none"
                stroke={src.color}
                strokeOpacity="0.7"
                strokeWidth={Math.min(8, 1.5 + src.kw * 0.4)}
                strokeDasharray="7 7"
              >
                <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.1s" repeatCount="indefinite" />
              </path>
            ) : null
          )}
          {/* flows: battery -> loads */}
          {loads.map((l, i) =>
            l.kw > 0.02 ? (
              <path
                key={l.id}
                d={`M 430 150 C 500 150, 520 ${loadY(i)}, 590 ${loadY(i)}`}
                fill="none"
                stroke="var(--muted)"
                strokeOpacity="0.55"
                strokeWidth={Math.min(7, 1 + l.kw * 0.9)}
                strokeDasharray="7 7"
              >
                <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.1s" repeatCount="indefinite" />
              </path>
            ) : null
          )}

          {/* source nodes */}
          {sources.map((src, i) => (
            <g key={src.id}>
              <rect x="10" y={srcY(i) - 20} width="140" height="40" rx="9" fill="var(--panel-2)" stroke={src.color} strokeOpacity="0.6" />
              <text x="22" y={srcY(i) - 2} fontSize="12" fill="var(--text)" fontWeight="600">
                {src.name}
              </text>
              <text x="22" y={srcY(i) + 13} fontSize="11" fill={src.color}>
                {src.id === "genset" && src.kw === 0 ? "standby" : `${src.kw} kW`}
              </text>
            </g>
          ))}

          {/* battery hub */}
          <g>
            <rect x="330" y="105" width="100" height="90" rx="12" fill="var(--panel-2)" stroke="var(--accent)" strokeOpacity="0.7" />
            <text x="380" y="135" fontSize="12" textAnchor="middle" fill="var(--muted)">
              BATTERY
            </text>
            <text x="380" y="163" fontSize="22" textAnchor="middle" fill="var(--accent)" fontWeight="700">
              {Math.round(e.batterySoC)}%
            </text>
            <text x="380" y="182" fontSize="10" textAnchor="middle" fill="var(--muted)">
              {e.batteryCapacityKwh} kWh
            </text>
          </g>

          {/* load nodes */}
          {loads.map((l, i) => (
            <g key={l.id}>
              <rect x="590" y={loadY(i) - 16} width="160" height="34" rx="8" fill="var(--panel-2)" stroke="var(--border)" />
              <text x="600" y={loadY(i) - 2} fontSize="11" fill="var(--text)">
                {l.name.length > 20 ? l.name.slice(0, 19) + "…" : l.name}
              </text>
              <text x="600" y={loadY(i) + 12} fontSize="10" fill="var(--muted)">
                {l.kw} kW
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

/* ---------------------------------- water ---------------------------------- */

function WaterFlow({ water }: { water: WaterReport }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
        Water flow — {water.storagePct}% storage · potable{" "}
        {water.treatment.potableOk ? "SAFE" : "CHECK"}
      </h2>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[--border] bg-[--panel] p-4 text-sm">
        <Pipe label="Rain + Well + Greywater" color="#3aa7ff" />
        <Arrow />
        <Pipe
          label={`Treatment ${water.treatment.stages.every((s) => s.ok) ? "✓" : "⚠"}`}
          color={water.treatment.potableOk ? "var(--accent)" : "var(--danger)"}
        />
        <Arrow />
        <Pipe label={`Storage ${water.storagePct}%`} color="#3aa7ff" />
        <Arrow />
        {water.ladder.slice(0, 4).map((r) => (
          <Pipe
            key={r.rank}
            label={`${r.rank}. ${r.use.split(" (")[0]}`}
            color={r.protected ? "var(--accent)" : r.status === "supplied" ? "var(--muted)" : "var(--warn)"}
          />
        ))}
        <Link href="/water" className="ml-auto text-xs text-[--accent] hover:underline">
          full water system →
        </Link>
      </div>
    </section>
  );
}

function Pipe({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-full border px-3 py-1.5 text-xs font-medium"
      style={{ borderColor: color, color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
    >
      {label}
    </span>
  );
}

function Arrow() {
  return <span className="text-[--muted]">→</span>;
}

/* --------------------------------- what-if ---------------------------------- */

function WhatIf({ baseLoad, baseCloud }: { baseLoad: number; baseCloud: number }) {
  const [cloud, setCloud] = useState(Math.round(baseCloud * 100));
  const [hours, setHours] = useState(12);
  const [loadDelta, setLoadDelta] = useState(0);
  const [pred, setPred] = useState<Prediction | null>(null);
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentNote, setAgentNote] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/predict?hours=${hours}&cloud=${cloud / 100}&loadDelta=${loadDelta}`,
          { cache: "no-store" }
        );
        if (r.ok) setPred(await r.json());
      } catch {
        /* ignore */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [cloud, hours, loadDelta]);

  async function askAgent() {
    setAgentBusy(true);
    setAgentNote(null);
    try {
      const r = await fetch("/api/agent/run", { method: "POST" });
      if (r.ok) {
        const j = await r.json();
        setAgentNote(`${j.mode === "claude" ? "🤖 Claude" : "⚙️ Rule engine"}: ${j.summary}`);
      }
    } catch {
      setAgentNote("Agent unavailable.");
    } finally {
      setAgentBusy(false);
    }
  }

  const color =
    pred?.minsToEmpty != null
      ? "var(--danger)"
      : pred?.minsToCritical != null
      ? "var(--warn)"
      : "var(--accent)";
  const data = (pred?.trajectory ?? []).map((t) => ({
    h: +(t.minutesAhead / 60).toFixed(1),
    soc: t.soc,
  }));

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
        What-if console — drag the weather, watch the future recompute
      </h2>
      <div className="grid gap-4 rounded-xl border border-[--border] bg-[--panel] p-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-5">
          <Slider
            label={`Cloud cover — ${cloud}%`}
            min={0}
            max={100}
            value={cloud}
            onChange={setCloud}
          />
          <Slider
            label={`Horizon — ${hours} h`}
            min={2}
            max={36}
            value={hours}
            onChange={setHours}
          />
          <Slider
            label={`Extra load — ${loadDelta >= 0 ? "+" : ""}${loadDelta} kW (base ${baseLoad} kW)`}
            min={-5}
            max={15}
            value={loadDelta}
            onChange={setLoadDelta}
          />
          <button
            onClick={askAgent}
            disabled={agentBusy}
            className="w-full rounded-xl bg-[--accent] px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {agentBusy ? "Agent reviewing…" : "🤖 Have the agent plan for this"}
          </button>
          {agentNote && (
            <p className="max-h-32 overflow-auto text-xs leading-snug text-[--muted]">{agentNote}</p>
          )}
        </div>

        <div>
          {pred && (
            <>
              <p className="mb-2 text-sm" style={{ color }}>
                {pred.summary}
              </p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
                    <defs>
                      <linearGradient id="whatifFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="h"
                      tick={{ fontSize: 10, fill: "var(--muted)" }}
                      tickFormatter={(v: number) => `+${v}h`}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--panel-2)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v}%`, "battery"]}
                      labelFormatter={(v: number) => `+${v} h`}
                    />
                    <ReferenceLine y={20} stroke="var(--warn)" strokeDasharray="4 4" />
                    <Area
                      type="monotone"
                      dataKey="soc"
                      stroke={color}
                      strokeWidth={2}
                      fill="url(#whatifFill)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[--accent]"
      />
    </label>
  );
}

function Badge({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-[--border] bg-[--panel] px-3 py-2">
      <div className="text-lg font-semibold text-[--accent]">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-[--muted]">{label}</div>
    </div>
  );
}
