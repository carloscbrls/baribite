import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AppShell } from "@/components/AppShell";
import { AllergyBanner } from "@/components/AllergyBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ShieldAlert } from "lucide-react";
import type { SproutsItem } from "@shared/schema";

const SECTION_ORDER = [
  "Protein & Deli",
  "Dairy",
  "Protein Shakes",
  "Pantry",
  "Snacks (Later Stages)",
  "Vitamins & Supplements",
];

export default function Sprouts() {
  const { data: items, isLoading } = useQuery<SproutsItem[]>({
    queryKey: ["/api/sprouts-items"],
  });

  const toggle = useMutation({
    mutationFn: async ({ id, checked }: { id: number; checked: boolean }) => {
      const res = await apiRequest("PATCH", `/api/sprouts-items/${id}`, { checked });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/sprouts-items"] }),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, SproutsItem[]>();
    (items ?? []).forEach((it) => {
      if (!map.has(it.section)) map.set(it.section, []);
      map.get(it.section)!.push(it);
    });
    return map;
  }, [items]);

  const checkedCount = (items ?? []).filter((i) => i.checked).length;
  const total = (items ?? []).length;
  const pct = total ? Math.round((checkedCount / total) * 100) : 0;

  return (
    <AppShell title="Sprouts shopping list">
      <div className="space-y-4">
        <AllergyBanner />

        {/* Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Cart progress</span>
            <span className="font-bold text-primary" data-testid="text-cart-count">
              {checkedCount}/{total}
            </span>
          </div>
          <Progress value={pct} className="mt-2 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            Shared list — anything you check stays checked for both of you.
          </p>
        </Card>

        <AddItemDialog />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : (
          SECTION_ORDER.filter((s) => grouped.has(s)).map((section) => (
            <section key={section} data-testid={`section-${section}`}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section}
              </h2>
              <Card className="divide-y divide-card-border p-0">
                {grouped.get(section)!.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    onToggle={(checked) => toggle.mutate({ id: it.id, checked })}
                  />
                ))}
              </Card>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}

function ItemRow({
  item,
  onToggle,
}: {
  item: SproutsItem;
  onToggle: (checked: boolean) => void;
}) {
  const peanutFree = /peanut-free/i.test(item.allergyNotes);
  const verify = /verify|check|read/i.test(item.allergyNotes);
  return (
    <label
      className="flex cursor-pointer items-start gap-3 p-3.5 hover-elevate"
      data-testid={`item-${item.id}`}
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={(v) => onToggle(Boolean(v))}
        className="mt-0.5"
        data-testid={`checkbox-${item.id}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-semibold leading-snug ${
              item.checked ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {item.name}
          </p>
          {item.proteinPerServing && item.proteinPerServing !== "—" && (
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-bold text-primary">
              {item.proteinPerServing}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.why}</p>
        <p
          className={`mt-1 inline-flex items-center gap-1 text-[0.7rem] font-semibold ${
            peanutFree ? "text-primary" : verify ? "text-coral" : "text-muted-foreground"
          }`}
        >
          {(peanutFree || verify) && <ShieldAlert className="h-3 w-3" />}
          {item.allergyNotes}
        </p>
      </div>
    </label>
  );
}

function AddItemDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const add = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sprouts-items", {
        section: "Pantry",
        name,
        why: "Added by you",
        allergyNotes: "Verify peanut & shellfish on the label",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprouts-items"] });
      setName("");
      setAcknowledged(false);
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2" data-testid="button-add-item">
          <Plus className="h-4 w-4" />
          Add custom item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add an item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="item-name" className="text-sm">Item name</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Greek yogurt"
              className="mt-1.5"
              data-testid="input-item-name"
            />
          </div>
          <label className="flex items-start gap-2.5 rounded-lg border border-coral-border bg-coral-soft p-3">
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(v) => setAcknowledged(Boolean(v))}
              data-testid="checkbox-allergy-ack"
              className="mt-0.5"
            />
            <span className="text-xs font-medium leading-snug text-foreground">
              I'll verify this item is free of <span className="font-bold text-coral">peanut</span>{" "}
              and <span className="font-bold text-coral">shellfish</span> before eating.
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button
            onClick={() => add.mutate()}
            disabled={!name.trim() || !acknowledged || add.isPending}
            data-testid="button-confirm-add"
            className="w-full"
          >
            Add to list
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
