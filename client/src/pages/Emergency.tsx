import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, ChevronLeft, Stethoscope, FileText } from "lucide-react";
import { RED_FLAGS, phaseForDay, postOpDay, phaseLabel, SURGERY_DATE, SURGEON_NAME, SURGEON_PHONE, CURRENT_MEDS } from "@/lib/baribite";
import type { Phase, User } from "@shared/schema";

export default function Emergency() {
  const { data: phases } = useQuery<Phase[]>({ queryKey: ["/api/phases"] });
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const patient = users?.find((u) => u.role === "patient");
  const allergies: string[] = patient ? JSON.parse(patient.allergies) : ["Peanut (severe)", "Shellfish (severe)"];
  const phase = phases ? phaseForDay(phases, postOpDay()) : undefined;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[hsl(0_72%_97%)] sm:max-w-lg">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-destructive/20 bg-destructive px-4 py-4 text-destructive-foreground">
        <Link
          href="/"
          data-testid="link-back-dashboard"
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium opacity-90"
        >
          <ChevronLeft className="h-4 w-4" /> Back to BariBite
        </Link>
        <h1 className="text-xl font-bold">Red flags — act now</h1>
        <p className="mt-1 text-sm leading-snug opacity-90">
          Call 911 or your surgeon IMMEDIATELY if you experience any of these:
        </p>
      </header>

      <div className="space-y-4 px-4 py-4 pb-10">
        {/* Call buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            asChild
            className="h-auto flex-col gap-1 bg-destructive py-4 text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-call-911"
          >
            <a href="tel:911">
              <Phone className="h-5 w-5" />
              <span className="text-base font-bold">Call 911</span>
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto flex-col gap-1 border-destructive/40 py-4 text-destructive"
            data-testid="button-call-surgeon"
          >
            <a href={`tel:${SURGEON_PHONE}`}>
              <Stethoscope className="h-5 w-5" />
              <span className="text-base font-bold">Call surgeon</span>
              <span className="text-[0.65rem] font-medium opacity-70">Tap to call</span>
            </a>
          </Button>
        </div>

        {/* Red flag list */}
        <Card className="border-destructive/20 bg-card p-4">
          <ul className="space-y-2.5">
            {RED_FLAGS.map((f, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm font-medium leading-snug text-foreground"
                data-testid={`redflag-${i}`}
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                {f}
              </li>
            ))}
          </ul>
        </Card>

        {/* Show this to ER */}
        <Card className="p-4" data-testid="card-er-summary">
          <div className="flex items-center gap-2 text-destructive">
            <FileText className="h-4 w-4" />
            <h2 className="text-sm font-bold uppercase tracking-wide">Show this to the ER</h2>
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Procedure" value="Sleeve gastrectomy (laparoscopic)" />
            <Row label="Surgery date" value={fmtDate(SURGERY_DATE)} />
            <Row label="Current phase" value={`${phaseLabel()} · ${phase?.name ?? "Pre-Op"}`} />
            <Row
              label="Allergies"
              value={allergies.join(", ")}
              danger
            />
            <Row label="Surgeon" value={`${SURGEON_NAME} · ${SURGEON_PHONE}`} />
            <Row label="Current meds" value={CURRENT_MEDS} />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Tip: complete the blanks before surgery so this screen is ready if you ever need it.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={`text-right text-sm font-medium ${danger ? "text-destructive" : "text-foreground"}`}>
        {value}
      </dd>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
