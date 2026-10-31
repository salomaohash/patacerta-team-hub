import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, PawPrint, FileText, MapPin, User, Heart, ClipboardCheck,
  Footprints, Bookmark, Check, Building2, Mail, Coffee, Trees, Stethoscope,
  Pencil, Home, Clock, Dog, Cake, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { HealthSummary, HealthBadge, HealthRecord, HealthModal } from "@/components/dashboard/LunaHealth";
import { GooglePlacesMap } from "@/components/dashboard/GooglePlacesMap";
import { todayCare, toggleCare } from "@/lib/luna-record";
import { formatDistance, haversineKm, type GeoPosition } from "@/lib/geo";
import lunaPhoto from "@/assets/pets/luna.jpg";
import { signOutDemo, useDemoUser } from "@/lib/demo-session";
import { signIn, signOut, useSession } from "@/lib/state/session";
import { RequireSession } from "@/components/RequireSession";
import { InstitutionDashboard } from "@/components/dashboard/InstitutionDashboard";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel e instituição, PataCerta" },
      { name: "description", content: "Painel pessoal e gestão local de animais, candidaturas, eventos e perfil da instituição na PataCerta." },
      { property: "og:title", content: "Painel e instituição, PataCerta" },
      { property: "og:description", content: "Painel pessoal e gestão local de animais, candidaturas, eventos e perfil da instituição na PataCerta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { secao?: "pet" | "application" } =>
    s["secao"] === "pet" || s["secao"] === "application" ? { secao: s["secao"] } : {},
  component: DashboardEntry,
});

function DashboardEntry() {
  const user = useSession();
  return <RequireSession>{user?.papel === "associacao" ? <InstitutionDashboard /> : <Dashboard />}</RequireSession>;
}

type SectionId = "overview" | "pet" | "application" | "requests" | "places" | "profile";

const nav: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Painel", icon: LayoutDashboard },
  { id: "pet", label: "O meu animal", icon: PawPrint },
  { id: "application", label: "Pedido de adoção", icon: FileText },
  { id: "requests", label: "Pedidos de adoção", icon: ClipboardCheck },
  { id: "places", label: "Locais pet-friendly", icon: MapPin },
  { id: "profile", label: "Perfil", icon: User },
];

const sectionTitles: Record<SectionId, string> = {
  overview: "Painel",
  pet: "O meu animal",
  application: "Pedido de adoção",
  requests: "Pedidos de adoção",
  places: "Locais pet-friendly",
  profile: "Perfil",
};

const summary = [
  { label: "O teu match", value: "Luna", icon: Heart },
  { label: "Pedido de adoção", value: "Completo", icon: ClipboardCheck },
  { label: "Progresso", value: "5 de 5 etapas", icon: Footprints },
  { label: "Locais guardados", value: "3", icon: Bookmark },
];

const steps = [
  "Questionário concluído",
  "Pedido enviado",
  "Em análise pela instituição",
  "Encontro com o animal",
  "Adoção confirmada",
];
const CURRENT = 6; // >= steps.length: adoção completa

const careChecklist = [
  "Dois passeios calmos por dia, de 20 a 30 minutos",
  "Ração para cão adulto, de manhã e à noite",
  "Escovagem semanal para manter o pelo macio",
  "Consulta anual no veterinário",
  "Um cantinho tranquilo com a cama dela",
];

type PlaceKind = "shelter" | "cafe" | "park" | "vet";

interface Place {
  name: string;
  kind: PlaceKind;
  kindLabel: string;
  distance: string;
  address: string;
  icon: typeof Coffee;
  position: { lat: number; lng: number };
}

