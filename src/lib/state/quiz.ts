// Respostas do quiz — guardadas no navegador (modo demonstração).
import type { QuizAnswers } from "@/lib/matching";
import { isAdoptionProfile } from "@/lib/adoption-quiz";

const KEY = "patacerta.quiz";

export function saveQuiz(a: QuizAnswers) {
  localStorage.setItem(KEY, JSON.stringify(a));
}

export function loadQuiz(): QuizAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!value || typeof value !== "object") return null;
    if (value.adoptionProfile !== undefined && !isAdoptionProfile(value.adoptionProfile)) return null;
    const limits = { hoursAway: 2, housing: 2, dailyTime: 2, activity: 2, kids: 2, pets: 3, experience: 2, routine: 2, openness: 2 };
    if (!Object.entries(limits).every(([key, max]) => Number.isInteger(value[key]) && value[key] >= 0 && value[key] <= max)) return null;
    return value;
  } catch {
    return null;
  }
}
