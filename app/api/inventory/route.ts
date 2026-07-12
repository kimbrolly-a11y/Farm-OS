// GET /api/inventory — stock levels + production batches with traceability.
import { NextResponse } from "next/server";
import { getInventory } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getInventory());
}
