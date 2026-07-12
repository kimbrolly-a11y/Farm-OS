"use client";

import Link from "next/link";
import { useTwin } from "./useTwin";
import type { AgentAction } from "@/lib/types";

const TOOL_COLOR: Record<string, string> = {
  shedLoad: "var(--warn)",
  restoreLoad: "var(--accent)",
  setActuator: "var(--accent)",
  scheduleIrrigation: "#3aa7ff",
  createAlert: "var(--danger)",
  assignTask: "#b98cff",
};

export function ActivityLog() {
  const { twin, loading } = useTwin(2000);

  if (loading && !twin) return <div className="p-8 text-[--muted]">Loading…</div>;
  if (!twin) return <div className="p-8 text-[--danger]">No data.</div>;

  const actions: AgentAction[] = [...twin.actions].reverse();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-2">
        <h1 className="text-2xl font-semibold">Agent Activity Log</h1>
        <p className="text-[--muted]">What my company did while I slept.</p>
      </header>
      <p className="mb-6 text-sm text-[--muted]">
        {actions.length} decision{actions.length !== 1 ? "s" : ""} logged
        {!twin.online && (
          <span className="text-[--warn]"> · offline — running autonomously</span>
        )}
      </p>

      {actions.length === 0 ? (
        <div className="rounded-xl border border-[--border] bg-[--panel] p-6 text-center text-[--muted]">
          No decisions yet. Run the agent from{" "}
          <Link href="/controls" className="text-[--accent] underline">
            Controls
          </Link>
          .
        </div>
      ) : (
        <ol className="space-y-3">
          {actions.map((a) => {
            const color = TOOL_COLOR[a.toolCalled] ?? "var(--muted)";
            const refused = a.result.startsWith("REFUSED");
            return (
              <li
                key={a.id}
                className="rounded-xl border border-[--border] bg-[--panel] p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium">{a.decision}</span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{ color, border: `1px solid ${color}` }}
                  >
                    {a.toolCalled}
                  </span>
                </div>
                <p className="text-sm text-[--muted]">
                  <span className="text-[--text]">Reasoning:</span> {a.reasoning}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[--muted]">
                  <span>trigger: {a.trigger}</span>
                  <span
                    style={{ color: refused ? "var(--danger)" : undefined }}
                  >
                    → {a.result}
                  </span>
                  <span className="ml-auto">
                    {new Date(a.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
