// GET /api/state — full digital-twin snapshot (getFarmState over HTTP).
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getTwin());
}
