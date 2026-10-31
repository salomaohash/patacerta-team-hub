import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  PawPrint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchRing } from "@/components/MatchRing";
import {
  animalsNeedingAttention,
  attentionAlerts,
  greeting,
} from "@/lib/organization";
import {
  animalName,
  APP_STATUS,
  fmtDate,
  matchFor,
  petPhoto,
  waitingDays,
  type Data,
  type Pet,
  type Section,
} from "./shared";

export function OrgOverview({
  data,
  pets,
  institutionName,
  go,
  openApplication,
}: {
  data: Data;
  pets: Pet[];
  institutionName: string;
  go: (s: Section) => void;
  openApplication: (id: string) => void;
}) {
  const published = pets.filter((p) => p.status === "published");
  const pending = data.applications.filter((a) => a.status === "received").length;
  const now = new Date();
  const interviews = data.calendarEvents.filter(
    (e) =>
      e.status === "scheduled" &&
      ["interview", "visit"].includes(e.kind) &&
      new Date(e.starts_at) >= now,
  ).length;
  const adopted = pets.filter((p) => p.status === "adopted").length;
  const longest = published
    .map((p) => ({ p, days: waitingDays(p.created_at) }))
    .sort((a, b) => b.days - a.days)[0];
  const alerts = attentionAlerts(pets, data.applications, data.checkins, data.calendarEvents);
  const recent = [...data.applications]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);
  const attention = animalsNeedingAttention(pets, data.applications).slice(0, 3);

  const stats = [
    { label: "Animais disponíveis", value: published.length, icon: PawPrint, go: () => go("animais") },
    { label: "Candidaturas pendentes", value: pending, icon: AlertCircle, go: () => go("candidaturas") },
    { label: "Entrevistas agendadas", value: interviews, icon: CalendarClock, go: () => go("calendario") },
    { label: "Adoções concluídas", value: adopted, icon: CheckCircle2, go: () => go("acompanhamento") },
    {
      label: longest ? `À espera há mais tempo · ${petNameLabel(longest.p, data)}` : "À espera há mais tempo",
      value: longest ? `${longest.days}d` : "—",
      icon: Clock,
      go: () => go("animais"),
    },
  ];

  return (
    <>
      <header className="org-page-heading mb-8">
        <h2 className="text-3xl sm:text-4xl">
          {greeting()}, {institutionName}
        </h2>
        <p className="mt-2 text-muted-foreground">
          Aqui está o resumo da atividade da tua associação.
        </p>
      </header>

      <ul className="org-stats grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label}>
            <Button variant="ghost"
              onClick={s.go}
              className="org-stat h-full w-full rounded-xl border border-border bg-card px-4 py-5 text-left shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="org-stat-top"><s.icon className="h-4 w-4 text-accent-deep" aria-hidden /><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /></span>
              <span className="mt-3 block font-sans text-3xl font-semibold">{s.value}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{s.label}</span>
            </Button>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <h3 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
          Precisa da tua atenção
        </h3>
        {alerts.length === 0 ? (
          <p className="mt-4 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Está tudo em dia. Não há alertas pendentes.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {alerts.map((a) => (
              <li key={a.kind}>
                <Button variant="ghost"
                  onClick={() => go(a.section)}
                  className="org-alert flex h-full w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>
                    <span className="block font-medium">{a.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{a.detail}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-accent-deep" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
            Candidaturas recentes
          </h3>
          <Button variant="link"
            onClick={() => go("candidaturas")}
            className="text-sm font-medium text-accent-deep hover:underline"
          >
            Ver todas
          </Button>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Ainda não há candidaturas. Quando alguém se candidatar a um perfil publicado, aparece
            aqui.
          </p>
        ) : (
          <ul className="org-recent-list mt-4 divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
            {recent.map((a) => {
              const pet = data.pets.find((p) => p.id === a.animal_id);
              const photo = petPhoto(pet);
              const match = matchFor(a, data);
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-4 p-4">
                  {photo ? (
                    <img
                      src={photo}
                      alt={animalName(a.animal_id, data)}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-lg bg-secondary">
                      <PawPrint className="h-6 w-6 text-muted-foreground" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 font-medium">
                      <Badge variant="secondary">{APP_STATUS[a.status] ?? a.status}</Badge>
                      <span>{animalName(a.animal_id, data)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Candidatura de {fmtDate(a.created_at)}
                    </p>
                  </div>
                  {match && <MatchRing value={match.score} size={52} />}
                  <Button variant="outline" size="sm" onClick={() => openApplication(a.id)}>
                    Ver candidatura
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
            Animais que precisam de atenção
          </h3>
          <Button variant="link"
            onClick={() => go("animais")}
            className="text-sm font-medium text-accent-deep hover:underline"
          >
            Ver todos os animais
          </Button>
        </div>
        {attention.length === 0 ? (
          <p className="mt-4 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Nenhum animal precisa de atenção especial de momento.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {attention.map((a) => {
              const pet = pets.find((p) => p.id === a.petId);
              const photo = petPhoto(pet);
              return (
                <li
                  key={a.petId}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {photo ? (
                      <img
                        src={photo}
                        alt={petNameLabel(pet, data)}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-lg bg-secondary">
                        <PawPrint className="h-5 w-5 text-muted-foreground" aria-hidden />
                      </span>
                    )}
                    <p className="font-medium">{petNameLabel(pet, data)}</p>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {a.reasons.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => go("animais")}
                  >
                    Rever perfil
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

function petNameLabel(p: Pet | undefined, data: Data): string {
  if (!p) return "Animal";
  return animalName(p.id, data);
}
