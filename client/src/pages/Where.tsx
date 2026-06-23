import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { AllergyBanner, AllergyStatus } from "@/components/AllergyBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquareQuote, AlertTriangle } from "lucide-react";
import type { RestaurantPick } from "@shared/schema";

const CHAINS = [
  "Chick-fil-A",
  "Starbucks",
  "Jamba Juice",
  "Target",
  "McDonald's",
  "Wendy's",
  "Taco Bell",
  "Subway",
];

export default function Where() {
  const { data: picks, isLoading } = useQuery<RestaurantPick[]>({
    queryKey: ["/api/restaurant-picks"],
  });
  const [selected, setSelected] = useState<string>("Chick-fil-A");

  const filtered = useMemo(
    () => (picks ?? []).filter((p) => p.chain === selected).slice(0, 3),
    [picks, selected]
  );

  return (
    <AppShell title="Where am I eating?">
      <div className="space-y-4">
        <AllergyBanner />

        {/* Chip selector */}
        <div className="flex flex-wrap gap-2" data-testid="chips-chains">
          {CHAINS.map((c) => (
            <button
              key={c}
              data-testid={`chip-${c.toLowerCase().replace(/[^a-z]/g, "")}`}
              onClick={() => setSelected(c)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors hover-elevate active-elevate-2 ${
                selected === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your top picks at {selected}
        </p>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <PickCard key={p.id} pick={p} />
            ))}
          </div>
        )}

        <AllergyScript />
      </div>
    </AppShell>
  );
}

function PickCard({ pick }: { pick: RestaurantPick }) {
  const hasCaveat =
    /verify|confirm|avoid|cross-contact|refined peanut/i.test(pick.allergyNotes);
  return (
    <Card className="p-4" data-testid={`card-pick-${pick.id}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold leading-snug text-foreground">
          {pick.dishName}
        </h3>
        <Badge variant="secondary" className="shrink-0 whitespace-nowrap">
          {pick.minPhase}+
        </Badge>
      </div>

      {/* Macros */}
      <div className="mt-2.5 flex gap-4 text-sm">
        <Macro label="Protein" value={`${pick.proteinG}g`} strong />
        <Macro label="Carbs" value={`${pick.carbsG}g`} />
        <Macro label="Sugar" value={`${pick.sugarG}g`} />
      </div>

      {/* Allergy status */}
      <div className="mt-3">
        <AllergyStatus peanutSafe={pick.peanutSafe} shellfishSafe={pick.shellfishSafe} />
      </div>

      {/* Caveat */}
      {hasCaveat && (
        <div
          className="mt-2.5 flex items-start gap-2 rounded-lg border border-coral-border bg-coral-soft p-2.5"
          data-testid={`caveat-${pick.id}`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
          <p className="text-xs leading-snug text-foreground">{pick.allergyNotes}</p>
        </div>
      )}

      {/* Order instructions */}
      <div className="mt-3 rounded-lg bg-secondary/60 p-2.5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
          How to order
        </p>
        <p className="mt-0.5 text-sm leading-snug text-foreground">
          {pick.orderInstructions}
        </p>
      </div>
    </Card>
  );
}

function Macro({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm ${strong ? "font-bold text-primary" : "font-medium text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function AllergyScript() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-full gap-2"
          variant="outline"
          data-testid="button-allergy-script"
        >
          <MessageSquareQuote className="h-4 w-4 text-coral" />
          Allergy script — exact words for the server
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Say this to your server</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          <p className="rounded-lg border border-coral-border bg-coral-soft p-3 font-medium">
            "I have a <span className="font-bold text-coral">severe, life-threatening
            allergy to peanuts and shellfish.</span> Even a trace can send me to
            the ER. Can you please check with the kitchen that my food has no
            peanut, peanut oil, or shellfish, and that it's prepared on a clean
            surface with clean utensils?"
          </p>
          <p className="text-muted-foreground">
            If they can't confirm, don't risk it. Carry your epinephrine
            auto-injector at all times.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
