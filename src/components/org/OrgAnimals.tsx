import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LayoutGrid, PawPrint, Table2, Trash2 } from "lucide-react";
import { saveWorkspace } from "@/lib/pets.functions";
import { missingForPublication, unconfirmedFields } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { InstitutionPublisher } from "@/components/InstitutionPublisher";
import {
  field,
  PET_STATUS,
  petName,
  petPhoto,
  petProfile,
  waitingDays,
  type Data,
  type Pet,
} from "./shared";

type Sort = "name" | "age" | "published" | "waiting";

export function OrgAnimals({
  data,
  pets,
  reload,
  focusForm,
}: {
  data: Data;
  pets: Pet[];
  reload: () => void;
  focusForm: number;
}) {
  const save = useServerFn(saveWorkspace);
  const [q, setQ] = useState("");
  const [species, setSpecies] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<Sort>("waiting");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [edit, setEdit] = useState<{ pet: Pet; n: number } | null>(null);
  const [notice, setNotice] = useState("");

  const list = useMemo(() => {
    const filtered = pets.filter((p) => {
      const prof = petProfile(p);
      return (
        (!statusFilter || p.status === statusFilter) &&
        (!species || prof["species"] === species) &&
        petName(p).toLowerCase().includes(q.toLowerCase())
      );
    });
    const by: Record<Sort, (a: Pet, b: Pet) => number> = {
      name: (a, b) => petName(a).localeCompare(petName(b), "pt-PT"),
      age: (a, b) =>
        Number(petProfile(a)["ageYears"] ?? 999) - Number(petProfile(b)["ageYears"] ?? 999),
      published: (a, b) => b.created_at.localeCompare(a.created_at),
      waiting: (a, b) => waitingDays(b.created_at) - waitingDays(a.created_at),
    };
    return [...filtered].sort(by[sort]);
  }, [pets, q, species, statusFilter, sort]);

  async function setStatus(id: string, next: "draft" | "published" | "paused" | "adopted") {
    setNotice("");
    try {
      await save({ data: { action: "petStatus", id, status: next } });
      setNotice(`Estado alterado para «${PET_STATUS[next]}».`);
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível alterar.");
    }
  }

  async function remove(p: Pet) {
    const apps = data.applications.filter((a) => a.animal_id === p.id).length;
    const warning =
      apps > 0
        ? `Eliminar o perfil de ${petName(p)}? Existem ${apps} ${apps === 1 ? "candidatura associada" : "candidaturas associadas"}, que deixam de mostrar este perfil. Esta ação não pode ser anulada.`
        : `Eliminar o perfil de ${petName(p)}? Esta ação não pode ser anulada.`;
    if (!window.confirm(warning)) return;
    setNotice("");
    try {
      await save({ data: { action: "petDelete", id: p.id } });
      setNotice(`Perfil de ${petName(p)} eliminado.`);
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível eliminar.");
    }
  }

  const actions = (p: Pet) => {
    const missing = missingForPublication(petProfile(p));
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setEdit({ pet: p, n: Date.now() })}>
          Editar
        </Button>
        {p.status !== "published" && p.status !== "adopted" && missing.length === 0 && (
          <Button size="sm" onClick={() => setStatus(p.id, "published")}>
            Publicar
          </Button>
        )}
        {p.status === "published" && (
          <Button variant="outline" size="sm" onClick={() => setStatus(p.id, "paused")}>
            Pausar
          </Button>
        )}
        {p.status === "paused" && (
          <Button variant="outline" size="sm" onClick={() => setStatus(p.id, "published")}>
            Retomar
          </Button>
        )}
        {p.status !== "adopted" && p.status !== "draft" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm(`Marcar ${petName(p)} como adotado?`)) setStatus(p.id, "adopted");
            }}
          >
            Marcar como adotado
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => remove(p)}
          aria-label={`Eliminar ${petName(p)}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Eliminar
        </Button>
      </div>
    );
  };

  return (
    <section className="org-animals">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl">Os meus animais</h2>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1" role="group" aria-label="Modo de visualização">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden /> Grelha
          </Button>
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
          >
            <Table2 className="h-4 w-4" aria-hidden /> Tabela
          </Button>
        </div>
      </div>

      <div className="org-filters mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          Pesquisa por nome
          <input className={field} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="text-sm">
          Espécie
          <select className={field} value={species} onChange={(e) => setSpecies(e.target.value)}>
            <option value="">Todas</option>
            <option value="cão">Cão</option>
            <option value="gato">Gato</option>
          </select>
        </label>
        <label className="text-sm">
          Estado
          <select className={field} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(PET_STATUS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Ordenar por
          <select className={field} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="waiting">Tempo de espera</option>
            <option value="name">Nome</option>
            <option value="age">Idade</option>
            <option value="published">Data de publicação</option>
          </select>
        </label>
      </div>
      <p role="status" className="mt-3 text-sm">
        {notice}
      </p>

      {list.length === 0 ? (
        <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Sem perfis para mostrar. Cria o primeiro perfil no formulário abaixo.
        </p>
      ) : view === "grid" ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const prof = petProfile(p);
            const photo = petPhoto(p);
            const apps = data.applications.filter((a) => a.animal_id === p.id).length;
            const missing = missingForPublication(prof);
            const unconfirmed = unconfirmedFields(prof);
            return (
              <li
                key={p.id}
                className="org-pet-card overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                {photo ? (
                  <img src={photo} alt={petName(p)} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="grid h-44 w-full place-items-center bg-secondary">
                    <PawPrint className="h-10 w-10 text-muted-foreground" aria-hidden />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-xl">{petName(p)}</h3>
                    <span className="org-status" data-status={p.status}>{PET_STATUS[p.status] ?? p.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {prof["ageYears"] != null ? `${prof["ageYears"]} anos · ` : ""}
                    {apps} {apps === 1 ? "candidatura" : "candidaturas"} · à espera há{" "}
                    {waitingDays(p.created_at)} dias
                  </p>
                  {missing.length > 0 && (
                    <p className="mt-2 text-sm text-destructive">
                      Falta para publicar: {missing.join(", ")}
                    </p>
                  )}
                  {unconfirmed.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Por confirmar: {unconfirmed.join(", ")}
                    </p>
                  )}
                  <div className="mt-3">{actions(p)}</div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th className="p-3">Animal</th>
                <th className="p-3">Idade</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Candidaturas</th>
                <th className="p-3">Espera</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((p) => {
                const prof = petProfile(p);
                const apps = data.applications.filter((a) => a.animal_id === p.id).length;
                return (
                  <tr key={p.id}>
                    <td className="p-3">
                      <span className="flex items-center gap-3">
                        {petPhoto(p) ? (
                          <img
                            src={petPhoto(p)}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
                            <PawPrint className="h-4 w-4 text-muted-foreground" aria-hidden />
                          </span>
                        )}
                        <span className="font-medium">{petName(p)}</span>
                      </span>
                    </td>
                    <td className="p-3">{prof["ageYears"] != null ? `${prof["ageYears"]} anos` : "Por confirmar"}</td>
                    <td className="p-3">{PET_STATUS[p.status] ?? p.status}</td>
                    <td className="p-3">{apps}</td>
                    <td className="p-3">{waitingDays(p.created_at)} dias</td>
                    <td className="p-3">{actions(p)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div key={focusForm}>
        <InstitutionPublisher
          institutions={data.institutions}
          pets={pets}
          reload={reload}
          editRequest={edit}
          hideList
        />
      </div>
    </section>
  );
}
