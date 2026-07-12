"use client";

// "Where to stay" — the three lodging tiers with their generated photography
// (public/img/stays). Exterior leads each card; click opens a lightbox that
// cycles the tier's shots. Offline-safe local JPGs, graceful if any is missing.

import { useEffect, useState } from "react";

interface Tier {
  id: string;
  name: string;
  blurb: string;
  shots: Array<{ src: string; label: string }>;
}

const TIERS: Tier[] = [
  {
    id: "hotel",
    name: "Hotel",
    blurb: "60-room eco-hotel · block A open",
    shots: [
      { src: "/img/stays/hotel_exterior.jpg", label: "Exterior" },
      { src: "/img/stays/hotel_room.jpg", label: "Room" },
      { src: "/img/stays/hotel_pool.jpg", label: "Pool" },
    ],
  },
  {
    id: "glamping",
    name: "Glamping",
    blurb: "Domes & safari tents in the grove",
    shots: [
      { src: "/img/stays/glamping_dome.jpg", label: "Dome" },
      { src: "/img/stays/glamping_tent.jpg", label: "Tent" },
      { src: "/img/stays/glamping_interior.jpg", label: "Interior" },
    ],
  },
  {
    id: "cabins",
    name: "Farm Cabins",
    blurb: "The original two — orchard views",
    shots: [
      { src: "/img/stays/cabin_exterior.jpg", label: "Exterior" },
      { src: "/img/stays/cabin_interior.jpg", label: "Interior" },
      { src: "/img/stays/cabin_cluster.jpg", label: "The cluster" },
    ],
  },
];

export function StaysGallery({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState<{ tier: Tier; index: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight")
        setOpen((o) => o && { tier: o.tier, index: (o.index + 1) % o.tier.shots.length });
      if (e.key === "ArrowLeft")
        setOpen(
          (o) =>
            o && { tier: o.tier, index: (o.index - 1 + o.tier.shots.length) % o.tier.shots.length }
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
        {TIERS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setOpen({ tier: t, index: 0 })}
            className="group overflow-hidden rounded-xl border border-[--border] bg-[--panel] text-left transition-colors hover:border-[--accent]"
          >
            <span className={`block w-full overflow-hidden ${compact ? "h-28" : "h-36"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.shots[0].src}
                alt={`${t.name} — ${t.shots[0].label}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </span>
            <span className="block p-3">
              <span className="flex items-center justify-between text-sm font-medium">
                {t.name}
                <span className="text-[10px] uppercase tracking-wide text-[--accent]">
                  {t.shots.length} photos →
                </span>
              </span>
              <span className="mt-0.5 block text-xs text-[--muted]">{t.blurb}</span>
            </span>
          </button>
        ))}
      </div>

      {/* lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={open.tier.shots[open.index].src}
              alt={`${open.tier.name} — ${open.tier.shots[open.index].label}`}
              className="max-h-[75vh] w-full rounded-xl object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="mt-3 flex items-center justify-between text-sm text-white">
              <span>
                {open.tier.name} · {open.tier.shots[open.index].label}
              </span>
              <span className="flex items-center gap-2">
                {open.tier.shots.map((s, i) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => setOpen({ tier: open.tier, index: i })}
                    className={`h-2.5 w-2.5 rounded-full ${
                      i === open.index ? "bg-[--accent]" : "bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={s.label}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="ml-3 rounded-full border border-white/40 px-3 py-1 text-xs hover:border-white"
                >
                  ✕ close
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
