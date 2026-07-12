"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Loop {
  id: string;
  category: "energy" | "water" | "soil" | "feed" | "material";
  from: string;
  process: string;
  to: string;
  note: string;
}
interface Product {
  name: string;
  from: string;
  sellable: boolean;
}
interface Data {
  loops: Loop[];
  products: Product[];
  circularityScore: number;
}

const CAT_COLOR: Record<string, string> = {
  energy: "var(--warn)",
  water: "#3aa7ff",
  soil: "#a8763f",
  feed: "var(--accent)",
  material: "#b98cff",
};

export function LoopsView() {
  const [d, setD] = useState<Data | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/loops", { cache: "no-store" });
        if (r.ok) setD(await r.json());
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (!d) return <div className="p-8 text-[--muted]">Loading resource loops…</div>;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Circular Resource Loops</h1>
          <p className="text-[--muted]">
            Every output feeds another process — nothing is wasted. Zero-discharge target.
          </p>
        </div>
        <div className="rounded-xl border border-[--accent] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-4 py-3 text-center">
          <div className="text-3xl font-semibold text-[--accent]">{d.circularityScore}%</div>
          <div className="text-xs uppercase tracking-wide text-[--muted]">circularity</div>
        </div>
      </header>

      <section className="mb-8 space-y-2">
        {d.loops.map((l) => {
          const c = CAT_COLOR[l.category];
          return (
            <div
              key={l.id}
              className="rounded-xl border border-[--border] bg-[--panel] p-4"
              style={{ borderLeft: `3px solid ${c}` }}
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{l.from}</span>
                <span className="text-[--muted]">→</span>
                <span className="rounded px-2 py-0.5 text-xs" style={{ color: c, border: `1px solid ${c}` }}>
                  {l.process}
                </span>
                <span className="text-[--muted]">→</span>
                <span className="font-medium" style={{ color: c }}>{l.to}</span>
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[10px] uppercase"
                  style={{ color: c, background: `color-mix(in srgb, ${c} 14%, transparent)` }}
                >
                  {l.category}
                </span>
              </div>
              {l.note && <p className="mt-1 text-xs text-[--muted]">{l.note}</p>}
            </div>
          );
        })}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Products made from waste ({d.products.length})
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {d.products.map((p) => (
            <div key={p.name} className="rounded-xl border border-[--border] bg-[--panel] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{p.name}</span>
                {p.sellable && (
                  <span className="rounded-full border border-[--accent] px-1.5 py-0.5 text-[10px] text-[--accent]">
                    sellable
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[--muted]">from {p.from}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
