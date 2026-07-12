"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Prediction {
  horizonHours: number;
  minsToCritical: number | null;
  minsToEmpty: number | null;
  socFloor: number;
  summary: string;
  trajectory: { minutesAhead: number; soc: number }[];
}

export function PredictivePanel() {
  const [p, setP] = useState<Prediction | null>(null);

  useEffect(() => {
    const fetchP = async () => {
      try {
        const r = await fetch("/api/predict", { cache: "no-store" });
        if (r.ok) setP(await r.json());
      } catch {
        /* ignore */
      }
    };
    fetchP();
    const id = setInterval(fetchP, 4000);
    return () => clearInterval(id);
  }, []);

  if (!p) return null;

  const critical = p.minsToEmpty !== null || p.minsToCritical !== null;
  const color = p.minsToEmpty !== null ? "var(--danger)" : p.minsToCritical !== null ? "var(--warn)" : "var(--accent)";
  const data = p.trajectory.map((t) => ({ h: +(t.minutesAhead / 60).toFixed(1), soc: t.soc }));

  return (
    <div className="rounded-xl border border-[--border] bg-[--panel] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Battery outlook · {p.horizonHours}h
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          {p.minsToEmpty !== null
            ? "empties soon"
            : p.minsToCritical !== null
            ? "critical ahead"
            : "healthy"}
        </span>
      </div>

      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="socFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="h"
              tick={{ fontSize: 10, fill: "var(--muted)" }}
              tickFormatter={(h) => `${h}h`}
              interval={7}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted)" }} width={30} />
            <ReferenceLine y={20} stroke="var(--warn)" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}%`, "SoC"]}
              labelFormatter={(h) => `+${h}h`}
            />
            <Area
              type="monotone"
              dataKey="soc"
              stroke={color}
              strokeWidth={2}
              fill="url(#socFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p
        className="mt-2 text-sm"
        style={{ color: critical ? color : "var(--muted)" }}
      >
        {p.summary}
      </p>
    </div>
  );
}
