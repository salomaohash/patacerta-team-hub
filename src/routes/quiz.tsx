import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Award, Building2, Cat, Check, Clock, Dog, Footprints, Heart, Home, Hourglass, Moon, PawPrint, RotateCcw, Sprout, Sun, Users, Zap } from "lucide-react";
import { computeMatch, type QuizAnswers } from "@/lib/matching";
import { loadQuiz, saveQuiz } from "@/lib/state/quiz";
import { adoptionQuestions, isAdoptionProfile, matchesAdoptionSpecies, toQuizAnswers } from "@/lib/adoption-quiz";
import { animals } from "@/lib/animals";
import { Button } from "@/components/ui/button";
import { MatchRing } from "@/components/MatchRing";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Questionário de adoção, PataCerta" },
      { name: "description", content: "Seis perguntas sobre a tua casa, rotina e preferências para encontrar animais compatíveis contigo." },
      { property: "og:title", content: "Questionário de compatibilidade, PataCerta" },
      { property: "og:description", content: "Descobre a tua compatibilidade em seis perguntas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { refazer?: boolean } => (s["refazer"] ? { refazer: true } : {}),
  component: Quiz,
});

const icons = [
  [Building2, Home, Users], [Hourglass, Clock, Sun], [Moon, Footprints, Zap],
  [Sprout, Heart, Award], [Dog, Cat, PawPrint], [Moon, Footprints, Cat, Users],
];

