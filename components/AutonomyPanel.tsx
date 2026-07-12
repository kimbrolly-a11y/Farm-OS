"use client";

// The autonomy trust dial (spec P5 #24): per-domain advise → approve → auto,
// plus the pending-approval queue the dial produces. Life-support protection
// is hard-wired upstream and cannot be dialed away.

import { useCallback, useEffect, useState } from "react";
import type { PendingApproval } from "@/lib/types";

interface DomainRow {
  id: string;
  label: string;
  description: string;
  icon: string;
  level: string;
}
interface LevelMeta {
  id: string;
  label: string;
  description: string;
}
interface Data {
  domains: DomainRow[];
  levels: LevelMeta[];
  approvals: PendingApproval[];
}

export function AutonomyPanel() {
  const [d, setD] = useState<Data | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/autonomy", { cache: "no-store" });
      if (r.ok) setD(await r.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  async function setLevel(domain: string, level: string) {
    setBusy(domain);
    try {
      const r = await fetch("/api/autonomy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain, level }),
      });
      if (r.ok) setD(await r.json());
    } finally {
      setBusy(null);
    }
  }

  async function resolve(id: string, action: "apply" | "dismiss") {
    setBusy(id);
    try {
      await fetch("/api/approvals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (!d) return null;

  return (
    <section className="mt-6 rounded-xl border border-[--border] bg-[--panel] p-5">
      <h2 className="mb-1 font-medium">Autonomy trust dial</h2>
      <p className="mb-4 text-sm text-[--muted]">
        How much should the AI do on its own? Set per domain — life-support protection is
        hard-wired and cannot be dialed away.
      </p>

      <div className="space-y-3">
        {d.domains.map((dom) => (
          <div
            key={dom.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[--border] bg-[--panel-2] px-4 py-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium">
                {dom.icon} {dom.label}
              </div>
              <div className="text-xs text-[--muted]">{dom.description}</div>
            </div>
            <div className="flex overflow-hidden rounded-full border border-[--border]">
              {d.levels.map((l) => {
                const active = dom.level === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setLevel(dom.id, l.id)}
                    disabled={busy === dom.id}
                    title={l.description}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      active
                        ? l.id === "auto"
                          ? "bg-[--accent] text-black"
                          : "bg-[--warn] text-black"
                        : "text-[--muted] hover:text-[--text]"
                    }`}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {d.approvals.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-medium text-[--warn]">
            ⏳ {d.approvals.length} recommendation{d.approvals.length === 1 ? "" : "s"} awaiting
            your approval
          </h3>
          <div className="space-y-2">
            {d.approvals.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-[--warn] bg-[color-mix(in_srgb,var(--warn)_8%,transparent)] px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{a.summary}</div>
                  <div className="text-xs italic text-[--muted]">“{a.reasoning.slice(0, 120)}”</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => resolve(a.id, "apply")}
                    disabled={busy === a.id}
                    className="rounded-lg bg-[--accent] px-3 py-1.5 text-xs font-medium text-black hover:opacity-90 disabled:opacity-50"
                  >
                    ✓ Apply
                  </button>
                  <button
                    onClick={() => resolve(a.id, "dismiss")}
                    disabled={busy === a.id}
                    className="rounded-lg border border-[--border] px-3 py-1.5 text-xs text-[--muted] hover:border-[--muted] disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
