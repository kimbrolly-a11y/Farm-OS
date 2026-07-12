"use client";

// FarmMap — the whole of Verdant Acres on one page. An AI-rendered map sets the
// scene (four styles to switch between); the interactive legend below is the real
// map key — every zone is a live, tappable link into its digital-twin detail.

import Link from "next/link";
import { useState } from "react";
import { useTwin } from "./useTwin";
import { VERTICAL_VISUALS } from "@/lib/verticalVisuals";

const STYLES = [
  { id: "map_isometric", label: "3D map" },
  { id: "map_iso_hud", label: "Digital twin" },
  { id: "map_illustrated", label: "Illustrated" },
  { id: "map_aerial", label: "Aerial" },
] as const;

const STATUS_COLOR: Record<string, string> = {
  ok: "var(--accent)",
  warning: "var(--warn)",
  critical: "var(--danger)",
};

// non-vertical attractions that live on the land but route to /attractions
const ATTRACTIONS = [
  "Pool & lazy river",
  "Forest adventure trails",
  "Lake · canoeing",
  "Fishing & prawning",
  "Solar & wind",
  "BBQ & farm-to-table",
];

export function FarmMap() {
  const { twin } = useTwin(3000);
  const [style, setStyle] = useState<string>("map_isometric");

  const byId = new Map((twin?.verticals ?? []).map((v) => [v.id, v]));
  const zoneIds = Object.keys(VERTICAL_VISUALS);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-[--muted] hover:text-[--text]">
            ← Welcome
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            Farm map · {twin?.farm.name ?? "Verdant Acres"}
          </h1>
          <p className="text-[--muted]">
            {twin?.farm.areaAcres ?? 100} acres · {zoneIds.length} verticals + attractions.
            Tap any zone to enter its live view.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-[--border] px-4 py-2 text-sm hover:border-[--muted]"
        >
          Command center →
        </Link>
      </header>

      {/* style switcher */}
      <div className="mb-3 flex flex-wrap gap-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyle(s.id)}
            aria-pressed={style === s.id}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              style === s.id
                ? "border-[--accent] bg-[--accent] text-white"
                : "border-[--border] text-[--muted] hover:border-[--muted] hover:text-[--text]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* the map */}
      <figure className="relative overflow-hidden rounded-2xl border border-[--border] bg-[--panel-2]">
        <div className="grid aspect-[16/10] w-full place-items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/img/map/${style}.jpg`}
            alt={`Verdant Acres — ${style.replace("map_", "").replace("_", " ")} map`}
            className="h-full w-full object-contain"
          />
        </div>
        <figcaption className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/45 to-transparent p-3 text-[11px] text-white/90">
          <span className="rounded bg-black/40 px-2 py-1">
            Illustrative map — AI-rendered
          </span>
          <span className="rounded bg-black/40 px-2 py-1">
            Verdant Acres · Malaysia
          </span>
        </figcaption>
      </figure>

      {/* interactive legend — the real map key */}
      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-[--muted]">
        Zones — tap to enter
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {zoneIds.map((id, i) => {
          const vis = VERTICAL_VISUALS[id];
          const v = byId.get(id);
          const status = v?.status ?? "ok";
          return (
            <Link
              key={id}
              href={`/vertical/${id}`}
              className="group flex items-center gap-3 rounded-xl border border-[--border] bg-[--panel] p-2.5 transition-colors hover:border-[--muted]"
            >
              <span className="relative block h-14 w-14 flex-none overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/img/verticals/${id}.jpg`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="absolute left-1 top-1 grid h-4 w-4 place-items-center rounded bg-black/55 text-[9px] font-semibold text-white">
                  {i + 1}
                </span>
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 flex-none rounded-full"
                    style={{ background: STATUS_COLOR[status], boxShadow: `0 0 6px ${STATUS_COLOR[status]}` }}
                    title={status}
                  />
                  <span className="truncate text-sm font-medium" style={{ color: vis.color }}>
                    {vis.name}
                  </span>
                </span>
                {v?.headline ? (
                  <span className="mt-0.5 block truncate text-xs text-[--muted]">
                    {v.headline.value}
                    {v.headline.unit ? ` ${v.headline.unit}` : ""} · {v.headline.label}
                  </span>
                ) : (
                  <span className="mt-0.5 block truncate text-xs text-[--muted]">{vis.tagline}</span>
                )}
              </span>
            </Link>
          );
        })}
      </div>

      {/* attractions */}
      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-[--muted]">
        Attractions & infrastructure
      </h2>
      <div className="flex flex-wrap gap-2">
        {ATTRACTIONS.map((a) => (
          <Link
            key={a}
            href="/attractions"
            className="rounded-full border border-[--border] bg-[--panel] px-3.5 py-1.5 text-sm text-[--muted] transition-colors hover:border-[--muted] hover:text-[--text]"
          >
            {a}
          </Link>
        ))}
      </div>
    </main>
  );
}
