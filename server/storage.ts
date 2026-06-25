import {
  users,
  phases,
  meals,
  restaurantPicks,
  sproutsItems,
  mealPlanProgress,
} from "@shared/schema";
import type {
  User,
  InsertUser,
  Phase,
  Meal,
  InsertMeal,
  RestaurantPick,
  SproutsItem,
  MealPlanProgress,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, gte } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Ensure tables exist (no migration step in prototype).
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    surgery_date TEXT NOT NULL,
    allergies TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    day_start INTEGER NOT NULL,
    day_end INTEGER,
    texture TEXT NOT NULL,
    volume_per_meal TEXT NOT NULL,
    protein_goal TEXT NOT NULL,
    guidance TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL,
    protein_g INTEGER NOT NULL DEFAULT 0,
    carbs_g INTEGER NOT NULL DEFAULT 0,
    water_oz INTEGER NOT NULL DEFAULT 0,
    calories INTEGER NOT NULL DEFAULT 0,
    notes TEXT
  );
  CREATE TABLE IF NOT EXISTS restaurant_picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chain TEXT NOT NULL,
    dish_name TEXT NOT NULL,
    protein_g INTEGER NOT NULL DEFAULT 0,
    carbs_g INTEGER NOT NULL DEFAULT 0,
    sugar_g INTEGER NOT NULL DEFAULT 0,
    peanut_safe INTEGER NOT NULL DEFAULT 1,
    shellfish_safe INTEGER NOT NULL DEFAULT 1,
    allergy_notes TEXT NOT NULL DEFAULT '',
    order_instructions TEXT NOT NULL DEFAULT '',
    min_phase TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS sprouts_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    name TEXT NOT NULL,
    why TEXT NOT NULL,
    protein_per_serving TEXT NOT NULL DEFAULT '',
    allergy_notes TEXT NOT NULL DEFAULT '',
    checked INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS meal_plan_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week INTEGER NOT NULL,
    day INTEGER NOT NULL,
    meal_index INTEGER NOT NULL,
    eaten INTEGER NOT NULL DEFAULT 0,
    eaten_at TEXT
  );
