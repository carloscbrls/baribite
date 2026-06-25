// Structured 6-week post-op meal plan for Carlos.
// Converted from baribite_meal_plan.md (Baptist Health bariatric guidelines).
// Source: peanut + shellfish allergy, sleeve gastrectomy June 24, 2026.

export interface MealSlot {
  time: string; // "7 AM"
  what: string;
  volume: string; // "2 oz", "3 Tbsp", "¼ cup"
  protein: number; // grams
}

export interface PlanDay {
  label: string; // "Day 1", "Day 1 (Surgery Day)"
  note?: string; // optional day-level note
  meals: MealSlot[];
}

export interface Recipe {
  name: string;
  ingredients: string;
  steps: string;
}

export interface PlanWeek {
  week: number; // 1-6
  dayRange: string; // "Days 1-7"
  phase: string; // "Clear → Full Liquids"
  volume: string; // per-meal volume target
  proteinGoal: string; // "70-80g protein"
  banner: string; // composed banner string
  days: PlanDay[];
  shopping: string[];
  recipes: Recipe[];
}

// Helper to clone a sample day across the remaining days of a week.
function buildDays(
  base: { label?: string; note?: string; meals: MealSlot[] },
  count: number,
  startNum: number
): PlanDay[] {
  return Array.from({ length: count }, (_, i) => ({
    label: `Day ${startNum + i}`,
    note: base.note,
    meals: base.meals,
  }));
}

// ── WEEK 1 — Days 1-7 (Clear → Full Liquids) ───────────────────────────────
const week1ClearMeals: MealSlot[] = [
  { time: "7 AM", what: "1 oz water", volume: "1 oz", protein: 0 },
  { time: "9 AM", what: "1 oz chicken broth (no shellfish stock — verify label)", volume: "1 oz", protein: 1 },
  { time: "11 AM", what: "1 oz Crystal Light or Propel", volume: "1 oz", protein: 0 },
  { time: "1 PM", what: "1 oz sugar-free Jell-O", volume: "1 oz", protein: 0 },
  { time: "3 PM", what: "1 oz decaf tea", volume: "1 oz", protein: 0 },
  { time: "5 PM", what: "1 oz bone broth", volume: "1 oz", protein: 2 },
  { time: "7 PM", what: "1 oz Powerade Zero", volume: "1 oz", protein: 0 },
  { time: "9 PM", what: "Sugar-free popsicle", volume: "1 piece", protein: 0 },
];

const week1FullMeals: MealSlot[] = [
  { time: "7 AM", what: "Owyn protein shake (vanilla)", volume: "2 oz", protein: 5 },
  { time: "9 AM", what: "Fage 0% Greek yogurt thinned with milk", volume: "2 oz", protein: 5 },
  { time: "11 AM", what: "Strained cream of chicken soup (low-fat, verify)", volume: "2 oz", protein: 4 },
  { time: "1 PM", what: "Premier Protein shake (slowly over 30 min)", volume: "4 oz", protein: 30 },
  { time: "3 PM", what: "Sugar-free pudding made with skim milk", volume: "2 oz", protein: 5 },
  { time: "5 PM", what: "Blended cottage cheese (Good Culture)", volume: "2 oz", protein: 6 },
  { time: "7 PM", what: "Fairlife Core Power chocolate (sip over 30 min)", volume: "4 oz", protein: 26 },
];

