import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveWorkspace, workspace } from "@/lib/pets.functions";
import { Button } from "./ui/button";
import { AiAssistance } from "./AiAssistance";
type Institution = Awaited<ReturnType<typeof workspace>>["institutions"][number];
type Pet = Awaited<ReturnType<typeof workspace>>["pets"][number];
const field = "mt-1 w-full rounded-lg border border-input bg-card p-3 text-sm";
const blank = {
  name: "",
  species: "cão" as "cão" | "gato",
  breed: "",
  ageYears: null as number | null,
  size: null as "pequeno" | "médio" | "grande" | null,
  energy: null as "baixa" | "média" | "alta" | null,
  goodWithKids: null as boolean | null,
  goodWithPets: null as boolean | null,
  apartmentOk: null as boolean | null,
  careComplexity: null as "baixa" | "média" | "alta" | null,
  description: "",
  photo: "",
  dataSource: "",
  careNotes: "",
};
export function InstitutionPublisher({
  institutions,
  pets,
  reload,
  editRequest,
  hideList = false,
}: {
  institutions: Institution[];
  pets: Pet[];
  reload: () => void;
  editRequest?: { pet: Pet; n: number } | null;
  hideList?: boolean;
}) {
  const save = useServerFn(saveWorkspace);
  const [institutionName, setInstitutionName] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [faq, setFaq] = useState("");
  const [profile, setProfile] = useState(blank);
  const [id, setId] = useState<string | undefined>();
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [step, setStep] = useState(0);
  const institution = institutions[0];
  useEffect(() => {
    if (!editRequest) return;
    setId(editRequest.pet.id);
    setProfile({ ...blank, ...(editRequest.pet.profile as typeof blank) });
    setReviewed(false);
    setStep(0);
  }, [editRequest]);
  async function institutionSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await save({ data: { action: "institution", name: institutionName, city, contact, faq } });
      reload();
      setNotice("Instituição guardada.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }
  async function persist(status: "draft" | "published") {
    if (!institution) return;
    setBusy(true);
    try {
      await save({
        data: { action: "pet", id, institutionId: institution.id, status, profile, reviewed },
      });
      setNotice(
        status === "draft"
          ? "Rascunho guardado. Podes completá-lo mais tarde."
          : "Perfil publicado no catálogo.",
      );
      setId(undefined);
      setProfile(blank);
      setReviewed(false);
      setStep(0);
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }
  if (!institution)
    return (
      <section className="mt-8">
        <h2 className="text-2xl">Ficha da instituição</h2>
        <form onSubmit={institutionSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            Nome da instituição
            <input
              required
              minLength={2}
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className={field}
            />
          </label>
          <label>
            Localidade
            <input value={city} onChange={(e) => setCity(e.target.value)} className={field} />
          </label>
          <label>
            Contacto público
            <input value={contact} onChange={(e) => setContact(e.target.value)} className={field} />
          </label>
          <label>
            Perguntas frequentes
            <textarea value={faq} onChange={(e) => setFaq(e.target.value)} className={field} />
          </label>
          <Button type="submit" disabled={busy}>
            Guardar instituição
          </Button>
        </form>
        <p role="status" className="mt-3 text-sm">
          {notice}
        </p>
      </section>
    );
  return (
    <section className="mt-8">
      <p className="eyebrow">
        {institution.name} · {institution.city}
      </p>
      <h2 className="mt-3 text-3xl">
        {id ? `Editar ${profile.name || "perfil"}` : "Criar perfil de animal"}
      </h2>
      {id && (
        <Button
          variant="ghost"
          className="mt-2"
          onClick={() => {
            setId(undefined);
            setProfile(blank);
          }}
        >
          Cancelar edição e criar novo
        </Button>
      )}
      <p className="mt-2 text-sm text-muted-foreground">
        Contacto: {institution.contact || "por indicar"}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {["Identificação", "Necessidades", "Descrição e revisão"].map((label, i) => (
          <Button
            key={label}
            variant={step === i ? "secondary" : "ghost"}
            onClick={() => setStep(i)}
          >
            {i + 1}. {label}
          </Button>
        ))}
      </div>
      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          persist("published");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {step === 0 && (
            <>
              <label>
                Nome
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className={field}
                />
              </label>
              <label>
                Espécie
                <select
                  className={field}
                  value={profile.species}
                  onChange={(e) =>
                    setProfile({ ...profile, species: e.target.value as "cão" | "gato" })
                  }
                >
                  <option>cão</option>
                  <option>gato</option>
                </select>
              </label>
              <label>
                Idade (anos) · deixa vazio se desconhecida
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={profile.ageYears ?? ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      ageYears: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className={field}
                />
              </label>
              <label>
                Raça · se conhecida
                <input
                  value={profile.breed}
                  onChange={(e) => setProfile({ ...profile, breed: e.target.value })}
                  className={field}
                />
              </label>
              <label className="sm:col-span-2">
                Ligação HTTPS da fotografia
                <input
                  type="url"
                  value={profile.photo}
                  onChange={(e) => setProfile({ ...profile, photo: e.target.value })}
                  className={field}
                />
              </label>
            </>
          )}
          {step === 1 && (
            <>
              {(["size", "energy", "careComplexity"] as const).map((k) => (
                <label key={k}>
                  {k === "size"
                    ? "Porte"
                    : k === "energy"
                      ? "Energia"
                      : "Complexidade dos cuidados"}
                  <select
                    className={field}
                    value={profile[k] ?? ""}
                    onChange={(e) => setProfile({ ...profile, [k]: e.target.value || null })}
                  >
                    <option value="">Por confirmar</option>
                    {(k === "size"
                      ? ["pequeno", "médio", "grande"]
                      : ["baixa", "média", "alta"]
                    ).map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              ))}
              {(["goodWithKids", "goodWithPets", "apartmentOk"] as const).map((k) => (
                <label key={k}>
                  {k === "goodWithKids"
                    ? "Convívio com crianças"
                    : k === "goodWithPets"
                      ? "Convívio com animais"
                      : "Adequação a apartamento"}
                  <select
                    className={field}
                    value={profile[k] === null ? "" : String(profile[k])}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        [k]: e.target.value === "" ? null : e.target.value === "true",
                      })
                    }
                  >
                    <option value="">Por confirmar</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </label>
              ))}
              <label className="sm:col-span-2">
                Necessidades, dificuldades e preparação indicadas
                <textarea
                  value={profile.careNotes}
                  onChange={(e) => setProfile({ ...profile, careNotes: e.target.value })}
                  className={field}
                />
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <label className="sm:col-span-2">
                Descrição ou notas da equipa
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className={`${field} min-h-36`}
                />
              </label>
              <div className="sm:col-span-2">
                <AiAssistance
                  kind="description"
                  source={JSON.stringify(profile, null, 2)}
                  onAccept={(text) => setProfile({ ...profile, description: text })}
                />
              </div>
              <label className="sm:col-span-2">
                Origem dos dados e campos por confirmar
                <textarea
                  value={profile.dataSource}
                  onChange={(e) => setProfile({ ...profile, dataSource: e.target.value })}
                  placeholder="Indica quem observou ou forneceu cada informação; só menciona confirmação profissional se existir."
                  className={field}
                />
              </label>
              <label className="flex items-start gap-3 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={(e) => setReviewed(e.target.checked)}
                />
                Revi os dados, a descrição e a origem. Confirmo que posso publicar esta fotografia e
                que não apresento suposições como factos.
              </label>
            </>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled={busy} onClick={() => persist("draft")}>
            Guardar rascunho
          </Button>
          {step < 2 ? (
            <Button type="button" onClick={() => setStep(step + 1)}>
              Continuar
            </Button>
          ) : (
            <Button type="submit" disabled={busy || !reviewed}>
              Publicar após revisão
            </Button>
          )}
        </div>
      </form>
      <p role="status" className="mt-4 text-sm">
        {notice}
      </p>
      {!hideList && <h3 className="mt-10 text-2xl">Perfis da instituição</h3>}
      {hideList ? null : pets.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Ainda não há perfis ou rascunhos.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {pets.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-4">
              <span>
                {String((p.profile as Record<string, unknown>)["name"] || "Sem nome")} ·{" "}
                {p.status === "draft"
                  ? "Rascunho"
                  : p.status === "adopted"
                    ? "Adotado"
                    : "Publicado"}
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  setId(p.id);
                  setProfile({ ...blank, ...(p.profile as typeof blank) });
                  setReviewed(false);
                  setStep(0);
                }}
              >
                Editar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
