import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, HeartHandshake, PawPrint, ArrowRight } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PataCerta — Adoção consciente em Portugal" },
      {
        name: "description",
        content:
          "Encontrar a família certa para cada animal: compatibilidade explicada, adoção inclusiva e acompanhamento.",
      },
      { property: "og:title", content: "PataCerta — Adoção consciente em Portugal" },
      {
        property: "og:description",
        content: "Encontrar a família certa para cada animal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.querySelectorAll<HTMLElement>(".reveal").forEach((c, i) => {
            c.style.transitionDelay = `${i * 80}ms`;
            c.classList.add("is-visible");
          });
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

const steps = [
  {
    icon: ClipboardList,
    title: "Questionário de estilo de vida",
    text: "Respondes a perguntas sobre a tua casa, rotina e experiência.",
  },
  {
    icon: HeartHandshake,
    title: "Compatibilidade explicada",
    text: "Mostramos porque cada animal pode — ou não — ser a escolha certa.",
  },
  {
    icon: PawPrint,
    title: "Adoção acompanhada",
    text: "Acompanhamos os primeiros 30, 60 e 90 dias da nova família.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="font-serif text-xl tracking-tight">
            PataCerta
          </a>
          <button className="rounded-full border border-border px-5 py-2 text-sm transition-colors hover:bg-secondary">
            Entrar
          </button>
        </div>
      </header>

      <main>
        <section className="grain relative overflow-hidden">
          <div
            aria-hidden
            className="glow-breathe pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] rounded-full md:h-[720px] md:w-[720px]"
          />
          <Reveal className="relative mx-auto max-w-3xl px-6 py-28 text-center md:py-40">
            <p className="eyebrow reveal">Adoção consciente</p>
            <h1 className="reveal mt-6 text-4xl font-light leading-[1.1] md:text-6xl">
              A família certa para cada animal.
            </h1>
            <p className="reveal mx-auto mt-6 max-w-[52ch] text-[17px] text-muted-foreground">
              A nossa missão: não encontrar qualquer família para qualquer animal. Encontrar a
              família certa para cada animal.
            </p>
            <div className="reveal mt-10">
              <a
                href="/quiz"
                className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-[15px] text-primary-foreground shadow-soft transition-colors hover:bg-accent-deep"
              >
                Descobrir a tua compatibilidade
                <ArrowRight
                  size={18}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </Reveal>
        </section>

        <section className="border-t border-border py-24">
          <Reveal className="mx-auto max-w-6xl px-6">
            <p className="eyebrow reveal">Como funciona</p>
            <h2 className="reveal mt-4 max-w-xl text-3xl md:text-4xl">
              Três passos, sem pressas.
            </h2>
            <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
              {steps.map((s, i) => (
                <div key={s.title} className="reveal border-t border-border pt-8">
                  <div className="flex items-center gap-3 text-accent-deep">
                    <s.icon size={24} strokeWidth={1.5} />
                    <span className="eyebrow">Passo {i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl">{s.title}</h3>
                  <p className="mt-3 max-w-[40ch] text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span className="font-serif text-base text-foreground">PataCerta</span>
          <span className="eyebrow">Projeto de demonstração</span>
        </div>
      </footer>
    </div>
  );
}
