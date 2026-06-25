import type { Phase } from "@shared/schema";

export const SURGERY_DATE = "2026-06-24"; // Wed June 24, 2026 — sleeve gastrectomy

// ── Surgeon contact — update these before surgery ──
export const SURGEON_NAME = "Dr. Hrishikesh Nerkar, MD";
export const SURGEON_PHONE = "+12095727049";
export const CURRENT_MEDS = "(add before surgery)";

// Days since surgery. Day 0 = surgery day. Negative = pre-op.
export function daysSinceSurgery(now = new Date()): number {
  const surgery = new Date(SURGERY_DATE + "T00:00:00");
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - surgery.getTime()) / 86400000);
}

// Post-op recovery day is 0-indexed (day of surgery is Day 0, next day is Day 1).
export function postOpDay(now = new Date()): number {
  return daysSinceSurgery(now);
}

export function phaseForDay(phases: Phase[], day: number): Phase | undefined {
  if (day < 1) return phases.find((p) => p.dayStart === 0);
  return phases.find(
    (p) => day >= p.dayStart && (p.dayEnd == null || day <= p.dayEnd)
  );
}

export function phaseLabel(now = new Date()): string {
  const d = daysSinceSurgery(now);
  if (d < 0) return `Day ${d} · Pre-Op`;
  if (d === 0) return "Surgery Day";
  return `Day ${d}`;
}

// The five always-visible rules.
export const CORE_RULES: { n: number; text: string }[] = [
  { n: 1, text: "Protein first, every meal" },
  { n: 2, text: "No drinking 30 min before & 60 min after meals" },
  { n: 3, text: "Sip slow — no straws, no carbonation" },
  { n: 4, text: "Chew 20–30 times" },
  { n: 5, text: "Stop at the first sign of pressure" },
];

export const RED_FLAGS: string[] = [
  "Resting heart rate above 120 bpm (earliest leak sign)",
  "Fever above 101°F / 38.3°C",
  "Severe or worsening abdominal pain not relieved by meds",
  "Pain in left shoulder or chest (referred from a leak)",
  "Trouble breathing, rapid breathing, or blue lips",
  "Vomiting that won't stop",
  "Cannot keep any fluid down for 4+ hours",
  "Confusion, chills with shaking, or drastically reduced urine",
  "Incision redness or pus worsening after 48–72 hours",
];