const week1: PlanWeek = {
  week: 1,
  dayRange: "Days 1-7",
  phase: "Clear → Full Liquids",
  volume: "1 oz sips → 2-4 oz",
  proteinGoal: "Hydration first → 60-80g",
  banner: "Week 1 · Clear → Full Liquids · 1 oz sips, then 2-4 oz · 48-64 oz fluids",
  days: [
    {
      label: "Day 1 (Surgery Day)",
      note: "In hospital. Follow nurse instructions. Walk every 1-2 hours.",
      meals: [
        { time: "All day", what: "Sips of water, ice chips", volume: "Sips", protein: 0 },
        { time: "Midday", what: "Sugar-free Jell-O", volume: "1 oz", protein: 0 },
        { time: "Hourly", what: "Walk 5-10 min every 1-2 hours", volume: "—", protein: 0 },
      ],
    },
    { label: "Day 1", note: "Clear liquids · 1 oz sips · goal 48-64 oz fluids.", meals: week1ClearMeals },
    { label: "Day 2", note: "Clear liquids · 1 oz sips · goal 48-64 oz fluids.", meals: week1ClearMeals },
    { label: "Day 3", note: "Full liquids begin · 2-4 oz per meal · goal 60g protein.", meals: week1FullMeals },
    { label: "Day 4", note: "Full liquids · 2-4 oz per meal · goal 60g protein.", meals: week1FullMeals },
    { label: "Day 5", note: "Full liquids · 2-4 oz per meal · goal 60g protein.", meals: week1FullMeals },
    { label: "Day 6", note: "Full liquids · 2-4 oz per meal · goal 60g protein.", meals: week1FullMeals },
  ],
  shopping: [
    "Owyn protein shakes (peanut-free brand — your go-to)",
    "Premier Protein shakes (30g)",
    "Fairlife Core Power chocolate (26g)",
    "Fage 0% Greek yogurt",
    "Good Culture cottage cheese",
    "Sugar-free pudding cups",
    "Sugar-free Jell-O cups",
    "Bone broth (Kettle & Fire or Bonafide)",
    "Chicken broth (verify no shellfish stock)",
    "Crystal Light / Propel / Powerade Zero",
    "Decaf tea bags",
    "Sugar-free popsicles",
  ],
  recipes: [],
};

// ── WEEK 2 — Days 8-14 (Full Liquids, expanding) ───────────────────────────
const week2Sample: MealSlot[] = [
  { time: "7 AM", what: "Owyn shake", volume: "4 oz", protein: 20 },
  { time: "9 AM", what: "Thinned plain Greek yogurt + sugar-free vanilla syrup", volume: "4 oz", protein: 8 },
  { time: "11 AM", what: "Cream of tomato soup (strained, low-fat)", volume: "4 oz", protein: 4 },
  { time: "1 PM", what: "Premier Protein shake", volume: "4 oz", protein: 30 },
  { time: "3 PM", what: "Sugar-free pudding made with milk", volume: "4 oz", protein: 5 },
  { time: "5 PM", what: "Blended cottage cheese + 1 tsp sugar-free fruit puree", volume: "4 oz", protein: 7 },
  { time: "7 PM", what: "Fairlife Core Power", volume: "4 oz", protein: 26 },
];

const week2: PlanWeek = {
  week: 2,
  dayRange: "Days 8-14",
  phase: "Full Liquids",
  volume: "4 oz max per meal",
  proteinGoal: "60-80g protein",
  banner: "Week 2 · Full Liquids · 4 oz max per meal · 60-80g protein",
  days: buildDays(
    { note: "Full liquids, expanding variety · 4 oz max per meal.", meals: week2Sample },
    7,
    8
  ),
  shopping: [
    "8x Premier Protein shakes (30g)",
    "6x Fairlife Core Power chocolate (26g) — Costco bulk pack works",
    "6x Owyn protein shakes (peanut-free brand)",
    "Fage 0% Greek yogurt 32 oz",
    "Good Culture cottage cheese",
    "Sugar-free pudding cups (variety pack)",
    "Bone broth (Kettle & Fire or Bonafide)",
    "Sugar-free Jell-O cups",
    "Crystal Light variety pack",
    "Decaf tea bags",
  ],
  recipes: [],
};

// ── WEEK 3 — Days 15-21 (Pureed) ───────────────────────────────────────────
const week3Sample: MealSlot[] = [
  { time: "7 AM", what: "Scrambled egg pureed with cheese (1 egg + 1 Tbsp cheddar)", volume: "3 Tbsp", protein: 8 },
  { time: "10 AM", what: "Owyn shake (slowly)", volume: "6 oz", protein: 20 },
  { time: "12 PM", what: "Blended chicken with low-sodium broth", volume: "2 Tbsp", protein: 9 },
  { time: "3 PM", what: "Greek yogurt with mashed banana", volume: "3 Tbsp", protein: 7 },
  { time: "6 PM", what: "Refried beans (low-fat, no lard) + 1 Tbsp queso fresco", volume: "3 Tbsp", protein: 8 },
  { time: "8 PM", what: "Cottage cheese smoothie blend", volume: "3 Tbsp", protein: 7 },
];

