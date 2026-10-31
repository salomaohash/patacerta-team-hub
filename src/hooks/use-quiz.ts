import { useEffect, useState } from "react";
import { loadQuiz } from "@/lib/state/quiz";
import type { QuizAnswers } from "@/lib/matching";

export function useQuiz() {
  const [quiz, setQuiz] = useState<QuizAnswers | null>(null);
  useEffect(() => { setQuiz(loadQuiz()); }, []);
  return quiz;
}