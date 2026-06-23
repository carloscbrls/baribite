import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { AllergyBanner } from "@/components/AllergyBanner";
import { MacroRow } from "@/components/Macros";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ShieldCheck, ShieldAlert, ExternalLink, SlidersHorizontal } from "lucide-react";
import {
  FOOD_ITEMS,
  SOURCE_FILTERS,
  PHASE_LABELS,
  whyItWorks,
  phaseNameToKey,
  type FoodItem,
  type PhaseFilter,
  type SortKey,
} from "@/data/menu";
import { phaseForDay, postOpDay, daysSinceSurgery } from "@/lib/baribite";
import type { Phase } from "@shared/schema";

const PHASE_FILTERS: PhaseFilter[] = [
  "pre_op",
  "clear_liquids",
  "full_liquids",
  "pureed",
  "soft_solids",
  "regular",
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "protein", label: "Highest protein" },
  { key: "carbs", label: "Lowest carbs" },
  { key: "sugar", label: "Lowest sugar" },
  { key: "alpha", label: "A–Z" },
];

export default function Menu() {
  const { data: phases } = useQuery<Phase[]>({ queryKey: ["/api/phases"] });

  // Derive Carlos's current phase as the default phase filter.
  const day = postOpDay();
  const defaultPhase: PhaseFilter = useMemo(() => {
    if (daysSinceSurgery() < 0) return "pre_op";
    const p = phases ? phaseForDay(phases, day) : undefined;
    return p ? phaseNameToKey(p.name) : "full_liquids";
  }, [phases, day]);

  const [phaseSet, setPhaseSet] = useState(false);
  const [phase, setPhaseRaw] = useState<PhaseFilter>("full_liquids");
  // Sync to the user's real phase once phases load (only until user overrides).
  const activePhase = phaseSet ? phase : defaultPhase;
  const setPhase = (p: PhaseFilter) => {
    setPhaseSet(true);
    setPhaseRaw(p);
  };

  const [query, setQuery] = useState("");
  const [source, setSource] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("protein");
  const [selected, setSelected] = useState<FoodItem | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = FOOD_ITEMS.filter((it) => {
      // phase: pre_op shows soft/regular targets; otherwise match the tag
      const phaseOk =
        activePhase === "pre_op"
          ? it.bariatric_phase.includes("regular") ||
            it.bariatric_phase.includes("soft_solids")
          : it.bariatric_phase.includes(activePhase);
      if (!phaseOk) return false;
      if (source !== "All" && it.sourceShort !== source) return false;
      if (q) {
        const hay = `${it.name} ${it.source} ${it.sourceShort} ${
          it.category ?? ""
        } ${it.order_mods} ${it.notes ?? ""} ${it.allergens.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "protein") return b.protein_g - a.protein_g;
      if (sort === "carbs") return a.carbs_g - b.carbs_g;
      if (sort === "sugar") return a.sugar_g - b.sugar_g;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [query, source, sort, activePhase]);

  return (
    <AppShell title="Food library">
      <div className="space-y-4">
        <AllergyBanner />

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods, chains, ingredients…"
            className="pl-9"
            data-testid="input-search"
          />
        </div>

        {/* Phase chips */}
        <FilterGroup label="Phase">
          {PHASE_FILTERS.map((p) => (
            <Chip
              key={p}
              active={activePhase === p}
              onClick={() => setPhase(p)}
              testid={`chip-phase-${p}`}
            >
              {PHASE_LABELS[p]}
            </Chip>
          ))}
        </FilterGroup>

        {/* Source chips */}
        <FilterGroup label="Source">
          <Chip active={source === "All"} onClick={() => setSource("All")} testid="chip-source-all">
            All
          </Chip>
          {SOURCE_FILTERS.map((s) => (
            <Chip
              key={s}
              active={source === s}
              onClick={() => setSource(s)}
              testid={`chip-source-${s}`}
            >
              {s}
            </Chip>
          ))}
        </FilterGroup>

        {/* Sort chips */}
        <FilterGroup label="Sort" icon>
          {SORTS.map((s) => (
            <Chip
              key={s.key}
              active={sort === s.key}
              onClick={() => setSort(s.key)}
              testid={`chip-sort-${s.key}`}
            >
              {s.label}
            </Chip>
          ))}
        </FilterGroup>

        {/* Results */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-medium text-muted-foreground" data-testid="text-result-count">
            {results.length} {results.length === 1 ? "item" : "items"}
          </p>
          <p className="text-xs text-muted-foreground">{PHASE_LABELS[activePhase]} phase</p>
        </div>

        {!phases ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : results.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 px-6 py-10 text-center" data-testid="empty-state">
            <SlidersHorizontal className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No items match.</p>
            <p className="text-xs text-muted-foreground">
              Try widening your phase or removing filters.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {results.map((it) => (
              <FoodCard
                key={it.id}
                item={it}
                phase={activePhase}
                onOpen={() => setSelected(it)}
              />
            ))}
          </div>
        )}
      </div>

      <ItemDetail
        item={selected}
        phase={activePhase}
        onClose={() => setSelected(null)}
      />
    </AppShell>
  );
}

function FilterGroup({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1 px-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon && <SlidersHorizontal className="h-3 w-3" />}
        {label}
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  testid,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testid?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover-elevate active-elevate-2 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function AllergyBadges({ item }: { item: FoodItem }) {
  const peanutCaveat = !!item.peanut_note || !!item.peanutOilWarning;
  return (
    <div className="flex flex-wrap gap-1.5" data-testid={`allergy-badges-${item.id}`}>
      <Badge
        ok={item.peanut_safe && !peanutCaveat}
        caveat={item.peanut_safe && peanutCaveat}
        label="Peanut-safe"
        caveatLabel="Peanut — verify"
        riskLabel="Peanut RISK"
      />
      <Badge
        ok={item.shellfish_safe}
        caveat={false}
        label="Shellfish-safe"
        caveatLabel=""
        riskLabel="Shellfish RISK"
      />
    </div>
  );
}

function Badge({
  ok,
  caveat,
  label,
  caveatLabel,
  riskLabel,
}: {
  ok: boolean;
  caveat: boolean;
  label: string;
  caveatLabel: string;
  riskLabel: string;
}) {
  if (caveat) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-coral-soft px-2 py-0.5 text-[0.7rem] font-semibold text-coral">
        <ShieldAlert className="h-3 w-3" />
        {caveatLabel}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${
        ok ? "bg-secondary text-primary" : "bg-coral text-coral-foreground"
      }`}
    >
      {ok ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
      {ok ? label : riskLabel}
    </span>
  );
}

function FoodCard({
  item,
  phase,
  onOpen,
}: {
  item: FoodItem;
  phase: PhaseFilter;
  onOpen: () => void;
}) {
  return (
    <Card
      className="cursor-pointer space-y-2.5 p-4 hover-elevate active-elevate-2"
      onClick={onOpen}
      data-testid={`card-food-${item.id}`}
    >
      {item.image && (
        <div className="-mx-4 -mt-4 mb-2 overflow-hidden rounded-t-2xl">
          <img
            src={item.image}
            alt={item.name}
            className="h-40 w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold leading-snug text-foreground">{item.name}</h3>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
          {item.sourceShort}
        </span>
      </div>

      <MacroRow
        protein={item.protein_g}
        carbs={item.carbs_g}
        sugar={item.sugar_g}
        fat={item.fat_g}
        calories={item.calories}
      />

      <AllergyBadges item={item} />

      {item.order_mods && (
        <p className="text-xs leading-snug text-foreground">
          <span className="font-semibold text-primary">Order this way: </span>
          {item.order_mods}
        </p>
      )}

      <p className="text-xs leading-snug text-muted-foreground">
        <span className="font-semibold">Why it works: </span>
        {whyItWorks(item, phase)}
      </p>
    </Card>
  );
}

function ItemDetail({
  item,
  phase,
  onClose,
}: {
  item: FoodItem | null;
  phase: PhaseFilter;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-6 text-left text-base leading-snug">
                {item.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3.5">
              {item.image && (
                <div className="-mx-6 -mt-4 mb-1 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {item.source}
              </span>

              <MacroRow
                protein={item.protein_g}
                carbs={item.carbs_g}
                sugar={item.sugar_g}
                fat={item.fat_g}
                calories={item.calories}
              />

              <AllergyBadges item={item} />

              {(item.peanut_note || item.peanutOilWarning) && (
                <div className="rounded-lg border border-coral-border bg-coral-soft p-3 text-xs leading-snug text-foreground">
                  <p className="font-semibold text-coral">Peanut note</p>
                  <p className="mt-0.5">{item.peanut_note || item.peanutOilWarning}</p>
                </div>
              )}

              {item.order_mods && (
                <Section title="Order this way">{item.order_mods}</Section>
              )}

              <Section title="Why it works">{whyItWorks(item, phase)}</Section>

              {item.notes && <Section title="Notes">{item.notes}</Section>}

              {item.generalNotes && (
                <Section title="About this source">{item.generalNotes}</Section>
              )}

              {item.bariatric_phase.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Phases
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {item.bariatric_phase.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[0.7rem] font-semibold text-primary"
                      >
                        {PHASE_LABELS[p]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="link-source"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View source
                </a>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="mt-0.5 text-xs leading-snug text-foreground">{children}</p>
    </div>
  );
}
