import { CHECKIN_DAYS, checkinDue } from "./adoption-guide.ts";

export interface PetLike {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile: unknown;
}
export interface AppLike {
  id: string;
  animal_id: string;
  status: string;
  created_at: string;
  adopted_at: string | null;
  institution_id: string | null;
}
export interface CheckinLike {
  application_id: string;
  day: number;
  needs_help: boolean;
}
export interface CalendarEventLike {
  id: string;
  kind: string;
  status: string;
  starts_at: string;
  title: string;
}

const dayMs = 86400000;
const dayStamp = (s: string) => Date.parse(`${s.slice(0, 10)}T00:00:00Z`);
const daysBetween = (from: string, today: Date) =>
  Math.floor((dayStamp(today.toISOString()) - dayStamp(from)) / dayMs);

/* ---------- Kanban ---------- */

export const KANBAN_COLUMNS = [
  { id: "submitted", label: "Submetida", statuses: ["received"] },
  { id: "review", label: "Em análise", statuses: ["information"] },
  { id: "interview", label: "Entrevista", statuses: ["conversation", "visit"] },
  { id: "approved", label: "Aprovada", statuses: ["pending_decision", "approved"] },
  { id: "adopted", label: "Adotado", statuses: ["adopted"] },
] as const;
export type KanbanColumnId = (typeof KANBAN_COLUMNS)[number]["id"];
export const DECLINED_STATUSES = ["declined", "withdrawn"] as const;

export function kanbanColumnOf(status: string): KanbanColumnId | "declined" {
  if ((DECLINED_STATUSES as readonly string[]).includes(status)) return "declined";
  return (
    KANBAN_COLUMNS.find((c) => (c.statuses as readonly string[]).includes(status))?.id ??
    "submitted"
  );
}

/** Estado aplicado ao arrastar um cartão para uma coluna. */
export const KANBAN_TARGET_STATUS: Record<KanbanColumnId, string> = {
  submitted: "received",
  review: "information",
  interview: "conversation",
  approved: "approved",
  adopted: "adopted",
};

/* ---------- Alertas «Precisa da tua atenção» ---------- */

export interface AttentionAlert {
  kind: "applications" | "stale" | "events" | "followups" | "waiting";
  title: string;
  detail: string;
  section: "candidaturas" | "animais" | "calendario" | "acompanhamento";
  count: number;
}

const STALE_DAYS = 21;
const LONG_WAIT_DAYS = 60;

export function attentionAlerts(
  pets: PetLike[],
  apps: AppLike[],
  checkins: CheckinLike[],
  events: CalendarEventLike[],
  today = new Date(),
): AttentionAlert[] {
  const alerts: AttentionAlert[] = [];
  const received = apps.filter((a) => a.status === "received").length;
  if (received > 0)
    alerts.push({
      kind: "applications",
      title: "Novas candidaturas por analisar",
      detail: `${received} ${received === 1 ? "candidatura aguarda" : "candidaturas aguardam"} uma primeira resposta.`,
      section: "candidaturas",
      count: received,
    });
  const stale = pets.filter(
    (p) => p.status === "published" && daysBetween(p.updated_at, today) >= STALE_DAYS,
  );
  if (stale.length > 0)
    alerts.push({
      kind: "stale",
      title: "Animais sem atualização há vários dias",
      detail: `${stale.length} ${stale.length === 1 ? "perfil publicado" : "perfis publicados"} sem revisão há pelo menos ${STALE_DAYS} dias.`,
      section: "animais",
      count: stale.length,
    });
  const soon = new Date(today.getTime() + 7 * dayMs);
  const upcoming = events.filter(
    (e) =>
      e.status === "scheduled" &&
      ["interview", "visit"].includes(e.kind) &&
      new Date(e.starts_at) >= today &&
      new Date(e.starts_at) <= soon,
  );
  if (upcoming.length > 0)
    alerts.push({
      kind: "events",
      title: "Entrevistas e visitas próximas",
      detail: `${upcoming.length} ${upcoming.length === 1 ? "evento agendado" : "eventos agendados"} nos próximos 7 dias.`,
      section: "calendario",
      count: upcoming.length,
    });
  const followups = apps.filter(
    (a) =>
      a.status === "adopted" &&
      a.adopted_at &&
      CHECKIN_DAYS.some(
        (day) =>
          checkinDue(a.adopted_at ?? "", day, today) &&
          !checkins.some((c) => c.application_id === a.id && c.day === day),
      ),
  );
  if (followups.length > 0)
    alerts.push({
      kind: "followups",
      title: "Acompanhamentos pós-adoção pendentes",
      detail: `${followups.length} ${followups.length === 1 ? "adoção tem" : "adoções têm"} pontos de acompanhamento por concluir.`,
      section: "acompanhamento",
      count: followups.length,
    });
  const waiting = pets.filter(
    (p) => p.status === "published" && daysBetween(p.created_at, today) >= LONG_WAIT_DAYS,
  );
  if (waiting.length > 0)
    alerts.push({
      kind: "waiting",
      title: "Animais à espera há muito tempo",
      detail: `${waiting.length} ${waiting.length === 1 ? "animal aguarda" : "animais aguardam"} adoção há mais de ${LONG_WAIT_DAYS} dias.`,
      section: "animais",
      count: waiting.length,
    });
  return alerts;
}

