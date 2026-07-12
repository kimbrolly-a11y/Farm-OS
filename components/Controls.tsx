"use client";

import Link from "next/link";
import { useState } from "react";
import { useTwin } from "./useTwin";

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

export function Controls() {
  const { twin, refetch } = useTwin(2000);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-sm text-[--muted] hover:text-[--text]">
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

      {twin && (
        <p className="mt-4 text-xs text-[--muted]">
          Status: {twin.online ? "online" : "offline"} ·{" "}
          {twin.actions.length} total decisions logged · battery{" "}
          {Math.round(twin.resources.energy.batterySoC)}%
        </p>
      )}
    </main>
  );
}
