"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MorningBrief } from "@/lib/brief";

export function BriefView() {
  const [d, setD] = useState<MorningBrief | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/brief", { cache: "no-store" });
        if (r.ok) setD(await r.json());
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  if (!d) return <div className="p-8 text-[--muted]">Preparing your brief…</div>;

  const when = new Date(d.generatedAt);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>

      <header className="mt-6 mb-8 border-b border-[--border] pb-6">
        <div className="mb-2 text-xs uppercase tracking-widest text-[--muted]">
          Morning brief ·{" "}
          {when.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
          {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <h1 className="text-3xl font-semibold leading-tight">{d.headline}</h1>
      </header>

      <section className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {d.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[--border] bg-[--panel] p-3 text-center"
          >
            <div className="text-lg font-semibold text-[--accent]">{s.value}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-[--muted]">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {d.sections.map((sec) => (
        <section key={sec.title} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
            {sec.title}
          </h2>
          <div className="space-y-2">
            {sec.items.map((it, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-[--border] bg-[--panel] px-4 py-3"
              >
                <span className="text-lg leading-6">{it.icon}</span>
                <div>
                  <div className="text-sm">{it.text}</div>
                  {it.detail && (
                    <div className="mt-0.5 text-xs italic text-[--muted]">“{it.detail}”</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-10 border-t border-[--border] pt-4 text-center text-xs text-[--muted]">
        Compiled by your FarmOS agent from the live twin — full trail in the{" "}
        <Link href="/activity" className="text-[--accent] hover:underline">
          Activity Log
        </Link>
        .
      </footer>
    </main>
  );
}
