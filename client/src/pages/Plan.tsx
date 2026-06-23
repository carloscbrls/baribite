import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AppShell } from "@/components/AppShell";
import { AllergyBanner } from "@/components/AllergyBanner";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CalendarDays, ShoppingCart, ChefHat, Clock } from "lucide-react";
import {
  MEAL_PLAN,
  weekForPostOpDay,
  dailyProteinTotal,
  type PlanWeek,
  type MealSlot,
} from "@/data/meal_plan";
import { postOpDay } from "@/lib/baribite";
import type { MealPlanProgress } from "@shared/schema";

const USER_ID = 1;

export default function Plan() {
  // Default to Carlos's current post-op week.
  const defaultWeek = weekForPostOpDay(postOpDay());
  const [week, setWeek] = useState<number>(defaultWeek);
  const [day, setDay] = useState<number>(1);

  const weekData: PlanWeek = MEAL_PLAN[week - 1];
  const dayData = weekData.days[day - 1];

  const { data: progress } = useQuery<MealPlanProgress[]>({
    queryKey: ["/api/meal-plan/progress", { userId: USER_ID, week, day }],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/meal-plan/progress?userId=${USER_ID}&week=${week}&day=${day}`
      );
      return res.json();
    },
  });

  const check = useMutation({
    mutationFn: async ({ mealIndex, eaten }: { mealIndex: number; eaten: boolean }) => {
      const res = await apiRequest("POST", "/api/meal-plan/check", {
        userId: USER_ID,
        week,
        day,
        mealIndex,
        eaten,
      });
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/meal-plan/progress", { userId: USER_ID, week, day }],
      }),
  });

  const eatenSet = useMemo(() => {
    const s = new Set<number>();
    (progress ?? []).forEach((p) => {
      if (p.eaten) s.add(p.mealIndex);
    });
    return s;
  }, [progress]);

  const goalProtein = dailyProteinTotal(dayData.meals);
  const eatenProtein = dayData.meals.reduce(
    (sum, m, i) => (eatenSet.has(i) ? sum + (m.protein || 0) : sum),
    0
  );
  const pct = goalProtein ? Math.round((eatenProtein / goalProtein) * 100) : 0;

  return (
    <AppShell title="Meal plan">
      <div className="space-y-4">
        <AllergyBanner />

        {/* Week selector */}
        <div>
          <p className="mb-1.5 px-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Week
          </p>
          <div className="flex gap-1.5">
            {MEAL_PLAN.map((w) => (
              <button
                key={w.week}
                type="button"
                onClick={() => setWeek(w.week)}
                data-testid={`button-week-${w.week}`}
                className={`flex-1 rounded-xl border py-2 text-sm font-bold transition-colors hover-elevate active-elevate-2 ${
                  week === w.week
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {w.week}
              </button>
            ))}
          </div>
        </div>

        {/* Phase banner */}
        <Card
          className="flex items-start gap-3 border-primary-border bg-secondary p-4"
          data-testid="banner-phase"
        >
          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-bold text-foreground">{weekData.banner}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {weekData.dayRange} · {weekData.phase}
            </p>
          </div>
        </Card>

        {/* Day tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {weekData.days.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDay(i + 1)}
              data-testid={`button-day-${i + 1}`}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors hover-elevate active-elevate-2 ${
                day === i + 1
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {d.label.startsWith("Day") ? `Day ${i + 1}` : d.label}
            </button>
          ))}
        </div>

        {/* Day note */}
        {dayData.note && (
          <p className="px-1 text-xs leading-snug text-muted-foreground" data-testid="text-day-note">
            {dayData.note}
          </p>
        )}

        {/* Meal timeline */}
        <div className="space-y-2.5">
          {dayData.meals.map((meal, i) => (
            <MealCard
              key={`${week}-${day}-${i}`}
              meal={meal}
              eaten={eatenSet.has(i)}
              onToggle={(eaten) => check.mutate({ mealIndex: i, eaten })}
              testid={`meal-${i}`}
            />
          ))}
        </div>

        {/* Daily total */}
        <Card className="p-4" data-testid="card-daily-total">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Protein today</span>
            <span className="font-bold text-primary" data-testid="text-protein-total">
              {eatenProtein}g / {goalProtein}g goal
            </span>
          </div>
          <Progress value={Math.min(pct, 100)} className="mt-2 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            Check off meals as you eat them — your progress stays saved.
          </p>
        </Card>

        {/* Shopping list */}
        {weekData.shopping.length > 0 && (
          <Card className="p-4" data-testid="card-shopping">
            <div className="mb-2 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                Shopping list — Week {weekData.week}
              </h2>
            </div>
            <ul className="space-y-1.5">
              {weekData.shopping.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-snug text-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.7rem] text-muted-foreground">
              From Sprouts / Target / Amazon. Always verify peanut &amp; shellfish on labels.
            </p>
          </Card>
        )}

        {/* Recipes */}
        {weekData.recipes.length > 0 && (
          <Card className="p-4" data-testid="card-recipes">
            <div className="mb-2 flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Batch-prep recipes</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {weekData.recipes.map((r, i) => (
                <AccordionItem key={i} value={`recipe-${i}`} data-testid={`recipe-${i}`}>
                  <AccordionTrigger className="py-2.5 text-left text-sm font-semibold">
                    {r.name}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-xs leading-snug">
                    <div>
                      <p className="font-semibold text-primary">Ingredients</p>
                      <p className="text-foreground">{r.ingredients}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-primary">Steps</p>
                      <p className="text-foreground">{r.steps}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function MealCard({
  meal,
  eaten,
  onToggle,
  testid,
}: {
  meal: MealSlot;
  eaten: boolean;
  onToggle: (eaten: boolean) => void;
  testid: string;
}) {
  return (
    <Card className="flex items-start gap-3 p-3.5" data-testid={`card-${testid}`}>
      <div className="flex w-14 shrink-0 flex-col items-center">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="mt-0.5 text-center text-[0.7rem] font-semibold leading-tight text-muted-foreground">
          {meal.time}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold leading-snug ${
            eaten ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {meal.what}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {meal.volume && meal.volume !== "—" && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
              {meal.volume}
            </span>
          )}
          {meal.protein > 0 && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[0.7rem] font-bold text-primary">
              {meal.protein}g protein
            </span>
          )}
        </div>
      </div>
      <Checkbox
        checked={eaten}
        onCheckedChange={(v) => onToggle(Boolean(v))}
        className="mt-0.5"
        aria-label="Mark eaten"
        data-testid={`checkbox-${testid}`}
      />
    </Card>
  );
}
