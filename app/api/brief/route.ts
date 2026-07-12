import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { getMorningBrief } from "@/lib/brief";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getMorningBrief(getTwin()));
}
