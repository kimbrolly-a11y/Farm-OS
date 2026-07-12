"use client";

import type { Resources } from "@/lib/types";

function levelColor(pct: number): string {
  if (pct <= 20) return "var(--danger)";
  if (pct <= 40) return "var(--warn)";
  return "#3aa7ff";
}

export function WaterPanel({ water }: { water: Resources["water"] }) {
  return (
    <div className="rounded-xl border border-[--border] bg-[--panel] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Water
        </h2>
        <span className="text-xs text-[--muted]">
          well: {water.wellStatus}
        </span>
      </div>

      <div className="space-y-4">
        {water.tanks.map((tank) => {
          const color = levelColor(tank.levelPct);
          const liters = Math.round((tank.levelPct / 100) * tank.capacityL);
          return (
            <div key={tank.id}>
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className="text-[--muted]">{tank.id}</span>
                <span className="font-medium" style={{ color }}>
                  {tank.levelPct}% ·{" "}
                  <span className="text-[--muted]">
                    {liters.toLocaleString()} / {tank.capacityL.toLocaleString()} L
                  </span>
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[--panel-2]">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${tank.levelPct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
