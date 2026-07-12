// POST /api/guest/request { room, type, detail } — file a guest service request.
// GET  /api/guest/request?room=... — list requests + bookings (all if no room).
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { createGuestRequest, listGuest, advanceRequest } from "@/lib/guest";
import type { GuestRequestType } from "@/lib/guest";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // ops: advance status
  if (body.advanceId) {
    const r = advanceRequest(body.advanceId);
    return NextResponse.json({ ok: !!r, request: r });
  }

  const { room, type, detail } = body as {
    room?: string;
    type?: GuestRequestType;
    detail?: string;
  };
  if (!room || !type || !detail) {
    return NextResponse.json({ ok: false, error: "room, type, detail required" }, { status: 400 });
  }
  const request = createGuestRequest(getTwin(), room, type, detail);
  return NextResponse.json({ ok: true, request });
}

export async function GET(req: Request) {
  const room = new URL(req.url).searchParams.get("room") ?? undefined;
  return NextResponse.json(listGuest(room));
}
