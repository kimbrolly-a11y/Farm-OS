"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HospitalityReport } from "@/lib/hospitality";
import type { AttractionsReport } from "@/lib/attractions";

interface Data {
  hospitality: HospitalityReport;
  attractions: AttractionsReport;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  open: { label: "open", color: "var(--accent)" },
  "staffed-hours": { label: "staffed hours", color: "#3aa7ff" },
  seasonal: { label: "seasonal", color: "var(--warn)" },
  "phase-4": { label: "phase 4", color: "var(--muted)" },
};

const BOOKING_COLOR: Record<string, string> = {
  "arriving-today": "var(--accent)",
  "in-house": "#3aa7ff",
  upcoming: "var(--muted)",
  enquiry: "var(--warn)",
};

export function ResortView() {
  const [d, setD] = useState<Data | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/resort", { cache: "no-store" });
        if (r.ok) setD(await r.json());
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (!d) return <div className="p-8 text-[--muted]">Loading Verdant World…</div>;

  const h = d.hospitality;
  const a = d.attractions;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Verdant World — Resort & Attractions</h1>
          <p className="text-[--muted]">
            Hospitality at 150–300-guest scale, run lean: the AI handles ops; people handle safety
            & craft.
          </p>
        </div>
        <div className="flex gap-3">
          <Stat value={`${h.occupancyPct}%`} label="occupancy" accent="var(--accent)" />
          <Stat value={`${h.guestsOnSite}`} label="guests on site" accent="#3aa7ff" />
          <Stat
            value={`${h.currency} ${(h.revenueTonight + a.ticketRevenueToday).toLocaleString()}`}
            label="rooms + tickets today"
            accent="var(--warn)"
          />
        </div>
      </header>

      {/* Lodging tiers */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Lodging
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {h.tiers.map((t) => {
            const pct = t.unitsOpen ? Math.round((t.occupied / t.unitsOpen) * 100) : 0;
            return (
              <div key={t.id} className="rounded-xl border border-[--border] bg-[--panel] p-4">
                <div className="mb-1 font-medium">{t.name}</div>
                <div className="mb-2 text-xs text-[--muted]">{t.phase}</div>
                {t.unitsOpen > 0 ? (
                  <>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span>
                        {t.occupied} / {t.unitsOpen} occupied
                      </span>
                      <span className="text-[--muted]">
                        {h.currency} {t.ratePerNight}/nt
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[--panel-2]">
                      <div
                        className="h-full rounded-full bg-[--accent]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {t.unitsDesign > t.unitsOpen && (
                      <div className="mt-1 text-[11px] text-[--muted]">
                        design capacity {t.unitsDesign}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-[--muted]">
                    {t.unitsDesign} units · {h.currency} {t.ratePerNight}/nt planned
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bookings stub */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Bookings (Beds24-class sync)
        </h2>
        <div className="overflow-hidden rounded-xl border border-[--border]">
          {h.bookings.map((b, i) => {
            const c = BOOKING_COLOR[b.status];
            return (
              <div
                key={b.id}
                className={`flex flex-wrap items-center gap-3 bg-[--panel] px-4 py-2.5 text-sm ${
                  i > 0 ? "border-t border-[--border]" : ""
                }`}
              >
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                  style={{ color: c, background: `color-mix(in srgb, ${c} 15%, transparent)` }}
                >
                  {b.status.replace("-", " ")}
                </span>
                <span className="font-medium">{b.guest}</span>
                <span className="text-[--muted]">
                  {b.party} pax · {b.tier} · {b.nights} night{b.nights > 1 ? "s" : ""} ·{" "}
                  {b.checkIn}
                </span>
                {b.note && <span className="text-xs text-[--muted]">— {b.note}</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Attractions */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[--muted]">
            Attractions — {a.ticketsToday} tickets today
          </h2>
          <span className="text-xs text-[--muted]">
            🧍 = human-staffed (safety-critical — never automated)
          </span>
        </div>
        {a.categories.map((cat) => (
          <div key={cat} className="mb-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[--muted]">
              {cat}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {a.attractions
                .filter((x) => x.category === cat)
                .map((x) => {
                  const st = STATUS_LABEL[x.status];
                  return (
                    <div
                      key={x.id}
                      className="rounded-xl border border-[--border] bg-[--panel] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {x.name} {x.humanStaffed && "🧍"}
                        </span>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                          style={{
                            color: st.color,
                            background: `color-mix(in srgb, ${st.color} 15%, transparent)`,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between text-xs text-[--muted]">
                        <span>{x.note ?? ""}</span>
                        <span className="shrink-0 font-medium text-[--text]">
                          {a.currency} {x.priceRm.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </section>
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
      <div className="text-xl font-semibold" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide text-[--muted]">{label}</div>
    </div>
  );
}
