import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Accessibility, ArrowRight, ClipboardList, HeartHandshake, Leaf, Mail, Stethoscope } from "lucide-react";
import { getAnimal, getAssociation, type Animal } from "@/lib/animals";
import { computeMatch, type QuizAnswers } from "@/lib/matching";
import { AnimalCard } from "@/components/AnimalCard";
import { MatchRing } from "@/components/MatchRing";
import heroPoster from "@/assets/hero-dog-poster.jpg";
import heroLoop from "@/assets/hero-dog-loop.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PataCerta — O animal que realmente combina contigo" },
      { name: "description", content: "Adoção consciente em Portugal: compatibilidade explicada para cada animal." },
      { property: "og:title", content: "PataCerta — O animal que realmente combina contigo" },
      { property: "og:description", content: "Adoção consciente em Portugal: compatibilidade explicada para cada animal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = [
  { icon: ClipboardList, title: "Questionário", text: "Nove perguntas calmas sobre a tua rotina, a tua casa e o tempo que tens para dar." },
  { icon: HeartHandshake, title: "Compatibilidade explicada", text: "Cada animal recebe uma percentagem com razões claras — e os desafios, com honestidade." },
  { icon: Mail, title: "Contacto", text: "Fala diretamente com a associação responsável e inicia o processo de adoção." },
];

const pick = (ids: string[]) => ids.map(getAnimal).filter((a): a is Animal => !!a);
const FEATURED = pick(["luna", "zeca", "simba", "nala"]);

// Exemplos reais do motor de compatibilidade, sem números inventados.
const HERO_CASE: QuizAnswers = { hoursAway: 0, housing: 1, dailyTime: 2, activity: 1, kids: 1, pets: 0, experience: 2, routine: 0, openness: 0 };
const heroAnimal = getAnimal("tobias")!;
const heroMatch = computeMatch(HERO_CASE, heroAnimal);

const ACTIVE_CASE: QuizAnswers = { hoursAway: 1, housing: 1, dailyTime: 1, activity: 1, kids: 0, pets: 1, experience: 1, routine: 1, openness: 1 };
const activeAnimal = getAnimal("kiko")!;
const activeMatch = computeMatch(ACTIVE_CASE, activeAnimal);
const dims = Object.values(activeMatch.dimensions);
const activeGoods = dims.filter((d) => d.score >= 0.75).slice(0, 2);
const activeHard = [...dims].sort((a, b) => a.score - b.score).find((d) => d.score < 0.75);

const senior = getAnimal("mimi")!;

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-shown={shown} className={`reveal-group ${className}`}>
      {children}
    </div>
  );
}

const d = (i: number) => ({ "--i": i }) as CSSProperties;
const btn = "inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] shadow-soft transition-colors";

