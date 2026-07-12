"use client";

import Link from "next/link";
import { useTwin } from "./useTwin";
import { VerticalArt } from "./VerticalArt";
import { visualFor } from "@/lib/verticalVisuals";

const STATUS_COLOR = {
  ok: "var(--accent)",
  warning: "var(--warn)",
  critical: "var(--danger)",
} as const;

export function VerticalsGallery() {
  const { twin, loading } = useTwin(2500);

  if (loading && !twin)
    return <div className="grid min-h-screen place-items-center text-[--muted]">Loading…</div>;
  if (!twin) return <div className="p-8 text-[--danger]">No data.</div>;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-[--muted] hover:text-[--text]">
            ← Welcome
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">The farm · {twin.farm.name}</h1>
          <p className="text-[--muted]">
            Ten verticals plus on-farm processing — tap any to go inside.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-[--border] px-4 py-2 text-sm hover:border-[--muted]"
        >
          Command center →
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {twin.verticals.map((v) => {
          const vis = visualFor(v.id);
          const statusColor = STATUS_COLOR[v.status];
          return (
            <Link
              key={v.id}
              href={`/vertical/${v.id}`}
              className="group overflow-hidden rounded-2xl border border-[--border] bg-[--panel] transition-colors hover:border-[--muted]"
            >
              <VerticalArt id={v.id} rounded="rounded-none" className="h-36 w-full" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: vis.color }}>
                    {v.name}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
                    title={v.status}
                  />
                </div>
                <p className="mt-0.5 text-xs text-[--muted]">{vis.tagline}</p>
                {v.headline && (
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">{v.headline.value}</span>
                    <span className="text-sm text-[--muted]">{v.headline.unit}</span>
                    <span className="ml-2 text-xs text-[--muted]">{v.headline.label}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
