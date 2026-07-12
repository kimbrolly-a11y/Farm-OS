import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { getSyncReport } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSyncReport(getTwin()));
}
