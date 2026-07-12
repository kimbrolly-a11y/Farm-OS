import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { getSustainability } from "@/lib/sustainability";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSustainability(getTwin()));
}