function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>(Array(6).fill(undefined));
  const [phase, setPhase] = useState<"quiz" | "thinking" | "result">("quiz");
  const [saved, setSaved] = useState<QuizAnswers | null>(null);
  const { refazer } = Route.useSearch();

  useEffect(() => {
    if (refazer) return;
    const previous = loadQuiz();
    if (previous?.adoptionProfile) setAnswers([...previous.adoptionProfile]);
  }, [refazer]);

  useEffect(() => {
    if (phase !== "thinking") return;
    const timer = setTimeout(() => setPhase("result"), 1000);
    return () => clearTimeout(timer);
  }, [phase]);

  const cur = adoptionQuestions[step];
  if (!cur) return null;
  const selected = answers[step];
  const next = () => {
    if (selected === undefined) return;
    if (step < adoptionQuestions.length - 1) setStep(step + 1);
    else if (isAdoptionProfile(answers)) {
      const complete = toQuizAnswers(answers);
      saveQuiz(complete);
      setSaved(complete);
      setPhase("thinking");
    }
  };
  const restart = () => {
    setAnswers(Array(6).fill(undefined));
    setStep(0);
    setPhase("quiz");
    setSaved(null);
  };

  if (phase === "thinking") return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-12 text-center" role="status">
      <PawPrint size={48} className="text-accent-deep motion-safe:animate-pulse" />
      <h1 className="mt-6 text-2xl md:text-3xl">A analisar as tuas respostas…</h1>
      <p className="mt-3 text-muted-foreground">A comparar as tuas preferências com os animais disponíveis.</p>
    </main>
  );

  if (phase === "result" && saved) {
    const ranked = animals.filter((a) => a.status === "active" && matchesAdoptionSpecies(saved, a))
      .map((a) => ({ a, m: computeMatch(saved, a) })).sort((a, b) => b.m.score - a.m.score);
    const best = ranked[0];
    if (!best) return <main className="mx-auto max-w-2xl px-6 py-12"><h1 className="text-3xl">Não encontrámos animais com estas preferências</h1><Button onClick={restart} className="mt-6">Alterar preferências</Button></main>;
    const reasons = Object.values(best.m.dimensions).filter((d) => d.score >= 0.75).slice(0, 3);
    return (
      <main className="quiz-step mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <p className="eyebrow text-center">O teu resultado</p>
        <h1 className="mt-3 text-center text-3xl leading-tight md:text-4xl">Um companheiro compatível contigo</h1>
        <div className="mt-6 flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-center">
          <img src={best.a.photo} alt={`Fotografia de ${best.a.name}`} className="aspect-square w-full rounded-lg object-cover sm:w-40" />
          <div className="min-w-0 flex-1"><h2 className="text-3xl">{best.a.name}</h2><p className="mt-2 text-sm text-muted-foreground">{best.a.species}, {best.a.breed}, porte {best.a.size}</p><p className="mt-3 text-sm">{best.a.description}</p></div>
          <div className="flex shrink-0 flex-col items-center gap-2"><MatchRing value={best.m.score} size={88} label="Compatibilidade indicativa" /><span className="text-xs text-muted-foreground">Compatibilidade indicativa</span></div>
        </div>
        <section className="py-6"><h3 className="text-xl">Porque combina contigo</h3><ul className="mt-3 space-y-3">{reasons.map((r) => <li key={r.reason} className="flex items-start gap-3 text-sm"><Check size={18} className="shrink-0 text-accent-deep" />{r.reason}</li>)}</ul>{reasons.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Consulta as necessidades deste animal antes de iniciares a adoção.</p>}</section>
        <div className="grid gap-3 sm:grid-cols-2">{ranked.slice(1, 3).map(({ a, m }) => <Link key={a.id} to="/animais/$id" params={{ id: a.id }} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"><img src={a.photo} alt={`Fotografia de ${a.name}`} className="h-16 w-16 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="font-semibold">{a.name}</p><p className="text-xs text-muted-foreground">{a.species}, {a.breed}</p></div><span className="text-sm font-semibold text-accent-deep">{m.score}%</span></Link>)}</div>
        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">Este resultado é uma sugestão baseada em seis respostas. Horários, crianças, outros animais e necessidades especiais devem ser confirmados com a associação antes da adoção.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button asChild className="h-12 flex-1"><Link to="/animais/$id" params={{ id: best.a.id }}>Conhecer {best.a.name}</Link></Button><Button variant="outline" onClick={restart} className="h-12 flex-1"><RotateCcw />Refazer questionário</Button></div>
        <Button asChild variant="link" className="mt-3 h-auto w-full whitespace-normal"><Link to="/resultados">Ver todos os resultados</Link></Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-6 sm:px-6 sm:py-12">
      <div>{step === 0 ? <Button asChild variant="outline"><Link to="/"><ArrowLeft />Voltar</Link></Button> : <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft />Voltar</Button>}</div>
      <progress max={6} value={step + 1} aria-label="Progresso do questionário" className="quiz-progress mt-6 h-1 w-full overflow-hidden rounded-full" />
      <div className="mt-4 flex justify-center gap-3" aria-hidden="true">{adoptionQuestions.map((_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i <= step ? "bg-accent-deep" : "bg-border"}`} />)}</div>
      <p className="eyebrow mt-6">Pergunta {step + 1} de {adoptionQuestions.length}</p>
      <div key={step} className="quiz-step mt-6 flex-1">
        <h1 className="text-3xl leading-tight md:text-4xl">{cur.q}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{cur.hint}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2" role="group" aria-label={cur.q}>
          {cur.options.map((o, i) => {
            const Icon = icons[step]?.[i] ?? PawPrint;
            const active = selected === i;
            return <Button variant="outline" key={o} aria-pressed={active} onClick={() => setAnswers((prev) => prev.map((v, index) => index === step ? i : v))}
              className={`h-auto min-h-20 w-full justify-start whitespace-normal rounded-lg px-4 py-4 text-left hover:border-accent-deep hover:bg-secondary ${active ? "border-accent-deep bg-secondary" : "border-border bg-card"}`}>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${active ? "bg-accent-deep text-primary-foreground" : "bg-secondary text-accent-deep"}`}><Icon /></span><span className="min-w-0 flex-1">{o}</span>{active && <Check className="text-accent-deep" />}
            </Button>;
          })}
        </div>
        <div className="mt-6 flex justify-end"><Button size="lg" onClick={next} disabled={selected === undefined}>Continuar</Button></div>
      </div>
    </main>
  );
}
