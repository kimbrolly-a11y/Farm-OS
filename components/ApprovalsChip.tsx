"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Header chip that appears only when the trust dial is holding actions. */
export function ApprovalsChip() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/autonomy", { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          setCount(j.approvals?.length ?? 0);
        }
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/controls"
      className="flex animate-pulse items-center gap-1.5 rounded-full border border-[--warn] px-3 py-1 text-[--warn] transition-colors hover:opacity-80"
      title="The agent has recommendations waiting for your approval (trust dial)"
    >
      ⏳ {count} to approve
    </Link>
  );
}
