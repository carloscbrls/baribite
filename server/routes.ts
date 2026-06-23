import type { Express } from "express";
import type { Server } from "node:http";
import { storage, seedDatabase } from "./storage";
import { insertMealSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  seedDatabase();

  app.get("/api/users", async (_req, res) => {
    res.json(await storage.getUsers());
  });

  app.get("/api/phases", async (_req, res) => {
    res.json(await storage.getPhases());
  });

  // Today's meals for a user (defaults to patient id 1, today's date)
  app.get("/api/meals", async (req, res) => {
    const userId = parseInt((req.query.userId as string) || "1", 10);
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    res.json(await storage.getMealsForUserOnDate(userId, date));
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const data = insertMealSchema.parse(req.body);
      const meal = await storage.createMeal(data);
      res.status(201).json(meal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal", errors: err.errors });
      }
      throw err;
    }
  });

  app.get("/api/restaurant-picks", async (_req, res) => {
    res.json(await storage.getRestaurantPicks());
  });

  app.get("/api/sprouts-items", async (_req, res) => {
    res.json(await storage.getSproutsItems());
  });

  app.patch("/api/sprouts-items/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const checked = Boolean(req.body.checked);
    const item = await storage.setSproutsChecked(id, checked);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post("/api/sprouts-items", async (req, res) => {
    const schema = z.object({
      section: z.string().min(1),
      name: z.string().min(1),
      why: z.string().default(""),
      allergyNotes: z.string().default(""),
    });
    try {
      const data = schema.parse(req.body);
      const item = await storage.addSproutsItem(data);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item", errors: err.errors });
      }
      throw err;
    }
  });

  return httpServer;
}
