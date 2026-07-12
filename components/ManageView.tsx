"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface VerticalBusiness {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  margin: number;
  energyCost: number;
  production: { label: string; value: number; unit: string };
  status: "ok" | "warning" | "critical";
}
interface Business {
  currency: string;
  farm: { revenue: number; cost: number; margin: number };
  verticals: VerticalBusiness[];
}

export function ManageView() {
  const [biz, setBiz] = useState<Business | null>(null);

  useEffect(() => {
    const fetchBiz = async () => {
      try {
        const r = await fetch("/api/business", { cache: "no-store" });
        if (r.ok) setBiz(await r.json());
      } catch {
        /* ignore */
      }
    };
    fetchBiz();
    const id = setInterval(fetchBiz, 3000);
    return () => clearInterval(id);
  }, []);

  if (!biz) return <div className="p-8 text-[--muted]">Loading P&amp;L…</div>;

  const c = biz.currency;
  const sorted = [...biz.verticals].sort((a, b) => b.margin - a.margin);
  const chart = sorted.map((v) => ({
    name: v.name.split(" ")[0],
    margin: v.margin,
  }));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/dashboard" className="text-sm text-[--muted] hover:text-[--text]">
        ← Command Center
      </Link>
      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Manage · P&amp;L</h1>
          <p className="text-[--muted]">
            Live financials across all verticals — revenue, cost, and margin per day.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <a
            href="/api/export?type=pnl"
            className="rounded-full border border-[--border] px-3 py-1.5 text-[--muted] transition-colors hover:border-[--accent] hover:text-[--accent]"
          >
            ⬇ P&amp;L CSV
          </a>
          <a
            href="/api/export?type=actions"
            className="rounded-full border border-[--border] px-3 py-1.5 text-[--muted] transition-colors hover:border-[--accent] hover:text-[--accent]"
          >
            ⬇ Audit trail CSV
          </a>
        </div>
      </header>

      {/* Farm rollup */}
      <section className="mb-6 grid grid-cols-3 gap-4">
        <Money label="Revenue / day" value={biz.farm.revenue} currency={c} color="var(--accent)" />
        <Money label="Cost / day" value={biz.farm.cost} currency={c} color="var(--warn)" />
        <Money
          label="Net margin / day"
          value={biz.farm.margin}
          currency={c}
          color={biz.farm.margin >= 0 ? "var(--accent)" : "var(--danger)"}
          big
        />
      </section>

      {/* Margin chart */}
      <section className="mb-6 rounded-xl border border-[--border] bg-[--panel] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Margin by vertical ({c}/day)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} width={44} />
              <Tooltip
                cursor={{ fill: "color-mix(in srgb, var(--muted) 10%, transparent)" }}
                contentStyle={{
                  background: "var(--panel-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                {chart.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.margin >= 0 ? "var(--accent)" : "var(--danger)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Per-vertical table */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--muted]">
          Per vertical
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[--border]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--border] text-left text-xs uppercase text-[--muted]">
                <th className="p-3">Vertical</th>
                <th className="p-3">Production</th>
                <th className="p-3 text-right">Revenue</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3 text-right">Energy</th>
                <th className="p-3 text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((v) => (
                <tr key={v.id} className="border-b border-[--border] last:border-0">
                  <td className="p-3">
                    <Link href={`/vertical/${v.id}`} className="hover:text-[--accent]">
                      {v.name}
                    </Link>
                  </td>
                  <td className="p-3 text-[--muted]">
                    {v.production.value} {v.production.unit}
                    <span className="ml-1 text-xs">· {v.production.label}</span>
                  </td>
                  <td className="p-3 text-right text-[--accent]">
                    {c}
                    {v.revenue}
                  </td>
                  <td className="p-3 text-right text-[--muted]">
                    {c}
                    {v.cost}
                  </td>
                  <td className="p-3 text-right text-[--muted]">
                    {c}
                    {v.energyCost}
                  </td>
                  <td
                    className="p-3 text-right font-medium"
                    style={{ color: v.margin >= 0 ? "var(--accent)" : "var(--danger)" }}
                  >
                    {v.margin >= 0 ? "+" : ""}
                    {c}
                    {v.margin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Money({
  label,
  value,
  currency,
  color,
  big,
}: {
  label: string;
  value: number;
  currency: string;
  color: string;
  big?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[--border] bg-[--panel] p-4">
      <div
        className={`font-semibold ${big ? "text-3xl" : "text-2xl"}`}
        style={{ color }}
      >
        {value >= 0 ? "" : "−"}
        {currency}
        {Math.abs(value).toLocaleString()}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wide text-[--muted]">
        {label}
      </div>
    </div>
  );
}
