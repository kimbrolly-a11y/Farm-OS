// GET → dial state + pending approvals; POST {domain, level} → set a dial.
import { NextRequest, NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import {
  DOMAIN_META,
  LEVEL_META,
  LEVELS,
  ensureAutonomy,
  setAutonomy,
} from "@/lib/autonomy";
import type { AutonomyDomain, AutonomyLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

function snapshot() {
  const twin = getTwin();
  ensureAutonomy(twin);
  return {
    domains: (Object.keys(DOMAIN_META) as AutonomyDomain[]).map((d) => ({
      id: d,
      ...DOMAIN_META[d],
      level: twin.autonomy[d],
    })),
    levels: LEVELS.map((l) => ({ id: l, ...LEVEL_META[l] })),
    approvals: twin.approvals.filter((a) => a.status === "pending"),
  };
}

export async function GET() {
  return NextResponse.json(snapshot());
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    domain?: AutonomyDomain;
    level?: AutonomyLevel;
  };
  const twin = getTwin();
  ensureAutonomy(twin);
  if (!body.domain || !(body.domain in DOMAIN_META) || !body.level || !LEVELS.includes(body.level)) {
    return NextResponse.json({ error: "domain + level required" }, { status: 400 });
  }
  setAutonomy(twin, body.domain, body.level);
  return NextResponse.json(snapshot());
}
