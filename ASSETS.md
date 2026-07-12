# FarmOS — Brand / Image Kit (offline-safe SVG)

All assets are hand-crafted **SVG** (vector): crisp at any size, on the app's dark
eco-theme, and 100% offline — nothing external to load, so the resilience demo is
safe. Files live in `public/` and are served at the root path.

| File | Use | Path |
|---|---|---|
| `public/farmos-mark.svg` | app icon / favicon | `/farmos-mark.svg` |
| `public/farmos-logo.svg` | logo + wordmark (nav, welcome) | `/farmos-logo.svg` |
| `public/welcome-hero.svg` | welcome-screen hero background (eco-farm landscape) | `/welcome-hero.svg` |
| `public/og-image.svg` | social / submission share card (1200×630) | `/og-image.svg` |

The per-vertical emblems already exist as inline SVG in `components/VerticalArt.tsx`
(cow, goat, sheep, duck, rabbit, horseshoe, fish, etc.) — this kit is the
farm-level brand layer on top.

## Wiring snippets (apply after the Fable build settles, to avoid clobbering it)

**Favicon / tab icon** — in `app/layout.tsx` metadata:
```ts
export const metadata: Metadata = {
  title: "FarmOS — Verdant Acres",
  description: "The autonomous OS for a one-person farm company.",
  icons: { icon: "/farmos-mark.svg" },
  openGraph: { images: ["/og-image.svg"] },
};
```

**Welcome hero background** — in `components/Welcome.tsx`, put the landscape behind
the hero (replace/supplement the ambient glow). Example:
```tsx
<div
  className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] bg-bottom bg-no-repeat bg-cover opacity-70"
  style={{ backgroundImage: "url('/welcome-hero.svg')" }}
/>
```
(Keep it `absolute` behind the content; the hero text stays on top.)

**Logo in the nav** — swap the text wordmark for the SVG where you like:
```tsx
import Image from "next/image";
<Image src="/farmos-logo.svg" alt="FarmOS" width={180} height={49} priority />
```

## Export to PNG (if the submission form needs raster)
Open the SVG in the browser pane (or `http://localhost:3000/og-image.svg`),
screenshot it, or use any SVG→PNG tool. For the OG image, target 1200×630.

## Want richer per-vertical scenes?
The current emblems are clean icons. If you want full illustrated *scenes* per
vertical (a coop, a pond, palm rows) as card headers, that's an upgrade to
`components/VerticalArt.tsx` — ask and I'll add them (offline-safe SVG, same
style) once Fable is done editing that file.