`);

export const db = drizzle(sqlite);

export interface IStorage {
  getUsers(): Promise<User[]>;
  getUserByRole(role: string): Promise<User | undefined>;
  getPhases(): Promise<Phase[]>;
  getMealsForUserOnDate(userId: number, dateISO: string): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  getRestaurantPicks(): Promise<RestaurantPick[]>;
  getSproutsItems(): Promise<SproutsItem[]>;
  setSproutsChecked(id: number, checked: boolean): Promise<SproutsItem | undefined>;
  addSproutsItem(item: { section: string; name: string; why: string; allergyNotes: string }): Promise<SproutsItem>;
  getMealPlanProgress(userId: number, week: number, day: number): Promise<MealPlanProgress[]>;
  setMealPlanProgress(
    userId: number,
    week: number,
    day: number,
    mealIndex: number,
    eaten: boolean
  ): Promise<MealPlanProgress>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return db.select().from(users).all();
  }
  async getUserByRole(role: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.role, role)).get();
  }
  async getPhases(): Promise<Phase[]> {
    return db.select().from(phases).all();
  }
  async getMealsForUserOnDate(userId: number, dateISO: string): Promise<Meal[]> {
    const all = db.select().from(meals).where(eq(meals.userId, userId)).all();
    return all.filter((m) => m.timestamp.slice(0, 10) === dateISO);
  }
  async createMeal(meal: InsertMeal): Promise<Meal> {
    return db.insert(meals).values(meal).returning().get();
  }
  async getRestaurantPicks(): Promise<RestaurantPick[]> {
    return db.select().from(restaurantPicks).all();
  }
  async getSproutsItems(): Promise<SproutsItem[]> {
    return db.select().from(sproutsItems).all();
  }
  async setSproutsChecked(id: number, checked: boolean): Promise<SproutsItem | undefined> {
    return db
      .update(sproutsItems)
      .set({ checked })
      .where(eq(sproutsItems.id, id))
      .returning()
      .get();
  }
  async addSproutsItem(item: {
    section: string;
    name: string;
    why: string;
    allergyNotes: string;
  }): Promise<SproutsItem> {
    return db
      .insert(sproutsItems)
      .values({
        section: item.section,
        name: item.name,
        why: item.why,
        proteinPerServing: "",
        allergyNotes: item.allergyNotes,
        checked: false,
      })
      .returning()
      .get();
  }
  async getMealPlanProgress(
    userId: number,
    week: number,
    day: number
  ): Promise<MealPlanProgress[]> {
    return db
      .select()
      .from(mealPlanProgress)
      .where(
        and(
          eq(mealPlanProgress.userId, userId),
          eq(mealPlanProgress.week, week),
          eq(mealPlanProgress.day, day)
        )
      )
      .all();
  }
  async setMealPlanProgress(
    userId: number,
    week: number,
    day: number,
    mealIndex: number,
    eaten: boolean
  ): Promise<MealPlanProgress> {
    const existing = db
      .select()
      .from(mealPlanProgress)
      .where(
        and(
          eq(mealPlanProgress.userId, userId),
          eq(mealPlanProgress.week, week),
          eq(mealPlanProgress.day, day),
          eq(mealPlanProgress.mealIndex, mealIndex)
        )
      )
      .get();
    const eatenAt = eaten ? new Date().toISOString() : null;
    if (existing) {
      return db
        .update(mealPlanProgress)
        .set({ eaten, eatenAt })
        .where(eq(mealPlanProgress.id, existing.id))
        .returning()
        .get();
    }
    return db
      .insert(mealPlanProgress)
      .values({ userId, week, day, mealIndex, eaten, eatenAt })
      .returning()
      .get();
  }
}

export const storage = new DatabaseStorage();

// ── Seeding ─────────────────────────────────────────────────────────────
export function seedDatabase() {
  // Users
  if (db.select().from(users).all().length === 0) {
    db.insert(users).values([
      {
        name: "Carlos",
        role: "patient",
        surgeryDate: "2026-06-24",
        allergies: JSON.stringify(["Peanut (severe)", "Shellfish (severe)"]),
      },
      {
        name: "Carlos's wife",
        role: "partner",
        surgeryDate: "2026-06-24",
        allergies: JSON.stringify(["Peanut (severe)", "Shellfish (severe)"]),
      },
    ]).run();
  }

  // Phases
  if (db.select().from(phases).all().length === 0) {
    db.insert(phases).values([
      {
        name: "Clear Liquids",
        dayStart: 0,
        dayEnd: 2,
        texture: "Clear liquids only",
        volumePerMeal: "1 oz sips",
        proteinGoal: "Hydration first",
        guidance: "Goal: 48–64 oz of clear fluid a day. Tiny 1 oz sips, all day long. Water, broth, sugar-free electrolytes, decaf tea.",
      },
      {
        name: "Full Liquids",
        dayStart: 3,
        dayEnd: 13,
        texture: "Full liquids",
        volumePerMeal: "2–4 oz per meal",
        proteinGoal: "60–80 g protein",
        guidance: "Protein shakes, strained cream soups, thin yogurt. Aim for 4–6 small meals and 60–80 g protein a day.",
      },
      {
        name: "Pureed",
        dayStart: 14,
        dayEnd: 27,
        texture: "Smooth purees",
        volumePerMeal: "2–4 Tbsp, up to 1/4 cup",
        proteinGoal: "60–80 g protein",
        guidance: "Blended, smooth, no chunks. Protein first, every meal. Stop at the first sign of fullness.",
      },
      {
        name: "Soft Solids",
        dayStart: 28,
        dayEnd: 41,
        texture: "Soft, moist solids",
        volumePerMeal: "1/4 to 1/2 cup",
        proteinGoal: "60–80 g protein",
        guidance: "Soft proteins: eggs, fish, ground meats, cottage cheese. Chew 20–30 times. Protein first.",
      },
      {
        name: "Regular Bariatric",
        dayStart: 42,
        dayEnd: null,
        texture: "Regular bariatric diet",
        volumePerMeal: "1/2 to 1 cup",
        proteinGoal: "80–100 g protein (forever)",
        guidance: "Your long-term way of eating. Protein first, 80–100 g a day, for life. Small portions, slow and mindful.",
      },
    ]).run();
  }

  // Restaurant picks
  if (db.select().from(restaurantPicks).all().length === 0) {
    db.insert(restaurantPicks).values([
      // Chick-fil-A
      { chain: "Chick-fil-A", dishName: "Grilled Nuggets (8 ct)", proteinG: 25, carbsG: 2, sugarG: 1, peanutSafe: true, shellfishSafe: true, allergyNotes: "Chick-fil-A fries in fully refined peanut oil — the nuggets are grilled, not fried, but confirm with your allergist before relying on it.", orderInstructions: "Order the 8-count grilled nuggets, no sauce or a low-sugar sauce on the side.", minPhase: "Soft Solids" },
      { chain: "Chick-fil-A", dishName: "Grilled Chicken Filet (no bun)", proteinG: 28, carbsG: 3, sugarG: 1, peanutSafe: true, shellfishSafe: true, allergyNotes: "Grilled, not fried. Refined peanut oil is used elsewhere in the kitchen — verify with your allergist.", orderInstructions: "Ask for the grilled filet only, no bun, no mayo.", minPhase: "Soft Solids" },
      { chain: "Chick-fil-A", dishName: "Egg White Grill (no bun)", proteinG: 25, carbsG: 4, sugarG: 1, peanutSafe: true, shellfishSafe: true, allergyNotes: "No peanut or shellfish ingredients. Refined peanut oil in kitchen — verify.", orderInstructions: "Order the Egg White Grill, ask for the filling only, no muffin.", minPhase: "Soft Solids" },
      // Starbucks
      { chain: "Starbucks", dishName: "Kale & Mushroom Egg Bites", proteinG: 15, carbsG: 9, sugarG: 1, peanutSafe: true, shellfishSafe: true, allergyNotes: "No peanut or shellfish. Pairs well early because they are soft and high-protein.", orderInstructions: "Two egg bites. Decaf coffee only for the first 30 days.", minPhase: "Soft Solids" },
      { chain: "Starbucks", dishName: "Egg White & Red Pepper Egg Bites", proteinG: 13, carbsG: 11, sugarG: 2, peanutSafe: true, shellfishSafe: true, allergyNotes: "No peanut or shellfish ingredients.", orderInstructions: "Two egg bites. Skip the caffeine early — order decaf.", minPhase: "Soft Solids" },
      { chain: "Starbucks", dishName: "Spinach Feta Wrap (filling only)", proteinG: 20, carbsG: 6, sugarG: 1, peanutSafe: true, shellfishSafe: true, allergyNotes: "Eat the egg/feta/spinach filling only; skip the wrap early on.", orderInstructions: "Ask for the filling scooped out, no tortilla. Decaf only first 30 days.", minPhase: "Soft Solids" },
      // Jamba Juice
      { chain: "Jamba Juice", dishName: "Greek Yogurt Blend (kids size) + 2 scoops whey", proteinG: 25, carbsG: 18, sugarG: 12, peanutSafe: true, shellfishSafe: true, allergyNotes: "AVOID PB Chocolate Love and any nut/peanut smoothies — cross-contact risk is high.", orderInstructions: "Order kids size, 'make it light', add 2 scoops of whey protein boost.", minPhase: "Full Liquids" },
      { chain: "Jamba Juice", dishName: "Protein Berry Workout (light, whey)", proteinG: 22, carbsG: 22, sugarG: 14, peanutSafe: true, shellfishSafe: true, allergyNotes: "Confirm the WHEY (soy) boost is used — never the peanut/almond option.", orderInstructions: "Kids size, 'make it light', whey boost only. No PB. No nut boosts.", minPhase: "Full Liquids" },
      // Target Good & Gather
      { chain: "Target", dishName: "Good & Gather Nonfat Greek Yogurt", proteinG: 18, carbsG: 6, sugarG: 4, peanutSafe: true, shellfishSafe: true, allergyNotes: "Plain nonfat. No peanut or shellfish. Great early protein.", orderInstructions: "Grab the plain nonfat tub — add your own sugar-free flavoring.", minPhase: "Full Liquids" },
      { chain: "Target", dishName: "Good & Gather Rotisserie Chicken", proteinG: 24, carbsG: 0, sugarG: 0, peanutSafe: true, shellfishSafe: true, allergyNotes: "Plain rotisserie. Read the label seasoning, but no peanut/shellfish.", orderInstructions: "Shred and moisten for soft-solids stage. Protein first.", minPhase: "Soft Solids" },
      { chain: "Target", dishName: "Good & Gather Sous-Vide Egg Bites", proteinG: 13, carbsG: 9, sugarG: 1, peanutSafe: true, shellfishSafe: true, allergyNotes: "No peanut or shellfish. Soft and easy to tolerate.", orderInstructions: "Microwave gently. One bite at a time.", minPhase: "Soft Solids" },
      { chain: "Target", dishName: "Good & Gather Deli Turkey", proteinG: 12, carbsG: 1, sugarG: 1, peanutSafe: true, shellfishSafe: true, allergyNotes: "Low-sodium oven-roasted. No peanut/shellfish.", orderInstructions: "Roll a slice with cheese for an easy soft-solids protein snack.", minPhase: "Soft Solids" },
      // McDonald's
      { chain: "McDonald's", dishName: "Grilled Chicken Sandwich (no bun, no mayo)", proteinG: 27, carbsG: 3, sugarG: 1, peanutSafe: true, shellfishSafe: true, allergyNotes: "Grilled patty only. No peanut/shellfish in the patty.", orderInstructions: "Ask for the grilled chicken, no bun, no mayo.", minPhase: "Soft Solids" },
      { chain: "McDonald's", dishName: "Egg White Delight (no muffin)", proteinG: 18, carbsG: 4, sugarG: 2, peanutSafe: true, shellfishSafe: true, allergyNotes: "Egg whites + Canadian bacon + cheese. No peanut/shellfish.", orderInstructions: "Order it, eat the filling only — skip the muffin.", minPhase: "Soft Solids" },
      { chain: "McDonald's", dishName: "Side Salad with Vinaigrette", proteinG: 2, carbsG: 6, sugarG: 3, peanutSafe: true, shellfishSafe: true, allergyNotes: "For later stages. Pair with a grilled protein.", orderInstructions: "Light vinaigrette on the side. Add grilled chicken for protein.", minPhase: "Regular Bariatric" },
      // Wendy's
      { chain: "Wendy's", dishName: "Grilled Chicken Wrap (filling only)", proteinG: 20, carbsG: 8, sugarG: 2, peanutSafe: true, shellfishSafe: true, allergyNotes: "Eat the grilled chicken + cheese filling, skip the tortilla early.", orderInstructions: "Order the grilled wrap, eat the filling only, light sauce.", minPhase: "Soft Solids" },
      { chain: "Wendy's", dishName: "Side Salad", proteinG: 3, carbsG: 7, sugarG: 4, peanutSafe: true, shellfishSafe: true, allergyNotes: "Pair with grilled chicken. No peanut/shellfish.", orderInstructions: "Add a grilled chicken to make it a protein-first meal.", minPhase: "Regular Bariatric" },
      // Taco Bell
      { chain: "Taco Bell", dishName: "Power Menu Bowl (no rice, no beans, fresco)", proteinG: 26, carbsG: 9, sugarG: 3, peanutSafe: true, shellfishSafe: true, allergyNotes: "Fresco style cuts dairy/sauce. No peanut/shellfish. Skip rice & beans early.", orderInstructions: "Order Power Bowl with grilled chicken, no rice, no beans, fresco style.", minPhase: "Soft Solids" },
      // Subway
      { chain: "Subway", dishName: "Chopped Salad — Rotisserie Chicken or Turkey", proteinG: 23, carbsG: 8, sugarG: 4, peanutSafe: true, shellfishSafe: true, allergyNotes: "No peanut/shellfish. Choose chicken or turkey, oil + vinegar.", orderInstructions: "Order as a chopped salad, rotisserie chicken or turkey, oil + vinegar dressing.", minPhase: "Soft Solids" },
    ]).run();
  }

  // Sprouts shopping items
  if (db.select().from(sproutsItems).all().length === 0) {
    db.insert(sproutsItems).values([
      // Protein / Deli
      { section: "Protein & Deli", name: "Kevin's Cilantro Lime Chicken", why: "Pre-cooked, clean ingredients, easy to warm and shred.", proteinPerServing: "20 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Protein & Deli", name: "Applegate Egg & Bacon Frittata Bites", why: "Soft, portion-sized protein for soft-solids stage.", proteinPerServing: "19 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Protein & Deli", name: "Rotisserie Chicken", why: "Versatile lean protein, shred and moisten.", proteinPerServing: "24 g / 3 oz", allergyNotes: "Peanut-safe, shellfish-safe — check seasoning label", checked: false },
      { section: "Protein & Deli", name: "Deli Turkey (low-sodium)", why: "Quick protein snack, roll with cheese.", proteinPerServing: "12 g / 2 oz", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Protein & Deli", name: "Ground Turkey 93/7", why: "Lean, tolerates well when cooked moist.", proteinPerServing: "22 g / 4 oz", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Protein & Deli", name: "Ground Beef 93/7", why: "Lean red-meat protein for later stages.", proteinPerServing: "23 g / 4 oz", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Protein & Deli", name: "Hard-Boiled Eggs", why: "Grab-and-go soft protein.", proteinPerServing: "6 g / egg", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Protein & Deli", name: "Salmon Filets", why: "Omega-3 rich, soft when baked. NOTE: fish — not shellfish.", proteinPerServing: "22 g / 3 oz", allergyNotes: "Peanut-safe, shellfish-safe (salmon is fish, not shellfish)", checked: false },

      // Dairy
      { section: "Dairy", name: "Fage 0% Greek Yogurt", why: "High protein, low sugar, tolerates very early.", proteinPerServing: "18 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Dairy", name: "Good Culture Cottage Cheese", why: "Smooth, high-protein, great pureed-stage option.", proteinPerServing: "14 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Dairy", name: "Icelandic Provisions Skyr", why: "Thick, protein-dense, low sugar.", proteinPerServing: "15 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Dairy", name: "String Cheese", why: "Portion-controlled protein snack.", proteinPerServing: "7 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Dairy", name: "Babybel", why: "Easy single-serve cheese protein.", proteinPerServing: "5 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },

      // Protein shakes
      { section: "Protein Shakes", name: "Owyn Protein Shake", why: "Made in a peanut-free, allergen-friendly facility — a safe default for Carlos.", proteinPerServing: "20 g", allergyNotes: "Peanut-FREE brand — top pick for severe allergy", checked: false },
      { section: "Protein Shakes", name: "Premier Protein Shake", why: "Widely available, 30 g protein, low sugar.", proteinPerServing: "30 g", allergyNotes: "Peanut-safe, shellfish-safe — read label (made on shared lines)", checked: false },
      { section: "Protein Shakes", name: "Fairlife Core Power", why: "Real-milk protein, smooth, low sugar.", proteinPerServing: "26 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Protein Shakes", name: "Orgain Clean Whey", why: "Clean whey isolate, mixes thin for early stages.", proteinPerServing: "21 g", allergyNotes: "Peanut-safe, shellfish-safe — verify line on label", checked: false },

      // Pantry
      { section: "Pantry", name: "A Dozen Cousins Cuban Black Beans", why: "Soft, blendable plant protein for pureed stage.", proteinPerServing: "16 g / pouch", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Pantry", name: "Sugar-Free Pudding Cups", why: "Soft texture, satisfies sweet cravings without sugar.", proteinPerServing: "2 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Pantry", name: "Sugar-Free Jell-O", why: "Clear-liquids-stage friendly, soothing.", proteinPerServing: "0 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Pantry", name: "Bone Broth", why: "Clear-liquids protein + electrolytes.", proteinPerServing: "9 g / cup", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },

      // Snacks for later stages
      { section: "Snacks (Later Stages)", name: "Chomps Beef Sticks", why: "Portable protein once solids are tolerated.", proteinPerServing: "9 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Snacks (Later Stages)", name: "Country Archer Meat Sticks", why: "Clean-ingredient jerky for later stages.", proteinPerServing: "8 g", allergyNotes: "VERIFY peanut-free on the specific flavor label", checked: false },
      { section: "Snacks (Later Stages)", name: "Bare Apple Chips", why: "Light crunchy snack, no added sugar.", proteinPerServing: "0 g", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Snacks (Later Stages)", name: "Quest Chips", why: "High-protein crunchy snack for later stages.", proteinPerServing: "18 g", allergyNotes: "Peanut-safe, shellfish-safe — check flavor label", checked: false },

      // Vitamins
      { section: "Vitamins & Supplements", name: "Bariatric Multivitamin (chewable)", why: "Bariatric-formulated, gentle on the new stomach.", proteinPerServing: "—", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Vitamins & Supplements", name: "Calcium Citrate (chewable)", why: "Citrate form absorbs best post-sleeve.", proteinPerServing: "—", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Vitamins & Supplements", name: "Vitamin D3 3000 IU", why: "Supports calcium and immunity.", proteinPerServing: "—", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Vitamins & Supplements", name: "B12 Sublingual 500 mcg", why: "Sublingual bypasses reduced stomach absorption.", proteinPerServing: "—", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
      { section: "Vitamins & Supplements", name: "Iron 18 mg", why: "Prevents post-surgical anemia. Take apart from calcium.", proteinPerServing: "—", allergyNotes: "Peanut-safe, shellfish-safe", checked: false },
    ]).run();
  }
}
