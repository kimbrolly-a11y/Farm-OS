"use client";

// LiveCam — a per-vertical "zone camera" feed. Uses the local photography in
// /public/img/verticals (offline-safe, no external streams) presented as live
// CCTV: slow pan, scanlines, REC badge and a ticking timestamp. On the real
// farm this swaps for an RTSP/HA camera entity — same frame, real pixels.

import { useEffect, useState } from "react";

const CAM_IMAGES = new Set([
  "aquaculture", "aquaponics", "beekeeping", "dairy_cattle", "dairy_goats",
  "ducks", "food_processing", "fruit_orchard", "horses", "hydroponics",
  "lodging", "palm_oil", "petting_zoo", "poultry", "rabbits", "recycling",
  "restaurant", "sheep",
]);

export function hasCam(verticalId: string): boolean {
  return CAM_IMAGES.has(verticalId);
}

export function LiveCam({
  verticalId,
  label,
  className = "",
}: {
  verticalId: string;
  label: string;
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!hasCam(verticalId)) return null;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-[--border] bg-black ${className}`}
    >
      {/* feed */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/img/verticals/${verticalId}.jpg`}
        alt={`${label} camera`}
        className="livecam-pan h-full w-full object-cover"
      />

      {/* scanlines + vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0 1px, transparent 1px 3px), radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.45))",
        }}
      />

      {/* top overlay: LIVE + cam id */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5 text-[10px] font-semibold tracking-wider">
        <span className="flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-red-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          LIVE
        </span>
        <span className="rounded bg-black/60 px-2 py-1 text-[--muted] uppercase">
          CAM 01 · {label}
        </span>
      </div>

      {/* bottom overlay: timestamp + REC */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-2.5 font-mono text-[10px]">
        <span className="rounded bg-black/60 px-2 py-1 text-[--text] tabular-nums">
          {now
            ? `${now.toLocaleDateString("en-MY")} ${now.toLocaleTimeString([], { hour12: false })}`
            : "--:--:--"}
        </span>
        <span className="rounded bg-black/60 px-2 py-1 text-[--muted]">
          ● REC · HA: camera.{verticalId}
        </span>
      </div>
    </div>
  );
}
