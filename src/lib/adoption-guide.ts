import type { Animal } from "./animals";
import { computeMatch, type Dimension, type QuizAnswers } from "./matching";

export const ANSWER_LABELS: Record<Exclude<keyof QuizAnswers, "adoptionProfile">, string[]> = {
  hoursAway: ["Menos de 4h", "4–8h", "Mais de 8h"],
  housing: ["Apartamento pequeno", "Apartamento espaçoso", "Casa com exterior"],
  dailyTime: ["Menos de 30 min", "30 min a 1h", "Mais de 1h"],
  activity: ["Calmo", "Moderado", "Ativo"],
  kids: ["Sim", "Não", "Nos planos"],
  pets: ["Nenhum", "Cão", "Gato", "Cão e gato"],
  experience: ["Nenhuma", "Alguma", "Muita"],
  routine: ["Muito estável", "Razoavelmente estável", "Imprevisível"],
  openness: ["Sim", "Talvez", "Não"],
};
export function practicalQuestion(k: Dimension, a: Animal, q: QuizAnswers): string {
  if (computeMatch(q, a).dimensions[k].reason.startsWith("Informação insuficiente")) return "Pede à instituição os dados que faltam neste ponto antes de tomar uma decisão.";
  const questions: Record<Dimension, string> = {
    schedule: `Passas ${(ANSWER_LABELS.hoursAway[q.hoursAway] ?? "por confirmar").toLowerCase()} fora de casa. Quem poderia ajudar durante as ausências? Confirma com a instituição o tempo que ${a.name} tolera sozinho.`,
    housing: a.apartmentOk
      ? "Confirma como organizar zonas de descanso e atividade no espaço que tens."
      : "O perfil indica que um apartamento não é adequado. Tens acesso ao espaço exterior necessário? Confirma as condições com a instituição.",
    time: `Disponibilizas ${(ANSWER_LABELS.dailyTime[q.dailyTime] ?? "por confirmar").toLowerCase()} por dia. Pede uma descrição da rotina atual e compara-a com um dia teu, incluindo deslocações e imprevistos.`,
    activity: `O perfil indica energia ${a.energy}; o teu ritmo é ${(ANSWER_LABELS.activity[q.activity] ?? "por confirmar").toLowerCase()}. Consegues reservar momentos diários adequados, também nos dias mais ocupados?`,
    household:
      "O perfil não assegura compatibilidade com todos os membros do agregado. Explica quem vive contigo e pergunta se uma avaliação e introdução acompanhadas são adequadas.",
    experience: `Os cuidados são classificados como de complexidade ${a.careComplexity}. Pede à instituição uma demonstração da rotina e confirma o apoio disponível antes de decidir.`,
    openness:
      "Pede detalhes sobre os cuidados, acessibilidade e apoio necessários. É legítimo reconhecer limites e procurar um animal com necessidades que consigas assegurar.",
  };
  return questions[k];
}
export function decisionGuide(q: QuizAnswers, a: Animal) {
  const match = computeMatch(q, a);
  const keys = Object.keys(match.dimensions) as Dimension[];
  return {
    match,
    strengths: keys.filter((k) => match.dimensions[k].score >= 0.75),
    considerations: keys.filter((k) => match.dimensions[k].score < 0.75),
  };
}
export function adaptationPlan(a: Animal, q: QuizAnswers | null) {
  if (a.unknownFields?.length) return [{title: "Antes de decidir · confirmar informação", source: "Campos por confirmar no perfil", text: "Pede à instituição as necessidades de espaço, energia, rotina e convívio. Os dados disponíveis ainda não permitem um plano específico; não foram preenchidos por suposição."}, {title: "Preparar em conjunto", source: "Mensagem e informações a combinar com a instituição", text: "Combina preparação da casa, chegada, introduções e contacto de apoio depois de confirmar os dados. Dúvidas de saúde ou comportamento devem ser encaminhadas para profissionais qualificados."}];
  return [
    {
      title: "Antes de chegar · preparar a casa",
      source: a.forgotten ? "Adaptações indicadas no perfil" : "Habitação e espaço no perfil",
      text: a.forgotten
        ? `${a.forgotten.homeAdaptations} Confirma estas indicações com a instituição; não são uma prescrição.`
        : a.apartmentOk
          ? "O perfil indica adequação a apartamento. Confirma com a instituição as condições de segurança e descanso para a tua casa."
          : "O perfil indica necessidade de espaço exterior. Confirma se o teu espaço cumpre as condições antes de avançar.",
    },
    {
      title: "Primeiros dias · combinar a chegada",
      source: "Dados por confirmar",
      text: "Pergunta pela rotina, alimentação e objetos familiares atuais. Combina uma chegada tranquila e um contacto da instituição para dúvidas; não há dados suficientes para definir um ritmo de adaptação.",
    },
    {
      title: "Rotina · organizar o dia",
      source: q
        ? "Energia do perfil e tempo indicado no questionário"
        : "Energia indicada no perfil",
      text: `Energia ${a.energy}.${q ? ` Indicas ${(ANSWER_LABELS.dailyTime[q.dailyTime] ?? "por confirmar").toLowerCase()} de tempo diário e ${(ANSWER_LABELS.hoursAway[q.hoursAway] ?? "por confirmar").toLowerCase()} de ausência.` : ""} Confirma horários, duração dos cuidados e apoio necessário com a instituição; distribui as responsabilidades antes da chegada.`,
    },
    {
      title: "Introduções · pessoas e animais",
      source: "Convívio indicado no perfil",
      text: `${a.goodWithKids ? "O perfil indica bom convívio com crianças." : "O perfil não indica bom convívio com crianças."} ${a.goodWithPets ? "Indica bom convívio com outros animais." : "Não indica bom convívio com outros animais."} Estas informações não garantem uma introdução segura. Confirma como avaliar o teu agregado e combinar introduções acompanhadas.`,
    },
    {
      title: "A observar · pedir apoio",
      source: "Cuidados e informação por confirmar",
      text: `Complexidade de cuidados ${a.careComplexity}. Pede à instituição os aspetos específicos a observar e o contacto de apoio. Dúvidas de saúde ou comportamento devem ser avaliadas por profissionais qualificados; este plano não diagnostica nem define tratamentos.`,
    },
  ];
}
export const CHECKIN_DAYS = [7, 30, 60, 90] as const;
export function checkinDue(adoptedAt: string, day: number, today = new Date()) {
  const date = new Date(`${adoptedAt}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + day);
  return date.toISOString().slice(0, 10) <= today.toISOString().slice(0, 10);
}
export function householdAgreement(
  members: { consent: boolean; activity: number; dailyTime: number; routine: number }[],
) {
  const shared = members.filter((m) => m.consent);
  return {
    count: shared.length,
    differences: (["activity", "dailyTime", "routine"] as const).filter(
      (k) => new Set(shared.map((m) => m[k])).size > 1,
    ),
  };
}
