// POST /api/tasks/done { id } — mark a task complete (or reopen).
import { NextResponse } from "next/server";
import { getTwin } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { id } = await req.json();
  const twin = getTwin();
  const task = twin.tasks.find((t) => t.id === id);
  if (task) task.status = task.status === "done" ? "open" : "done";
  return NextResponse.json({ ok: !!task, task });
}
