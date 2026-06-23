import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AppShell } from "@/components/AppShell";
import { AllergyBanner } from "@/components/AllergyBanner";
import { RulesRow } from "@/components/RulesRow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Droplet, Beef, UtensilsCrossed, Plus, Clock } from "lucide-react";
import {
  phaseForDay,
  postOpDay,
  phaseLabel,
  daysSinceSurgery,
} from "@/lib/baribite";
import type { Phase, Meal } from "@shared/schema";

const PROTEIN_GOAL = 70;
const WATER_GOAL = 64;
const MEAL_GOAL = 6;

export default function Dashboard() {
  const { data: phases, isLoading: phasesLoading } = useQuery<Phase[]>({
    queryKey: ["/api/phases"],
  });
  const today = new Date().toISOString().slice(0, 10);
  const { data: meals, isLoading: mealsLoading } = useQuery<Meal[]>({
    queryKey: ["/api/meals", { userId: 1, date: today }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/meals?userId=1&date=${today}`);
      return res.json();
    },
  });

  const day = postOpDay();
  const daysSince = daysSinceSurgery();
  const phase = useMemo(
    () => (phases ? phaseForDay(phases, day) : undefined),
    [phases, day]
  );

  const totals = useMemo(() => {
    const m = meals ?? [];
    return {
      protein: m.reduce((s, x) => s + (x.proteinG || 0), 0),
      water: m.reduce((s, x) => s + (x.waterOz || 0), 0),
      meals: m.filter((x) => x.type === "meal" || x.type === "shake").length,
    };
  }, [meals]);

  const addMeal = useMutation({
    mutationFn: async (payload: Partial<Meal>) => {
      const res = await apiRequest("POST", "/api/meals", {
        userId: 1,
        timestamp: new Date().toISOString(),
        type: payload.type,
        proteinG: payload.proteinG ?? 0,
        carbsG: 0,
        waterOz: payload.waterOz ?? 0,
        calories: 0,
        notes: payload.notes ?? null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals", { userId: 1, date: today }] });
      setLastEat(Date.now());
    },
  });

  // Meal-spacing timer: after a meal, you wait 60 min before drinking.
  const [lastEat, setLastEat] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000 * 15);
    return () => clearInterval(t);
  }, []);
  const waitMin = lastEat
    ? Math.max(0, 60 - Math.floor((now - lastEat) / 60000))
    : 0;
  const drinkingOpen = !lastEat || waitMin === 0;

  const clock = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Phase banner */}
        {phasesLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : (
          <Card className="overflow-hidden border-none bg-primary p-5 text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {phaseLabel()}
            </p>
            <h2 className="mt-1 text-xl font-bold" data-testid="text-phase-name">
              {phase?.name ?? "Pre-Op"}
            </h2>
            <p className="mt-1.5 text-sm leading-snug opacity-90">
              {daysSince < 0
                ? "Surgery is tomorrow. Today is clear-liquids prep — small sips, calm mind."
                : phase?.guidance}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-primary-foreground/15 px-2.5 py-1">
                {phase?.texture}
              </span>
              <span className="rounded-full bg-primary-foreground/15 px-2.5 py-1">
                {phase?.volumePerMeal} / meal
              </span>
            </div>
          </Card>
        )}

        <AllergyBanner />

        {/* Three stat cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            loading={mealsLoading}
            icon={<Beef className="h-4 w-4" />}
            label="Protein"
            value={totals.protein}
            unit="g"
            goal={PROTEIN_GOAL}
            testid="stat-protein"
          />
          <StatCard
            loading={mealsLoading}
            icon={<Droplet className="h-4 w-4" />}
            label="Water"
            value={totals.water}
            unit="oz"
            goal={WATER_GOAL}
            testid="stat-water"
          />
          <StatCard
            loading={mealsLoading}
            icon={<UtensilsCrossed className="h-4 w-4" />}
            label="Meals"
            value={totals.meals}
            unit=""
            goal={MEAL_GOAL}
            testid="stat-meals"
          />
        </div>

        {/* Meal-spacing timer */}
        <Card
          className={`p-4 ${
            drinkingOpen ? "bg-card" : "border-coral-border bg-coral-soft"
          }`}
          data-testid="card-timer"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full ${
                drinkingOpen ? "bg-secondary text-primary" : "bg-coral text-coral-foreground"
              }`}
            >
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {drinkingOpen ? "Drinking window: OPEN" : `Wait ${waitMin} min before drinking`}
              </p>
              <p className="text-xs text-muted-foreground">
                {drinkingOpen
                  ? "Sip water freely — stop 30 min before your next meal."
                  : "You just ate. Hold off on fluids so you don't overfill."}
              </p>
            </div>
          </div>
        </Card>

        {/* Next action */}
        <Card className="p-4" data-testid="card-next-action">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Next action
          </p>
          <p className="mt-1.5 text-sm leading-snug text-foreground">
            It's <span className="font-semibold">{clock}</span>.{" "}
            {drinkingOpen
              ? "Get your sips in now. When you eat, lead with protein and stop at the first sign of pressure."
              : `Let your stomach settle for ${waitMin} more minutes, then you can sip again.`}
          </p>
        </Card>

        {/* Quick add */}
        <section data-testid="section-quick-add">
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick add
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            <Button
              variant="outline"
              className="h-auto flex-col gap-1 py-3"
              data-testid="button-add-water"
              disabled={addMeal.isPending}
              onClick={() => addMeal.mutate({ type: "water", waterOz: 8 })}
            >
              <Droplet className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">+ Water</span>
              <span className="text-[0.65rem] text-muted-foreground">8 oz</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-1 py-3"
              data-testid="button-add-shake"
              disabled={addMeal.isPending}
              onClick={() => addMeal.mutate({ type: "shake", proteinG: 25 })}
            >
              <Beef className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">+ Shake</span>
              <span className="text-[0.65rem] text-muted-foreground">25 g</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-1 py-3"
              data-testid="button-add-meal"
              disabled={addMeal.isPending}
              onClick={() => addMeal.mutate({ type: "meal", proteinG: 15 })}
            >
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">+ Meal</span>
              <span className="text-[0.65rem] text-muted-foreground">15 g</span>
            </Button>
          </div>
          <p className="mt-2 px-1 text-[0.7rem] text-muted-foreground">
            Photo coach & barcode scanner — coming soon.
          </p>
        </section>

        <RulesRow />
      </div>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  goal,
  loading,
  testid,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  goal: number;
  loading?: boolean;
  testid: string;
}) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <Card className="p-3" data-testid={testid}>
      <div className="flex items-center gap-1.5 text-primary">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-6 w-12" />
      ) : (
        <p className="mt-1.5 text-lg font-bold leading-none text-foreground">
          {value}
          <span className="text-xs font-medium text-muted-foreground">
            {unit ? unit : ""}/{goal}
            {unit}
          </span>
        </p>
      )}
      <Progress value={pct} className="mt-2 h-1.5" />
    </Card>
  );
}