const week3: PlanWeek = {
  week: 3,
  dayRange: "Days 15-21",
  phase: "Pureed",
  volume: "2-4 Tbsp up to ¼ cup",
  proteinGoal: "70-80g protein",
  banner: "Week 3 · Pureed · 2-4 Tbsp per meal · 70-80g protein",
  days: buildDays(
    { note: "Pureed · smooth, no chunks · sip water between meals, NOT during.", meals: week3Sample },
    7,
    15
  ),
  shopping: [
    "Boneless skinless chicken breasts (4-pack)",
    "Large eggs (dozen)",
    "Ricotta (Galbani whole milk)",
    "Rao's marinara (no sugar)",
    "Parmesan",
    "A Dozen Cousins Cuban Black Beans (3 pouches)",
    "Wild Planet wild tuna (4 cans)",
    "Avocado (3-4)",
    "Plain Greek yogurt (Fage)",
  ],
  recipes: [
    {
      name: "Bariatric-friendly blended chicken",
      ingredients: "4 oz cooked chicken breast, ¼ cup low-sodium broth, 1 Tbsp Greek yogurt",
      steps: "Blend smooth. Freeze in 2-Tbsp portions.",
    },
    {
      name: "Ricotta bake",
      ingredients: "1 cup ricotta, ¼ cup marinara (no sugar — Rao's), 2 Tbsp parmesan",
      steps: "Bake at 350°F for 20 min. Cool, then blend smooth.",
    },
    {
      name: "Egg salad (pureed)",
      ingredients: "3 hard-boiled eggs, 1 Tbsp Greek yogurt, ½ tsp mustard",
      steps: "Mash to a smooth paste.",
    },
    {
      name: "Tuna mash",
      ingredients: "1 can wild-caught tuna in water, 2 Tbsp Greek yogurt, lemon",
      steps: "Blend smooth. (Tuna is fish — not shellfish.)",
    },
    {
      name: "Pinto/black bean puree",
      ingredients: "A Dozen Cousins Cuban Black Beans, splash of broth",
      steps: "Blend smooth.",
    },
  ],
};

// ── WEEK 4 — Days 22-28 (Pureed, more variety) ─────────────────────────────
const week4Sample: MealSlot[] = [
  { time: "7 AM", what: "Pureed scrambled eggs with avocado mash", volume: "¼ cup", protein: 9 },
  { time: "10 AM", what: "Owyn shake", volume: "8 oz", protein: 20 },
  { time: "12 PM", what: "Blended turkey chili (no beans yet) — turkey + tomato + cumin", volume: "¼ cup", protein: 14 },
  { time: "3 PM", what: "Cottage cheese with pureed peaches (sugar-free)", volume: "¼ cup", protein: 10 },
  { time: "6 PM", what: "Ricotta bake", volume: "¼ cup", protein: 9 },
  { time: "8 PM", what: "Greek yogurt protein bowl", volume: "¼ cup", protein: 8 },
];

const week4: PlanWeek = {
  week: 4,
  dayRange: "Days 22-28",
  phase: "Pureed",
  volume: "¼ cup per meal",
  proteinGoal: "70-80g protein",
  banner: "Week 4 · Pureed · ¼ cup per meal · test ONE new food per day",
  days: buildDays(
    { note: "Pureed, more variety · ¼ cup · test ONE new food per day.", meals: week4Sample },
    7,
    22
  ),
  shopping: [
    "Butternut squash",
    "Cauliflower",
    "Sweet potato",
    "Hummus (verify peanut-free facility)",
    "Frozen berries",
    "Bananas",
    "Ground turkey 93/7",
    "Canned peaches (no sugar added)",
    "Restock: Owyn shakes, Greek yogurt, cottage cheese, ricotta",
  ],
  recipes: [
    {
      name: "New foods to try (one per day)",
      ingredients:
        "Pureed butternut squash · pureed avocado · mashed banana · pureed cauliflower with parmesan · hummus · mashed sweet potato · Greek yogurt with pureed berries",
      steps: "Introduce one new food per day. Stop if any food doesn't sit well.",
    },
  ],
};

// ── WEEK 5 — Days 29-35 (Soft Solids) ──────────────────────────────────────
const week5Sample: MealSlot[] = [
  { time: "7 AM", what: "Soft scrambled eggs (1 egg) + 1 Tbsp avocado", volume: "¼ cup", protein: 7 },
  { time: "10 AM", what: "String cheese + 4 grapes", volume: "small", protein: 7 },
  { time: "1 PM", what: "Flaked baked tilapia (2 oz) + steamed zucchini", volume: "⅓ cup", protein: 14 },
  { time: "3 PM", what: "Owyn shake", volume: "8 oz", protein: 20 },
  { time: "6 PM", what: "Ground turkey meatballs (no breadcrumbs) + soft carrots", volume: "⅓ cup", protein: 14 },
  { time: "8 PM", what: "Cottage cheese with cinnamon", volume: "¼ cup", protein: 10 },
];

