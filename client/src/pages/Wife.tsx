import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AppShell } from "@/components/AppShell";
import { AllergyBanner } from "@/components/AllergyBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Heart, ChefHat, Beef, Droplet } from "lucide-react";
import { RED_FLAGS, phaseForDay, postOpDay, phaseLabel, daysSinceSurgery } from "@/lib/baribite";
import type { Phase, Meal } from "@shared/schema";

const PROTEIN_GOAL = 70;
const WATER_GOAL = 64;

// Phase-appropriate dinners with Plate Split (his portion + her portion).
const DINNERS = [
  {
    name: "Baked salmon + roasted veggies",
    his: "2–3 oz flaked salmon, no veg yet",
    hers: "Full filet, big side of veg & quinoa",
    note: "Salmon is fish, not shellfish — safe for Carlos.",
  },
  {
    name: "Ground-turkey & ricotta bake",
    his: "1/4 cup, soft and moist",
    hers: "Full portion over pasta",
    note: "Lean protein, easy to tolerate.",
  },
  {
    name: "Cottage cheese + soft scrambled eggs",
    his: "1/4 cup cottage cheese + 1 egg",
    hers: "Add toast & avocado",
    note: "High protein, gentle on the new stomach.",
  },
];

export default function Wife() {
  const { toast } = useToast();
  const { data: phases } = useQuery<Phase[]>({ queryKey: ["/api/phases"] });
  const today = new Date().toISOString().slice(0, 10);
  const { data: meals, isLoading } = useQuery<Meal[]>({
    queryKey: ["/api/meals", { userId: 1, date: today }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/meals?userId=1&date=${today}`);
      return res.json();
    },
  });

  const day = postOpDay();
  const phase = useMemo(
    () => (phases ? phaseForDay(phases, day) : undefined),
    [phases, day]
  );
  const totals = useMemo(() => {
    const m = meals ?? [];
    return {
      protein: m.reduce((s, x) => s + (x.proteinG || 0), 0),
      water: m.reduce((s, x) => s + (x.waterOz || 0), 0),
    };
  }, [meals]);

  return (
    <AppShell title="Partner view">
      <div className="space-y-4">
        {/* Status */}
        <Card className="border-none bg-primary p-5 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Carlos today
          </p>
          <h2 className="mt-1 text-xl font-bold">
            {phaseLabel()} · {phase?.name ?? "Pre-Op"}
          </h2>
          <p className="mt-1.5 text-sm leading-snug opacity-90">
            {daysSinceSurgery() < 0
              ? "Surgery is tomorrow morning. Tonight is calm prep — clear liquids only."
              : phase?.guidance}
          </p>
        </Card>

        <AllergyBanner />

        {/* His stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <Card className="p-3.5" data-testid="wife-stat-protein">
            <div className="flex items-center gap-1.5 text-primary">
              <Beef className="h-4 w-4" />
              <span className="text-xs font-semibold text-muted-foreground">Protein</span>
            </div>
            {isLoading ? (
              <Skeleton className="mt-2 h-6 w-16" />
            ) : (
              <p className="mt-1 text-lg font-bold text-foreground">
                {totals.protein}
                <span className="text-xs font-medium text-muted-foreground">/{PROTEIN_GOAL}g</span>
              </p>
            )}
            <Progress value={Math.min(100, (totals.protein / PROTEIN_GOAL) * 100)} className="mt-2 h-1.5" />
          </Card>
          <Card className="p-3.5" data-testid="wife-stat-water">
            <div className="flex items-center gap-1.5 text-primary">
              <Droplet className="h-4 w-4" />
              <span className="text-xs font-semibold text-muted-foreground">Water</span>
            </div>
            {isLoading ? (
              <Skeleton className="mt-2 h-6 w-16" />
            ) : (
              <p className="mt-1 text-lg font-bold text-foreground">
                {totals.water}
                <span className="text-xs font-medium text-muted-foreground">/{WATER_GOAL}oz</span>
              </p>
            )}
            <Progress value={Math.min(100, (totals.water / WATER_GOAL) * 100)} className="mt-2 h-1.5" />
          </Card>
        </div>

        {/* What to make */}
        <section data-testid="section-dinners">
          <h2 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ChefHat className="h-3.5 w-3.5" /> What to make tonight · Plate Split
          </h2>
          <div className="space-y-2.5">
            {DINNERS.map((d, i) => (
              <Card key={i} className="p-3.5" data-testid={`dinner-${i}`}>
                <p className="text-sm font-bold text-foreground">{d.name}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-secondary/60 p-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-primary">His plate</p>
                    <p className="text-xs leading-snug text-foreground">{d.his}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">Her plate</p>
                    <p className="text-xs leading-snug text-foreground">{d.hers}</p>
                  </div>
                </div>
                <p className="mt-1.5 text-[0.7rem] text-muted-foreground">{d.note}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Red flags to watch */}
        <section data-testid="section-wife-redflags">
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Watch for these — call 911 if you see them
          </h2>
          <Card className="border-coral-border bg-coral-soft p-4">
            <ul className="space-y-1.5">
              {RED_FLAGS.slice(0, 5).map((f, i) => (
                <li key={i} className="flex gap-2 text-xs leading-snug text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {f}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Encouragement */}
        <Button
          className="w-full gap-2"
          data-testid="button-encourage"
          onClick={() =>
            toast({
              title: "Sent with love 💚",
              description: "Carlos will see your encouragement on his phone.",
            })
          }
        >
          <Heart className="h-4 w-4" />
          Send Carlos encouragement
        </Button>
      </div>
    </AppShell>
  );
}
