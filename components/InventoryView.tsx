"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface StockItem {
  id: string;
  verticalId: string;
  verticalName: string;
  product: string;
  qty: number;
  unit: string;
  category: "fresh" | "processed" | "input";
  status: "ok" | "low" | "expiring";
}
interface Batch {
  id: string;
  product: string;
  verticalName: string;
  qty: number;
  unit: string;
  lineage: string[];
  haccp: { check: string; ok: boolean }[];
  status: "complete" | "in_progress";
  date: string;
}
interface Inv {
  items: StockItem[];
  batches: Batch[];
  summary: { fresh: number; processed: number; inputsLow: number };
}

const STATUS_COLOR: Record<string, string> = {
  ok: "var(--accent)",
  low: "var(--danger)",
  expiring: "var(--warn)",
};

export function InventoryView() {
  const [inv, setInv] = useState<Inv | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/inventory", { cache: "no-store" });
        if (r.ok) setInv(await r.json());
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  if (!inv) return <div className="p-8 text-[--muted]">Loading inventory…</div>;

  const groups: StockItem["category"][] = ["fresh", "processed", "input"];
  const label = { fresh: "Fresh produce", processed: "Processed goods", input: "Inputs" };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold">Production &amp; Inventory</h1>
        <p className="text-[--muted]">
          Stock across the farm and farm-to-table batch traceability.
          {inv.summary.inputsLow > 0 && (
            <span className="text-[--danger]"> · {inv.summary.inputsLow} input(s) low</span>
          )}
        </p>
      </header>

      {/* Stock by category */}
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {groups.map((g) => (
          <div key={g} className="rounded-xl border border-[--border] bg-[--panel] p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
              {label[g]}
            </h2>
            <ul className="space-y-2">
              {inv.items
                .filter((i) => i.category === g)
                .map((i) => (
                  <li key={i.id} className="flex items-baseline justify-between text-sm">
                    <span>
                      {i.product}
                      <span className="ml-1 text-xs text-[--muted]">· {i.verticalName}</span>
                    </span>
                    <span className="font-medium" style={{ color: STATUS_COLOR[i.status] }}>
                      {i.qty.toLocaleString()} {i.unit}
                      {i.status !== "ok" && (
                        <span className="ml-1 text-[10px] uppercase">{i.status}</span>
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Batch traceability */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Batch traceability &amp; food safety (HACCP)
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {inv.batches.map((b) => {
            const failed = b.haccp.some((h) => !h.ok);
            return (
              <div key={b.id} className="rounded-xl border border-[--border] bg-[--panel] p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{b.product}</span>
                  <span className="font-mono text-xs text-[--muted]">{b.id}</span>
                </div>
                <div className="mb-3 flex items-center gap-2 text-xs">
                  <span
                    className="rounded-full px-2 py-0.5"
                    style={{
                      color: b.status === "complete" ? "var(--accent)" : "var(--warn)",
                      border: `1px solid ${b.status === "complete" ? "var(--accent)" : "var(--warn)"}`,
                    }}
                  >
                    {b.status === "complete" ? "complete" : "in progress"}
                  </span>
                  <span className="text-[--muted]">
                    {b.qty} {b.unit} · {b.date}
                  </span>
                </div>

                {/* lineage */}
                <ol className="mb-3 space-y-1">
                  {b.lineage.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[--muted]">
                      <span className="text-[--accent]">
                        {i < b.lineage.length - 1 ? "↓" : "✓"}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>

                {/* HACCP */}
                <div className="space-y-1 border-t border-[--border] pt-2">
                  {b.haccp.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span style={{ color: h.ok ? "var(--accent)" : "var(--danger)" }}>
                        {h.ok ? "✓" : "✗"}
                      </span>
                      <span className={h.ok ? "text-[--muted]" : "text-[--danger]"}>
                        {h.check}
                      </span>
                    </div>
                  ))}
                </div>
                {failed && (
                  <p className="mt-2 text-[10px] font-medium uppercase text-[--danger]">
                    ⚠ Hold — HACCP check pending
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
