import { CHECKIN_DAYS, checkinDue } from "./adoption-guide.ts";

export const REQUIRED_FOR_PUBLICATION = {
  name: "Nome",
  photo: "Fotografia",
  description: "Descrição",
  dataSource: "Origem dos dados",
} as const;

export const OPTIONAL_FIELDS = {
  ageYears: "Idade",
  size: "Porte",
  energy: "Energia",
  goodWithKids: "Convívio com crianças",
  goodWithPets: "Convívio com animais",
  apartmentOk: "Adequação a apartamento",
  careComplexity: "Complexidade dos cuidados",
} as const;

const empty = (v: unknown) => v === null || v === undefined || (typeof v === "string" && !v.trim());

/** Campos obrigatórios em falta: impedem a publicação. */
export function missingForPublication(profile: Record<string, unknown>): string[] {
  return Object.entries(REQUIRED_FOR_PUBLICATION)
    .filter(([k]) => empty(profile[k]))
    .map(([, l]) => l);
}

/** Campos que ficam «por confirmar» — não impedem publicação, mas a equipa deve vê-los. */
export function unconfirmedFields(profile: Record<string, unknown>): string[] {
  return Object.entries(OPTIONAL_FIELDS)
    .filter(([k]) => empty(profile[k]))
    .map(([, l]) => l);
}

export const STAGES = [
  { id: "received", label: "Recebida", statuses: ["received"] },
  { id: "review", label: "Em análise", statuses: ["information"] },
  { id: "conversation", label: "Conversa agendada", statuses: ["conversation"] },
  { id: "visit", label: "Visita agendada", statuses: ["visit"] },
  { id: "decision", label: "Decisão pendente", statuses: ["pending_decision"] },
  { id: "approved", label: "Aprovada", statuses: ["approved"] },
  { id: "closed", label: "Encerrada", statuses: ["declined", "adopted", "withdrawn"] },
] as const;
export type StageId = (typeof STAGES)[number]["id"];

export function stageOf(status: string): StageId {
  return STAGES.find((s) => (s.statuses as readonly string[]).includes(status))?.id ?? "received";
}

interface App {
  id: string;
  status: string;
  next_step: string;
  adopted_at: string | null;
  institution_id: string | null;
}
interface Checkin {
  application_id: string;
  day: number;
  needs_help: boolean;
}
export interface Task {
  applicationId: string;
  kind: "next_step" | "checkin" | "help";
  label: string;
}

/** Tarefas derivadas — nunca decisões; apenas lembretes para a equipa. */
export function deriveTasks(apps: App[], checkins: Checkin[], today = new Date()): Task[] {
  const tasks: Task[] = [];
  for (const a of apps) {
    if (!a.institution_id) continue;
    const stage = stageOf(a.status);
    if (stage !== "closed" && a.next_step && a.next_step !== "Sem tarefa pendente")
      tasks.push({ applicationId: a.id, kind: "next_step", label: a.next_step });
    if (a.status === "adopted" && a.adopted_at)
      for (const day of CHECKIN_DAYS) {
        const done = checkins.find((c) => c.application_id === a.id && c.day === day);
        if (!done && checkinDue(a.adopted_at, day, today))
          tasks.push({ applicationId: a.id, kind: "checkin", label: `Check-in dos ${day} dias` });
        if (done?.needs_help)
          tasks.push({
            applicationId: a.id,
            kind: "help",
            label: `Pedido de ajuda no check-in dos ${day} dias`,
          });
      }
  }
  return tasks;
}

export function overview(
  apps: App[],
  pets: { status: string; profile: unknown }[],
  checkins: Checkin[],
  today = new Date(),
) {
  const count = (id: StageId) => apps.filter((a) => stageOf(a.status) === id).length;
  return {
    unanswered: count("received"),
    inReview: count("review") + count("decision"),
    scheduled: count("conversation") + count("visit"),
    tasks: deriveTasks(apps, checkins, today).length,
    published: pets.filter((p) => p.status === "published").length,
    drafts: pets.filter((p) => p.status === "draft").length,
    incomplete: pets.filter(
      (p) =>
        p.status !== "adopted" &&
        (missingForPublication(p.profile as Record<string, unknown>).length > 0 ||
          unconfirmedFields(p.profile as Record<string, unknown>).length > 0),
    ).length,
  };
}

export const MESSAGE_TEMPLATES = [
  {
    id: "receipt",
    label: "Confirmação de receção",
    text: "Olá. Recebemos a tua candidatura e agradecemos o interesse. Vamos ler as tuas respostas com atenção e entraremos em contacto com o próximo passo.",
  },
  {
    id: "info",
    label: "Pedido de informação adicional",
    text: "Olá. Para conhecermos melhor a tua situação, podes contar-nos como planeias organizar os cuidados diários e os períodos de ausência?",
  },
  {
    id: "conversation",
    label: "Convite para conversa",
    text: "Olá. Gostaríamos de combinar uma conversa sobre a tua rotina e as necessidades do animal. Que dias e horários te dão mais jeito?",
  },
  {
    id: "update",
    label: "Atualização do estado",
    text: "Olá. Queremos dar-te uma atualização sobre a tua candidatura: ",
  },
] as const;
