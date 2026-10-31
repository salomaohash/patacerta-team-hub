/**
 * Atividade sintética de apresentação (is_demo = true).
 * Regras puras: indicadores, evolução temporal e revelação progressiva.
 * Nunca misturar com métricas reais da plataforma.
 */

export type DemoActivityKind =
  | "visit"
  | "profile_view"
  | "quiz"
  | "match"
  | "favorite"
  | "application"
  | "interview"
  | "adoption"
  | "followup";

export interface DemoActivityEvent {
  id: string;
  kind: DemoActivityKind;
  actor_name: string;
  animal_name: string;
  match_pct: number | null;
  batch: "history" | "live";
  seq: number | null;
  occurred_at: string;
}

export interface ActivityIndicators {
  visits: number;
  activeVisitors: number;
  quizzes: number;
  matches: number;
  applications: number;
  interviews: number;
  adoptions: number;
}

const ACTIVE_WINDOW_DAYS = 7;

/** Indicadores derivados apenas dos eventos apresentados. */
export function activityIndicators(
  events: DemoActivityEvent[],
  now = new Date(),
): ActivityIndicators {
  const since = now.getTime() - ACTIVE_WINDOW_DAYS * 86400000;
  const active = new Set<string>();
  const count = { visits: 0, quizzes: 0, matches: 0, applications: 0, interviews: 0, adoptions: 0 };
  for (const e of events) {
    if (e.kind === "visit" || e.kind === "profile_view") count.visits += 1;
    else if (e.kind === "quiz") count.quizzes += 1;
    else if (e.kind === "match") count.matches += 1;
    else if (e.kind === "application") count.applications += 1;
    else if (e.kind === "interview") count.interviews += 1;
    else if (e.kind === "adoption") count.adoptions += 1;
    if (Date.parse(e.occurred_at) >= since) active.add(e.actor_name);
  }
  return { activeVisitors: active.size, ...count };
}

export interface ActivityBucket {
  start: string;
  label: string;
  visits: number;
  applications: number;
  adoptions: number;
}

export type ActivityPeriod = "week" | "month";

function mondayOf(d: Date): Date {
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const offset = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - offset);
  return day;
}

/** Evolução da atividade: 8 semanas ou 6 meses, incluindo o período atual. */
export function activityEvolution(
  events: DemoActivityEvent[],
  period: ActivityPeriod,
  now = new Date(),
): ActivityBucket[] {
  const buckets: ActivityBucket[] = [];
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  if (period === "week") {
    const first = mondayOf(now);
    first.setUTCDate(first.getUTCDate() - 7 * 7);
    for (let i = 0; i < 8; i++) {
      const start = new Date(first);
      start.setUTCDate(start.getUTCDate() + i * 7);
      buckets.push({
        start: fmt(start),
        label: start.toLocaleDateString("pt-PT", { day: "numeric", month: "short" }),
        visits: 0,
        applications: 0,
        adoptions: 0,
      });
    }
  } else {
    const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    for (let i = 0; i < 6; i++) {
      const start = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + i, 1));
      buckets.push({
        start: fmt(start),
        label: start.toLocaleDateString("pt-PT", { month: "short" }),
        visits: 0,
        applications: 0,
        adoptions: 0,
      });
    }
  }
  const span = period === "week" ? 7 * 86400000 : 0;
  const firstStart = buckets[0]?.start ?? "";
  for (const e of events) {
    const t = Date.parse(e.occurred_at);
    const idx =
      period === "week"
        ? Math.floor((t - Date.parse(firstStart)) / span)
        : (() => {
            const d = new Date(t);
            return (
              (d.getUTCFullYear() - Number(firstStart.slice(0, 4))) * 12 +
              (d.getUTCMonth() - (Number(firstStart.slice(5, 7)) - 1))
            );
          })();
    const bucket = idx >= 0 && idx < buckets.length ? buckets[idx] : undefined;
    if (!bucket) continue;
    if (e.kind === "visit" || e.kind === "profile_view") bucket.visits += 1;
    else if (e.kind === "application") bucket.applications += 1;
    else if (e.kind === "adoption") bucket.adoptions += 1;
  }
  return buckets;
}

/** Frase legível para o feed «Atividade recente». */
export function describeEvent(e: DemoActivityEvent): string {
  switch (e.kind) {
    case "visit":
      return `Um visitante consultou os animais, incluindo ${e.animal_name}.`;
    case "profile_view":
      return `${e.actor_name} consultou o perfil de ${e.animal_name}.`;
    case "quiz":
      return `${e.actor_name} concluiu o questionário de adoção.`;
    case "match":
      return `Foi encontrada uma correspondência de ${e.match_pct ?? "—"}% para ${e.animal_name}.`;
    case "favorite":
      return `${e.actor_name} adicionou ${e.animal_name} aos favoritos.`;
    case "application":
      return `Foi submetida uma candidatura para ${e.animal_name}.`;
    case "interview":
      return `Foi agendada uma entrevista para ${e.animal_name}.`;
    case "adoption":
      return `Uma adoção foi concluída: ${e.animal_name} encontrou a sua família.`;
    case "followup":
      return `Foi concluído um acompanhamento pós-adoção de ${e.animal_name}.`;
  }
}

/** Tempo relativo curto, em português europeu. */
export function relTime(iso: string, now = new Date()): string {
  const diff = Math.max(0, now.getTime() - Date.parse(iso));
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} ${days === 1 ? "dia" : "dias"}`;
  const weeks = Math.floor(days / 7);
  return `há ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
}

export type ActivityLevel = "calmo" | "moderado" | "intenso";

const LEVELS: { level: ActivityLevel; min: number; max: number; length: number }[] = [
  { level: "moderado", min: 9000, max: 16000, length: 3 },
  { level: "intenso", min: 4000, max: 8000, length: 2 },
  { level: "calmo", min: 18000, max: 30000, length: 2 },
];

/** Nível de atividade para cada posição da sequência ao vivo. */
export function levelAt(index: number): ActivityLevel {
  let pos = index;
  for (const l of LEVELS) {
    if (pos < l.length) return l.level;
    pos -= l.length;
  }
  return levelAt(pos);
}

/**
 * Intervalo até ao próximo evento ao vivo, em ms.
 * Determinístico por posição (sem repetições nem aleatoriedade instável),
 * com níveis de atividade variáveis.
 */
export function liveDelay(index: number): number {
  const level = levelAt(index);
  const range = LEVELS.find((l) => l.level === level) ?? { min: 9000, max: 16000 };
  const span = range.max - range.min;
  const step = ((index * 2654435761) % 1000) / 1000;
  return Math.round(range.min + span * step);
}
