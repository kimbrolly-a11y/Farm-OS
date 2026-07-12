// POST /api/automations/run { id } — dispatch an automation.
import { NextResponse } from "next/server";
import { runAutomation } from "@/lib/automations";
import { setTrigger } from "@/lib/tools/log";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { id } = await req.json();
  setTrigger("manual automation dispatch");
  const result = runAutomation(String(id));
  return NextResponse.json({ result });
}
