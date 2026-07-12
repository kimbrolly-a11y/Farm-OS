// POST /api/agent/run — run the supervisor agent once ("Run agent now").
import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  let trigger = "manual run";
  try {
    const body = await req.json();
    if (body?.trigger) trigger = String(body.trigger);
  } catch {
    /* no body — fine */
  }
  const result = await runAgent(trigger);
  return NextResponse.json(result);
}
