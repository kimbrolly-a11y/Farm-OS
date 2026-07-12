"use client";

import Link from "next/link";
import { useTwin } from "./useTwin";
import { EnergyPanel } from "./EnergyPanel";
import { WaterPanel } from "./WaterPanel";
import { VerticalCard } from "./VerticalCard";
import { AlertsStrip } from "./AlertsStrip";

export function CommandCenter() {
  const { twin, history, error, loading } = useTwin(2000);

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
            FarmOS · {twin.farm.name}
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
            href="/activity"
            className="rounded-full border border-[--border] px-3 py-1 hover:border-[--muted]"
          >
            Activity log
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
