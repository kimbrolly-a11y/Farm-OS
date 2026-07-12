// GET /api/export?type=pnl|actions — real books & audit trail as CSV.
// Turns the queued "Wave export" sync story into an actual download (spec P2 #9).
import { NextRequest, NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { getBusiness } from "@/lib/economics";

export const dynamic = "force-dynamic";

function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: Array<Array<unknown>>): string {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\r\n") + "\r\n";
}

export async function GET(req: NextRequest) {
  const twin = getTwin();
  const type = req.nextUrl.searchParams.get("type") ?? "pnl";
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === "actions") {
    const rows: Array<Array<unknown>> = [
      ["timestamp", "trigger", "tool", "decision", "reasoning", "result"],
      ...twin.actions.map((a) => [
        a.timestamp,
        a.trigger,
        a.toolCalled,
        a.decision,
        a.reasoning,
        a.result,
      ]),
    ];
    return new NextResponse(toCsv(rows), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="farmos-audit-trail-${stamp}.csv"`,
      },
    });
  }

  const b = getBusiness(twin);
  const rows: Array<Array<unknown>> = [
    ["vertical", "status", "production", "production_unit", `revenue_${b.currency}_day`, `cost_${b.currency}_day`, `energy_cost_${b.currency}_day`, `margin_${b.currency}_day`],
    ...b.verticals.map((v) => [
      v.name,
      v.status,
      v.production.value,
      v.production.unit,
      v.revenue,
      v.cost,
      v.energyCost,
      v.margin,
    ]),
    [],
    ["FARM TOTAL", "", "", "", b.farm.revenue, b.farm.cost, "", b.farm.margin],
  ];
  return new NextResponse(toCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="farmos-pnl-${stamp}.csv"`,
    },
  });
}
