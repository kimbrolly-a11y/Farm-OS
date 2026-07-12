"use client";

// StaffView — the human layer of the one-person company: a lean duty roster,
// plus "alerts → actions": every open alert with the AI's recommended human
// action, dispatchable into the task board with one click.

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Alert } from "@/lib/types";
import type { StaffMember, AlertRecommendation } from "@/lib/staff";

type RosterEntry = StaffMember & { onDuty: boolean; openTasks: number };
type OpenAlert = Alert & { recommendation: AlertRecommendation };

const SEV_COLOR: Record<string, string> = {
  info: "var(--water, #2b7fd9)",
  warning: "var(--warn)",
  critical: "var(--danger)",
};

export function StaffView() {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [alerts, setAlerts] = useState<OpenAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/staff", { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        setRoster(d.roster);
        setAlerts(d.alerts);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  async function dispatch(alertId?: string) {
    setBusy(alertId ?? "all");
    await fetch("/api/staff/dispatch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(alertId ? { alertId } : { all: true }),
    });
    setBusy(null);
    load();
  }

  if (loading) return <div className="p-8 text-[--muted]">Loading staff…</div>;

  const onDuty = roster.filter((m) => m.onDuty);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Staff & duty</h1>
          <p className="text-[--muted]">
            The human layer of the one-person company — {onDuty.length} of {roster.length} on
            duty. The AI runs the farm; people handle safety-critical & hands-on work.
          </p>
        </div>
        <Link
          href="/tasks"
          className="rounded-full border border-[--border] px-4 py-2 text-sm hover:border-[--muted]"
        >
          Task board →
        </Link>
      </header>

      {/* alerts → staff actions */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[--muted]">
            Alerts → staff actions ({alerts.length} open)
          </h2>
          {alerts.length > 1 && (
            <button
              onClick={() => dispatch()}
              disabled={busy !== null}
              className="rounded-full bg-[--accent] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy === "all" ? "Dispatching…" : `Dispatch all ${alerts.length}`}
            </button>
          )}
        </div>
        {alerts.length === 0 ? (
          <p className="rounded-xl border border-[--border] bg-[--panel] p-4 text-sm text-[--muted]">
            No open alerts — nothing needs a human right now. 🌱
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => {
              const c = SEV_COLOR[a.severity] ?? "var(--muted)";
              return (
                <div key={a.id} className="rounded-xl border border-[--border] bg-[--panel] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: c, background: `color-mix(in srgb, ${c} 14%, transparent)` }}
                    >
                      {a.severity}
                    </span>
                    <span className="text-sm font-medium">{a.message}</span>
                    <span className="ml-auto text-xs text-[--muted]">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-[--panel-2] px-3 py-2.5">
                    <span className="text-xs text-[--muted]">
                      → <b className="text-[--text]">{a.recommendation.staffName}</b>:{" "}
                      {a.recommendation.action}
                    </span>
                    <button
                      onClick={() => dispatch(a.id)}
                      disabled={busy !== null}
                      className="ml-auto shrink-0 rounded-full border border-[--accent] px-3.5 py-1 text-xs font-medium text-[--accent] hover:bg-[--accent] hover:text-white disabled:opacity-50"
                    >
                      {busy === a.id ? "…" : "Dispatch task"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* roster */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
        Duty roster
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roster.map((m) => (
          <div key={m.id} className="rounded-xl border border-[--border] bg-[--panel] p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[--panel-2] text-xl">
                {m.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{m.name}</span>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      m.onDuty ? "bg-[--accent]" : "bg-[--border]"
                    }`}
                    title={m.onDuty ? "on duty" : "off duty"}
                  />
                </div>
                <div className="truncate text-xs text-[--muted]">{m.role}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[--muted]">
              <span>{m.shift === "on-call" ? "📟 on-call" : m.shift === "day" ? "☀️ day shift" : "🌙 night shift"}</span>
              <span>{m.openTasks} open task{m.openTasks === 1 ? "" : "s"}</span>
              <span className="font-mono">{m.phone}</span>
            </div>
            {m.coverage[0] !== "everything" && (
              <div className="mt-2 flex flex-wrap gap-1">
                {m.coverage.slice(0, 4).map((c) => (
                  <span key={c} className="rounded bg-[--panel-2] px-1.5 py-0.5 text-[10px] text-[--muted]">
                    {c.replace("_", " ")}
                  </span>
                ))}
                {m.coverage.length > 4 && (
                  <span className="text-[10px] text-[--muted]">+{m.coverage.length - 4}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