/* ---------- Animais que precisam de atenção ---------- */

export interface AttentionAnimal {
  petId: string;
  waitingDays: number;
  applications: number;
  reasons: string[];
  actions: string[];
}

export function animalsNeedingAttention(
  pets: PetLike[],
  apps: AppLike[],
  today = new Date(),
): AttentionAnimal[] {
  const result: AttentionAnimal[] = [];
  for (const p of pets) {
    if (p.status !== "published" && p.status !== "paused") continue;
    const profile = p.profile as Record<string, unknown>;
    const waitingDays = Math.max(0, daysBetween(p.created_at, today));
    const applications = apps.filter((a) => a.animal_id === p.id).length;
    const staleDays = daysBetween(p.updated_at, today);
    const special =
      profile["careComplexity"] === "alta" ||
      (typeof profile["careNotes"] === "string" && (profile["careNotes"] as string).trim().length > 0);
    const reasons: string[] = [];
    const actions: string[] = [];
    if (waitingDays >= LONG_WAIT_DAYS) {
      reasons.push(`À espera de adoção há ${waitingDays} dias`);
      actions.push("Promover o animal", "Partilhar o perfil nas redes sociais");
    }
    if (p.status === "published" && applications === 0) {
      reasons.push("Ainda sem candidaturas");
      actions.push("Melhorar descrição", "Atualizar fotografias");
    }
    if (staleDays >= 30) {
      reasons.push(`Informação sem atualização há ${staleDays} dias`);
      actions.push("Rever informações");
    }
    if (special) {
      reasons.push("Necessidades especiais que merecem maior divulgação");
      actions.push("Promover o animal");
    }
    if (reasons.length > 0)
      result.push({
        petId: p.id,
        waitingDays,
        applications,
        reasons,
        actions: [...new Set(actions)],
      });
  }
  return result.sort((a, b) => b.waitingDays - a.waitingDays);
}

/* ---------- PataCerta Intelligence ---------- */

export function intelligence(
  pets: PetLike[],
  apps: AppLike[],
  checkins: CheckinLike[],
  today = new Date(),
) {
  const adoptedIds = new Set(pets.filter((p) => p.status === "adopted").map((p) => p.id));
  const dates = new Map<string, number>();
  for (const a of apps) {
    if (a.status !== "adopted" || !a.adopted_at) continue;
    adoptedIds.add(a.animal_id);
    const end = dayStamp(a.adopted_at);
    if (Number.isFinite(end) && end <= today.getTime())
      dates.set(a.animal_id, Math.min(dates.get(a.animal_id) ?? end, end));
  }
  const durations = pets.flatMap((p) => {
    const end = dates.get(p.id);
    const start = dayStamp(p.created_at);
    return end !== undefined && Number.isFinite(start) && end >= start
      ? [(end - start) / dayMs]
      : [];
  });
  const concluded = apps.filter((a) =>
    ["adopted", "declined", "withdrawn"].includes(a.status),
  ).length;
  const adoptedApps = apps.filter((a) => a.status === "adopted").length;
  const adoptedPets = pets.filter((p) => adoptedIds.has(p.id));
  const profileOf = (p: PetLike) => p.profile as Record<string, unknown>;
  const senior = adoptedPets.filter((p) => Number(profileOf(p)["ageYears"] ?? 0) >= 8).length;
  const special = adoptedPets.filter((p) => {
    const pr = profileOf(p);
    return (
      pr["careComplexity"] === "alta" ||
      (typeof pr["careNotes"] === "string" && (pr["careNotes"] as string).trim().length > 0)
    );
  }).length;
  let followupsCompleted = 0;
  let followupsPending = 0;
  for (const a of apps) {
    if (a.status !== "adopted" || !a.adopted_at) continue;
    for (const day of CHECKIN_DAYS) {
      if (checkins.some((c) => c.application_id === a.id && c.day === day)) followupsCompleted++;
      else if (checkinDue(a.adopted_at, day, today)) followupsPending++;
    }
  }
  return {
    totalPublished: pets.filter((p) => p.status === "published").length,
    totalAdopted: adoptedIds.size,
    applicationsReceived: apps.length,
    conversionRate: concluded > 0 ? Math.round((adoptedApps / concluded) * 100) : null,
    averageWaitDays:
      durations.length >= 3
        ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
        : null,
    seniorAdopted: senior,
    specialNeedsAdopted: special,
    followupsCompleted,
    followupsPending,
  };
}

/* ---------- Calendário ---------- */

/** Grelha mensal em semanas começadas à segunda-feira; inclui dias limítrofes. */
export function monthGrid(year: number, month: number): Date[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + w * 7 + d);
      week.push(day);
    }
    weeks.push(week);
    const lastDay = week[6]!;
    if (lastDay.getUTCMonth() !== month && lastDay > first) break;
  }
  return weeks;
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function eventsOnDay<T extends CalendarEventLike>(events: T[], day: Date): T[] {
  return events.filter((e) => sameDay(new Date(e.starts_at), day));
}

/** Semana (segunda a domingo) que contém o dia indicado. */
export function weekOf(day: Date): Date[] {
  const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return d;
  });
}

/* ---------- Saudação ---------- */

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 6 || h >= 20) return "Boa noite";
  if (h < 13) return "Bom dia";
  return "Boa tarde";
}
