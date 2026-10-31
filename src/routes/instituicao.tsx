import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  PawPrint,
  ClipboardList,
  CalendarDays,
  HeartHandshake,
  Sparkles,
  Building2,
  Settings,
  Plus,
  Bell,
  BadgeCheck,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";
import { workspace } from "@/lib/pets.functions";
import { institutionDemo, showsInstitutionDemo } from "@/lib/institution-demo";
import { attentionAlerts } from "@/lib/organization";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "@/lib/state/session";
import { useDemoUser } from "@/lib/demo-session";
import { OrgOverview } from "@/components/org/OrgOverview";
import { OrgLiveActivity } from "@/components/org/OrgLiveActivity";
import { OrgAnimals } from "@/components/org/OrgAnimals";
import { OrgKanban } from "@/components/org/OrgKanban";
import { OrgCalendar } from "@/components/org/OrgCalendar";
import { OrgFollowUp } from "@/components/org/OrgFollowUp";
import { OrgIntelligence } from "@/components/org/OrgIntelligence";
import { OrgProfile } from "@/components/org/OrgProfile";
import { InstitutionPublisher } from "@/components/InstitutionPublisher";
import { APP_STATUS, PET_STATUS, type Section } from "@/components/org/shared";

const sections = [
  "geral",
  "animais",
  "candidaturas",
  "calendario",
  "acompanhamento",
  "intelligence",
  "perfil",
  "definicoes",
] as const;
const search = z.object({
  secao: z.enum(sections).catch("geral"),
  candidatura: z.string().optional(),
  novo: z.string().optional(),
});

export const Route = createFileRoute("/instituicao")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Área da instituição — PataCerta" },
      {
        name: "description",
        content: "Gere animais, candidaturas e acompanhamentos da tua instituição num só lugar.",
      },
      { property: "og:title", content: "Área da instituição — PataCerta" },
      {
        property: "og:description",
        content: "Gestão de animais, candidaturas e acompanhamento pós-adoção.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Data = Awaited<ReturnType<typeof workspace>>;
const nav: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "geral", label: "Visão geral", icon: LayoutDashboard },
  { id: "animais", label: "Os meus animais", icon: PawPrint },
  { id: "candidaturas", label: "Candidaturas", icon: ClipboardList },
  { id: "calendario", label: "Calendário", icon: CalendarDays },
  { id: "acompanhamento", label: "Acompanhamento", icon: HeartHandshake },
  { id: "intelligence", label: "PataCerta Intelligence", icon: Sparkles },
  { id: "perfil", label: "Perfil da organização", icon: Building2 },
  { id: "definicoes", label: "Definições", icon: Settings },
];

