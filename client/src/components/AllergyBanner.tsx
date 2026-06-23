import { ShieldAlert } from "lucide-react";

/** Always-visible allergy reminder. Sits under the header on every food surface. */
export function AllergyBanner() {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border border-coral-border bg-coral-soft px-3.5 py-2.5"
      data-testid="banner-allergy"
      role="note"
      aria-label="Severe allergy reminder"
    >
      <ShieldAlert className="h-5 w-5 shrink-0 text-coral" />
      <p className="text-sm font-semibold leading-snug text-foreground">
        Severe allergy: <span className="text-coral">peanut</span> &{" "}
        <span className="text-coral">shellfish</span>. Always verify before
        eating.
      </p>
    </div>
  );
}

/** Compact inline pill for restaurant/grocery cards. */
export function AllergyStatus({
  peanutSafe,
  shellfishSafe,
}: {
  peanutSafe: boolean;
  shellfishSafe: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" data-testid="status-allergy">
      <SafePill safe={peanutSafe} label="Peanut" />
      <SafePill safe={shellfishSafe} label="Shellfish" />
    </div>
  );
}

function SafePill({ safe, label }: { safe: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        safe
          ? "bg-secondary text-primary"
          : "bg-coral text-coral-foreground"
      }`}
    >
      <span aria-hidden>{safe ? "✓" : "✕"}</span>
      {label}-{safe ? "safe" : "RISK"}
    </span>
  );
}
