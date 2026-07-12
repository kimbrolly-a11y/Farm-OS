// POST /api/scenario/online — reconnect and flush the queued syncs/alerts.
import { NextResponse } from "next/server";
import { goOnline } from "@/lib/scenario";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(goOnline());
}
