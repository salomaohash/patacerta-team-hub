// Respostas do quiz — guardadas no navegador (modo demonstração).
import type { QuizAnswers } from "@/lib/matching";

const KEY = "patacerta.quiz";

export function saveQuiz(a: QuizAnswers) {
  localStorage.setItem(KEY, JSON.stringify(a));
}

export function loadQuiz(): QuizAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}
