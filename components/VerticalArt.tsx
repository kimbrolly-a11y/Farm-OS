"use client";

import { visualFor } from "@/lib/verticalVisuals";

// A distinct hand-drawn SVG emblem per vertical on its signature gradient.
// Pure SVG → offline-safe, crisp at any size, no external images.

function Icon({ id, color, dark }: { id: string; color: string; dark: string }) {
  const w = "#f4f0e8";
  switch (id) {
    case "poultry":
      return (
        <g>
          <ellipse cx="50" cy="54" rx="23" ry="29" fill={w} />
          <ellipse cx="42" cy="44" rx="6" ry="9" fill={color} opacity="0.45" />
        </g>
      );
    case "aquaponics":
      return (
        <g>
          <ellipse cx="46" cy="52" rx="26" ry="16" fill={w} />
          <polygon points="70,52 90,40 90,64" fill={w} />
          <circle cx="34" cy="48" r="3.4" fill={dark} />
        </g>
      );
    case "hydroponics":
      return (
        <g fill="none" stroke={w} strokeWidth="5" strokeLinecap="round">
          <path d="M50 80 V46" />
          <path d="M50 54 C40 42 24 46 26 60 C40 62 50 58 50 54 Z" fill={w} stroke="none" />
          <path d="M50 48 C60 36 78 42 74 56 C60 56 50 52 50 48 Z" fill={w} stroke="none" />
        </g>
      );
    case "fruit_orchard":
      return (
        <g>
          <rect x="46" y="56" width="8" height="26" rx="2" fill={w} />
          <circle cx="50" cy="42" r="23" fill={w} />
          <circle cx="42" cy="40" r="4" fill={color} />
          <circle cx="58" cy="38" r="4" fill={color} />
          <circle cx="52" cy="50" r="4" fill={color} />
        </g>
      );
    case "lodging":
      return (
        <g>
          <polygon points="24,52 50,26 76,52" fill={w} />
          <rect x="32" y="50" width="36" height="30" rx="2" fill={w} />
          <rect x="45" y="62" width="10" height="18" fill={dark} />
        </g>
      );
    case "restaurant":
      return (
        <g stroke={w} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M40 30 V78" />
          <path d="M33 28 V44 M40 28 V46 M47 28 V44" strokeWidth="3.2" />
          <path d="M62 30 V78" />
          <path d="M62 30 C72 34 72 50 62 52" fill={w} stroke="none" />
        </g>
      );
    case "petting_zoo":
      return (
        <g fill={w}>
          <ellipse cx="50" cy="62" rx="16" ry="13" />
          <circle cx="33" cy="46" r="6" />
          <circle cx="44" cy="39" r="6.5" />
          <circle cx="56" cy="39" r="6.5" />
          <circle cx="67" cy="46" r="6" />
        </g>
      );
    case "palm_oil":
      return (
        <g fill="none" stroke={w} strokeWidth="5" strokeLinecap="round">
          <path d="M50 82 Q45 60 50 46" />
          <path d="M50 46 Q34 36 22 42" />
          <path d="M50 46 Q66 36 78 42" />
          <path d="M50 46 Q38 30 30 24" />
          <path d="M50 46 Q62 30 70 24" />
          <path d="M50 46 Q50 30 50 20" />
        </g>
      );
    case "recycling":
      return (
        <g fill="none" stroke={w} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 44 A24 24 0 1 1 27 60" />
          <polygon points="27,44 37,44 30,54" fill={w} stroke="none" />
        </g>
      );
    case "beekeeping":
      return (
        <g>
          <polygon points="50,22 73,36 73,64 50,78 27,64 27,36" fill="none" stroke={w} strokeWidth="5" strokeLinejoin="round" />
          <ellipse cx="50" cy="50" rx="10" ry="7" fill={color} />
          <path d="M50 43 V57" stroke={dark} strokeWidth="2.4" />
        </g>
      );
    case "food_processing":
      return (
        <g>
          <rect x="33" y="34" width="34" height="46" rx="5" fill={w} />
          <rect x="31" y="26" width="38" height="9" rx="3" fill={w} />
          <rect x="33" y="50" width="34" height="13" fill={color} opacity="0.55" />
        </g>
      );
    default:
      return <circle cx="50" cy="50" r="24" fill={w} />;
  }
}

export function VerticalArt({
  id,
  className = "",
  rounded = "rounded-xl",
}: {
  id: string;
  className?: string;
  rounded?: string;
}) {
  const v = visualFor(id);
  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${v.gradient[0]}, ${v.gradient[1]})`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl"
        style={{ background: v.color, opacity: 0.22 }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full p-[18%]">
        <Icon id={id} color={v.color} dark={v.gradient[1]} />
      </svg>
    </div>
  );
}
