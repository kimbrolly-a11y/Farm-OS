"use client";

import Link from "next/link";
import { useTwin } from "./useTwin";
import type { Task } from "@/lib/types";

export function TasksView() {
  const { twin, loading, refetch } = useTwin(2500);

  if (loading && !twin) return <div className="p-8 text-[--muted]">Loading tasks…</div>;
  if (!twin) return <div className="p-8 text-[--danger]">No data.</div>;

  const tasks = twin.tasks;
  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "done");

  async function toggle(id: string) {
    await fetch("/api/tasks/done", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refetch();
  }

  const Row = ({ t }: { t: Task }) => (
    <div className="flex items-start gap-3 rounded-xl border border-[--border] bg-[--panel] p-4">
      <button
        onClick={() => toggle(t.id)}
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border text-xs ${
          t.status === "done"
            ? "border-[--accent] bg-[--accent] text-black"
            : "border-[--muted] text-transparent hover:border-[--accent]"
        }`}
        title={t.status === "done" ? "reopen" : "mark done"}
      >
        ✓
      </button>
      <div className="flex-1">
        <p className={t.status === "done" ? "text-[--muted] line-through" : ""}>
          {t.description}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-[--muted]">
          <span>👤 {t.assignee}</span>
          {t.verticalId && (
            <Link href={`/vertical/${t.verticalId}`} className="hover:text-[--accent]">
              {t.verticalId}
            </Link>
          )}
          <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold">Workforce · Tasks</h1>
        <p className="text-[--muted]">
          Work the agent (and you) assign across the farm. {open.length} open ·{" "}
          {done.length} done.
        </p>
      </header>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Open ({open.length})
        </h2>
        <div className="space-y-2">
          {open.length === 0 ? (
            <p className="text-sm text-[--muted]">Nothing open — all caught up.</p>
          ) : (
            open.map((t) => <Row key={t.id} t={t} />)
          )}
        </div>
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
            Done ({done.length})
          </h2>
          <div className="space-y-2 opacity-70">
            {done.map((t) => (
              <Row key={t.id} t={t} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