function Dashboard() {
  const sessionUser = useSession();
  const demoUserOnly = useDemoUser();
  const user = sessionUser ?? (demoUserOnly ? { nome: demoUserOnly.name, name: demoUserOnly.name, email: "", papel: demoUserOnly.papel, role: demoUserOnly.papel === "associacao" ? "association" : "adopter" } : null);
  const isDemo = showsInstitutionDemo(user);
  const [demoData] = useState(() => institutionDemo());
  const { secao, candidatura, novo } = Route.useSearch();
  const navigate = useNavigate({ from: "/instituicao" });
  const fetchWorkspace = useServerFn(workspace);
  const [realData, setData] = useState<Data | null>(null);
  const data = isDemo ? demoData : realData;
  const [error, setError] = useState("");
  const reload = useCallback(() => {
    if (!user?.id || user.isDemo) return;
    setError("");
    fetchWorkspace()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Não foi possível carregar."));
  }, [user?.id, user?.isDemo, fetchWorkspace]);
  useEffect(reload, [reload]);
  const go = (s: Section) => navigate({ search: { secao: s } });
  const addAnimal = () =>
    navigate({ search: { secao: "animais", novo: String(Date.now()) } });

  const institution = data?.institutions[0];
  const ownPets = data ? data.pets.filter((p) => p.owner_id === data.userId) : [];
  const teamApps = data
    ? data.applications.filter((a) => a.institution_id === institution?.id)
    : [];
  const teamData = data ? { ...data, applications: teamApps } : null;
  const alerts =
    teamData && institution
      ? attentionAlerts(ownPets, teamApps, data?.checkins ?? [], data?.calendarEvents ?? [])
      : [];

  const NavButton = ({ n }: { n: (typeof nav)[number] }) => (
    <Button
      variant="ghost"
      onClick={() => go(n.id)}
      aria-current={secao === n.id ? "page" : undefined}
      className={`org-nav-item flex w-auto shrink-0 items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full ${
        secao === n.id ? "bg-secondary font-medium text-accent-deep" : "text-foreground"
      }`}
    >
      <n.icon className="h-5 w-5" aria-hidden />
      <span>{n.label}</span>
    </Button>
  );

  return (
    <main className="org-dashboard grid min-h-[calc(100vh-77px)] lg:grid-cols-[244px_1fr]">
      <aside className="org-sidebar min-w-0 border-b border-border bg-sidebar lg:border-b-0 lg:border-r">
        <div className="org-workspace flex items-center gap-3 border-b border-border px-5 py-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-accent-deep">
            <Building2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Instituição</span>
            <span className="block truncate font-medium">
              {institution?.name ?? "Por configurar"}
            </span>
          </span>
        </div>
        <div className="org-sidebar-action p-4">
          <Button onClick={addAnimal} className="w-auto lg:w-full">
            <Plus className="h-4 w-4" aria-hidden /> Adicionar animal
          </Button>
        </div>
        <nav aria-label="Secções da instituição" className="org-nav flex gap-1 overflow-x-auto p-3 pt-0 lg:flex-col">
          {nav.map((n) => (
            <NavButton key={n.id} n={n} />
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="org-topbar flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="org-breadcrumb text-xs text-muted-foreground">Instituição</span>
            <ChevronRight className="org-breadcrumb h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <h1 className="truncate font-sans text-sm font-medium">
              {nav.find((n) => n.id === secao)?.label ?? "Visão geral"}
            </h1>
            {institution?.verified && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-accent-deep">
                <BadgeCheck className="h-4 w-4" aria-hidden /> Organização verificada
              </span>
            )}
          </div>

          {institution && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Notificações">
                  <Bell className="h-4 w-4" aria-hidden />
                  {alerts.length > 0 && (
                    <span className="rounded-full bg-accent-deep px-1.5 text-xs text-primary-foreground">
                      {alerts.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 max-h-80 overflow-y-auto">
                <p className="text-sm font-medium">Notificações</p>
                {alerts.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Está tudo em dia. Não há alertas pendentes.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {alerts.map((a) => (
                      <li key={a.kind}>
                        <Button variant="ghost"
                          onClick={() => go(a.section)}
                          className="w-full rounded-lg p-2 text-left text-sm hover:bg-accent"
                        >
                          <span className="block font-medium">{a.title}</span>
                          <span className="block text-xs text-muted-foreground">{a.detail}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </PopoverContent>
            </Popover>
          )}

          {isDemo ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/entrar">Iniciar sessão</Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"
                  aria-label="Menu da conta"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar>
                    <AvatarFallback>
                      {(user?.name ?? "C").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block font-medium">{user?.name}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/painel">Painel pessoal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={async () => {
                    await signOut();
                    navigate({ to: "/entrar" });
                  }}
                >
                  <LogOut className="h-4 w-4" aria-hidden /> Terminar sessão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        <div className="org-content px-4 py-7 sm:px-8">
          {isDemo && (
            <div className="org-demo-notice mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-accent-deep">Demonstração</strong> · Dados fictícios, sem
                alterações a registos reais.
              </p>
              <Link to="/entrar" className="text-sm text-accent-deep underline">
                Iniciar sessão
              </Link>
            </div>
          )}
          {error && (
            <p role="alert" className="text-destructive">
              {error}{" "}
              <Button variant="outline" onClick={reload}>
                Tentar novamente
              </Button>
            </p>
          )}
          {!data && !error && (
            <div className="space-y-4" role="status" aria-label="A carregar o painel">
              <Skeleton className="h-10 w-64" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-40 rounded-xl" />
            </div>
          )}
          {data && !institution && !isDemo && (
            <div>
              <h2 className="text-2xl">Bem-vindo à área da instituição</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cria a ficha da tua organização para começar a publicar animais e gerir
                candidaturas.
              </p>
              <InstitutionPublisher institutions={[]} pets={[]} reload={reload} />
            </div>
          )}
          {data && institution && teamData && (
            <div className="org-section" key={secao}>
              {secao === "geral" && (
                <>
                  <OrgOverview
                    data={teamData}
                    pets={ownPets}
                    institutionName={institution.name}
                    go={go}
                    openApplication={(id) =>
                      isDemo
                        ? undefined
                        : navigate({ search: { secao: "candidaturas", candidatura: id } })
                    }
                  />
                  {isDemo && <OrgLiveActivity />}
                </>
              )}
              {secao === "animais" &&
                (isDemo ? (
                  <DemoRecords data={data} kind="pets" />
                ) : (
                  <OrgAnimals
                    data={data}
                    pets={ownPets}
                    reload={reload}
                    focusForm={novo ? Number(novo) : 0}
                  />
                ))}
              {secao === "candidaturas" && (
                <OrgKanban
                  data={teamData}
                  reload={reload}
                  readOnly={isDemo}
                  selected={candidatura ?? null}
                  onClose={() => navigate({ search: { secao: "candidaturas" } })}
                />
              )}
              {secao === "calendario" && (
                <OrgCalendar data={teamData} reload={reload} readOnly={isDemo} />
              )}
              {secao === "acompanhamento" && (
                <OrgFollowUp data={teamData} reload={reload} readOnly={isDemo} />
              )}
              {secao === "intelligence" && (
                <OrgIntelligence data={teamData} pets={ownPets} go={go} />
              )}
              {secao === "perfil" &&
                (isDemo ? (
                  <section>
                    <h2 className="text-2xl">Perfil da organização</h2>
                    <p className="mt-4">{institution.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Demonstração · Inicia sessão para gerir o perfil da tua organização.
                    </p>
                  </section>
                ) : (
                  <OrgProfile institution={institution} reload={reload} />
                ))}
              {secao === "definicoes" && (
                <section>
                  <h2 className="text-2xl">Definições</h2>
                  <h3 className="mt-6 text-xl">Membros e permissões</h3>
                  <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                    De momento, cada instituição tem uma única conta responsável. A gestão de
                    vários membros com permissões diferentes ainda não está disponível.
                  </p>
                  <h3 className="mt-8 text-xl">Dados e privacidade</h3>
                  <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                    As notas internas e os registos das candidaturas só são visíveis para a tua
                    conta. Os dados dos candidatos nunca são partilhados com outras organizações.
                  </p>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function DemoRecords({ data, kind }: { data: Data; kind: "pets" | "applications" }) {
  return (
    <section className="org-animal-list">
      <div className="flex items-center justify-between gap-3"><h2 className="text-2xl">{kind === "pets" ? "Os meus animais" : "Candidaturas"}</h2><span className="text-sm text-muted-foreground">{kind === "pets" ? data.pets.length : data.applications.length} registos</span></div>
      <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
        {(kind === "pets" ? data.pets : data.applications).map((row) => {
          const pet = "profile" in row ? row : data.pets.find((p) => p.id === row.animal_id);
          const profile = pet?.profile as Record<string, unknown> | undefined;
          return (
            <li key={row.id} className="org-animal-row flex flex-wrap items-center gap-4 px-5 py-4">
              {typeof profile?.["photo"] === "string" && (
                <img
                  src={profile["photo"]}
                  alt={String(profile["name"] ?? "Animal")}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-xl">{String(profile?.["name"] ?? "Animal")}</h3>
                <p className="text-sm text-muted-foreground">
                  Demonstração
                </p>
                {!("profile" in row) && (
                  <p className="mt-1 text-sm text-muted-foreground">{row.next_step}</p>
                )}
              </div>
              <span className="org-status" data-status={row.status}>{PET_STATUS[row.status] ?? APP_STATUS[row.status] ?? row.status}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
