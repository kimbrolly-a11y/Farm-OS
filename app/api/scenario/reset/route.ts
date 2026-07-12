// POST /api/scenario/reset — restore normal state.
import { NextResponse } from "next/server";
import { resetScenario } from "@/lib/scenario";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(resetScenario());
}
