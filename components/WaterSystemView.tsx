"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WaterReport } from "@/lib/water";

const STATUS_COLOR: Record<string, string> = {
  supplied: "var(--accent)",
  reduce: "var(--warn)",
  cut: "var(--danger)",
};

export function WaterSystemView() {
  const [d, setD] = useState<WaterReport | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/water", { cache: "no-store" });
        if (r.ok) setD(await r.json());
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  if (!d) return <div className="p-8 text-[--muted]">Loading water system…</div>;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Water System</h1>
          <p className="text-[--muted]">
            Off-grid sources · natural multi-barrier treatment · shortage priority ladder
          </p>
        </div>
        <div className="flex gap-3">
          <Stat value={`${d.storagePct}%`} label="storage" accent="var(--accent)" />
          <Stat value={`${d.reusePct}%`} label="water reuse" accent="#3aa7ff" />
          <Stat
            value={d.treatment.potableOk ? "SAFE" : "CHECK"}
            label="potable"
            accent={d.treatment.potableOk ? "var(--accent)" : "var(--danger)"}
          />
        </div>
      </header>

      {/* Sources */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Sources
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {d.sources.map((s) => (
            <div key={s.id} className="rounded-xl border border-[--border] bg-[--panel] p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium">{s.name}</span>
                {s.renewable && (
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[--accent]">
                    renewable
                  </span>
                )}
              </div>
              <p className="mb-2 text-xs text-[--muted]">{s.detail}</p>
              <div className="text-sm">
                <span className="text-[--muted]">{s.stat.label}: </span>
                <span className="font-medium">
                  {s.stat.value}
                  {s.stat.unit && ` ${s.stat.unit}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Treatment train */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Potable treatment — natural, chemical-free
        </h2>
        <div className="flex flex-wrap items-stretch gap-2">
          {d.treatment.stages.map((st, i) => (
            <div key={st.id} className="flex items-center gap-2">
              <div
                className="min-w-44 rounded-xl border bg-[--panel] p-3"
                style={{
                  borderColor: st.ok ? "var(--border)" : "var(--danger)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: st.ok ? "var(--accent)" : "var(--danger)" }}
                  />
                  <span className="text-sm font-medium">{st.name}</span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-[--muted]">{st.detail}</p>
                {st.reading && (
                  <div className="mt-1.5 text-xs">
                    <span className="text-[--muted]">{st.reading.label}: </span>
                    <span className="font-medium">
                      {st.reading.value} {st.reading.unit}
                    </span>
                  </div>
                )}
              </div>
              {i < d.treatment.stages.length - 1 && (
                <span className="text-lg text-[--muted]">→</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[--muted]">
          {d.treatment.note} · Flow {d.treatment.flowLpm} L/min · Treatment assets are{" "}
          <span className="text-[--accent]">never_shed</span> — potable water is life support.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Storage */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
            Storage
          </h2>
          <div className="space-y-3">
            {d.tanks.map((t) => (
              <div key={t.id} className="rounded-xl border border-[--border] bg-[--panel] p-4">
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{t.id}</span>
                  <span className="text-[--muted]">
                    {Math.round((t.capacityL * t.levelPct) / 100 / 100) / 10} / {t.capacityL / 1000} kL
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[--panel-2]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${t.levelPct}%`,
                      background: t.levelPct < 25 ? "var(--danger)" : t.levelPct < 45 ? "var(--warn)" : "#3aa7ff",
                    }}
                  />
                </div>
                <div className="mt-1 text-right text-xs text-[--muted]">{t.levelPct}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* Shortage ladder */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
            Shortage priority ladder
          </h2>
          <div className="space-y-2">
            {d.ladder.map((r) => {
              const c = STATUS_COLOR[r.status];
              return (
                <div
                  key={r.rank}
                  className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--panel] px-4 py-2.5"
                  style={{ borderLeft: `3px solid ${r.protected ? "var(--accent)" : c}` }}
                >
                  <span className="w-5 text-center text-sm font-semibold text-[--muted]">
                    {r.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {r.use}
                      {r.protected && (
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[--accent]">
                          never cut
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-[--muted]">{r.detail}</div>
                  </div>
                  <span className="text-xs font-medium uppercase" style={{ color: c }}>
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[--muted]">
            The agent cuts from the bottom up as storage falls — mirroring the energy
            load-shedding ladder. People and animals always drink.
          </p>
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div
      className="rounded-xl border px-4 py-3 text-center"
      style={{
        borderColor: accent,
        background: `color-mix(in srgb, ${accent} 10%, transparent)`,
      }}
    >
      <div className="text-2xl font-semibold" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide text-[--muted]">{label}</div>
    </div>
  );
}
