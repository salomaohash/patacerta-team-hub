import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, ShieldCheck, Stethoscope, House, HandHeart, Leaf } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import mimi from "@/assets/pets/mimi.jpg";
import zeca from "@/assets/pets/zeca.jpg";

export const Route = createFileRoute("/acerca")({
  head: () => ({ meta: [
    { title: "Acerca de nós, PataCerta" },
    { name: "description", content: "A história da PataCerta: adoção informada, reabilitação e expectativas reais. Conhece os nossos valores e as perguntas frequentes." },
    { property: "og:title", content: "Acerca de nós, PataCerta" },
    { property: "og:description", content: "Compaixão com expectativas reais. A nossa história, os animais reabilitados e respostas às tuas perguntas." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: About,
});

const opening = "Em Portugal, milhares de animais esperam em associações e centros de recolha. Muitos chegam feridos ou doentes. Recebem cuidados veterinários e acompanhamento até estarem prontos para adoção. Mas a maior parte dos sites mostra apenas uma fotografia e uma descrição breve. E a pessoa escolhe com o coração, sem saber se a sua vida consegue acompanhar a do animal.";
const values = [
  { icon: HeartHandshake, title: "Compaixão com expectativas reais", text: "Amamos cada animal; adotar exige informação." },
  { icon: Stethoscope, title: "Reabilitação contada do início ao fim", text: "Mostramos quanto já recuperaram e o que ainda pode precisar de acompanhamento." },
  { icon: Leaf, title: "Ninguém é esquecido", text: "Seniores e animais com necessidades especiais merecem a mesma luz, não menos." },
];
const stages = [
  { icon: HandHeart, title: "Chegada e resgate", text: "Acolhimento, segurança e avaliação das necessidades de cada animal." },
  { icon: Stethoscope, title: "Reabilitação", text: "Cuidados veterinários, fisioterapia e acompanhamento do comportamento." },
  { icon: House, title: "Pronto para adoção", text: "Um perfil completo: a vida que tem agora e o que precisa para recomeçar." },
];
const faqs = [
  { question: "É um site de adoção de animais?", answer: "Sim. A PataCerta foi pensada como um lugar onde podes encontrar animais de associações parceiras prontos para adoção, com contexto, não apenas com uma imagem. Neste momento, os animais apresentados são perfis ilustrativos; não é possível concluir uma adoção pelo site." },
  { question: "O que tem em comum com sites como Bianca, Petify, Adopta-me ou OLX?", answer: "Há cães e gatos com fotografia e descrição, como nesses sites. A proposta da PataCerta é acrescentar uma compatibilidade explicada a partir do teu questionário: o que encaixa na tua rotina e os desafios a considerar. Não substitui a informação de outras plataformas nem a conversa com a associação." },
  { question: "O que é a «Compatibilidade indicativa»?", answer: "Uma percentagem que estima o encaixe entre as necessidades do animal e a tua vida, calculada a partir do questionário: horas fora de casa, crianças, experiência, atividade física e outros aspetos da rotina. É sempre acompanhada das razões que a justificam. Uma estimativa baseada nas tuas respostas, não uma previsão científica." },
  { question: "E os animais reabilitados, como sei que estão recuperados?", answer: "A proposta é que cada animal reabilitado tenha uma secção dedicada: o que lhe aconteceu, o tratamento que recebeu e o acompanhamento de que ainda precisa, incluindo consultas ou exercícios. Essa informação deve estar disponível antes da candidatura. Os perfis atuais são exemplos, não registos clínicos verificados." },
  { question: "E se me candidatar a um animal com necessidades especiais, dos Inesquecíveis?", answer: "O perfil descreve a medicação e as adaptações em casa. Indica também a frequência das consultas e o apoio previsto da associação. Se for o teu primeiro animal com necessidades especiais, as razões de compatibilidade ajudam-te a fazer uma primeira avaliação informada. As candidaturas e os apoios apresentados são exemplos." },
  { question: "Isto é um serviço pago?", answer: "Não. Toda a PataCerta é gratuita para quem adota. Os adotantes e as associações não pagam nada." },
  { question: "Posso adotar diretamente através do site?", answer: "Os perfis de animais e as candidaturas são exemplos ilustrativos. As percentagens são estimativas calculadas a partir das tuas respostas. Não podes adotar diretamente estes animais através do site. Nenhuma associação responde por animais neste protótipo; qualquer candidatura feita aqui fica apenas neste navegador e não é enviada." },
  { question: "Onde são guardados os meus dados?", answer: "As tuas respostas ao questionário, candidaturas e favoritos são guardados localmente no teu navegador. Estes dados não são enviados para um servidor externo. Limpar os dados do navegador apaga o teu histórico." },
];

function About() {
  return (
    <>
      <main>
        <section className="border-b border-border">
          <Reveal className="mx-auto max-w-6xl px-6 py-12 text-center md:py-12">
            <p data-r className="eyebrow">Acerca de nós</p>
            <h1 data-r className="mx-auto mt-6 max-w-4xl text-[38px] leading-[1.15] md:text-[52px]">Porque é que tantas adoções falham?</h1>
            <p data-r className="mx-auto mt-6 max-w-3xl text-[17px] text-muted-foreground">{opening}</p>
          </Reveal>
        </section>

        <section>
          <Reveal className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 md:grid-cols-[1.15fr_1fr] md:gap-12 md:py-12">
            <div data-r className="space-y-6">
              <div className="space-y-6">
                <p className="eyebrow text-accent-deep">A nossa história</p>
                <h2 className="text-[32px] leading-tight md:text-[40px]">A informação também é uma forma de cuidar.</h2>
                <p className="text-[17px] text-muted-foreground">Acreditamos que mais informação pode ajudar as pessoas a escolher. A PataCerta compara as respostas sobre a tua rotina com as necessidades de cada animal. Apresentamos as razões de compatibilidade e os desafios a considerar.</p>
              </div>
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-[26px]">Animais reabilitados</h3>
                <p className="text-[15px] text-muted-foreground">As associações e os centros de recolha acompanham cada animal desde a chegada: tratamento veterinário, recuperação, comportamento e a vida que tem agora. Queremos contar até onde chegou: a cirurgia que correu bem, os meses de recuperação, a medicação de que já não precisa e os cuidados que ainda são necessários. Terás essa informação antes de te candidatares, nunca depois.</p>
              </div>
            </div>
            <figure data-r>
              <img src={mimi} alt="Mimi, gata sénior de 13 anos" width={768} height={768} className="aspect-[4/5] w-full rounded-lg object-cover" />
              <figcaption className="mt-4 text-[13px] text-muted-foreground">Mimi, 13 anos. Um ritmo tranquilo e a mesma vontade de pertencer.</figcaption>
            </figure>
          </Reveal>
        </section>

        <section className="border-y border-border bg-secondary">
          <Reveal className="mx-auto max-w-6xl px-6 py-12 md:py-12">
            <div data-r><p className="eyebrow">O percurso</p><h2 className="mt-6 text-[32px] leading-tight md:text-[40px]">Como chega um animal à adoção?</h2></div>
            <ol className="mt-12 grid gap-6 md:grid-cols-3 md:gap-12">
              {stages.map((stage, i) => <li data-r key={stage.title} className="relative border-t border-border pt-6">
                <div className="flex items-center gap-3"><span className="font-serif text-sm text-muted-foreground">0{i + 1}</span><stage.icon size={22} strokeWidth={1.5} className="text-accent-deep" /></div>
                <h3 className="mt-6 text-[24px]">{stage.title}</h3><p className="mt-3 text-[15px] text-muted-foreground">{stage.text}</p>
              </li>)}
            </ol>
          </Reveal>
        </section>

        <section>
          <Reveal className="mx-auto max-w-6xl px-6 py-12 md:py-12">
            <div data-r><p className="eyebrow">Os nossos valores</p><h2 className="mt-6 text-[32px] md:text-[40px]">O que orienta o nosso trabalho?</h2></div>
            <ol className="mt-12 grid md:grid-cols-3">
              {values.map((value, i) => <li data-r key={value.title} className="border-t border-border py-6 md:border-l md:border-t-0 md:px-6 md:py-2 md:first:border-l-0 md:first:pl-0">
                <div className="flex items-center gap-3"><span className="font-serif text-sm text-muted-foreground">0{i + 1}</span><value.icon size={20} strokeWidth={1.5} className="text-accent-deep" /></div>
                <h3 className="mt-6 text-[24px] leading-snug">{value.title}</h3><p className="mt-3 text-[15px] text-muted-foreground">{value.text}</p>
              </li>)}
            </ol>
          </Reveal>
        </section>

        <section className="bg-muted">
          <Reveal className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 md:grid-cols-2 md:gap-12 md:py-12">
            <figure data-r><img src={zeca} alt="Zeca, cão sénior de 11 anos" width={768} height={768} loading="lazy" className="aspect-square w-full rounded-lg object-cover" /><figcaption className="mt-4 text-[13px] text-muted-foreground">Zeca, 11 anos. Passeios curtos, companhia sem pressa.</figcaption></figure>
            <div data-r className="space-y-6">
              <p className="eyebrow text-accent-warm">Os Inesquecíveis</p>
              <h2 className="text-[34px] leading-tight md:text-[44px]">Que cuidados precisam estes animais?</h2>
              <p className="text-[17px] text-muted-foreground">Seniores, animais com deficiência ou necessidades especiais. Explicamos o tempo e as adaptações necessários para cuidar deles. Indicamos os custos e o apoio previsto da associação.</p>
              <Button asChild size="lg" className="h-auto whitespace-normal py-3 font-normal"><Link to="/animais" search={{ situacao: "esquecidos" }}>Conhecer os Inesquecíveis </Link></Button>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 md:py-12">
          <aside className="flex gap-4 border-l-2 border-primary bg-secondary px-6 py-6" aria-labelledby="demo-title">
            <ShieldCheck size={24} strokeWidth={1.5} className="mt-2 shrink-0 text-accent-deep" />
            <div><h2 id="demo-title" className="text-[24px]">Informação sobre os perfis</h2><p className="mt-3 max-w-3xl text-[15px] text-muted-foreground">A PataCerta reúne perfis ilustrativos para explorar a adoção consciente. O questionário, as percentagens e os dados de adoção são exemplos realistas criados para este produto. Nenhum animal do site está disponível para adoção diretamente através do site.</p><p className="mt-3 max-w-3xl text-[15px] text-muted-foreground">Os avisos de desaparecidos e encontrados também são fictícios: as fotografias são ilustrativas e os contactos example.com não recebem pedidos reais. As associações do catálogo são fictícias. As organizações apresentadas na faixa da página inicial são referências reais, sem qualquer parceria formal com a PataCerta.</p></div>
          </aside>
        </section>

        <section id="faq" className="scroll-mt-8 border-t border-border">
          <Reveal className="mx-auto max-w-6xl px-6 py-12 md:py-12">
            <div data-r className="max-w-3xl"><p className="eyebrow">Perguntas frequentes</p><h2 className="mt-6 text-[32px] leading-tight md:text-[40px]">O que queres saber sobre a PataCerta?</h2></div>
            <Accordion data-r type="single" collapsible className="mt-12 max-w-4xl">
              {faqs.map((faq, i) => <AccordionItem key={faq.question} value={`faq-${i}`}><AccordionTrigger className="gap-6 py-6 text-[17px] font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{faq.question}</AccordionTrigger><AccordionContent className="max-w-3xl pr-6 text-[15px] leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent></AccordionItem>)}
            </Accordion>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}