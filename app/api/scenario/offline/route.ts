// POST /api/scenario/offline — simulate a grid + internet outage.
import { NextResponse } from "next/server";
import { goOffline } from "@/lib/scenario";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  return NextResponse.json(await goOffline());
}
