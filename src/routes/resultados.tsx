import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { animals } from "@/lib/animals";
import { computeMatch, type QuizAnswers } from "@/lib/matching";
import { loadQuiz } from "@/lib/state/quiz";
import { useSession } from "@/lib/state/session";
import { MatchCard } from "@/components/MatchCard";

export const Route = createFileRoute("/resultados")({
  head: () => ({
    meta: [
      { title: "Animais compatíveis contigo · PataCerta" },
      { name: "description", content: "Os animais mais compatíveis contigo, com a compatibilidade explicada." },
      { property: "og:title", content: "Os teus resultados, PataCerta" },
      { property: "og:description", content: "Compatibilidade explicada para cada animal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Resultados,
});

function Resultados() {
  const navigate = useNavigate();
  const user = useSession();
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);

  useEffect(() => {
    const q = loadQuiz();
    if (!q) navigate({ to: "/quiz", replace: true });
    else setAnswers(q);
  }, [navigate]);

  if (!answers) return null;

  const ranked = animals
    .filter((a) => a.status === "active")
    .map((a) => ({ a, m: computeMatch(answers, a) }))
    .filter((x) => x.m.score >= 40)
    .sort((x, y) => y.m.score - x.m.score);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <p className="eyebrow">Os teus resultados</p>
      <h1 className="mt-4 text-4xl md:text-5xl">Os animais que combinam contigo</h1>
      <p className="mt-4 text-muted-foreground">Uma estimativa baseada nas tuas respostas, não uma previsão científica.</p>

      {!user && (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-secondary p-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Cria conta para guardares os teus resultados e os animais de que gostas.</span>
          <Link to="/registar" className="rounded-full bg-primary px-6 py-2 text-center text-primary-foreground">Criar conta</Link>
        </div>
      )}

      <div className="mt-12 space-y-6">
        {ranked.map(({ a, m }) => (
          <MatchCard key={a.id} a={a} m={m} />
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link to="/quiz" search={{ refazer: true }} className="rounded-full border border-border px-6 py-3 text-sm hover:bg-secondary">Repetir questionário</Link>
        <Link to="/animais" className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Ver todos os animais</Link>
      </div>
    </main>
  );
}
