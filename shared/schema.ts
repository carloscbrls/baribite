import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Users ───────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'patient' | 'partner'
  surgeryDate: text("surgery_date").notNull(), // ISO date string
  allergies: text("allergies").notNull(), // JSON string array
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ── Phases ──────────────────────────────────────────────────────────────
export const phases = sqliteTable("phases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  dayStart: integer("day_start").notNull(),
  dayEnd: integer("day_end"), // null = open-ended (forever phase)
  texture: text("texture").notNull(), // "Clear liquids", "Pureed", etc.
  volumePerMeal: text("volume_per_meal").notNull(),
  proteinGoal: text("protein_goal").notNull(),
  guidance: text("guidance").notNull(),
});

export const insertPhaseSchema = createInsertSchema(phases).omit({ id: true });
export type InsertPhase = z.infer<typeof insertPhaseSchema>;
export type Phase = typeof phases.$inferSelect;

// ── Meals (logged intake) ───────────────────────────────────────────────
export const meals = sqliteTable("meals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  timestamp: text("timestamp").notNull(), // ISO datetime
  type: text("type").notNull(), // 'water' | 'shake' | 'meal'
  proteinG: integer("protein_g").notNull().default(0),
  carbsG: integer("carbs_g").notNull().default(0),
  waterOz: integer("water_oz").notNull().default(0),
  calories: integer("calories").notNull().default(0),
  notes: text("notes"),
});

export const insertMealSchema = createInsertSchema(meals).omit({ id: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

// ── Restaurant picks ────────────────────────────────────────────────────
export const restaurantPicks = sqliteTable("restaurant_picks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chain: text("chain").notNull(),
  dishName: text("dish_name").notNull(),
  proteinG: integer("protein_g").notNull().default(0),
  carbsG: integer("carbs_g").notNull().default(0),
  sugarG: integer("sugar_g").notNull().default(0),
  peanutSafe: integer("peanut_safe", { mode: "boolean" }).notNull().default(true),
  shellfishSafe: integer("shellfish_safe", { mode: "boolean" }).notNull().default(true),
  allergyNotes: text("allergy_notes").notNull().default(""),
  orderInstructions: text("order_instructions").notNull().default(""),
  minPhase: text("min_phase").notNull().default(""), // earliest stage appropriate
});

export const insertRestaurantPickSchema = createInsertSchema(restaurantPicks).omit({ id: true });
export type InsertRestaurantPick = z.infer<typeof insertRestaurantPickSchema>;
export type RestaurantPick = typeof restaurantPicks.$inferSelect;

// ── Sprouts shopping items ──────────────────────────────────────────────
export const sproutsItems = sqliteTable("sprouts_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  section: text("section").notNull(),
  name: text("name").notNull(),
  why: text("why").notNull(),
  proteinPerServing: text("protein_per_serving").notNull().default(""),
  allergyNotes: text("allergy_notes").notNull().default(""),
  checked: integer("checked", { mode: "boolean" }).notNull().default(false),
});

export const insertSproutsItemSchema = createInsertSchema(sproutsItems).omit({ id: true });
export type InsertSproutsItem = z.infer<typeof insertSproutsItemSchema>;
export type SproutsItem = typeof sproutsItems.$inferSelect;

// ── Meal plan progress (which plan meals have been checked off) ─────────────
export const mealPlanProgress = sqliteTable("meal_plan_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  week: integer("week").notNull(),
  day: integer("day").notNull(), // 1-7 within the week
  mealIndex: integer("meal_index").notNull(),
  eaten: integer("eaten", { mode: "boolean" }).notNull().default(false),
  eatenAt: text("eaten_at"), // ISO datetime when marked eaten
});

export const insertMealPlanProgressSchema = createInsertSchema(mealPlanProgress).omit({ id: true });
export type InsertMealPlanProgress = z.infer<typeof insertMealPlanProgressSchema>;
export type MealPlanProgress = typeof mealPlanProgress.$inferSelect;
