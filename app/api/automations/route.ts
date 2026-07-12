// GET /api/automations — the autonomous-equipment registry with live state.
import { NextResponse } from "next/server";
import { getAutomations } from "@/lib/automations";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ automations: getAutomations() });
}
