import { CORE_RULES } from "@/lib/baribite";

export function RulesRow() {
  return (
    <section aria-label="The five rules" data-testid="section-rules">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        The five rules
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CORE_RULES.map((r) => (
          <div
            key={r.n}
            data-testid={`rule-${r.n}`}
            className="flex w-36 shrink-0 flex-col gap-1.5 rounded-xl border border-card-border bg-card p-3"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
              {r.n}
            </span>
            <p className="text-xs font-medium leading-snug text-foreground">
              {r.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
