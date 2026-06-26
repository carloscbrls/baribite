import raw from "./menu_data.json";
import { getFoodImage } from "./food_images";

// ── Phase keys used in the data ────────────────────────────────────────────
export type PhaseKey =
  | "clear_liquids"
  | "full_liquids"
  | "pureed"
  | "soft_solids"
  | "regular"
  | "never_recommended";

// Pre-op is a UI-only filter — nothing in the data is tagged pre-op, but pre-op
// patients can browse the regular/soft items they'll work toward.
export type PhaseFilter = "pre_op" | PhaseKey;

export const PHASE_ORDER: PhaseKey[] = [
  "clear_liquids",
  "full_liquids",
  "pureed",
  "soft_solids",
  "regular",
];

export const PHASE_LABELS: Record<PhaseFilter, string> = {
  pre_op: "Pre-Op",
  clear_liquids: "Clear Liquids",
  full_liquids: "Full Liquids",
  pureed: "Pureed",
  soft_solids: "Soft Solids",
  regular: "Regular",
  never_recommended: "Not recommended",
};

// Map the DB phase texture (from the existing phases table) → a PhaseKey.
export function phaseNameToKey(name: string): PhaseKey {
  const n = name.toLowerCase();
  if (n.includes("clear")) return "clear_liquids";
  if (n.includes("full")) return "full_liquids";
  if (n.includes("pure")) return "pureed";
  if (n.includes("soft")) return "soft_solids";
  return "regular";
}

// ── Unified food item ──────────────────────────────────────────────────────
export interface FoodItem {
  id: string;
  name: string;
  source: string; // chain / store / cuisine display name
  sourceShort: string; // chip label
  category?: string;
  calories?: number;
  protein_g: number;
  carbs_g: number;
  sugar_g: number;
  fat_g: number;
  allergens: string[];
  peanut_safe: boolean;
  shellfish_safe: boolean;
  peanut_note?: string;
  bariatric_phase: PhaseKey[];
  order_mods: string;
  notes?: string;
  source_url?: string;
  image?: string; // URL to food photo
  // contextual notes pulled from the parent group
  generalNotes?: string;
  peanutOilWarning?: string;
}

export interface CuisineGuide {
  name: string;
  description: string;
  watch_for: string[];
}

interface RawItem {
  name: string;
  category?: string;
  calories?: number;
  protein_g: number;
  carbs_g: number;
  sugar_g: number;
  fat_g: number;
  allergens?: string[];
  peanut_safe: boolean;
  shellfish_safe: boolean;
  peanut_note?: string;
  bariatric_phase?: string[];
  order_mods?: string;
  notes?: string;
  source_url?: string;
  image?: string;
}

// Map full source names → short chip labels matching the filter UI.
const SHORT: Record<string, string> = {
  "Chick-fil-A": "Chick-fil-A",
  Starbucks: "Starbucks",
  "Jamba Juice": "Jamba",
  "McDonald's": "McDonald's",
  "Wendy's": "Wendy's",
  "Taco Bell": "Taco Bell",
  Subway: "Subway",
  "Sprouts Farmers Market": "Sprouts",
  "Target (Good & Gather)": "Target",
  Mexican: "Mexican",
  Italian: "Italian",
};

function shortLabel(name: string): string {
  return SHORT[name] ?? name;
}

function toItem(
  it: RawItem,
  source: string,
  idx: number,
  extra: { generalNotes?: string; peanutOilWarning?: string } = {}
): FoodItem {
  const phases = (it.bariatric_phase ?? []).filter(
    (p) => p !== "never_recommended"
  ) as PhaseKey[];
  const id = `${shortLabel(source)}-${idx}-${it.name}`.replace(/\s+/g, "-").toLowerCase();
  return {
    id,
    name: it.name,
    source,
    sourceShort: shortLabel(source),
    category: it.category,
    calories: it.calories,
    protein_g: it.protein_g ?? 0,
    carbs_g: it.carbs_g ?? 0,
    sugar_g: it.sugar_g ?? 0,
    fat_g: it.fat_g ?? 0,
    allergens: it.allergens ?? [],
    peanut_safe: it.peanut_safe,
    shellfish_safe: it.shellfish_safe,
    peanut_note: it.peanut_note,
    bariatric_phase: phases,
    order_mods: it.order_mods ?? "",
    notes: it.notes,
    source_url: it.source_url,
    image: it.image ?? getFoodImage(id),
    generalNotes: extra.generalNotes,
    peanutOilWarning: extra.peanutOilWarning,
  };
}

interface RawChain {
  name: string;
  allergen_menu_url?: string;
  nutrition_url?: string;
  general_notes?: string;
  peanut_oil_warning?: string;
  items: RawItem[];
}

interface RawCuisine {
  name: string;
  description: string;
  safe_items: RawItem[];
  watch_for: string[];
}

const data = raw as {
  meta: { phase_definitions: Record<string, string>; allergen_disclaimer: string };
  chains: RawChain[];
  cuisines: RawCuisine[];
};

export const PHASE_DEFINITIONS = data.meta.phase_definitions;
export const ALLERGEN_DISCLAIMER = data.meta.allergen_disclaimer;

// Flatten everything into a single searchable list.
export const FOOD_ITEMS: FoodItem[] = (() => {
  const out: FoodItem[] = [];
  data.chains.forEach((c) => {
    c.items.forEach((it, i) =>
      out.push(
        toItem(it, c.name, i, {
          generalNotes: c.general_notes,
          peanutOilWarning: c.peanut_oil_warning,
        })
      )
    );
  });
  data.cuisines.forEach((c) => {
    c.safe_items.forEach((it, i) =>
      out.push(toItem(it, c.name, i, { generalNotes: c.description }))
    );
  });
  return out;
})();

export const CUISINE_GUIDES: CuisineGuide[] = data.cuisines.map((c) => ({
  name: c.name,
  description: c.description,
  watch_for: c.watch_for,
}));

// Distinct source chip labels, ordered to match the brief.
export const SOURCE_FILTERS: string[] = [
  "Chick-fil-A",
  "Starbucks",
  "Jamba",
  "McDonald's",
  "Wendy's",
  "Taco Bell",
  "Subway",
  "Sprouts",
  "Target",
  "Mexican",
  "Italian",
];

export type SortKey = "protein" | "carbs" | "sugar" | "alpha";

// "Why it works" — derived from phase fit + macros.
export function whyItWorks(item: FoodItem, phase: PhaseFilter): string {
  const fitsPhase =
    phase === "pre_op"
      ? item.bariatric_phase.includes("regular") ||
        item.bariatric_phase.includes("soft_solids")
      : item.bariatric_phase.includes(phase as PhaseKey);
  const phaseLabel = PHASE_LABELS[phase];

  if (item.protein_g >= 20) {
    return fitsPhase
      ? `High-protein (${item.protein_g}g) and texture-appropriate for the ${phaseLabel} phase.`
      : `Protein-dense (${item.protein_g}g) — save it for the phases it's tagged for.`;
  }
  if (item.protein_g >= 8) {
    return fitsPhase
      ? `Solid protein (${item.protein_g}g) that fits the ${phaseLabel} phase.`
      : `Moderate protein (${item.protein_g}g); check the phase tags before relying on it.`;
  }
  if (item.calories != null && item.calories <= 60) {
    return "Low-calorie flavor or hydration helper — pair it with a protein.";
  }
  return fitsPhase
    ? `Appropriate texture for the ${phaseLabel} phase. Lead with protein.`
    : "Light option — best once you reach the phases it's tagged for.";
}
