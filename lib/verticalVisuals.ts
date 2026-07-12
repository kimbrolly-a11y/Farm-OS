// lib/verticalVisuals.ts — per-vertical visual identity (signature colour +
// gradient + one-line descriptor). Used by the welcome screen, the visual
// gallery, and the vertical cards. Colours are chosen to be distinct and to
// read on the dark theme.

export interface VerticalVisual {
  color: string;
  gradient: [string, string];
  tagline: string;
}

export const VERTICAL_VISUALS: Record<string, VerticalVisual> = {
  poultry: { color: "#f0a830", gradient: ["#4a3410", "#0e0f0a"], tagline: "Coops, brooders & incubation" },
  aquaponics: { color: "#2bb3c0", gradient: ["#0f3a41", "#0a0f10"], tagline: "Fish tanks & grow beds in one loop" },
  hydroponics: { color: "#46c86a", gradient: ["#123a1f", "#0a0f0b"], tagline: "Soil-free greenhouses" },
  fruit_orchard: { color: "#ff7a45", gradient: ["#4a2412", "#0f0b0a"], tagline: "Orchard blocks & drip irrigation" },
  lodging: { color: "#9b7bff", gradient: ["#2a1f4a", "#0b0a10"], tagline: "Eco-cabins & guest stays" },
  restaurant: { color: "#ff5c8a", gradient: ["#45162a", "#0f0a0c"], tagline: "Farm-to-table kitchen" },
  petting_zoo: { color: "#a8c83a", gradient: ["#2f3a12", "#0d0f0a"], tagline: "Barns, paddocks & animals" },
  palm_oil: { color: "#3f9d5a", gradient: ["#123a24", "#0a0f0b"], tagline: "Plantation blocks & FFB yield" },
  recycling: { color: "#7bd44a", gradient: ["#213a12", "#0b0f0a"], tagline: "Biogas, compost & circularity" },
  beekeeping: { color: "#ffcb2e", gradient: ["#4a3a0e", "#0f0d0a"], tagline: "Apiaries & hive monitoring" },
  food_processing: { color: "#3a9bd8", gradient: ["#123245", "#0a0d0f"], tagline: "Canning, freeze-drying & processing" },
};

export function visualFor(id: string): VerticalVisual {
  return (
    VERTICAL_VISUALS[id] ?? {
      color: "#8ba79d",
      gradient: ["#1a2420", "#0a0f0d"],
      tagline: "",
    }
  );
}
