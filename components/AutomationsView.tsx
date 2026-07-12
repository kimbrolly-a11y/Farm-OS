"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Automation {
  id: string;
  name: string;
  verticalId: string;
  verticalName: string;
  assetId: string;
  kind: string;
  autonomy: "autonomous" | "assisted" | "manual";
  trigger: string;
  state: "on" | "off" | "n/a";
}

const AUTONOMY_COLOR: Record<string, string> = {
  autonomous: "var(--accent)",
  assisted: "var(--warn)",
  manual: "var(--muted)",
};

const KIND_ICON: Record<string, string> = {
  irrigation: "💧",
  dosing: "🧪",
  feeding: "🍽️",
  robot: "🤖",
  vision: "📷",
  climate: "🌡️",
  deterrent: "🦅",
  door: "🚪",
};

export function AutomationsView() {
  const [autos, setAutos] = useState<Automation[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/automations", { cache: "no-store" });
      if (r.ok) setAutos((await r.json()).automations);
    } catch {
      /* ignore */
    }
  };
  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  async function run(id: string) {
    setBusy(id);
    try {
      await fetch("/api/automations/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  const autoCount = autos.filter((a) => a.autonomy === "autonomous").length;
  const running = autos.filter((a) => a.state === "on").length;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-2">
        <h1 className="text-2xl font-semibold">Automations &amp; Equipment</h1>
        <p className="text-[--muted]">
          Autonomous equipment across the farm — the agent dispatches these; you can too.
        </p>
      </header>
      <p className="mb-6 text-sm text-[--muted]">
        {autos.length} automations · {autoCount} fully autonomous · {running} running
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {autos.map((a) => {
          const color = AUTONOMY_COLOR[a.autonomy];
          return (
            <div
              key={a.id}
              className="rounded-xl border border-[--border] bg-[--panel] p-4"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="font-medium">
                  {KIND_ICON[a.kind] ?? "⚙️"} {a.name}
                </span>
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    a.state === "on" ? "" : "opacity-30"
                  }`}
                  style={{
                    background: a.state === "on" ? "var(--accent)" : "var(--muted)",
                    boxShadow: a.state === "on" ? "0 0 8px var(--accent)" : "none",
                  }}
                  title={a.state}
                />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{ color, border: `1px solid ${color}` }}
                >
                  {a.autonomy}
                </span>
                <Link
                  href={`/vertical/${a.verticalId}`}
                  className="text-xs text-[--muted] hover:text-[--accent]"
                >
                  {a.verticalName}
                </Link>
              </div>
              <p className="mb-3 text-xs text-[--muted]">Trigger: {a.trigger}</p>
              <button
                onClick={() => run(a.id)}
                disabled={busy === a.id}
                className="rounded-lg border border-[--border] px-3 py-1 text-xs hover:border-[--accent] hover:text-[--accent] disabled:opacity-50"
              >
                {busy === a.id ? "Dispatching…" : a.state === "on" ? "Re-run now" : "Run now"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
