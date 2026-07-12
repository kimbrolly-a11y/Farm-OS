// POST /api/staff/dispatch { alertId } or { all: true } — convert alert(s)
// into assigned staff tasks (acknowledges the alerts).
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { dispatchAlert } from "@/lib/staff";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const twin = getTwin();

  if (body.all) {
    const tasks = twin.alerts
      .filter((a) => !a.acknowledged)
      .map((a) => dispatchAlert(twin, a.id))
      .filter(Boolean);
    return NextResponse.json({ ok: true, dispatched: tasks.length, tasks });
  }

  const task = dispatchAlert(twin, body.alertId);
  return NextResponse.json({ ok: !!task, task });
}
