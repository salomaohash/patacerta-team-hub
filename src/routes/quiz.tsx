import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { QuizAnswers } from "@/lib/matching";
import { loadQuiz, saveQuiz } from "@/lib/state/quiz";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Questionário de compatibilidade — PataCerta" },
      { name: "description", content: "Nove perguntas sobre a tua rotina para encontrar os animais mais compatíveis contigo." },
      { property: "og:title", content: "Questionário de compatibilidade — PataCerta" },
      { property: "og:description", content: "Descobre a tua compatibilidade em nove perguntas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { refazer?: boolean } => (s.refazer ? { refazer: true } : {}),
  component: Quiz,
});

const questions: { key: keyof QuizAnswers; q: string; options: string[] }[] = [
  { key: "hoursAway", q: "Quantas horas por dia passas fora de casa?", options: ["Menos de 4h", "4–8h", "Mais de 8h"] },
  { key: "housing", q: "Onde vives?", options: ["Apartamento pequeno", "Apartamento espaçoso", "Casa com espaço exterior"] },
  { key: "dailyTime", q: "Quanto tempo por dia consegues dedicar a um animal?", options: ["Menos de 30 min", "30 min a 1h", "Mais de 1h"] },
  { key: "activity", q: "Como descreves o teu nível de atividade?", options: ["Calmo, prefiro estar em casa", "Moderado, passeios regulares", "Ativo, exercício todos os dias"] },
  { key: "kids", q: "Tens crianças em casa?", options: ["Sim", "Não", "Está nos planos"] },
  { key: "pets", q: "Tens outros animais?", options: ["Não", "Cão", "Gato", "Cão e gato"] },
  { key: "experience", q: "Que experiência tens com animais?", options: ["Nenhuma", "Alguma", "Muita"] },
  { key: "routine", q: "A tua rotina é estável?", options: ["Muito estável", "Razoavelmente estável", "Imprevisível"] },
  { key: "openness", q: "Estarias disponível para adotar um animal sénior ou com necessidades especiais?", options: ["Sim", "Talvez, se souber o que esperar", "Não"] },
];

function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const navigate = useNavigate();
  const { refazer } = Route.useSearch();

  useEffect(() => {
    if (!refazer && loadQuiz()) navigate({ to: "/resultados", replace: true });
  }, [refazer, navigate]);

  const cur = questions[step]!;
  const choose = (i: number) => {
    const next = { ...answers, [cur.key]: i } as Partial<QuizAnswers>;
    setAnswers(next);
    if (step < questions.length - 1) setStep(step + 1);
    else {
      saveQuiz(next as QuizAnswers);
      navigate({ to: "/resultados" });
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl flex-col px-6 py-12">
      <div className="h-0.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-accent-deep transition-all duration-500" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <p className="eyebrow">Passo {step + 1} de {questions.length}</p>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Anterior
          </button>
        )}
      </div>
      <div key={step} className="quiz-step mt-12 flex-1">
        <h1 className="text-3xl leading-tight md:text-4xl">{cur.q}</h1>
        <div className="mt-10 space-y-3">
          {cur.options.map((o, i) => (
            <button
              key={o}
              onClick={() => choose(i)}
              className={`w-full rounded-2xl border px-6 py-4 text-left transition-colors hover:border-accent-deep hover:bg-secondary ${answers[cur.key] === i ? "border-accent-deep bg-secondary" : "border-border bg-card"}`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
