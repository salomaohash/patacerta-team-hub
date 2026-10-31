import { CHECKIN_DAYS, checkinDue } from "./adoption-guide.ts";

interface Pet { id: string; status: string; created_at: string }
interface Application { id: string; animal_id: string; status: string; created_at: string; adopted_at: string | null }
interface Checkin { application_id: string; day: number }
export type Period = "week" | "month";
const dayMs = 86400000;
const timestamp = (s: string) => Date.parse(s.slice(0, 10) + "T00:00:00Z");

export function institutionMetrics(pets: Pet[], apps: Application[], checkins: Checkin[], today = new Date()) {
  const adopted = new Set(pets.filter(p => p.status === "adopted").map(p => p.id));
  const dates = new Map<string, number>();
  for (const a of apps) {
    if (a.status !== "adopted" || !a.adopted_at) continue;
    adopted.add(a.animal_id);
    const end = timestamp(a.adopted_at);
    if (Number.isFinite(end) && end <= today.getTime()) dates.set(a.animal_id, Math.min(dates.get(a.animal_id) ?? end, end));
  }
  const durations = pets.flatMap(p => {
    const end = dates.get(p.id);
    const start = timestamp(p.created_at);
    return end !== undefined && Number.isFinite(start) && end >= start ? [(end - start) / dayMs] : [];
  });
  let completed = 0;
  let pending = 0;
  for (const a of apps) {
    if (a.status !== "adopted" || !a.adopted_at || !Number.isFinite(timestamp(a.adopted_at))) continue;
    for (const day of CHECKIN_DAYS) {
      if (checkins.some(c => c.application_id === a.id && c.day === day)) completed++;
      else if (checkinDue(a.adopted_at, day, today)) pending++;
    }
  }
  return {
    published: pets.filter(p => p.status === "published" && !adopted.has(p.id)).length,
    adopted: pets.filter(p => adopted.has(p.id)).length,
    waiting: pets.filter(p => ["published", "paused"].includes(p.status) && !adopted.has(p.id)).length,
    received: apps.filter(a => a.status === "received").length,
    reviewing: apps.filter(a => ["information", "conversation", "visit", "pending_decision", "approved"].includes(a.status)).length,
    concluded: apps.filter(a => ["declined", "withdrawn", "adopted"].includes(a.status)).length,
    completed, pending, adoptionSamples: durations.length,
    averageDays: durations.length >= 3 ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : null,
  };
}

function periodStart(date: Date, period: Period) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (period === "month") d.setUTCDate(1);
  else d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
  return d;
}
export function institutionEvolution(apps: Application[], period: Period, today = new Date()) {
  const count = period === "week" ? 8 : 6;
  const end = periodStart(today, period);
  const buckets = Array.from({ length: count }, (_, i) => {
    const start = new Date(end);
    if (period === "week") start.setUTCDate(start.getUTCDate() - (count - 1 - i) * 7);
    else start.setUTCMonth(start.getUTCMonth() - (count - 1 - i));
    const next = new Date(start);
    if (period === "week") next.setUTCDate(next.getUTCDate() + 7);
    else next.setUTCMonth(next.getUTCMonth() + 1);
    return { start: start.getTime(), end: next.getTime(), label: start.toLocaleDateString("pt-PT", { timeZone: "UTC", ...(period === "week" ? { day: "numeric", month: "short" } : { month: "short", year: "2-digit" }) }), applications: 0, adoptions: 0 };
  });
  const adoptions = new Map<string, number>();
  for (const a of apps) {
    const created = timestamp(a.created_at);
    const bucket = buckets.find(b => created >= b.start && created < b.end && created <= today.getTime());
    if (bucket) bucket.applications++;
    if (a.status === "adopted" && a.adopted_at) {
      const d = timestamp(a.adopted_at);
      if (Number.isFinite(d) && d <= today.getTime()) adoptions.set(a.animal_id, Math.min(adoptions.get(a.animal_id) ?? d, d));
    }
  }
  for (const d of adoptions.values()) {
    const bucket = buckets.find(b => d >= b.start && d < b.end);
    if (bucket) bucket.adoptions++;
  }
  return buckets;
}