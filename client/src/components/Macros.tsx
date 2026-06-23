/** Color-coded P / C / S / F macro row. Protein green, sugar coral if > 5g. */
export function MacroRow({
  protein,
  carbs,
  sugar,
  fat,
  calories,
}: {
  protein: number;
  carbs: number;
  sugar: number;
  fat: number;
  calories?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" data-testid="macro-row">
      <Macro label="P" value={`${protein}g`} tone="protein" />
      <Macro label="C" value={`${carbs}g`} tone="muted" />
      <Macro label="S" value={`${sugar}g`} tone={sugar > 5 ? "sugar" : "muted"} />
      <Macro label="F" value={`${fat}g`} tone="muted" />
      {calories != null && (
        <span className="ml-0.5 text-[0.7rem] font-medium text-muted-foreground">
          {calories} cal
        </span>
      )}
    </div>
  );
}

function Macro({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "protein" | "sugar" | "muted";
}) {
  const cls =
    tone === "protein"
      ? "bg-secondary text-primary"
      : tone === "sugar"
      ? "bg-coral-soft text-coral"
      : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold ${cls}`}
    >
      <span className="opacity-70">{label}</span>
      {value}
    </span>
  );
}
