// GET /api/business — live per-vertical P&L + production (the Manage layer).
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { getBusiness } from "@/lib/economics";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getBusiness(getTwin()));
}
