// POST /api/guest/book { room, item, pax, when } — book a tour/activity/service.
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { createGuestBooking } from "@/lib/guest";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { room, item, pax, when } = await req.json().catch(() => ({}));
  if (!room || !item) {
    return NextResponse.json({ ok: false, error: "room and item required" }, { status: 400 });
  }
  const booking = createGuestBooking(getTwin(), room, item, Number(pax) || 2, when || "today");
  return NextResponse.json({ ok: true, booking });
}
