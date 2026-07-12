"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SustainabilityReport } from "@/lib/sustainability";

const PILLAR_COLOR: Record<string, string> = {
  E: "var(--accent)",
  S: "#3aa7ff",
  G: "#b98cff",
};

const CERT_COLOR: Record<string, string> = {
  held: "var(--accent)",
  "in-progress": "var(--warn)",
  planned: "var(--muted)",
};

export function SustainabilityView() {
  const [d, setD] = useState<SustainabilityReport | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/sustainability", { cache: "no-store" });
        if (r.ok) setD(await r.json());
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (!d) return <div className="p-8 text-[--muted]">Loading sustainability…</div>;

  const h = d.headline;
  const tiles: Array<{ value: string; label: string; accent: string }> = [
    { value: `${h.renewablePct}%`, label: "renewable now", accent: "var(--accent)" },
    { value: `${h.energySelfSufficiencyPct}%`, label: "energy self-sufficient", accent: "var(--accent)" },
    { value: `${h.circularityPct}%`, label: "circularity", accent: "#b98cff" },
    { value: `${h.waterReusePct}%`, label: "water reuse", accent: "#3aa7ff" },
    { value: `${h.foodSelfSufficiencyPct}%`, label: "food self-sufficient", accent: "var(--warn)" },
    { value: `${h.carbonAvoidedTonsYear} t`, label: "CO₂e avoided / yr", accent: "var(--accent)" },
  ];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sustainability · ESG</h1>
          <p className="text-[--muted]">
            Live from the twin — energy, water, circularity and governance in one score.
          </p>
        </div>
        <div
          className="rounded-xl border px-5 py-3 text-center"
          style={{
            borderColor: "var(--accent)",
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
          }}
        >
          <div className="text-4xl font-semibold text-[--accent]">{d.esgScore}</div>
          <div className="text-xs uppercase tracking-wide text-[--muted]">ESG score</div>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-xl border border-[--border] bg-[--panel] p-3 text-center"
          >
            <div className="text-xl font-semibold" style={{ color: t.accent }}>
              {t.value}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-[--muted]">
              {t.label}
            </div>
          </div>
        ))}
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {d.pillars.map((p) => {
          const c = PILLAR_COLOR[p.key];
          return (
            <div key={p.key} className="rounded-xl border border-[--border] bg-[--panel] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full text-sm font-semibold"
                    style={{ background: `color-mix(in srgb, ${c} 18%, transparent)`, color: c }}
                  >
                    {p.key}
                  </span>
                  {p.name}
                </span>
                <span className="text-lg font-semibold" style={{ color: c }}>
                  {p.score}
                </span>
              </div>
              <div className="space-y-2.5">
                {p.items.map((it) => (
                  <div key={it.label}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span>{it.label}</span>
                      <span className="font-medium" style={{ color: c }}>
                        {it.value}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug text-[--muted]">{it.note}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Certifications
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {d.certifications.map((cert) => {
            const c = CERT_COLOR[cert.status];
            return (
              <div key={cert.name} className="rounded-xl border border-[--border] bg-[--panel] p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{cert.name}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                    style={{ color: c, background: `color-mix(in srgb, ${c} 15%, transparent)` }}
                  >
                    {cert.status}
                  </span>
                </div>
                <p className="text-xs text-[--muted]">{cert.note}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-[--muted]">
          Carbon-avoided figure = grid displacement by on-farm renewables + digester methane
          capture + biochar soil sequestration ({h.carbonAvoidedKgDay} kg CO₂e/day). Only a
          unified live twin can compute this in real time — it is the basis for verified
          carbon credits.
        </p>
      </section>
    </main>
  );
}
