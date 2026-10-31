import { animals } from "./animals";
import type { workspace } from "./pets.functions";

export function showsInstitutionDemo(user: { id?: string; isDemo?: boolean } | null) {
  return !user?.id || user.isDemo === true;
}

/** Local examples only: never read or write a private workspace. */
export function institutionDemo(today = new Date()): Awaited<ReturnType<typeof workspace>> {
  const ago = (days: number) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 9));
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString();
  };
  const date = ago(180);
  const owner = "demo-owner";
  const institution = "demo-institution";
  const statuses = ["published", "published", "paused", "published", "adopted", "published", "published", "adopted", "published", "adopted", "published", "published", "draft", "draft"];
  const scenarios = [
    { pet: 0, status: "received", days: 0, next: "Confirmar receção da candidatura" },
    { pet: 1, status: "received", days: 2, next: "Responder à família" },
    { pet: 2, status: "information", days: 6, next: "Confirmar rotina e disponibilidade" },
    { pet: 3, status: "conversation", days: 12, next: "Combinar conversa com a família" },
    { pet: 5, status: "visit", days: 18, next: "Confirmar visita à instituição" },
    { pet: 6, status: "pending_decision", days: 25, next: "Rever a visita antes da decisão" },
    { pet: 8, status: "approved", days: 32, next: "Preparar a chegada a casa" },
    { pet: 4, status: "adopted", days: 120, adopted: 100, next: "Acompanhar adaptação" },
    { pet: 7, status: "adopted", days: 65, adopted: 45, next: "Responder ao pedido de apoio" },
    { pet: 9, status: "adopted", days: 20, adopted: 5, next: "Aguardar o check-in de 30 dias" },
    { pet: 10, status: "declined", days: 55, next: "Candidatura encerrada após conversa" },
    { pet: 11, status: "withdrawn", days: 85, next: "Candidatura retirada pela família" },
  ];
  return {
    userId: owner,
    institutions: [{ id: institution, owner_id: owner, name: "Patudos do Porto (demo)", city: "Porto", contact: "", faq: "", description: "Associação fictícia de demonstração para explorares o painel: animais, candidaturas, calendário e acompanhamento pós-adoção.", email: "", phone: "", website: "", social: "", verified: false, created_at: date }],
    pets: animals.map((a, i) => ({
      id: a.id, owner_id: owner, institution_id: institution,
      profile: { name: a.name, photo: a.photo, description: a.description, dataSource: "Demonstração" },
      status: statuses[i] ?? "draft",
      created_at: ago(({ 4: 135, 7: 73, 9: 26 } as Record<number, number>)[i] ?? (i >= 12 ? 2 : 40 + i * 6)),
      updated_at: ago(i % 6),
    })),
    applications: scenarios.map((s, i) => ({
      id: `demo-application-${i}`, user_id: `demo-applicant-${i}`,
      animal_id: animals[s.pet]?.id ?? "demo-animal", institution_id: institution,
      is_demo: true, status: s.status, answers: {}, message: "Candidatura fictícia de demonstração.",
      next_step: s.next,
      adopted_at: s.adopted === undefined ? null : ago(s.adopted).slice(0, 10),
      created_at: ago(s.days), updated_at: ago(Math.min(s.days, 3)), notes: "",
    })),
    events: [
      { application: 0, kind: "message", content: "Nova candidatura recebida para Thor", days: 0 },
      { application: 4, kind: "visit", content: "Visita ao Kiko agendada com a família", days: 1 },
      { application: 5, kind: "interview", content: "Conversa sobre a adoção da Nala concluída", days: 2 },
      { application: 1, kind: "message", content: "Candidatura recebida para Luna", days: 2 },
      { application: 9, kind: "decision", content: "Adoção do Pantufa registada", days: 5 },
      { application: 8, kind: "decision", content: "Adoção da Mimi registada", days: 45 },
    ].map((e, i) => ({
      id: `demo-event-${i}`, application_id: `demo-application-${e.application}`,
      author_id: owner, kind: e.kind, content: `Demonstração · ${e.content}`, occurred_at: ago(e.days),
    })),
    checkins: [
      { application: 7, day: 30, days: 70, help: false },
      { application: 7, day: 60, days: 40, help: false },
      { application: 8, day: 30, days: 2, help: true },
    ].map((c, i) => ({
      id: `demo-checkin-${i}`, application_id: `demo-application-${c.application}`,
      user_id: `demo-applicant-${c.application}`, day: c.day,
      response: c.help ? "Demonstração · Gostaríamos de apoio na adaptação à rotina." : "Demonstração · A adaptação está a decorrer bem.",
      needs_help: c.help, created_at: ago(c.days),
    })),
    calendarEvents: [
      { title: "Demonstração · Entrevista com a família do Kiko", kind: "interview", inDays: 2, application: 4, status: "scheduled" },
      { title: "Demonstração · Visita para conhecer a Nala", kind: "visit", inDays: 4, application: 5, status: "scheduled" },
      { title: "Demonstração · Reunião de equipa semanal", kind: "meeting", inDays: 1, application: null, status: "scheduled" },
      { title: "Demonstração · Acompanhamento pós-adoção da Mimi", kind: "followup", inDays: -3, application: 8, status: "completed" },
      { title: "Demonstração · Visita ao Thor", kind: "visit", inDays: -6, application: 0, status: "cancelled" },
    ].map((e, i) => ({
      id: `demo-calendar-${i}`, institution_id: institution, owner_id: owner,
      application_id: e.application === null ? null : `demo-application-${e.application}`,
      title: e.title, kind: e.kind,
      starts_at: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + e.inDays, 10)).toISOString(),
      notes: "", status: e.status, created_at: ago(e.inDays + 10), updated_at: ago(Math.max(0, e.inDays)),
    })),
  };
}