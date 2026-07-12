"use client";

import Link from "next/link";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTwin } from "./useTwin";
import { VerticalArt } from "./VerticalArt";
import type { SensorReading } from "@/lib/types";

const STATUS_COLOR = {
  ok: "var(--accent)",
  warning: "var(--warn)",
  critical: "var(--danger)",
} as const;

export function VerticalDetail({ verticalId }: { verticalId: string }) {
  const { twin, loading } = useTwin(2000);

  if (loading && !twin) {
    return <div className="p-8 text-[--muted]">Loading…</div>;
  }
  if (!twin) return <div className="p-8 text-[--danger]">No data.</div>;

  const vertical = twin.verticals.find((v) => v.id === verticalId);
  if (!vertical) {
    return (
      <div className="p-8">
        <p className="text-[--danger]">Unknown vertical: {verticalId}</p>
        <Link href="/dashboard" className="text-[--accent] underline">
          ← back
        </Link>
      </div>
    );
  }

  const assets = twin.assets.filter((a) => a.verticalId === verticalId);
  const sensors = twin.sensors.filter((s) => s.verticalId === verticalId);
  const color = STATUS_COLOR[vertical.status];

  // build recent series per sensor
  const seriesFor = (sensorId: string) =>
    twin.readings
      .filter((r) => r.sensorId === sensorId)
      .slice(-30)
      .map((r: SensorReading) => ({ t: r.timestamp.slice(11, 19), value: r.value }));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
          ← Command Center
        </Link>
      </div>

      <header className="mb-6 flex items-center gap-3">
        <VerticalArt id={vertical.id} className="h-12 w-12 shrink-0" />
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}
        />
        <h1 className="text-2xl font-semibold">{vertical.name}</h1>
        {vertical.headline && (
          <span className="ml-2 text-[--muted]">
            {vertical.headline.label}:{" "}
            <span style={{ color }} className="font-medium">
              {vertical.headline.value}
              {vertical.headline.unit}
            </span>
          </span>
        )}
      </header>

      {vertical.insights && vertical.insights.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
            AI insights
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vertical.insights.map((ins) => {
              const c =
                ins.level === "good"
                  ? "var(--accent)"
                  : ins.level === "watch"
                  ? "var(--warn)"
                  : "var(--danger)";
              return (
                <div
                  key={ins.key}
                  className="rounded-xl border bg-[--panel] p-4"
                  style={{ borderColor: `color-mix(in srgb, ${c} 40%, var(--border))` }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-[--muted]">{ins.label}</span>
                    <span className="text-lg font-semibold" style={{ color: c }}>
                      {ins.value}
                      <span className="ml-0.5 text-xs">{ins.unit}</span>
                    </span>
                  </div>
                  <div
                    className="mt-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                    style={{ color: c, border: `1px solid ${c}` }}
                  >
                    {ins.level}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Sensors
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {sensors.map((s) => {
            const data = seriesFor(s.id);
            const last = data.length ? data[data.length - 1].value : "—";
            return (
              <div
                key={s.id}
                className="rounded-xl border border-[--border] bg-[--panel] p-4"
              >
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm capitalize">
                    {s.metric.replace(/_/g, " ")}
                  </span>
                  <span className="text-lg font-semibold">
                    {last}
                    <span className="ml-1 text-xs text-[--muted]">{s.unit}</span>
                  </span>
                </div>
                {data.length > 2 ? (
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                        <XAxis dataKey="t" hide />
                        <YAxis
                          domain={["auto", "auto"]}
                          tick={{ fontSize: 10, fill: "var(--muted)" }}
                          width={34}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--panel-2)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          labelStyle={{ color: "var(--muted)" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="var(--accent)"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-24 grid place-items-center text-xs text-[--muted]">
                    collecting…
                  </div>
                )}
                <div className="mt-1 text-[10px] text-[--muted]">{s.product}</div>
              </div>
            );
          })}
          {sensors.length === 0 && (
            <p className="text-sm text-[--muted]">No sensors in this vertical.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Actuators
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-[--border] bg-[--panel] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{a.id}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    a.state === "on"
                      ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[--accent]"
                      : "bg-[color-mix(in_srgb,var(--warn)_18%,transparent)] text-[--warn]"
                  }`}
                >
                  {a.state}
                </span>
              </div>
              <div className="mt-1 text-xs text-[--muted]">
                {a.type.replace(/_/g, " ")} · {a.powerDraw} W
              </div>
              <div
                className="mt-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
                style={{
                  color:
                    a.criticality === "life_support"
                      ? "var(--danger)"
                      : a.criticality === "important"
                      ? "var(--warn)"
                      : "var(--muted)",
                  border: "1px solid currentColor",
                }}
              >
                {a.criticality.replace(/_/g, " ")}
              </div>
              {a.hardware && (
                <div className="mt-2 text-[10px] text-[--muted]">{a.hardware}</div>
              )}
            </div>
          ))}
          {assets.length === 0 && (
            <p className="text-sm text-[--muted]">No actuators in this vertical.</p>
          )}
        </div>
      </section>
    </main>
  );
}
