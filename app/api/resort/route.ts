import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { getHospitality } from "@/lib/hospitality";
import { getAttractions } from "@/lib/attractions";

export const dynamic = "force-dynamic";

export async function GET() {
  const twin = getTwin();
  return NextResponse.json({
    hospitality: getHospitality(twin),
    attractions: getAttractions(twin),
  });
}
