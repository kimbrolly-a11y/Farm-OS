"use client";

import type { Alert } from "@/lib/types";

const SEV_COLOR: Record<Alert["severity"], string> = {
  critical: "var(--danger)",
  warning: "var(--warn)",
  info: "var(--accent)",
};

export function AlertsStrip({ alerts }: { alerts: Alert[] }) {
  const active = alerts.filter((a) => !a.acknowledged).slice(-6).reverse();

  if (active.length === 0) {
    return (
      <div className="rounded-xl border border-[--border] bg-[--panel] px-4 py-3 text-sm text-[--muted]">
        ✓ No active alerts — all systems nominal.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {active.map((a) => {
        const color = SEV_COLOR[a.severity];
        return (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm"
            style={{
              borderColor: color,
              background: "color-mix(in srgb, " + color + " 10%, transparent)",
            }}
          >
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
              style={{ color, border: `1px solid ${color}` }}
            >
              {a.severity}
            </span>
            <span className="flex-1">{a.message}</span>
            {a.queued && (
              <span className="text-xs text-[--muted]">⏳ queued (offline)</span>
            )}
            <span className="text-xs text-[--muted]">{a.channel}</span>
          </div>
        );
      })}
    </div>
  );
}
