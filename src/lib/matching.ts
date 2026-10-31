// Motor de compatibilidade — função pura, sem estado nem efeitos.
// Reutilizável pelos resultados, detalhe do animal e painel da associação.
import type { Animal } from "@/lib/animals";

export interface QuizAnswers {
  hoursAway: 0 | 1 | 2; // 0 <4h · 1 4–8h · 2 >8h
  housing: 0 | 1 | 2; // 0 apto pequeno · 1 apto espaçoso · 2 casa com exterior
  dailyTime: 0 | 1 | 2; // 0 <30min · 1 30min–1h · 2 >1h
  activity: 0 | 1 | 2; // 0 calmo · 1 moderado · 2 ativo
  kids: 0 | 1 | 2; // 0 sim · 1 não · 2 nos planos
  pets: 0 | 1 | 2 | 3; // 0 não · 1 cão · 2 gato · 3 cão e gato
  experience: 0 | 1 | 2; // 0 nenhuma · 1 alguma · 2 muita
  routine: 0 | 1 | 2; // 0 muito estável · 1 razoável · 2 imprevisível
  openness: 0 | 1 | 2; // 0 sim · 1 talvez · 2 não
}

export const WEIGHTS = {
  schedule: 15,
  housing: 15,
  time: 20,
  activity: 15,
  household: 15,
  experience: 10,
  openness: 10,
} as const;
export type Dimension = keyof typeof WEIGHTS;

export interface DimensionResult {
  score: number; // 0–1
  reason: string;
}
export interface MatchResult {
  score: number; // 0–100
  dimensions: Record<Dimension, DimensionResult>;
}

const lvl = { baixa: 0, média: 1, alta: 2 } as const;
const sizeLvl = { pequeno: 0, médio: 1, grande: 2 } as const;
const fit = (gap: number) => Math.max(0, 1 - gap / 2); // 0 → 1, 1 → 0.5, 2 → 0

// Necessidades derivadas do animal (0 baixa · 2 alta):
// independence_need — quanto tolera estar sozinho. Gatos e animais calmos toleram mais.
// attention_need — tempo diário que precisa: energia + complexidade de cuidados.
// space_need — porte + energia.
function needs(a: Animal) {
  const energy = lvl[a.energy];
  const lonelinessSensitivity = Math.min(2, (a.species === "gato" ? 0 : 1) + (energy === 2 ? 1 : 0));
  const attention = Math.round((energy + lvl[a.careComplexity]) / 2);
  const space = Math.round((sizeLvl[a.size] + energy) / 2) + (a.apartmentOk ? 0 : 1);
  return { lonelinessSensitivity, attention, space: Math.min(2, space), energy };
}

export function computeMatch(q: QuizAnswers, a: Animal): MatchResult {
  const n = needs(a);
  const special = !!a.forgotten || a.ageYears >= 8;

  // schedule: horas fora (0–2) vs. sensibilidade à solidão (0–2); só penaliza quando as horas excedem a tolerância.
  const schedGap = Math.max(0, q.hoursAway + n.lonelinessSensitivity - 2);
  const schedule = fit(schedGap) * (q.routine === 2 ? 0.85 : 1);

  // housing: espaço da casa (0–2) vs. space_need (0–2).
  const housing = fit(Math.max(0, n.space - q.housing));

  // time: tempo disponível (0–2) vs. attention_need (0–2).
  const time = fit(Math.max(0, n.attention - q.dailyTime));

  // activity: distância entre atividade do utilizador e energia do animal (em ambos os sentidos).
  const activity = fit(Math.abs(q.activity - n.energy));

  // household: crianças (atuais ou planeadas) exigem good_with_kids; outros animais exigem good_with_pets.
  let household = 1;
  if (q.kids !== 1 && !a.goodWithKids) household -= q.kids === 0 ? 0.6 : 0.3;
  if (q.pets !== 0 && !a.goodWithPets) household -= 0.5;
  household = Math.max(0, household);

  // experience: experiência (0–2) vs. care_complexity (0–2).
  const experience = fit(Math.max(0, lvl[a.careComplexity] - q.experience));

  // openness: só conta para séniores/necessidades especiais.
  const openness = !special ? 1 : q.openness === 0 ? 1 : q.openness === 1 ? 0.5 : 0;

  const dims: Record<Dimension, DimensionResult> = {
    schedule: {
      score: schedule,
      reason: schedule >= 0.75 ? "O teu horário encaixa no quanto tolera ficar sozinho." : "Passa mal muitas horas sozinho face ao teu horário.",
    },
    housing: {
      score: housing,
      reason: housing >= 0.75 ? "A tua casa tem o espaço de que precisa." : "Precisaria de mais espaço do que a tua casa oferece.",
    },
    time: {
      score: time,
      reason: time >= 0.75 ? "Tens o tempo diário que pede." : "Pede mais tempo diário do que tens disponível.",
    },
    activity: {
      score: activity,
      reason: activity >= 0.75 ? "O vosso nível de energia é parecido." : "A energia dele e o teu ritmo são diferentes.",
    },
    household: {
      score: household,
      reason: household >= 0.75 ? "Dá-se bem com quem vive contigo." : "Pode não se dar bem com crianças ou outros animais em casa.",
    },
    experience: {
      score: experience,
      reason: experience >= 0.75 ? "A tua experiência chega para os cuidados que precisa." : "Os cuidados pedem mais experiência.",
    },
    openness: {
      score: openness,
      reason: !special ? "Sem necessidades especiais a considerar." : openness >= 0.75 ? "Estás aberto a um animal sénior ou com necessidades especiais." : "É sénior ou tem necessidades especiais.",
    },
  };

  const total = (Object.keys(WEIGHTS) as Dimension[]).reduce((s, k) => s + dims[k].score * WEIGHTS[k], 0);
  const max = Object.values(WEIGHTS).reduce((s, w) => s + w, 0);
  return { score: Math.round((total / max) * 100), dimensions: dims };
}