const places: Place[] = [
  { name: "Associação Patinhas Felizes", kind: "shelter", kindLabel: "Instituição de adoção", distance: "Distância por confirmar", address: "Lisboa", icon: Building2, position: { lat: 38.736, lng: -9.15 } },
  { name: "Patas & Café", kind: "cafe", kindLabel: "Café pet-friendly", distance: "0,8 km", address: "Chiado, Lisboa", icon: Coffee, position: { lat: 38.711, lng: -9.142 } },
  { name: "Parque Canino de Monsanto", kind: "park", kindLabel: "Parque para cães", distance: "2,1 km", address: "Monsanto, Lisboa", icon: Trees, position: { lat: 38.728, lng: -9.19 } },
  { name: "Clínica Veterinária Alfama", kind: "vet", kindLabel: "Clínica veterinária", distance: "1,4 km", address: "Alfama, Lisboa", icon: Stethoscope, position: { lat: 38.713, lng: -9.128 } },
];

const filters: { id: PlaceKind | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "shelter", label: "Instituições de adoção" },
  { id: "cafe", label: "Cafés" },
  { id: "park", label: "Parques" },
  { id: "vet", label: "Veterinários" },
];

const profile = [
  { label: "Nome", value: "", icon: User },
  { label: "Localização", value: "Lisboa, Portugal", icon: MapPin },
  { label: "Habitação", value: "Apartamento", icon: Home },
  { label: "Tempo disponível", value: "Médio", icon: Clock },
  { label: "Animal preferido", value: "Cão", icon: Dog },
];

