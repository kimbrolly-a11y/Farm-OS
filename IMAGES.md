# FarmOS — Photoreal Image Kit (fal.ai)

Generate photoreal "smart-farm + holographic HUD" imagery for the deck and app.

## 1. Add your key
Get a key at **fal.ai → dashboard → keys**, then add to `.env.local` (project root):
```
FAL_KEY=your-fal-key-here
```
- `.env.local` is gitignored. I use the key **only** to call fal.ai — never print or commit it.
- Cost: a few cents per image (billed to your fal account).
- After adding it, tell me **"go"** and I run the generation.

## 2. What I'll run
A script that calls fal.ai (FLUX — `fal-ai/flux/dev` for quality, or `flux/schnell`
for speed), 16:9, downloads each result to `public/img/`, then:
- **Base64-embeds the hero into the deck** (keeps the artifact self-contained).
- **Wires images into the app** (welcome hero + relevant pages) as bundled assets
  (`/img/*.png` — offline-safe). *App wiring waits until Fable finishes editing to
  avoid collisions; the deck can update immediately.*

## 3. The prompts (photoreal, matched to the farm)

**hero.png** — deck title + app welcome hero
> Cinematic golden-hour aerial photo of a diversified tropical eco-farm in
> Malaysia — rows of green crops, an oil-palm plantation, fish ponds, greenhouses,
> grazing cattle, a small barn, solar panels along the field edges, sunrise with
> warm golden light and soft mist. Floating above the fields: subtle glowing
> holographic data overlays — translucent circular gauges, sensor icons, thin
> connecting lines, cyan-green HUD. Photorealistic, ultra-detailed, hopeful,
> shallow depth of field. 16:9.

**aquaculture.png** — aquaculture / dashboard
> Cinematic golden-hour photo of a smart aquaculture farm — fish ponds with tilapia,
> drones overhead, a control dashboard screen on a jetty, subtle holographic sensor
> icons over the water, warm misty light, photorealistic. 16:9.

**automation.png** — "How it works" / automation
> Close-up of a healthy crop plant with a translucent holographic control panel
> showing gauges and plant-science data (CO₂, H₂O, O₂), a yellow robotic arm
> tending it, warm sunlight, photorealistic, shallow depth of field. 16:9.

**robot.png** — autonomous equipment
> A sleek autonomous field robot driving between rows of leafy greens on a farm at
> soft morning light, photorealistic, shallow depth of field. 16:9.

**animals.png** — eco-tourism / livestock (optional)
> Golden-hour photo of an eco-tourism farm — dairy cows and goats grazing under oil
> palms, a duck pond, guests on a trail, subtle glowing holographic sensor icons,
> photorealistic. 16:9.

## 4. Alternative (no key sharing)
Generate them yourself in the fal.ai playground (or Bing Image Creator / Ideogram),
download, drop into `public/img/`, and tell me — I'll base64-embed + wire them.

## 5. Where they get used
- **Deck:** hero on the title slide (base64), aquaculture/automation on their slides.
- **App:** welcome hero, and optionally the `/aquaculture`, `/automations`,
  `/attractions`, `/guest` pages — bundled, offline-safe.
