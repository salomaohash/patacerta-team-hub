import type { workspace } from "@/lib/pets.functions";
import { getAnimal } from "@/lib/animals";
import { petFromRow } from "@/lib/pet-records";
import { computeMatch, type QuizAnswers } from "@/lib/matching";

export type Data = Awaited<ReturnType<typeof workspace>>;
export type Pet = Data["pets"][number];
export type App = Data["applications"][number];
export type CalendarEvent = Data["calendarEvents"][number];
export type Section =
  | "geral"
  | "animais"
  | "candidaturas"
  | "calendario"
  | "acompanhamento"
  | "intelligence"
  | "perfil"
  | "definicoes";

export const field = "mt-1 w-full rounded-lg border border-input bg-card p-3 text-sm";

export const PET_STATUS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  paused: "Pausado",
  adopted: "Adotado",
};

export const APP_STATUS: Record<string, string> = {
  received: "Recebida",
  information: "Em análise",
  conversation: "Conversa",
  visit: "Visita",
  pending_decision: "Decisão pendente",
  approved: "Aprovada",
  declined: "Não avançou",
  adopted: "Adotado",
  withdrawn: "Retirada",
};

export const petProfile = (p: Pet | undefined) =>
  (p?.profile ?? {}) as Record<string, unknown>;

export function petName(p: Pet | undefined): string {
  return String(petProfile(p)["name"] || "Sem nome");
}

export function petPhoto(p: Pet | undefined): string {
  const photo = petProfile(p)["photo"];
  return typeof photo === "string" ? photo : "";
}

export function animalName(id: string, data: Data): string {
  const p = data.pets.find((p) => p.id === id);
  return getAnimal(id)?.name ?? (p ? petName(p) : "Animal");
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT");
}

/** Compatibilidade indicativa; só com respostas suficientes e dados do animal. */
export function matchFor(a: App, data: Data) {
  const answers = a.answers as Record<string, number>;
  if (Object.keys(answers).length < 5) return null;
  const p = data.pets.find((p) => p.id === a.animal_id);
  const animal =
    getAnimal(a.animal_id) ??
    (p ? petFromRow({ ...p, institutions: { name: "", city: "", contact: "", email: "", phone: "", website: "", social: "" } }) : null);
  if (!animal) return null;
  return computeMatch(answers as unknown as QuizAnswers, animal);
}

export function waitingDays(createdAt: string, today = new Date()): number {
  return Math.max(
    0,
    Math.floor((Date.parse(today.toISOString().slice(0, 10)) - Date.parse(createdAt.slice(0, 10))) / 86400000),
  );
}
