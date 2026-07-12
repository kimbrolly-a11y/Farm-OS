import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { getWaterReport } from "@/lib/water";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getWaterReport(getTwin()));
}