function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // React não renderiza o atributo `muted` no SSR; força-o para o autoplay funcionar.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="grain relative overflow-hidden">
        <div aria-hidden className="glow-breathe pointer-events-none absolute -top-1/3 left-1/4 h-[620px] w-[620px] rounded-full" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 md:grid-cols-[1.25fr_1fr] md:py-32">
          <div className="space-y-8">
            <p className="eyebrow text-accent-deep">Adoção consciente</p>
            <h1 className="text-[44px] font-light leading-[1.05] md:text-[68px]">O animal que realmente combina contigo.</h1>
            <p className="max-w-[52ch] text-[17px] text-muted-foreground">
              Responde a um questionário cuidadoso e vê, para cada animal, uma compatibilidade explicada — o que encaixa e o que poderá ser um desafio.
            </p>
            <div className="flex flex-col gap-6 pt-2 sm:flex-row sm:items-center">
              <Link to="/quiz" className={`${btn} bg-primary text-primary-foreground hover:bg-accent-deep`}>
                Descobrir a tua compatibilidade <ArrowRight size={18} />
              </Link>
              <Link to="/animais" className="text-[15px] underline-offset-4 hover:underline">Explorar animais</Link>
            </div>
          </div>
          <div className="relative mt-6 md:mt-0">
            <div className="overflow-hidden rounded-[28px] shadow-soft">
              <video
                ref={videoRef}
                className="aspect-[4/5] w-full object-cover motion-reduce:hidden"
                src={heroLoop.url}
                poster={heroPoster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Cão a brincar no relvado"
              />
              <img src={heroPoster} alt="Cão a brincar no relvado" width={800} height={1008} className="hidden aspect-[4/5] w-full object-cover motion-reduce:block" />
            </div>
            <div className="absolute -bottom-8 -left-10 hidden items-center gap-4 rounded-2xl bg-card p-4 pr-6 shadow-soft sm:flex">
              <MatchRing value={heroMatch.score} size={60} label="Compatibilidade indicativa" />
              <div>
                <p className="font-serif text-[19px] leading-tight">{heroAnimal.name}</p>
                <p className="text-[13px] text-muted-foreground">
                  {heroAnimal.species} · {heroAnimal.ageYears} anos · {getAssociation(heroAnimal.associationId)?.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-t border-border">
        <Reveal className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div data-r className="space-y-6">
            <p className="eyebrow">Como funciona</p>
            <h2 className="text-[34px] md:text-[44px]">Três passos, sem pressa.</h2>
          </div>
          <ol className="mt-12 grid md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} data-r style={d(i + 1)} className="border-t border-border py-8 md:border-l md:border-t-0 md:px-10 md:py-2 md:first:border-l-0 md:first:pl-0">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-sm text-muted-foreground">0{i + 1}</span>
                  <s.icon size={20} strokeWidth={1.5} className="text-accent-deep" />
                </div>
                <h3 className="mt-6 text-[24px]">{s.title}</h3>
                <p className="mt-3 text-[15px] text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Em destaque */}
      <section className="bg-secondary">
        <Reveal className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div data-r className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="space-y-6">
              <p className="eyebrow">Em destaque</p>
              <h2 className="text-[34px] md:text-[44px]">À espera de uma casa.</h2>
            </div>
            <Link to="/animais" className="text-[15px] underline-offset-4 hover:underline">Ver todos os animais</Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {FEATURED.map((a, i) => (
              <div key={a.id} data-r style={d(i + 1)}>
                <AnimalCard a={a} />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Compatibilidade explicada */}
      <section>
        <Reveal className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-16 md:grid-cols-2 md:py-24">
          <div data-r className="space-y-6">
            <p className="eyebrow text-accent-deep">Compatibilidade</p>
            <h2 className="text-[34px] md:text-[44px]">Uma percentagem que se explica.</h2>
            <p className="max-w-[52ch] text-muted-foreground">
              Não mostramos apenas um número. Dizemos porque é que um animal encaixa na tua vida — e onde poderá haver fricção. Uma adoção feliz começa com expectativas honestas.
            </p>
          </div>
          <div data-r style={d(1)} className="space-y-6">
            <div className="flex items-center gap-6 border-b border-border pb-6">
              <MatchRing value={activeMatch.score} size={80} label="Compatibilidade indicativa" />
              <div>
                <p className="font-serif text-[24px]">{activeAnimal.name}</p>
                <p className="text-sm text-muted-foreground">
                  {activeAnimal.species} {activeAnimal.breed}, {activeAnimal.ageYears} anos · {getAssociation(activeAnimal.associationId)?.city}
                </p>
              </div>
            </div>
            <ul className="space-y-4 pt-2 text-[15px]">
              {activeGoods.map((r) => (
                <li key={r.reason} className="flex gap-3">
                  <HeartHandshake size={18} strokeWidth={1.5} className="mt-1 shrink-0 text-accent-deep" />
                  <span>{r.reason}</span>
                </li>
              ))}
              {activeHard && (
                <li className="flex gap-3 text-muted-foreground">
                  <Stethoscope size={18} strokeWidth={1.5} className="mt-1 shrink-0 text-accent-warm" />
                  <span>{activeHard.reason}</span>
                </li>
              )}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Os Esquecidos */}
      <section className="bg-muted">
        <Reveal className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1fr_1.1fr] md:items-center md:py-24">
          <div data-r className="space-y-3">
            <img src={senior.photo} alt={`${senior.name}, gata sénior`} loading="lazy" width={800} height={1008} className="aspect-[4/5] w-full rounded-[28px] object-cover md:aspect-[5/6]" />
            <p className="text-[13px] text-muted-foreground">
              {senior.name}, {senior.ageYears} anos, de {getAssociation(senior.associationId)?.name} — uma das que esperam há mais tempo.
            </p>
          </div>
          <div data-r style={d(1)} className="space-y-6">
            <p className="eyebrow text-accent-warm">Os Esquecidos</p>
            <h2 className="text-[34px] md:text-[48px]">Alguns animais esperam mais tempo. Não por serem menos.</h2>
            <p className="max-w-[52ch] text-muted-foreground">
              Seniores, animais com deficiência ou necessidades especiais. Apresentamo-los com dignidade e realismo: o que precisam, o que implica cuidar deles e o apoio que a associação oferece.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {[
                [Leaf, "Sénior"],
                [Stethoscope, "Necessidades especiais"],
                [Accessibility, "Deficiência"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Leaf;
                return (
                  <span key={label as string} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                    <I size={14} /> {label as string}
                  </span>
                );
              })}
            </div>
            <Link to="/animais" className={`${btn} mt-2 bg-accent-warm text-primary-foreground hover:opacity-90`}>
              Conhecer Os Esquecidos <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* CTA final */}
      <section>
        <Reveal className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 data-r className="text-[34px] md:text-[48px]">Começa pela pergunta certa.</h2>
          <p data-r style={d(1)} className="mx-auto mt-6 max-w-[52ch] text-muted-foreground">
            Três minutos de questionário. Uma lista de animais que combinam, de facto, contigo.
          </p>
          <div data-r style={d(2)} className="mt-10">
            <Link to="/quiz" className={`${btn} bg-primary text-primary-foreground hover:bg-accent-deep`}>
              Descobrir a tua compatibilidade <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span className="font-serif text-base text-foreground">PataCerta</span>
          <span className="eyebrow">Projeto de demonstração</span>
        </div>
      </footer>
    </div>
  );
}
