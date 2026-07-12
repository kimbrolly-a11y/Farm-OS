// POST {id, action: "apply" | "dismiss"} — resolve a pending approval.
import { NextRequest, NextResponse } from "next/server";
import { applyApproval, dismissApproval } from "@/lib/approvals";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { id?: string; action?: string };
  if (!body.id || !["apply", "dismiss"].includes(body.action ?? "")) {
    return NextResponse.json({ error: "id + action required" }, { status: 400 });
  }
  const out = body.action === "apply" ? applyApproval(body.id) : dismissApproval(body.id);
  return NextResponse.json(out, { status: out.ok ? 200 : 400 });
}