const week5: PlanWeek = {
  week: 5,
  dayRange: "Days 29-35",
  phase: "Soft Solids",
  volume: "¼ to ½ cup per meal",
  proteinGoal: "~80g protein",
  banner: "Week 5 · Soft Solids · ¼ to ½ cup · chew 20-30 times · protein FIRST",
  days: buildDays(
    { note: "Soft solids · chew 20-30 times · protein first · stop at first pressure.", meals: week5Sample },
    7,
    29
  ),
  shopping: [
    "Tilapia / cod / sole filets (bake or poach — never fried)",
    "Canned pink salmon + fresh salmon filets",
    "Kevin's frozen turkey meatballs (or ground turkey 93/7)",
    "Ground beef 93/7",
    "Eggs (dozen)",
    "String cheese, Babybel, fresh mozzarella, queso fresco",
    "Soft veg: zucchini, carrots, cauliflower",
    "Dill, Italian seasoning",
  ],
  recipes: [
    {
      name: "Bariatric turkey meatballs",
      ingredients: "1 lb ground turkey, 1 egg, ¼ cup parmesan, Italian seasoning (NO breadcrumbs)",
      steps: "Bake at 375°F for 18 min. Freeze in pairs.",
    },
    {
      name: "Salmon cakes (baked, not fried)",
      ingredients: "1 can pink salmon, 1 egg, 2 Tbsp Greek yogurt, dill",
      steps: "Form patties. Bake at 375°F, ~15 min per side.",
    },
    {
      name: "Egg muffins",
      ingredients: "6 eggs, ¼ cup cottage cheese, spinach, diced bell pepper",
      steps: "Bake in a muffin tin at 350°F for 18 min. Freeze.",
    },
  ],
};

// ── WEEK 6 — Days 36-42 (Soft Solids → Regular) ────────────────────────────
const week6Sample: MealSlot[] = [
  { time: "7 AM", what: "2 egg muffins + ¼ avocado", volume: "½ cup", protein: 14 },
  { time: "10 AM", what: "Greek yogurt with chia + berries", volume: "½ cup", protein: 18 },
  { time: "1 PM", what: "2 turkey meatballs + ¼ cup zucchini", volume: "½ cup", protein: 18 },
  { time: "3 PM", what: "Owyn shake", volume: "8 oz", protein: 20 },
  { time: "6 PM", what: "3 oz baked salmon + ¼ cup cauliflower mash", volume: "½ cup", protein: 22 },
  { time: "8 PM", what: "Cottage cheese", volume: "¼ cup", protein: 10 },
];

const week6: PlanWeek = {
  week: 6,
  dayRange: "Days 36-42",
  phase: "Soft Solids → Regular",
  volume: "½ cup per meal",
  proteinGoal: "~100g protein",
  banner: "Week 6 · Soft Solids → Regular · ½ cup · ~100g protein · stop at fullness",
  days: buildDays(
    { note: "Add small portions of soft veggies + tiny fruit. Pouch is settling now.", meals: week6Sample },
    7,
    36
  ),
  shopping: [
    "Restock turkey meatballs, salmon, egg muffins (batch-prep)",
    "Greek yogurt, cottage cheese",
    "Chia seeds",
    "Berries, avocado",
    "Cauliflower, zucchini",
    "Owyn shakes",
  ],
  recipes: [
    {
      name: "Batch-prep carryover",
      ingredients: "Turkey meatballs, salmon cakes, egg muffins from Week 5",
      steps: "Keep your freezer stocked with the Week 5 batch recipes — they carry you through Week 6 and into the regular phase.",
    },
  ],
};

export const MEAL_PLAN: PlanWeek[] = [week1, week2, week3, week4, week5, week6];

// Compute the week a given post-op day falls into (1-6, clamped).
export function weekForPostOpDay(day: number): number {
  if (day < 1) return 1;
  const w = Math.ceil(day / 7);
  return Math.min(Math.max(w, 1), 6);
}

export function dailyProteinTotal(meals: MealSlot[]): number {
  return meals.reduce((sum, m) => sum + (m.protein || 0), 0);
}
