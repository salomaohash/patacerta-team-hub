import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Animal } from "@/lib/animals";
import { computeMatch, type QuizAnswers } from "@/lib/matching";
import { loadQuiz } from "@/lib/state/quiz";
import { MatchRing } from "@/components/MatchRing";

/** Bloco compacto no detalhe do animal, só quando o quiz está completo. */
export function QuizInline({ a }: { a: Animal }) {
  const [q, setQ] = useState<QuizAnswers | null>(null);
  useEffect(() => setQ(loadQuiz()), []);
  if (!q) return null;
  const m = computeMatch(q, a);
  return (
    <div className="mt-8 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <MatchRing value={m.score} size={60} label="Compatibilidade indicativa" />
      <div className="text-sm">
        <p className="font-medium">Compatibilidade indicativa</p>
        <Link to="/resultados" className="text-accent-deep underline-offset-4 hover:underline">Ver a explicação completa</Link>
      </div>
    </div>
  );
}
