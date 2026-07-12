import { NextRequest, NextResponse } from "next/server";
import { askConsole } from "@/lib/console";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { question?: string };
  const question = (body.question ?? "").trim().slice(0, 500);
  if (!question) {
    return NextResponse.json({ error: "question required" }, { status: 400 });
  }
  return NextResponse.json(await askConsole(question));
}
