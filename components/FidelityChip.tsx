"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SyncReport } from "@/lib/sync";

/** Header chip: twin fidelity — "178/178 in sync · simulated". Links to /twin. */
export function FidelityChip() {
  const [s, setS] = useState<SyncReport | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/sync", { cache: "no-store" });
        if (r.ok) setS(await r.json());
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 6000);
    return () => clearInterval(id);
  }, []);

  if (!s) return null;

  const healthy = s.fidelityPct >= 95;
  const color = healthy ? "var(--accent)" : s.fidelityPct >= 75 ? "var(--warn)" : "var(--danger)";

  return (
    <Link
      href="/twin"
      className="flex items-center gap-1.5 rounded-full border px-3 py-1 transition-colors hover:opacity-80"
      style={{ borderColor: color, color }}
      title={`${s.sensorsInSync}/${s.sensorsTotal} sensors reporting · ${s.actuatorsMapped}/${s.actuatorsTotal} actuators bound to ${s.hub} — click for the living twin map`}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {s.devicesInSync}/{s.devicesTotal} in sync · {s.mode}
    </Link>
  );
}
