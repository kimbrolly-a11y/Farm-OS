"use client";

import Link from "next/link";
import { useState } from "react";
import { useTwin } from "./useTwin";
import { AutonomyPanel } from "./AutonomyPanel";

interface RunResult {
  mode: string;
  summary: string;
  actionsAdded: number;
}

const MODE_LABEL: Record<string, string> = {
  claude: "Claude (live tool-use)",
  rules: "rule engine (no API key)",
  "offline-rules": "rule engine (offline)",
};

interface CrisisResult extends RunResult {
  protectedOn: string[];
  shed: string[];
  batterySoC: number;
}

export function Controls() {
  const { twin, refetch } = useTwin(2000);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "crisis" | "reset" | "outage">(null);
  const [crisis, setCrisis] = useState<CrisisResult | null>(null);

  async function runAgent() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ trigger: "manual run" }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setResult(await r.json());
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "run failed");
    } finally {
      setRunning(false);
    }
  }

  async function runCrisis() {
    setBusy("crisis");
    setCrisis(null);
    setError(null);
    try {
      const r = await fetch("/api/scenario/crisis", { method: "POST" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setCrisis(await r.json());
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "crisis failed");
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    setBusy("reset");
    setError(null);
    try {
      await fetch("/api/scenario/reset", { method: "POST" });
      setCrisis(null);
      setResult(null);
      refetch();
    } finally {
      setBusy(null);
    }
  }

  async function toggleOutage() {
    if (!twin) return;
    setBusy("outage");
    setError(null);
    try {
      const endpoint = twin.online ? "/api/scenario/offline" : "/api/scenario/online";
      const r = await fetch(endpoint, { method: "POST" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "toggle failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold">Controls</h1>

      <section className="rounded-xl border border-[--border] bg-[--panel] p-5">
        <h2 className="mb-1 font-medium">Run the supervisor agent</h2>
        <p className="mb-4 text-sm text-[--muted]">
          The agent reads farm state + forecast, takes any warranted actions
          through its tools, and logs each decision with its reasoning.
        </p>
        <button
          onClick={runAgent}
          disabled={running}
          className="rounded-lg bg-[--accent] px-4 py-2 font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {running ? "Running…" : "Run agent now"}
        </button>

        {error && <p className="mt-3 text-sm text-[--danger]">Error: {error}</p>}

        {result && (
          <div className="mt-4 rounded-lg border border-[--border] bg-[--panel-2] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs">
              <span className="rounded-full border border-[--accent] px-2 py-0.5 text-[--accent]">
                {MODE_LABEL[result.mode] ?? result.mode}
              </span>
              <span className="text-[--muted]">
                {result.actionsAdded} action{result.actionsAdded !== 1 ? "s" : ""} taken
              </span>
            </div>
            <p className="text-sm">{result.summary}</p>
            <Link
              href="/activity"
              className="mt-3 inline-block text-sm text-[--accent] underline"
            >
              See the full activity log →
            </Link>
          </div>
        )}
      </section>

      <AutonomyPanel />

      <section className="mt-6 rounded-xl border border-[--border] bg-[--panel] p-5">
        <h2 className="mb-1 font-medium">Demo scenarios</h2>
        <p className="mb-4 text-sm text-[--muted]">
          Scripted situations that drive the agent. Reset restores normal state.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runCrisis}
            disabled={busy !== null}
            className="rounded-lg border border-[--danger] px-4 py-2 font-medium text-[--danger] transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] disabled:opacity-50"
          >
            {busy === "crisis" ? "Running crisis…" : "⚡ Crisis — cloudy day, battery low"}
          </button>
          <button
            onClick={toggleOutage}
            disabled={busy !== null}
            className={`rounded-lg border px-4 py-2 font-medium transition-colors disabled:opacity-50 ${
              twin && !twin.online
                ? "border-[--accent] text-[--accent] hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
                : "border-[--warn] text-[--warn] hover:bg-[color-mix(in_srgb,var(--warn)_12%,transparent)]"
            }`}
          >
            {busy === "outage"
              ? "Toggling…"
              : twin && !twin.online
              ? "🔌 Reconnect (flush queue)"
              : "🌩 Outage — grid + internet down"}
          </button>
          <button
            onClick={reset}
            disabled={busy !== null}
            className="rounded-lg border border-[--border] px-4 py-2 text-[--muted] transition-colors hover:border-[--muted] disabled:opacity-50"
          >
            {busy === "reset" ? "Resetting…" : "Reset to normal"}
          </button>
        </div>

        {twin && !twin.online && (
          <div className="mt-4 rounded-lg border border-[--warn] bg-[color-mix(in_srgb,var(--warn)_8%,transparent)] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[--warn]" />
              <span className="font-semibold text-[--warn]">
                OFFLINE — running autonomously
              </span>
            </div>
            <p className="text-sm text-[--muted]">
              Life-support protected · agent on cached rules + last forecast ·{" "}
              {twin.syncQueue.length} external sync
              {twin.syncQueue.length !== 1 ? "s" : ""} queued:
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {twin.syncQueue.map((s) => (
                <span
                  key={s.id}
                  className="rounded bg-[color-mix(in_srgb,var(--warn)_15%,transparent)] px-1.5 py-0.5 text-[10px] text-[--warn]"
                >
                  ⏳ {s.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {crisis && (
          <div className="mt-4 rounded-lg border border-[--danger] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-[--danger] px-2 py-0.5 text-[--danger]">
                battery {Math.round(crisis.batterySoC)}%
              </span>
              <span className="rounded-full border border-[--accent] px-2 py-0.5 text-[--accent]">
                {MODE_LABEL[crisis.mode] ?? crisis.mode}
              </span>
              <span className="text-[--muted]">{crisis.actionsAdded} actions</span>
            </div>
            <p className="mb-3 text-sm">{crisis.summary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase text-[--warn]">
                  Shed ({crisis.shed.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {crisis.shed.length === 0 && (
                    <span className="text-xs text-[--muted]">none</span>
                  )}
                  {crisis.shed.map((id) => (
                    <span
                      key={id}
                      className="rounded bg-[color-mix(in_srgb,var(--warn)_15%,transparent)] px-1.5 py-0.5 text-[10px] text-[--warn]"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold uppercase text-[--accent]">
                  Protected · never shed ({crisis.protectedOn.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {crisis.protectedOn.map((id) => (
                    <span
                      key={id}
                      className="rounded bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] px-1.5 py-0.5 text-[10px] text-[--accent]"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/activity"
              className="mt-3 inline-block text-sm text-[--accent] underline"
            >
              See the reasoning in the activity log →
            </Link>
          </div>
        )}
      </section>

      {twin && (
        <p className="mt-4 text-xs text-[--muted]">
          Status: {twin.online ? "online" : "offline"} · scenario{" "}
          {twin.sim.scenario} · {twin.actions.length} decisions logged · battery{" "}
          {Math.round(twin.resources.energy.batterySoC)}%
        </p>
      )}
    </main>
  );
}
