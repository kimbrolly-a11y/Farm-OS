"use client";

// IntegrationView — the "commissioning" screen. Shows whether FarmOS is running on
// simulated or real sensors, how many feeds are live per vertical, and per-device
// health. When hardware arrives you watch sensors flip from SIM → LIVE here.

import Link from "next/link";
import { useEffect, useState } from "react";

interface Status {
  mode: "sim" | "live";
  enabled: boolean;
  hub: string | null;
  total: number;
  live: number;
  simulated: number;
  stale: number;
  mappedEntities: number;
  pollMs: number;
  lastPollAt: string | null;
  lastError: string | null;
  perVertical: Record<string, { live: number; total: number }>;
  devices: Array<{ sensorId: string; entity?: string; online: boolean; lastSeen: string | null }>;
}

export function IntegrationView() {
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/integration", { cache: "no-store" });
        if (r.ok) setS(await r.json());
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  if (!s) return <div className="p-8 text-[--muted]">Loading integration status…</div>;

  const livePct = s.total ? Math.round((s.live / s.total) * 100) : 0;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sensor integration</h1>
          <p className="text-[--muted]">
            The seam between the digital twin and real hardware. Wire a sensor into your Home
            Assistant hub and it flips from <b>SIM</b> to <b>LIVE</b> here — the AI operates on
            whichever is available, per sensor.
          </p>
        </div>
        <span
          className="rounded-full border px-4 py-2 text-sm font-medium"
          style={{
            borderColor: s.mode === "live" ? "var(--accent)" : "var(--muted)",
            color: s.mode === "live" ? "var(--accent)" : "var(--muted)",
            background:
              s.mode === "live" ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
          }}
        >
          {s.mode === "live" ? "● LIVE — real sensors" : "◌ SIM — simulated feed"}
        </span>
      </header>

      {/* headline stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { v: s.total, l: "sensors in twin" },
          { v: s.live, l: "live (real hardware)", accent: "var(--accent)" },
          { v: s.simulated, l: "simulated" },
          { v: s.stale, l: "mapped but stale", accent: s.stale ? "var(--warn)" : undefined },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-[--border] bg-[--panel] p-4">
            <div className="text-2xl font-semibold" style={{ color: k.accent }}>
              {k.v}
            </div>
            <div className="text-xs text-[--muted]">{k.l}</div>
          </div>
        ))}
      </div>

      {/* live progress */}
      <div className="mb-6 rounded-xl border border-[--border] bg-[--panel] p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Live coverage</span>
          <span className="text-[--muted]">
            {s.live}/{s.total} sensors on real hardware ({livePct}%)
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[--panel-2]">
          <div className="h-full rounded-full bg-[--accent]" style={{ width: `${livePct}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[--muted]">
          <span>hub: {s.hub ?? "—"}</span>
          <span>mapped entities: {s.mappedEntities}</span>
          <span>poll: {s.pollMs} ms</span>
          <span>last poll: {s.lastPollAt ? new Date(s.lastPollAt).toLocaleTimeString() : "—"}</span>
          {s.lastError && <span className="text-[--danger]">error: {s.lastError}</span>}
        </div>
      </div>

      {s.mode === "sim" && (
        <div className="mb-6 rounded-xl border border-[--border] bg-[--panel-2] p-4 text-sm text-[--muted]">
          Running on the simulator. To bring real sensors online, set{" "}
          <code className="rounded bg-[--panel] px-1.5 py-0.5 text-[--text]">INTEGRATION_MODE=live</code>{" "}
          + your Home Assistant URL/token (see <b>INTEGRATION.md</b>), map each sensor&apos;s{" "}
          <code className="rounded bg-[--panel] px-1.5 py-0.5 text-[--text]">ha_entity</code> in{" "}
          <code className="rounded bg-[--panel] px-1.5 py-0.5 text-[--text]">farm.config.yaml</code>, and
          those sensors flip to LIVE here automatically — one vertical at a time.
        </div>
      )}

      {/* per-vertical */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
        Per vertical
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(s.perVertical)
          .sort((a, b) => b[1].live - a[1].live || a[0].localeCompare(b[0]))
          .map(([vid, c]) => (
            <div
              key={vid}
              className="flex items-center justify-between rounded-xl border border-[--border] bg-[--panel] px-4 py-2.5 text-sm"
            >
              <span className="capitalize">{vid.replace(/_/g, " ")}</span>
              <span className={c.live ? "text-[--accent]" : "text-[--muted]"}>
                {c.live}/{c.total} live
              </span>
            </div>
          ))}
      </div>

      {/* live devices (only shown when there are any) */}
      {s.devices.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-[--muted]">
            Devices ({s.devices.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-[--border]">
            {s.devices.map((d, i) => (
              <div
                key={d.sensorId}
                className={`flex flex-wrap items-center gap-3 bg-[--panel] px-4 py-2.5 text-sm ${
                  i > 0 ? "border-t border-[--border]" : ""
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: d.online ? "var(--accent)" : "var(--danger)" }}
                />
                <span className="font-mono text-xs">{d.sensorId}</span>
                {d.entity && <span className="text-xs text-[--muted]">← {d.entity}</span>}
                <span className="ml-auto text-xs text-[--muted]">
                  {d.online ? "online" : "offline"}
                  {d.lastSeen ? ` · ${new Date(d.lastSeen).toLocaleTimeString()}` : ""}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
