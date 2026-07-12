"use client";

import Link from "next/link";
import type { Asset, Vertical } from "@/lib/types";

const STATUS_COLOR: Record<Vertical["status"], string> = {
  ok: "var(--accent)",
  warning: "var(--warn)",
  critical: "var(--danger)",
};

export function VerticalCard({
  vertical,
  assets,
}: {
  vertical: Vertical;
  assets: Asset[];
}) {
  const color = STATUS_COLOR[vertical.status];
  const vAssets = assets.filter((a) => a.verticalId === vertical.id);
  const onCount = vAssets.filter((a) => a.state === "on").length;
  const shed = vAssets.filter((a) => a.state === "off").length;

  return (
    <Link
      href={`/vertical/${vertical.id}`}
      className="block rounded-xl border border-[--border] bg-[--panel] p-4 transition-colors hover:border-[--muted]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">{vertical.name}</span>
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          title={vertical.status}
        />
      </div>

      {vertical.headline ? (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold" style={{ color }}>
            {vertical.headline.value}
          </span>
          <span className="text-sm text-[--muted]">{vertical.headline.unit}</span>
        </div>
      ) : (
        <div className="text-2xl font-semibold text-[--muted]">—</div>
      )}
      <div className="mt-0.5 text-xs text-[--muted]">
        {vertical.headline?.label ?? "no sensor"}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wide text-[--muted]">
        <span>{onCount} on</span>
        {shed > 0 && (
          <span className="text-[--warn]">· {shed} shed</span>
        )}
      </div>
    </Link>
  );
}
