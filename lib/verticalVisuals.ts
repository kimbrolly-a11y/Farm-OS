// lib/verticalVisuals.ts — per-vertical visual identity (signature colour +
// gradient + one-line descriptor). Used by the welcome screen, the visual
// gallery, and the vertical cards. Colours are chosen to be distinct and to
// read on the dark theme.

export interface VerticalVisual {
  /** short display name — legible under a small tile */
  name: string;
  color: string;
  gradient: [string, string];
  tagline: string;
}

export const VERTICAL_VISUALS: Record<string, VerticalVisual> = {
  poultry: { name: "Poultry", color: "#f0a830", gradient: ["#fbe9c8", "#fff7e8"], tagline: "Coops, brooders & incubation" },
  aquaponics: { name: "Aquaponics", color: "#2bb3c0", gradient: ["#d2f0f3", "#effbfc"], tagline: "Fish tanks & grow beds in one loop" },
  hydroponics: { name: "Hydroponics", color: "#46c86a", gradient: ["#d7f3de", "#f0fbf3"], tagline: "Soil-free greenhouses" },
  fruit_orchard: { name: "Orchard", color: "#ff7a45", gradient: ["#ffe3d5", "#fff5ef"], tagline: "Orchard blocks & drip irrigation" },
  lodging: { name: "Lodging", color: "#9b7bff", gradient: ["#e8e1ff", "#f7f4ff"], tagline: "Eco-cabins & guest stays" },
  restaurant: { name: "Restaurant", color: "#ff5c8a", gradient: ["#ffdde8", "#fff2f6"], tagline: "Farm-to-table kitchen" },
  petting_zoo: { name: "Petting zoo", color: "#a8c83a", gradient: ["#e9f2c8", "#f8fbea"], tagline: "Barns, paddocks & animals" },
  palm_oil: { name: "Palm oil", color: "#3f9d5a", gradient: ["#d5ecdc", "#eff8f2"], tagline: "Plantation blocks & FFB yield" },
  recycling: { name: "Recycling", color: "#7bd44a", gradient: ["#e2f5d5", "#f4fbee"], tagline: "Biogas, compost & circularity" },
  beekeeping: { name: "Bees", color: "#c99a00", gradient: ["#f7ecc4", "#fdf8e7"], tagline: "Apiaries & hive monitoring" },
  food_processing: { name: "Processing", color: "#3a9bd8", gradient: ["#d6eaf8", "#eff7fc"], tagline: "Canning, freeze-drying & processing" },
  dairy_cattle: { name: "Dairy cattle", color: "#a97b4f", gradient: ["#efe1d3", "#faf4ee"], tagline: "Milking herd & dairy" },
  dairy_goats: { name: "Goats", color: "#c9a24a", gradient: ["#f2e7cd", "#fbf6ea"], tagline: "Goat milk & cheese" },
  sheep: { name: "Sheep", color: "#7d8b94", gradient: ["#e4e9ec", "#f4f6f8"], tagline: "Silvopasture flock" },
  ducks: { name: "Ducks", color: "#5bb98c", gradient: ["#dbf0e6", "#f1faf5"], tagline: "Ducks, eggs & ponds" },
  rabbits: { name: "Rabbits", color: "#d98fb0", gradient: ["#f7e2ec", "#fcf3f7"], tagline: "Rabbitry" },
  horses: { name: "Horses", color: "#b0764f", gradient: ["#f0e0d4", "#faf2ec"], tagline: "Stables & riding" },
  aquaculture: { name: "Aquaculture", color: "#3aa0c8", gradient: ["#d6ecf5", "#eff8fb"], tagline: "Fish & prawn ponds" },
};

export function visualFor(id: string): VerticalVisual {
  return (
    VERTICAL_VISUALS[id] ?? {
      name: id,
      color: "#8ba79d",
      gradient: ["#e2ece5", "#f3f8f4"],
      tagline: "",
    }
  );
}
