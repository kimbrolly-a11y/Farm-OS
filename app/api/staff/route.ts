// GET /api/staff — roster with duty status, open-task counts, and every
// unacknowledged alert paired with its recommended staff action.
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";
import { STAFF, isOnDuty, recommendAction } from "@/lib/staff";

export const dynamic = "force-dynamic";

export async function GET() {
  const twin = getTwin();
  const roster = STAFF.map((m) => ({
    ...m,
    onDuty: isOnDuty(m),
    openTasks: twin.tasks.filter((t) => t.status === "open" && t.assignee === m.name).length,
  }));
  const alerts = twin.alerts
    .filter((a) => !a.acknowledged)
    .map((a) => ({ ...a, recommendation: recommendAction(a) }));
  return NextResponse.json({ roster, alerts });
}