function Timeline({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={compact ? "space-y-3" : "mt-4 space-y-3"}>
      {steps.map((step, i) => {
        const done = i < CURRENT;
        const current = i === CURRENT;
        return (
          <li key={step} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                done
                  ? "bg-primary text-primary-foreground"
                  : current
                    ? "bg-secondary text-secondary-foreground ring-2 ring-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={current ? "font-semibold" : done ? "" : "text-muted-foreground"}>{step}</span>
            {current && (
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">Etapa atual</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function LunaCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
      <img src={lunaPhoto} alt="Luna, uma cadela sem raça definida de porte pequeno" className="h-44 w-full object-cover sm:h-48" />
      <div className="flex flex-wrap items-start justify-between gap-4 p-5">
        <div>
          <h3 className="text-2xl">Luna</h3>
          <p className="text-sm text-muted-foreground">Cão sem raça definida de porte pequeno · 2 anos</p>
          <div className="mt-3 flex flex-wrap gap-2">{["Calma", "Carinhosa", "Ideal para apartamento"].map((tag) => <span key={tag} className="rounded-full bg-secondary px-2 py-1 text-xs">{tag}</span>)}</div>
          <Button variant="link" onClick={onOpen} className="mt-2 h-auto px-0">Ver perfil completo</Button>
        </div>
        <div className="rounded-2xl bg-primary px-4 py-3 text-center text-primary-foreground">
          <p className="text-2xl font-semibold leading-none">92%</p>
          <p className="mt-1 text-xs opacity-90">Compatibilidade</p>
        </div>
      </div>
    </div>
  );
}

function PlaceCards({ list, onSelect }: { list: Place[]; onSelect: (p: Place) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <div key={p.name} className="flex flex-col rounded-2xl bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-accent-deep">
            <p.icon className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-base">{p.name}</h3>
          <p className="text-sm text-muted-foreground">{p.kindLabel}</p>
          <p className="mt-1 text-sm text-muted-foreground">{p.distance}</p>
          <Button variant="ghost"
            onClick={() => onSelect(p)}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ver detalhes
          </Button>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const legacyUser = useDemoUser();
  const user = useSession();
  const demoUser = user ? { name: user.nome, initials: user.nome.slice(0, 1).toUpperCase() } : legacyUser;
  const { secao } = Route.useSearch();
  const [active, setActive] = useState<SectionId>(secao ?? "overview");
  const [place, setPlace] = useState<Place | null>(null);
  const [filter, setFilter] = useState<PlaceKind | "all">("all");
  const [editNote, setEditNote] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<"Dados da conta" | "Pedidos de adoção" | "Preferências">("Dados da conta");
  const [completedCare, setCompletedCare] = useState<string[]>([]);
  const [userPosition, setUserPosition] = useState<GeoPosition | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 10000 },
    );
  }, []);

  const filteredPlaces = (filter === "all" ? places : places.filter((p) => p.kind === filter))
    .map((p) => userPosition ? { ...p, distance: formatDistance(haversineKm(userPosition, p.position)) } : p)
    .sort((a, b) => userPosition ? haversineKm(userPosition, a.position) - haversineKm(userPosition, b.position) : 0);

  // O painel só é visível depois de entrar na demonstração.
  if (!demoUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navegação móvel */}
      <nav className="sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 lg:hidden">
        {nav.map((n) => (
          <Button variant="ghost"
            key={n.id}
            onClick={() => setActive(n.id)}
            aria-current={active === n.id ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active === n.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <n.icon className="h-3.5 w-3.5" /> {n.label}
          </Button>
        ))}
      </nav>

      <div className="flex w-full">
        {/* Barra lateral (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-border bg-card p-4 lg:flex">
          <div className="mb-6 flex items-center gap-2 px-2 pt-2 font-serif text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <PawPrint className="h-4 w-4" />
            </span>
            PataCerta
          </div>
          {nav.map((n) => (
            <Button variant="ghost"
              key={n.id}
              onClick={() => setActive(n.id)}
              aria-current={active === n.id ? "page" : undefined}
              className={`h-auto justify-start whitespace-normal flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                active === n.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Button>
          ))}
        </aside>

        <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6 xl:p-8">
          {/* Cabeçalho da secção */}
          <header className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl">{sectionTitles[active]}</h1>
            {demoUser.name && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label="Abrir menu do utilizador" className="flex shrink-0 items-center gap-3 rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <span className="max-w-40 break-words text-sm text-muted-foreground sm:max-w-64">{demoUser.name}</span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="max-w-64 break-words">{demoUser.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActive("overview")}>Painel</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActive("requests")}>Pedidos de adoção</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActive("profile")}>Perfil</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { signOut(); signOutDemo(); navigate({ to: "/" }); }}>Terminar sessão</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </header>

          {active === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="break-words text-xl sm:text-2xl">{demoUser.name ? `Bem-vindo de volta, ${demoUser.name}!` : "Olá!"}</h2>
                <div className="mt-4 grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-4">
                  {summary.map((s) => (
                    <div key={s.label} className="flex h-full flex-col rounded-2xl bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 sm:p-5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-accent-deep">
                        <s.icon className="h-4 w-4" />
                      </span>
                      <p className="mt-3 text-xs text-muted-foreground">{s.label}</p>
                      <p className="mt-0.5 text-base font-semibold sm:text-lg">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid items-stretch gap-4 md:grid-cols-2 md:auto-rows-fr 2xl:grid-cols-3">
                <div className="flex h-full flex-col">
                  <h2 className="mb-3 text-lg">O teu match</h2>
                  <LunaCard onOpen={() => setActive("pet")} />
                </div>
                <div className="flex h-full flex-col">
                  <h2 className="mb-3 flex items-center gap-2 text-lg"><Stethoscope size={18} className="text-accent-deep" /> Saúde da Luna</h2>
                  <HealthSummary heading={false} onOpen={() => setHealthOpen(true)} />
                </div>
                <div className="flex h-full flex-col md:col-span-2 2xl:col-span-1">
                  <h2 className="mb-3 text-lg">Progresso da adoção</h2>
                  <div className="flex-1 rounded-2xl bg-card p-5 shadow-soft">
                    <Timeline compact />
                    <Button variant="ghost"
                      onClick={() => setActive("application")}
                      className="mt-5 w-full rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90"
                    >
                      Ver pedido completo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-3"><h2 className="text-lg">Cuidados de hoje</h2><span className="text-xs text-muted-foreground" aria-live="polite">{completedCare.length} de {todayCare.length} concluídos</span></div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-all motion-reduce:transition-none" style={{ width: `${completedCare.length / todayCare.length * 100}%` }} /></div>
                  <ul className="mt-3 divide-y divide-border">{todayCare.map((item) => <li key={item.id}><label className="flex cursor-pointer items-center gap-3 py-3 text-sm"><Checkbox checked={completedCare.includes(item.id)} onCheckedChange={() => setCompletedCare((current) => toggleCare(current, item.id))} aria-label={item.label} /><span className={completedCare.includes(item.id) ? "text-muted-foreground line-through" : ""}>{item.label}</span><span className="ml-auto text-xs text-muted-foreground">{item.time}</span></label></li>)}</ul>
                </div>
                <div className="rounded-2xl bg-card p-5 shadow-soft">
                  <h2 className="text-lg">Próximos lembretes</h2>
                  <ul className="mt-4 divide-y divide-border text-sm">{["Consulta anual", "Reforço anual da vacinação", "Desparasitação"].map((label) => <li key={label} className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-accent-deep"><Clock size={17} /></span><div><p className="font-medium">{label}</p><p className="text-xs text-muted-foreground">15 de novembro de 2026</p></div></li>)}</ul>
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg">Locais pet-friendly perto de ti</h2>
                  <Button variant="ghost" onClick={() => setActive("places")} className="text-sm font-medium text-accent-deep hover:underline">
                    Ver mapa
                  </Button>
                </div>
                <PlaceCards list={places.slice(1)} onSelect={setPlace} />
              </div>
            </div>
          )}

          {active === "pet" && (
            <div className="space-y-8">
            <div className="grid gap-4 xl:grid-cols-5">
              <div className="xl:col-span-3">
                <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
                  <img src={lunaPhoto} alt="Luna, uma cadela sem raça definida de porte pequeno" className="h-64 w-full object-cover sm:h-80" />
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl">Luna</h2>
                        <p className="text-sm text-muted-foreground">Cão sem raça definida de porte pequeno · 2 anos</p>
                      </div>
                      <div className="rounded-2xl bg-primary px-4 py-3 text-center text-primary-foreground">
                        <p className="text-2xl font-semibold leading-none">92%</p>
                        <p className="mt-1 text-xs opacity-90">Compatibilidade</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Calma", "Carinhosa", "Ideal para apartamento"].map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                          <Sparkles className="h-3 w-3" /> {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      A Luna é uma cadela meiga de dois anos que adora manhãs tranquilas, janelas com sol e companhia
                      serena. Adapta-se rapidamente a novas rotinas, passeia bem com trela e sente-se perfeitamente
                      feliz num apartamento — desde que tenha os seus dois passeios diários e um colo quentinho ao
                      fim do dia.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                      <div className="rounded-xl bg-muted p-3">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Cake className="h-3.5 w-3.5" /> Idade</p>
                        <p className="mt-1 font-medium">2 anos</p>
                      </div>
                      <div className="rounded-xl bg-muted p-3">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Dog className="h-3.5 w-3.5" /> Tipo</p>
                        <p className="mt-1 font-medium">Sem raça definida, porte pequeno</p>
                      </div>
                      <div className="rounded-xl bg-muted p-3">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Building2 className="h-3.5 w-3.5" /> Instituição</p>
                        <p className="mt-1 font-medium">Associação Patinhas Felizes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-2">
                <div className="rounded-2xl bg-card p-5 shadow-soft">
                  <p className="text-sm font-semibold">Cuidados e necessidades</p>
                  <ul className="mt-4 space-y-3">
                    {careChecklist.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-secondary text-accent-deep">
                          <Check className="h-3 w-3" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl sm:text-2xl">Boletim de saúde e história da Luna</h2><HealthBadge /></div>
              <HealthRecord />
              <Button onClick={() => setHealthOpen(true)} variant="secondary" className="rounded-full"><FileText /> Ver histórico completo</Button>
            </section>
            </div>
          )}

          {active === "application" && (
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="rounded-2xl bg-card p-5 shadow-soft lg:col-span-3 sm:p-6">
                <h2 className="text-lg">Etapas da adoção</h2>
                <Timeline />
              </div>
              <div className="space-y-4 lg:col-span-2">
                <div className="rounded-2xl bg-card p-5 shadow-soft">
                  <p className="text-sm font-semibold">Instituição</p>
                  <p className="mt-3 flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-accent-deep" /> Associação Patinhas Felizes</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-accent-deep" /> Lisboa</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4 text-accent-deep" /> hello@patinhasfelizes.pt</p>
                </div>
              </div>
            </div>
          )}

          {active === "places" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <Button variant="ghost"
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      filter === f.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-soft hover:bg-secondary"
                    }`}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
              <GooglePlacesMap list={filteredPlaces} onSelect={setPlace} userPosition={userPosition} />
              <PlaceCards list={filteredPlaces} onSelect={setPlace} />
            </div>
          )}

          {active === "profile" && (
            <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
              <aside className="hidden md:block">
                <nav aria-label="Secções do perfil" className="space-y-1">
                  {(["Dados da conta", "Pedidos de adoção", "Preferências"] as const).map((label) => (
                    <Button key={label} variant="ghost" onClick={() => setProfileTab(label)} className={`h-auto w-full justify-start gap-3 whitespace-normal rounded-xl px-3 py-2.5 text-left text-sm ${profileTab === label ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                      {label}
                    </Button>
                  ))}
                </nav>
              </aside>
              <div className="min-w-0 space-y-6">
                {profileTab === "Pedidos de adoção" && (
                  <div className="space-y-3">
                    {[
                      { animal: "Luna", estado: "Aprovado", data: "12 de outubro de 2026" },
                      { animal: "Tobias", estado: "Em análise", data: "28 de outubro de 2026" },
                      { animal: "Mimi", estado: "Em análise", data: "30 de outubro de 2026" },
                    ].map((r) => (
                      <div key={r.animal} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-5 shadow-soft">
                        <div>
                          <p className="font-semibold">{r.animal}</p>
                          <p className="text-sm text-muted-foreground">Enviado a {r.data}</p>
                        </div>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{r.estado}</span>
                      </div>
                    ))}
                  </div>
                )}
                {profileTab === "Preferências" && (
                  <div className="divide-y divide-border">
                    {["Avisar-me por email quando o meu pedido for atualizado", "Mostrar-me novos animais compatíveis semanalmente", "Notificar-me de animais desaparecidos na minha zona"].map((label) => (
                      <label key={label} className="flex items-center gap-3 py-4 text-sm"><Checkbox defaultChecked className="h-4 w-4" /> {label}</label>
                    ))}
                  </div>
                )}
              <div className={profileTab === "Dados da conta" ? "" : "hidden"}>
                {demoUser.name && <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                    {demoUser.initials}
                  </span>
                  <div>
                    <h2 className="text-xl">{demoUser.name}</h2>
                  </div>
                </div>}
                <dl className="mt-6 divide-y divide-border">
                  {profile.filter((row) => row.label !== "Nome" || demoUser.name).map((row) => (
                    <div key={row.label} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-accent-deep">
                        <row.icon className="h-4 w-4" />
                      </span>
                      <dt className="w-32 text-muted-foreground">{row.label}</dt>
                      <dd className="break-words font-medium">{row.label === "Nome" ? demoUser.name : row.value}</dd>
                    </div>
                  ))}
                </dl>
                <Button variant="ghost"
                  onClick={() => setEditNote(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Pencil className="h-4 w-4" /> Editar perfil
                </Button>
                {editNote && (
                  <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                    A edição do perfil estará disponível em breve.
                  </p>
                )}
              </div>
              </div>
              </div>
          )}
        </main>
      </div>

      <HealthModal open={healthOpen} onOpenChange={setHealthOpen} />
      <Dialog open={!!place} onOpenChange={(o) => !o && setPlace(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{place?.name}</DialogTitle>
            <DialogDescription>
              {place?.kindLabel}, {place?.distance}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-accent-deep" /> {place?.address}
            </p>
            <p className="text-xs text-muted-foreground">Horário: por confirmar.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
