"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { Resources } from "@/lib/types";
import type { HistoryPoint } from "./useTwin";

function socColor(soc: number): string {
  if (soc <= 25) return "var(--danger)";
  if (soc <= 45) return "var(--warn)";
  return "var(--accent)";
}

export function EnergyPanel({
  energy,
  history,
}: {
  energy: Resources["energy"];
  history: HistoryPoint[];
}) {
  const soc = energy.batterySoC;
  const color = socColor(soc);
  const s = energy.sources;
  const generationKw = energy.solarInputKw + (s ? s.biogasKw + s.windKw + s.gensetKw : 0);
  const net = Math.round((generationKw - energy.loadKw) * 100) / 100;

  return (
    <div className="rounded-xl border border-[--border] bg-[--panel] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Energy
        </h2>
        <div className="flex items-center gap-2">
          {s && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                color: s.renewablePct >= 100 ? "var(--accent)" : "var(--warn)",
                background:
                  "color-mix(in srgb, " +
                  (s.renewablePct >= 100 ? "var(--accent)" : "var(--warn)") +
                  " 15%, transparent)",
              }}
              title="Share of current generation from solar + biogas + wind"
            >
              {s.renewablePct}% renewable{s.offGridCapable ? " · off-grid" : ""}
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              color,
              background: "color-mix(in srgb, " + color + " 15%, transparent)",
            }}
          >
            {net >= 0 ? "charging" : "draining"} {Math.abs(net)} kW
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Battery ring */}
        <div
          className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${color} ${soc * 3.6}deg, var(--panel-2) 0deg)`,
          }}
        >
          <div className="grid h-[86px] w-[86px] place-items-center rounded-full bg-[--panel]">
            <div className="text-center">
              <div className="text-2xl font-semibold" style={{ color }}>
                {Math.round(soc)}%
              </div>
              <div className="text-[10px] uppercase tracking-wide text-[--muted]">
                battery
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <Metric label="Solar" value={`${energy.solarInputKw} kW`} />
          {s && <Metric label="Biogas" value={`${s.biogasKw} kW`} />}
          {s && s.windCapKw > 0 && <Metric label="Wind" value={`${s.windKw} kW`} />}
          {s && (
            <Metric
              label="Genset"
              value={s.gensetOn ? `RUNNING ${s.gensetKw} kW` : "standby"}
              accent={s.gensetOn ? "var(--warn)" : undefined}
            />
          )}
          <Metric label="Live load" value={`${energy.loadKw} kW`} />
          <Metric
            label="Capacity"
            value={`${energy.batteryCapacityKwh} kWh · ${energy.solarArrayKw} kW array`}
          />
        </div>
      </div>

      {history.length > 2 && (
        <div className="mt-4 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="solarFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, "dataMax + 2"]} />
              <Area
                type="monotone"
                dataKey="solar"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#solarFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-center text-[10px] uppercase tracking-wide text-[--muted]">
            solar input trend
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-[--muted]">{label}</span>
      <span className="text-sm font-medium" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
    </div>
  );
}
