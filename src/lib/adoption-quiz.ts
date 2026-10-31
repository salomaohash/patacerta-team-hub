import type { Animal } from "@/lib/animals";
import type { MatchResult, QuizAnswers } from "@/lib/matching";

export const ADOPTION_QUIZ_PATH = "/quiz" as const;
export const adoptionQuestions = [
  { q: "Como é a tua casa?", hint: "Vamos começar pelo espaço onde vives.", options: ["Apartamento", "Casa com espaço exterior", "Casa partilhada"] },
  { q: "Quanto tempo tens disponível por dia?", hint: "Não há respostas erradas. Responde de acordo com a tua rotina.", options: ["Pouco tempo", "Algumas horas", "Bastante tempo"] },
  { q: "Que nível de atividade preferes?", hint: "O teu ritmo ajuda a encontrar a energia certa.", options: ["Calmo", "Moderado", "Ativo"] },
  { q: "Tens experiência com animais?", hint: "Todos os níveis de experiência são bem-vindos.", options: ["É a minha primeira vez", "Já tive animais", "Tenho experiência regular"] },
  { q: "Que tipo de animal procuras?", hint: "Que companheiro gostarias de conhecer?", options: ["Cão", "Gato", "Estou disponível para qualquer opção"] },
  { q: "O que é mais importante para ti?", hint: "Esta é a última pergunta.", options: ["Companhia tranquila", "Passeios e brincadeira", "Um animal independente", "Um animal para toda a família"] },
] as const;

export type AdoptionProfile = [number, number, number, number, number, number];

export function isAdoptionProfile(value: unknown): value is AdoptionProfile {
  return Array.isArray(value) && value.length === 6 && value.every((v, i) =>
    Number.isInteger(v) && v >= 0 && v < (adoptionQuestions[i]?.options.length ?? 0));
}

export function toQuizAnswers(profile: AdoptionProfile): QuizAnswers {
  return { hoursAway: 1, housing: profile[0] === 1 ? 2 : 0, dailyTime: profile[1] as 0 | 1 | 2,
    activity: profile[2] as 0 | 1 | 2, kids: 1, pets: 0, experience: profile[3] as 0 | 1 | 2,
    routine: 1, openness: 1, adoptionProfile: profile };
}

export function matchesAdoptionSpecies(q: QuizAnswers, a: Animal) {
  const preference = q.adoptionProfile?.[4];
  return preference === undefined || preference === 2 || a.species === (preference === 0 ? "cão" : "gato");
}

export function computeAdoptionMatch(p: AdoptionProfile, a: Animal): MatchResult {
  const levels = { baixa: 0, média: 1, alta: 2 } as const;
  const energy = levels[a.energy];
  const care = levels[a.careComplexity];
  const housing = p[0] === 1 || a.apartmentOk ? 1 : 0;
  const time = Math.max(0, 1 - Math.max(0, Math.round((energy + care) / 2) - p[1]) / 2);
  const activity = Math.max(0, 1 - Math.abs(energy - p[2]) / 2);
  const experience = Math.max(0, 1 - Math.max(0, care - p[3]) / 2);
  const priority = p[5] === 0 ? 1 - energy / 2 : p[5] === 1 ? energy / 2
    : p[5] === 2 ? (a.species === "gato" ? 1 : energy === 0 ? 0.5 : 0) : a.goodWithKids ? 1 : 0;
  const unasked = { score: 0.5, reason: "Não avaliado neste questionário." };
  return { score: Math.round(housing * 20 + time * 25 + activity * 20 + experience * 15 + priority * 20),
    dimensions: {
      schedule: unasked, household: unasked, openness: unasked,
      housing: { score: housing, reason: housing ? "O espaço que indicaste é adequado às suas necessidades." : "Precisa de espaço exterior. Confirma se a tua casa é adequada." },
      time: { score: time, reason: time >= 0.75 ? "A tua disponibilidade combina com os cuidados que precisa." : "Pode precisar de mais tempo diário do que tens disponível." },
      activity: { score: activity, reason: activity >= 0.75 ? "O vosso nível de energia é parecido." : "A sua energia e o teu ritmo são diferentes." },
      experience: { score: experience, reason: experience >= 0.75 ? "A tua experiência é adequada aos seus cuidados." : "Os seus cuidados podem pedir mais experiência." },
    } };
}