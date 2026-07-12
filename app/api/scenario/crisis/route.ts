// POST /api/scenario/crisis — arm the crisis scenario and run the agent.
import { NextResponse } from "next/server";
import { armCrisis } from "@/lib/scenario";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  const result = await armCrisis();
  return NextResponse.json(result);
}
