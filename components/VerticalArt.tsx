"use client";

import { visualFor } from "@/lib/verticalVisuals";

// A distinct hand-drawn SVG emblem per vertical on its signature gradient.
// Pure SVG → offline-safe, crisp at any size, no external images.

function shade(hex: string, f: number): string {
  const n = hex.replace("#", "");
  const ch = [0, 2, 4].map((i) =>
    Math.max(0, Math.min(255, Math.round(parseInt(n.slice(i, i + 2), 16) * f)))
  );
  return "#" + ch.map((x) => x.toString(16).padStart(2, "0")).join("");
}

function Icon({ id, color, dark }: { id: string; color: string; dark: string }) {
  // daylight theme: main shapes take the signature colour, accents go deeper,
  // and "dark" is the pastel background tint (reads as negative-space cutouts)
  const w = color;
  switch (id) {
    case "poultry":
      return (
        <g>
          <ellipse cx="50" cy="54" rx="23" ry="29" fill={w} />
          <ellipse cx="42" cy="44" rx="6" ry="9" fill={shade(color, 0.6)} opacity="0.45" />
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
          <circle cx="42" cy="40" r="4" fill={shade(color, 0.6)} />
          <circle cx="58" cy="38" r="4" fill={shade(color, 0.6)} />
          <circle cx="52" cy="50" r="4" fill={shade(color, 0.6)} />
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
          <ellipse cx="50" cy="50" rx="10" ry="7" fill={shade(color, 0.6)} />
          <path d="M50 43 V57" stroke={dark} strokeWidth="2.4" />
        </g>
      );
    case "food_processing":
      return (
        <g>
          <rect x="33" y="34" width="34" height="46" rx="5" fill={w} />
          <rect x="31" y="26" width="38" height="9" rx="3" fill={w} />
          <rect x="33" y="50" width="34" height="13" fill={shade(color, 0.6)} opacity="0.55" />
        </g>
      );
    case "dairy_cattle":
      return (
        <g>
          <rect x="30" y="44" width="40" height="36" rx="14" fill={w} />
          <ellipse cx="50" cy="40" rx="11" ry="7" fill={shade(color, 0.6)} opacity="0.4" />
          <ellipse cx="26" cy="46" rx="7" ry="4.5" fill={w} />
          <ellipse cx="74" cy="46" rx="7" ry="4.5" fill={w} />
          <circle cx="43" cy="52" r="3" fill={dark} />
          <circle cx="57" cy="52" r="3" fill={dark} />
          <ellipse cx="43" cy="70" rx="3.5" ry="5" fill={dark} />
          <ellipse cx="57" cy="70" rx="3.5" ry="5" fill={dark} />
        </g>
      );
    case "dairy_goats":
      return (
        <g>
          <ellipse cx="50" cy="54" rx="15" ry="18" fill={w} />
          <path d="M40 40 Q30 26 40 22" stroke={w} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M60 40 Q70 26 60 22" stroke={w} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M50 72 v9" stroke={w} strokeWidth="4" strokeLinecap="round" />
          <circle cx="44" cy="52" r="2.6" fill={dark} />
          <circle cx="56" cy="52" r="2.6" fill={dark} />
        </g>
      );
    case "sheep":
      return (
        <g>
          <g fill={w}>
            <circle cx="36" cy="52" r="12" />
            <circle cx="50" cy="44" r="13" />
            <circle cx="64" cy="52" r="12" />
            <circle cx="44" cy="64" r="12" />
            <circle cx="58" cy="64" r="12" />
          </g>
          <ellipse cx="50" cy="60" rx="9" ry="11" fill={dark} />
          <circle cx="46" cy="58" r="1.8" fill={w} />
          <circle cx="54" cy="58" r="1.8" fill={w} />
        </g>
      );
    case "ducks":
      return (
        <g>
          <ellipse cx="45" cy="58" rx="24" ry="15" fill={w} />
          <circle cx="66" cy="44" r="10" fill={w} />
          <polygon points="74,44 88,42 74,50" fill={shade(color, 0.6)} />
          <circle cx="66" cy="42" r="2.4" fill={dark} />
        </g>
      );
    case "rabbits":
      return (
        <g fill={w}>
          <ellipse cx="42" cy="32" rx="5.5" ry="17" transform="rotate(-12 42 32)" />
          <ellipse cx="58" cy="32" rx="5.5" ry="17" transform="rotate(12 58 32)" />
          <circle cx="50" cy="58" r="18" />
          <circle cx="44" cy="56" r="2.6" fill={dark} />
          <circle cx="56" cy="56" r="2.6" fill={dark} />
          <circle cx="50" cy="63" r="2" fill={shade(color, 0.6)} />
        </g>
      );
    case "horses":
      return (
        <g>
          <path d="M32 26 C 26 80, 74 80, 68 26" fill="none" stroke={w} strokeWidth="8" strokeLinecap="round" />
          <g fill={w}>
            <circle cx="31" cy="42" r="2.4" />
            <circle cx="33" cy="58" r="2.4" />
            <circle cx="40" cy="70" r="2.4" />
            <circle cx="69" cy="42" r="2.4" />
            <circle cx="67" cy="58" r="2.4" />
            <circle cx="60" cy="70" r="2.4" />
          </g>
        </g>
      );
    case "aquaculture":
      return (
        <g>
          <ellipse cx="44" cy="44" rx="20" ry="12" fill={w} />
          <polygon points="62,44 78,36 78,52" fill={w} />
          <circle cx="34" cy="41" r="2.6" fill={dark} />
          <path d="M20 68 q8 -6 16 0 t16 0 t16 0" fill="none" stroke={w} strokeWidth="4" strokeLinecap="round" />
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
        <Icon id={id} color={v.color} dark={v.gradient[0]} />
      </svg>
    </div>
  );
}
