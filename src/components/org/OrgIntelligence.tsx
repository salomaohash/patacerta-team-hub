import { Lightbulb, PawPrint, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animalsNeedingAttention, intelligence } from "@/lib/organization";
import { EvolutionSection } from "@/components/InstitutionMetrics";
import {
  animalName,
  petPhoto,
  type Data,
  type Pet,
  type Section,
} from "./shared";

export function OrgIntelligence({
  data,
  pets,
  go,
}: {
  data: Data;
  pets: Pet[];
  go: (s: Section) => void;
}) {
  const m = intelligence(pets, data.applications, data.checkins);
  const attention = animalsNeedingAttention(pets, data.applications);

  const cards = [
    { label: "Animais publicados", value: m.totalPublished },
    { label: "Adoções concretizadas", value: m.totalAdopted },
    { label: "Candidaturas recebidas", value: m.applicationsReceived },
    {
      label: "Conversão em adoções",
      value: m.conversionRate === null ? "—" : `${m.conversionRate}%`,
      hint: m.conversionRate === null ? "Sem candidaturas concluídas suficientes." : undefined,
    },
    {
      label: "Tempo médio até à adoção",
      value: m.averageWaitDays === null ? "—" : `${m.averageWaitDays} dias`,
      hint:
        m.averageWaitDays === null
          ? "Dados insuficientes — é preciso pelo menos 3 adoções com datas registadas."
          : undefined,
    },
    { label: "Animais séniores adotados", value: m.seniorAdopted },
    { label: "Com necessidades especiais adotados", value: m.specialNeedsAdopted },
    { label: "Acompanhamentos concluídos", value: m.followupsCompleted },
  ];

  return (
    <section className="org-intelligence">
      <h2 className="text-2xl">PataCerta Intelligence</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Indicadores calculados a partir dos registos da tua organização. Nada é estimado ou
        inventado — quando não há dados suficientes, o indicador fica em branco.
      </p>

      <ul className="org-insight-stats mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <li
            key={c.label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
            title={c.hint}
          >
            <span className="block font-sans text-3xl font-semibold">{c.value}</span>
            <span className="mt-1 block text-sm text-muted-foreground">{c.label}</span>
            {c.hint && <span className="mt-1 block text-xs text-muted-foreground">{c.hint}</span>}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <EvolutionSection data={data} />
      </div>

      <section className="mt-10">
        <h3 className="flex items-center gap-2 font-sans text-sm font-medium uppercase tracking-[0.16em]">
          <TrendingUp className="h-5 w-5" aria-hidden /> Animais que precisam da tua atenção
        </h3>
        {attention.length === 0 ? (
          <p className="mt-4 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Nenhum animal precisa de atenção especial de momento.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {attention.map((a) => {
              const pet = pets.find((p) => p.id === a.petId);
              const photo = pet ? petPhoto(pet) : "";
              return (
                <li
                  key={a.petId}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    {photo ? (
                      <img
                        src={photo}
                        alt={pet ? animalName(pet.id, data) : "Animal"}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="grid h-14 w-14 place-items-center rounded-lg bg-secondary">
                        <PawPrint className="h-6 w-6 text-muted-foreground" aria-hidden />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xl">{pet ? animalName(pet.id, data) : "Animal"}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.waitingDays} dias à espera · {a.applications}{" "}
                        {a.applications === 1 ? "candidatura" : "candidaturas"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => go("animais")}>
                      Abrir perfil
                    </Button>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {a.reasons.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-accent-deep" aria-hidden />
                    <span className="font-medium">Sugestões:</span>
                    {a.actions.map((action) => (
                      <span
                        key={action}
                        className="rounded-full bg-secondary px-3 py-1 text-xs"
                      >
                        {action}
                      </span>
                    ))}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          As sugestões são orientações baseadas nos dados do perfil, não garantias de resultado.
        </p>
      </section>
    </section>
  );
}
