import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, type CSSProperties } from "react";
import { ArrowRight, ClipboardList, HeartHandshake, Mail, Stethoscope } from "lucide-react";
import { getAnimal, getAssociation } from "@/lib/animals";
import { computeMatch, type QuizAnswers } from "@/lib/matching";
import { MatchRing } from "@/components/MatchRing";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { HomeStats } from "@/components/HomeStats";
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { Button } from "@/components/ui/button";
import { notices } from "@/lib/notices";
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

// Exemplos reais do motor de compatibilidade, sem números inventados.
const HERO_CASE: QuizAnswers = { hoursAway: 0, housing: 1, dailyTime: 2, activity: 1, kids: 1, pets: 0, experience: 2, routine: 0, openness: 1 };
const heroAnimal = getAnimal("tobias")!;
const heroMatch = computeMatch(HERO_CASE, heroAnimal);

const ACTIVE_CASE: QuizAnswers = { hoursAway: 1, housing: 1, dailyTime: 1, activity: 1, kids: 0, pets: 1, experience: 1, routine: 1, openness: 1 };
const activeAnimal = getAnimal("kiko")!;
const activeMatch = computeMatch(ACTIVE_CASE, activeAnimal);
const dims = Object.values(activeMatch.dimensions);
const activeGoods = dims.filter((d) => d.score >= 0.75).slice(0, 2);
const activeHard = [...dims].sort((a, b) => a.score - b.score).find((d) => d.score < 0.75);

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
      <section className="home-opening grain relative overflow-hidden border-b border-border">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-[1.15fr_1fr] md:gap-12 md:py-14">
          <div className="space-y-6">
            <p className="eyebrow flex items-center gap-3 text-accent-deep"><span aria-hidden="true" className="h-px w-8 bg-accent-deep" />Adoção consciente</p>
            <h1 className="font-sans text-[38px] font-black leading-[1.08] tracking-normal md:text-[52px]"><span className="block">O Animal Que</span><span className="block">Realmente</span><span className="block text-accent-deep">Combina Contigo.</span></h1>
            <p className="max-w-[46ch] text-[18px] leading-relaxed text-muted-foreground">
              Responde a um questionário cuidadoso e vê, para cada animal, uma compatibilidade explicada — o que encaixa e o que poderá ser um desafio.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-3">
              <Button asChild className="h-auto max-w-full whitespace-normal rounded-full px-6 py-3.5 text-base font-semibold shadow-soft"><Link to="/quiz">
                Descobrir a tua compatibilidade <ArrowRight size={18} className="shrink-0" />
              </Link></Button>
              <Button asChild variant="link" className="h-auto px-0 text-base font-normal"><Link to="/animais">Explorar animais <ArrowRight size={16} /></Link></Button>
            </div>
          </div>
          <div className="relative mx-auto mt-2 w-full max-w-[420px] pb-5 md:mt-0">
            <div className="overflow-hidden rounded-[24px] shadow-soft">
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
            <div className="absolute bottom-0 left-3 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 pr-6 shadow-soft md:-left-5">
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
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} data-r style={d(i + 1)} className="home-step rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-sm text-muted-foreground">0{i + 1}</span>
                  <s.icon size={20} strokeWidth={1.5} className="text-accent-deep" />
                </div>
                <h3 className="mt-6 text-[24px]">{s.title}</h3>
                <p className="mt-3 text-[16.5px] text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <HomeStats />
      <PartnerMarquee />

      <section className="section-texture border-t border-border bg-muted">
        <Reveal className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 py-12 md:flex-row md:items-center md:py-16">
          <div data-r className="max-w-2xl"><p className="eyebrow">Perdidos e Encontrados</p><h2 className="mt-5 text-[32px] leading-tight md:text-[40px]">Perdi o meu animal. Ajudamos a encontrá-lo.</h2><p className="mt-5 text-[16.5px] text-muted-foreground">Uma comunidade atenta começa com uma localização e um aviso partilhado. Consulta as zonas de busca e os animais encontrados.</p><p className="mt-4 text-sm text-accent-deep">{notices.filter((n) => n.tipo === "desaparecido").length} avisos no catálogo</p></div>
          <div data-r className="flex shrink-0 flex-col gap-3"><Button asChild className="font-normal"><Link to="/animais" search={{ estado: "desaparecido" }}>Ver desaparecidos <ArrowRight /></Link></Button><Button asChild variant="outline" className="font-normal"><Link to="/animais" search={{ estado: "encontrado" }}>Ver encontrados <ArrowRight /></Link></Button></div>
        </Reveal>
      </section>

      {/* Compatibilidade explicada */}
      <section className="home-ambient">
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
            <ul className="space-y-4 pt-2 text-[16.5px]">
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

      <SiteFooter />
    </div>
  );
}
