import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, ClipboardCopy, PawPrint } from "lucide-react";
import { saveWorkspace } from "@/lib/pets.functions";
import { CHECKIN_DAYS, checkinDue } from "@/lib/adoption-guide.ts";
import { Button } from "@/components/ui/button";
import {
  animalName,
  field,
  fmtDate,
  petPhoto,
  type App,
  type Data,
} from "./shared";

/** Acompanhamento pós-adoção: pontos de 7, 30, 60 e 90 dias após a adoção. */
export function OrgFollowUp({
  data,
  reload,
  readOnly,
}: {
  data: Data;
  reload: () => void;
  readOnly: boolean;
}) {
  const save = useServerFn(saveWorkspace);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const adopted = data.applications.filter(
    (a) => a.institution_id && a.status === "adopted" && a.adopted_at,
  );

  const isDone = (a: App, day: number) =>
    data.checkins.some((c) => c.application_id === a.id && c.day === day) ||
    data.events.some(
      (e) =>
        e.application_id === a.id && e.kind === "followup" && e.content.includes(`${day} dias`),
    );
  const helpAt = (a: App, day: number) =>
    data.checkins.some((c) => c.application_id === a.id && c.day === day && c.needs_help);

  async function conclude(a: App, day: number) {
    const note = notes[`${a.id}-${day}`]?.trim() ?? "";
    if (
      !window.confirm(
        `Marcar o acompanhamento dos ${day} dias de ${animalName(a.animal_id, data)} como concluído pela equipa?`,
      )
    )
      return;
    setBusy(true);
    setNotice("");
    try {
      await save({
        data: {
          action: "event",
          id: a.id,
          kind: "followup",
          content: `Acompanhamento dos ${day} dias concluído pela equipa.${note ? ` Observações: ${note}` : ""}`,
        },
      });
      setNotice("Acompanhamento registado como concluído.");
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível registar.");
    } finally {
      setBusy(false);
    }
  }

  function copyReminder(a: App, day: number) {
    const text = `Olá. Passaram ${day} dias desde a adoção de ${animalName(a.animal_id, data)} e gostaríamos de saber como está a correr a adaptação. Podes responder a este contacto com novidades, dificuldades ou dúvidas — estamos disponíveis para ajudar.`;
    void navigator.clipboard?.writeText(text).catch(() => undefined);
    setNotice("Lembrete copiado. Envia-o pelo contacto acordado com a família; a PataCerta não envia mensagens automaticamente.");
  }

  return (
    <section>
      <h2 className="text-2xl">Acompanhamento pós-adoção</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pontos de acompanhamento aos 7, 30, 60 e 90 dias após cada adoção. O objetivo é prevenir
        devoluções e apoiar as famílias durante a adaptação.
      </p>
      <p role="status" className="mt-2 text-sm">
        {notice}
      </p>

      {adopted.length === 0 ? (
        <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Ainda não há adoções registadas para acompanhar.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {adopted.map((a) => {
            const pet = data.pets.find((p) => p.id === a.animal_id);
            const photo = pet ? petPhoto(pet) : "";
            const pendingDays = CHECKIN_DAYS.filter(
              (d) => !isDone(a, d) && checkinDue(a.adopted_at ?? "", d),
            );
            const needsHelp = CHECKIN_DAYS.some((d) => helpAt(a, d));
            return (
              <li
                key={a.id}
                className={`rounded-xl border bg-card p-5 shadow-sm ${
                  needsHelp ? "border-destructive" : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-center gap-4">
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
                    <p className="text-xl">{animalName(a.animal_id, data)}</p>
                    <p className="text-sm text-muted-foreground">
                      Adotado a {fmtDate(a.adopted_at)} ·{" "}
                      {pendingDays.length > 0
                        ? `${pendingDays.length} ${pendingDays.length === 1 ? "acompanhamento pendente" : "acompanhamentos pendentes"}`
                        : "Acompanhamento em dia"}
                    </p>
                  </div>
                  {needsHelp && (
                    <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertTriangle className="h-4 w-4" aria-hidden />
                      A família pediu apoio — intervir com prioridade
                    </p>
                  )}
                </div>

                <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {CHECKIN_DAYS.map((day) => {
                    const done = isDone(a, day);
                    const due = checkinDue(a.adopted_at ?? "", day);
                    const checkin = data.checkins.find(
                      (c) => c.application_id === a.id && c.day === day,
                    );
                    return (
                      <li
                        key={day}
                        className="rounded-lg border border-border bg-background p-3 text-sm"
                      >
                        <p className="flex items-center gap-2 font-medium">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-accent-deep" aria-hidden />
                          ) : (
                            <span className="h-4 w-4 rounded-full border border-border" aria-hidden />
                          )}
                          {day} dias
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {done
                            ? checkin
                              ? checkin.needs_help
                                ? "Respondido · com pedido de apoio"
                                : "Respondido pela família"
                              : "Concluído pela equipa"
                            : due
                              ? "Resposta pendente"
                              : `Previsto para ${fmtDate(
                                  new Date(
                                    Date.parse(`${a.adopted_at}T12:00:00Z`) + day * 86400000,
                                  ).toISOString(),
                                )}`}
                        </p>
                        {checkin && (
                          <p className="mt-2 text-xs whitespace-pre-wrap">{checkin.response}</p>
                        )}
                        {!done && due && !readOnly && (
                          <div className="mt-3 space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyReminder(a, day)}
                            >
                              <ClipboardCopy className="h-3.5 w-3.5" aria-hidden /> Copiar lembrete
                            </Button>
                            <label className="block text-xs">
                              Observações da equipa
                              <textarea
                                className={field}
                                value={notes[`${a.id}-${day}`] ?? ""}
                                onChange={(e) =>
                                  setNotes({ ...notes, [`${a.id}-${day}`]: e.target.value })
                                }
                              />
                            </label>
                            <Button size="sm" disabled={busy} onClick={() => conclude(a, day)}>
                              Marcar como concluído
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
