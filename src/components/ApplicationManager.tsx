import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveWorkspace, workspace } from "@/lib/pets.functions";
import { getAnimal } from "@/lib/animals";
import { CHECKIN_DAYS, checkinDue } from "@/lib/adoption-guide.ts";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AiAssistance } from "./AiAssistance";
import { MESSAGE_TEMPLATES, STAGES, stageOf, deriveTasks, type StageId } from "@/lib/dashboard";
import { computeMatch, DIMENSION_LABELS, type QuizAnswers } from "@/lib/matching";
import { petFromRow } from "@/lib/pet-records";
type Workspace = Awaited<ReturnType<typeof workspace>>;
const statuses = {
  received: "Recebida",
  information: "A pedir informação",
  conversation: "Conversa",
  visit: "Visita",
  pending_decision: "Decisão pendente",
  approved: "Aprovada",
  declined: "Não avançou",
  adopted: "Adotado",
  withdrawn: "Retirada",
};
const field = "mt-1 w-full rounded-lg border border-input bg-card p-3 text-sm";
export function ApplicationManager({
  data,
  team,
  reload,
  initialStage = "",
}: {
  data: Workspace;
  team: boolean;
  reload: () => void;
  initialStage?: StageId | "";
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>(initialStage);
  const [animal, setAnimal] = useState("");
  const [since, setSince] = useState("");
  const nameOf = (id: string) => animalName(id, data);
  const applications = data.applications
    .filter(
      (a) =>
        (!filter || stageOf(a.status) === filter) &&
        (!animal || a.animal_id === animal) &&
        (!since || a.created_at.slice(0, 10) >= since) &&
        `${nameOf(a.animal_id)} ${a.message}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const animalIds = [...new Set(data.applications.map((a) => a.animal_id))];
  return (
    <section className="mt-8">
      <h2 className="text-3xl">
        {team ? "Candidaturas e próximos passos" : "As tuas candidaturas"}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          Pesquisa
          <input
            className={field}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Animal ou mensagem"
          />
        </label>
        <label className="text-sm">
          Estado
          <select className={field} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todas as etapas</option>
            {STAGES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label} ({data.applications.filter((a) => stageOf(a.status) === st.id).length})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Animal
          <select className={field} value={animal} onChange={(e) => setAnimal(e.target.value)}>
            <option value="">Todos</option>
            {animalIds.map((id) => (
              <option key={id} value={id}>
                {nameOf(id)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Recebidas desde
          <input type="date" className={field} value={since} onChange={(e) => setSince(e.target.value)} />
        </label>
      </div>
      {!applications.length && (
        <p className="mt-8 text-sm text-muted-foreground">
          Não há candidaturas para mostrar.{" "}
          {team
            ? "Quando alguém se candidatar a um perfil publicado, a candidatura aparece aqui."
            : "Podes demonstrar interesse na ficha de um animal."}
        </p>
      )}
      <div className="mt-6 space-y-6">
        {applications.map((a) => (
          <ApplicationItem
            key={a.id}
            a={a}
            data={data}
            team={team && !!a.institution_id && a.user_id !== data.userId}
            reload={reload}
          />
        ))}
      </div>
    </section>
  );
}
export function ApplicationItem({
  a,
  data,
  team,
  reload,
}: {
  a: Workspace["applications"][number];
  data: Workspace;
  team: boolean;
  reload: () => void;
}) {
  const save = useServerFn(saveWorkspace);
  const [status, setStatus] = useState(a.status);
  const [notes, setNotes] = useState(a.notes);
  const [next, setNext] = useState(a.next_step);
  const [adoptedAt, setAdoptedAt] = useState(a.adopted_at ?? "");
  const [event, setEvent] = useState("");
  const [kind, setKind] = useState<"note" | "interview" | "visit" | "message">("note");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [response, setResponse] = useState("");
  const [help, setHelp] = useState(false);
  const [reason, setReason] = useState("");
  const p = data.pets.find((p) => p.id === a.animal_id);
  const name = animalName(a.animal_id, data);
  const pending = deriveTasks([a], data.checkins.filter((c) => c.application_id === a.id));
  const animalObj = getAnimal(a.animal_id) ?? (p ? petFromRow({ ...p, institutions: { name: "", city: "", contact: "", email: "", phone: "", website: "", social: "" } }) : null);
  const answers = a.answers as Record<string, number>;
  const match =
    team && animalObj && Object.keys(answers).length >= 5
      ? computeMatch(answers as unknown as QuizAnswers, animalObj)
      : null;
  const events = data.events.filter((e) => e.application_id === a.id);
  const checkins = data.checkins.filter((c) => c.application_id === a.id);
  async function run(action: NonNullable<Parameters<typeof save>[0]> extends { data?: infer D } ? D : never) {
    setBusy(true);
    setNotice("");
    try {
      await save({ data: action });
      reload();
      setNotice("Guardado.");
      setEvent("");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="shrink-0">
            {statuses[a.status as keyof typeof statuses] ?? a.status}
          </Badge>
          <h3 className="text-2xl">{name}</h3>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Recebida a {new Date(a.created_at).toLocaleDateString("pt-PT")} · Atualizada a{" "}
        {new Date(a.updated_at).toLocaleDateString("pt-PT")}
        {a.is_demo ? " · Demonstração · sem instituição real" : ""}
      </p>
      {team && pending.length > 0 && (
        <p className="mt-2 text-sm text-accent-deep">
          Tarefas pendentes: {pending.map((t) => t.label).join(" · ")}
        </p>
      )}
      {match && (
        <details className="mt-4 text-sm">
          <summary>Compatibilidade indicativa: {match.score}% · apoio à conversa</summary>
          <p className="mt-2 text-xs text-muted-foreground">
            Não aprova, rejeita nem ordena candidatos. Serve apenas para orientar a conversa.
          </p>
          <ul className="mt-2 space-y-1">
            {(Object.keys(match.dimensions) as (keyof typeof match.dimensions)[]).map((k) => (
              <li key={k}>
                {DIMENSION_LABELS[k]}: {match.dimensions[k].reason}
              </li>
            ))}
          </ul>
        </details>
      )}
      {team && (
        <p className="mt-4 text-sm font-medium">
          Próximo passo: {a.next_step || "Combinar uma conversa"}
        </p>
      )}
      <details className="mt-4 text-sm">
        <summary>Consultar mensagem e respostas originais</summary>
        <p className="mt-3 whitespace-pre-wrap">{a.message}</p>
        <dl className="mt-3 space-y-2">
          {Object.entries(a.answers as Record<string, unknown>).map(([k, v]) => (
            <div key={k}>
              <dt className="font-medium">{answerNames[k] ?? k}</dt>
              <dd>{answerValues[k]?.[Number(v)] ?? String(v)}</dd>
            </div>
          ))}
        </dl>
      </details>
      {team && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Estado
              <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
                {Object.entries(statuses)
                  .filter(([v]) => v !== "withdrawn")
                  .map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-sm">
              Próximo passo
              <select className={field} value={next} onChange={(e) => setNext(e.target.value)}>
                {[
                  "Responder à candidatura",
                  "Pedir informação",
                  "Marcar conversa",
                  "Combinar visita",
                  "Fazer acompanhamento",
                  "Sem tarefa pendente",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            {["approved", "declined", "adopted", "pending_decision"].includes(status) && (
              <label className="text-sm sm:col-span-2">
                Motivo da decisão · fica registado com a data de hoje
                <textarea className={field} value={reason} onChange={(e) => setReason(e.target.value)} />
              </label>
            )}
            {status === "adopted" && (
              <label className="text-sm">
                Data da adoção
                <input
                  type="date"
                  className={field}
                  value={adoptedAt}
                  onChange={(e) => setAdoptedAt(e.target.value)}
                />
              </label>
            )}
            <label className="text-sm sm:col-span-2">
              Notas internas
              <textarea
                className={field}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>
          <Button
            disabled={busy}
            className="mt-4"
            onClick={() =>
              run({
                action: "update",
                id: a.id,
                status: status as "received",
                notes,
                nextStep: next,
                adoptedAt: adoptedAt || null,
                decisionReason: reason,
              })
            }
          >
            Confirmar alterações
          </Button>
          <AiAssistance
            kind="application"
            source={JSON.stringify(
              {
                animal: p?.profile ?? getAnimal(a.animal_id),
                message: a.message,
                answers: a.answers,
              },
              null,
              2,
            )}
          />
          <details className="mt-5 text-sm">
            <summary>Registar conversa, visita ou nota</summary>
            <label className="mt-3 block">
              Tipo de registo
              <select
                className={field}
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="note">Nota</option>
                <option value="interview">Entrevista</option>
                <option value="visit">Visita</option>
                <option value="message">Mensagem preparada</option>
              </select>
            </label>
            <label className="mt-3 block">
              Modelo de mensagem
              <select className={field} defaultValue="" onChange={(e) => setEvent(e.target.value)}>
                <option value="">Escolher e editar</option>
                {MESSAGE_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.text}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              aria-label="Conteúdo do registo"
              className={`${field} min-h-28`}
              value={event}
              onChange={(e) => setEvent(e.target.value)}
            />
            <Button
              disabled={busy || !event.trim()}
              className="mt-3"
              onClick={() => {
                if (
                  kind === "message" &&
                  !window.confirm(
                    "Confirmas que reviste esta mensagem? Fica registada como comunicada à pessoa candidata; a PataCerta não a envia automaticamente.",
                  )
                )
                  return;
                run({ action: "event", id: a.id, kind, content: event });
              }}
            >
              Guardar registo interno
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Não envia mensagens. Copia o texto revisto para o contacto acordado com a família.
            </p>
            {events.map((e) => (
              <p key={e.id} className="mt-3 border-t border-border pt-3 whitespace-pre-wrap">
                {new Date(e.occurred_at).toLocaleDateString("pt-PT")} · {e.content}
              </p>
            ))}
          </details>
        </>
      )}
      {a.status === "adopted" && a.adopted_at && (
        <div className="mt-6 border-t border-border pt-5">
          <h4 className="text-xl">Acompanhamento · 30, 60 e 90 dias</h4>
          {CHECKIN_DAYS.map((day) => {
            const done = checkins.find((c) => c.day === day);
            const due = checkinDue(a.adopted_at ?? "", day);
            return (
              <div key={day} className="mt-4">
                <p className="text-sm font-medium">
                  {day} dias ·{" "}
                  {done
                    ? done.needs_help
                      ? "Pedido de apoio"
                      : "Respondido"
                    : due
                      ? "Resposta pendente"
                      : "Agendado"}
                </p>
                {done && (
                  <>
                    <p className="mt-2 text-sm">{done.response}</p>
                    {team && (
                      <AiAssistance
                        kind="checkin"
                        source={`Dia: ${day}\nPedido de apoio: ${done.needs_help}\nResposta: ${done.response}`}
                      />
                    )}
                  </>
                )}
                {!done && due && !team && (
                  <>
                    <label className="mt-3 block text-sm">
                      Como está a correr a adaptação?
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className={field}
                      />
                    </label>
                    <label className="mt-3 flex gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={help}
                        onChange={(e) => setHelp(e.target.checked)}
                      />
                      Gostaria de pedir apoio à instituição.
                    </label>
                    <Button
                      disabled={busy || response.trim().length < 5}
                      className="mt-3"
                      onClick={() =>
                        run({ action: "checkin", id: a.id, day, response, needsHelp: help })
                      }
                    >
                      Guardar check-in dos {day} dias
                    </Button>
                  </>
                )}
              </div>
            );
          })}
          <p className="mt-4 text-xs text-muted-foreground">
            As respostas em falta e pedidos de apoio aparecem neste painel; não são enviados
            lembretes por email.
          </p>
        </div>
      )}
      <p role="status" className="mt-3 text-sm">
        {notice}
      </p>
    </article>
  );
}
const answerNames: Record<string, string> = {
  hoursAway: "Horas fora de casa",
  housing: "Habitação",
  dailyTime: "Tempo diário",
  activity: "Atividade",
  kids: "Crianças",
  pets: "Outros animais",
  experience: "Experiência",
  routine: "Rotina",
  openness: "Disponibilidade para necessidades especiais",
};
const answerValues: Record<string, string[]> = {
  hoursAway: ["Menos de 4h", "4–8h", "Mais de 8h"],
  housing: ["Apartamento pequeno", "Apartamento espaçoso", "Casa com exterior"],
  dailyTime: ["Menos de 30 min", "30 min a 1h", "Mais de 1h"],
  activity: ["Calmo", "Moderado", "Ativo"],
  kids: ["Sim", "Não", "Nos planos"],
  pets: ["Nenhum", "Cão", "Gato", "Cão e gato"],
  experience: ["Nenhuma", "Alguma", "Muita"],
  routine: ["Muito estável", "Razoavelmente estável", "Imprevisível"],
  openness: ["Sim", "Talvez", "Não"],
};

function animalName(id: string, data: Workspace) {
  const p = data.pets.find((p) => p.id === id);
  return (
    getAnimal(id)?.name ?? (p ? String((p.profile as Record<string, unknown>)["name"] || "Sem nome") : "Animal")
  );
}
