import { createFileRoute } from "@tanstack/react-router";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { filterAnimals, sortAnimals, type CatalogFilters } from "@/lib/catalog";
import { notices, filterNotices } from "@/lib/notices";
import { AnimalCard } from "@/components/AnimalCard";
import { NoticeCard } from "@/components/NoticeCard";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuiz } from "@/hooks/use-quiz";

export const Route = createFileRoute("/animais/")({
  validateSearch: (s: Record<string, unknown>): CatalogFilters => {
    const pick = (key: string) => typeof s[key] === "string" ? s[key] as string : undefined;
    return { especie: pick("especie"), porte: pick("porte"), energia: pick("energia"), situacao: pick("situacao"), estado: pick("estado"), q: pick("q"), zona: pick("zona"), ordem: pick("ordem") };
  },
  head: () => ({ meta: [
    { title: "Animais e avisos da comunidade — PataCerta" },
    { name: "description", content: "Encontra animais para adoção e consulta avisos demonstrativos de animais desaparecidos e encontrados em Portugal." },
    { property: "og:title", content: "Animais e avisos da comunidade — PataCerta" },
    { property: "og:description", content: "Adoção consciente e Perdidos e Encontrados: pesquisa por nome, zona ou raça." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Catalog,
});
const attributes = [
  { key: "especie", label: "Espécie", options: ["cão", "gato"] },
  { key: "porte", label: "Porte", options: ["pequeno", "médio", "grande"] },
  { key: "energia", label: "Energia", options: ["baixa", "média", "alta"] },
] as const;
const tabs = [
  { value: "adocao", label: "Para adoção", count: filterAnimals({}).length },
  { value: "desaparecido", label: "Desaparecidos", count: notices.filter((n) => n.tipo === "desaparecido").length },
  { value: "encontrado", label: "Encontrados", count: notices.filter((n) => n.tipo === "encontrado").length },
];
const selectClass = "h-10 rounded-full border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Catalog() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const quiz = useQuiz();
  const state = ["desaparecido", "encontrado"].includes(search.estado ?? "") ? search.estado : "adocao";
  const adoption = state === "adocao";
  const order = search.ordem ?? (quiz ? "compatibilidade" : "recentes");
  const animals = sortAnimals(filterAnimals(search), order, quiz);
  const posts = filterNotices(state ?? "adocao", search.q, search.zona);
  const count = adoption ? animals.length : posts.length;
  const update = (key: keyof CatalogFilters, value: string | undefined) => navigate({ search: (prev) => ({ ...prev, [key]: value }), replace: true, resetScroll: false });
  const clear = () => navigate({ search: { estado: search.estado }, replace: true, resetScroll: false });
  const active = (adoption ? ["q", "especie", "porte", "energia", "situacao"] : ["q", "zona"]).filter((key) => search[key as keyof CatalogFilters]);
  return <>
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12 md:py-16">
      <p className="eyebrow">{adoption ? "Catálogo" : "Perdidos e Encontrados"}</p>
      <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <h1 className="text-[34px] leading-tight md:text-[40px]">{adoption ? "Animais à procura de casa" : state === "desaparecido" ? "Alguém espera por eles." : "De volta à sua família."}</h1>
        <div className="relative w-full lg:w-80"><Search size={18} className="pointer-events-none absolute left-4 top-3.5 text-muted-foreground" /><Input aria-label="Procurar animais e avisos" placeholder="Procurar por nome, zona ou raça…" value={search.q ?? ""} onChange={(e) => update("q", e.target.value || undefined)} className="h-12 rounded-full bg-card pl-11" /></div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Estado dos animais" className="flex flex-wrap gap-2">
          {tabs.map((tab) => <Button key={tab.value} variant={state === tab.value ? "default" : "outline"} aria-current={state === tab.value ? "page" : undefined} className={`h-10 rounded-full px-4 font-normal ${state === tab.value ? "bg-accent-deep" : ""}`} onClick={() => navigate({ search: { estado: tab.value === "adocao" ? undefined : tab.value, q: search.q }, resetScroll: false })}>{tab.label} <span className="opacity-75">({tab.count})</span></Button>)}
        </nav>
        <p role="status" className="text-sm text-muted-foreground">{count} {adoption ? count === 1 ? "animal" : "animais" : count === 1 ? "aviso" : "avisos"}</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-border py-5">
        <SlidersHorizontal size={18} className="text-muted-foreground" aria-hidden />
        {adoption ? attributes.map((f) => <label key={f.key} className="flex items-center gap-2 text-sm"><span>{f.label}</span><select className={selectClass} value={search[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value || undefined)}><option value="">Todos</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select></label>) : <label className="flex items-center gap-2 text-sm">Zona<select className={selectClass} value={search.zona ?? ""} onChange={(e) => update("zona", e.target.value || undefined)}><option value="">Todas</option>{[...new Set(notices.map((n) => n.zona))].sort().map((zone) => <option key={zone}>{zone}</option>)}</select></label>}
        {adoption && count > 6 && <label className="flex items-center gap-2 text-sm md:ml-auto">Ordenar<select className={selectClass} value={order} onChange={(e) => update("ordem", e.target.value)}>{quiz && <option value="compatibilidade">Compatibilidade</option>}<option value="recentes">Mais recentes</option><option value="idade">Mais velhos</option></select></label>}
      </div>
      {active.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2">{active.map((key) => <Button key={key} variant="secondary" size="sm" className="rounded-full font-normal" aria-label={`Remover filtro ${search[key as keyof CatalogFilters]}`} onClick={() => update(key as keyof CatalogFilters, undefined)}>{key === "situacao" ? "Os Inesquecíveis" : search[key as keyof CatalogFilters]}<X size={14} /></Button>)}<Button variant="link" className="ml-auto font-normal" onClick={clear}>Limpar filtros</Button></div>}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adoption ? animals.map((a) => <AnimalCard key={a.id} a={a} />) : posts.map((n) => <NoticeCard key={n.id} notice={n} />)}
      </div>
      {count === 0 && <div className="py-16 text-center"><h2 className="text-2xl">Nenhum resultado por agora.</h2><p className="mt-3 text-muted-foreground">Tenta outro nome ou uma zona diferente.</p><Button variant="link" onClick={clear}>Limpar filtros</Button></div>}
      {!adoption && <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">Avisos e contactos de demonstração. As fotografias são exemplos; os endereços example.com não recebem pedidos reais.</p>}
    </main>
    <SiteFooter />
  </>;
}