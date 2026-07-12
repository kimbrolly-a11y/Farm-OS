"use client";

import Link from "next/link";
import { useState } from "react";
import { useTwin } from "./useTwin";
import { EnergyPanel } from "./EnergyPanel";
import { WaterPanel } from "./WaterPanel";
import { PredictivePanel } from "./PredictivePanel";
import { VerticalCard } from "./VerticalCard";
import { AlertsStrip } from "./AlertsStrip";

export function CommandCenter() {
  const { twin, history, error, loading, refetch } = useTwin(2000);
  const [apBusy, setApBusy] = useState(false);

  async function toggleAutopilot() {
    if (!twin) return;
    setApBusy(true);
    try {
      await fetch("/api/autopilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ on: !twin.sim.autopilot }),
      });
      refetch();
    } finally {
      setApBusy(false);
    }
  }

  if (loading && !twin) {
    return (
      <div className="grid min-h-screen place-items-center text-[--muted]">
        Loading farm state…
      </div>
    );
  }
  if (!twin) {
    return (
      <div className="grid min-h-screen place-items-center text-[--danger]">
        Could not reach FarmOS: {error}
      </div>
    );
  }

  const criticals = twin.verticals.filter((v) => v.status === "critical").length;
  const warnings = twin.verticals.filter((v) => v.status === "warning").length;

  return (
    <main className="mx-auto max-w-6xl p-6">
      {twin.sim.autopilot && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[--accent] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-4 py-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[--accent] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[--accent]" />
          </span>
          <span className="font-semibold text-[--accent]">
            AUTOPILOT ENGAGED — the farm is running itself
          </span>
          <span className="text-sm text-[--muted]">
            agent senses, predicts &amp; acts every 30s · watch the activity log
          </span>
        </div>
      )}
      {!twin.online && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[--warn] bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] px-4 py-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[--warn]" />
          <span className="font-semibold text-[--warn]">
            OFFLINE — running autonomously
          </span>
          <span className="text-sm text-[--muted]">
            grid/internet down · life-support protected · external syncs queued
          </span>
        </div>
      )}

      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            <Link href="/" className="hover:text-[--accent]">
              Farm<span className="text-[--accent]">OS</span>
            </Link>{" "}
            · {twin.farm.name}
          </h1>
          <p className="text-sm text-[--muted]">
            {twin.farm.areaAcres}-acre off-grid eco-farm · {twin.farm.location.country}
            {" · "}
            {criticals > 0 ? (
              <span className="text-[--danger]">{criticals} critical</span>
            ) : warnings > 0 ? (
              <span className="text-[--warn]">{warnings} warning</span>
            ) : (
              <span className="text-[--accent]">all nominal</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={toggleAutopilot}
            disabled={apBusy}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition-colors disabled:opacity-50 ${
              twin.sim.autopilot
                ? "border-[--accent] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[--accent]"
                : "border-[--muted] text-[--muted] hover:border-[--accent] hover:text-[--accent]"
            }`}
            title="Toggle autonomous mode"
          >
            🛰 Autopilot {twin.sim.autopilot ? "ON" : "OFF"}
          </button>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${
              twin.online
                ? "border-[--accent] text-[--accent]"
                : "border-[--warn] text-[--warn]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                twin.online ? "bg-[--accent]" : "bg-[--warn] animate-pulse"
              }`}
            />
            {twin.online ? "online" : "offline"}
          </span>
          <Link
            href="/verticals"
            className="rounded-full border border-[--border] px-3 py-1 hover:border-[--muted]"
          >
            Verticals
          </Link>
          <Link
            href="/manage"
            className="rounded-full border border-[--border] px-3 py-1 hover:border-[--muted]"
          >
            Manage · P&amp;L
          </Link>
          <Link
            href="/tasks"
            className="rounded-full border border-[--border] px-3 py-1 hover:border-[--muted]"
          >
            Tasks
          </Link>
          <Link
            href="/activity"
            className="rounded-full border border-[--border] px-3 py-1 hover:border-[--muted]"
          >
            Activity log
          </Link>
          <Link
            href="/inventory"
            className="rounded-full border border-[--border] px-3 py-1 hover:border-[--muted]"
          >
            Inventory
          </Link>
          <Link
            href="/loops"
            className="rounded-full border border-[--border] px-3 py-1 hover:border-[--muted]"
          >
            Loops
          </Link>
          <Link
            href="/automations"
            className="rounded-full border border-[--border] px-3 py-1 hover:border-[--muted]"
          >
            Automations
          </Link>
          <Link
            href="/controls"
            className="rounded-full border border-[--border] px-3 py-1 hover:border-[--muted]"
          >
            Controls
          </Link>
        </div>
      </header>

      <section className="mb-4">
        <AlertsStrip alerts={twin.alerts} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <EnergyPanel energy={twin.resources.energy} history={history} />
        <WaterPanel water={twin.resources.water} />
      </section>

      <section className="mb-6">
        <PredictivePanel />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Verticals
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {twin.verticals.map((v) => (
            <VerticalCard key={v.id} vertical={v} assets={twin.assets} />
          ))}
        </div>
      </section>

      <footer className="mt-8 text-center text-xs text-[--muted]">
        tick {twin.sim.tickCount} · updated{" "}
        {twin.sim.lastTickAt
          ? new Date(twin.sim.lastTickAt).toLocaleTimeString()
          : "—"}{" "}
        · {twin.simulated ? "simulated sensors" : "live (Home Assistant)"}
      </footer>
    </main>
  );
}
