// GET /api/loops — the circular / zero-waste resource map.
import { NextResponse } from "next/server";
import { getLoops } from "@/lib/loops";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getLoops());
}
