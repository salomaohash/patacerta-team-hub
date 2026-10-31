import { useState } from "react";
import { householdAgreement, ANSWER_LABELS } from "@/lib/adoption-guide.ts";
import { Button } from "./ui/button";
export function HouseholdAssessment() {
  const [members, setMembers] = useState<
    { consent: boolean; activity: number; dailyTime: number; routine: number }[]
  >([]);
  const [activity, setActivity] = useState(1);
  const [dailyTime, setDailyTime] = useState(1);
  const [routine, setRoutine] = useState(1);
  const [consent, setConsent] = useState(false);
  const summary = householdAgreement(members);
  return (
    <section className="mt-10 border-t border-border pt-6">
      <h2 className="text-2xl">Uma decisão do agregado</h2>
      <details className="mt-4">
        <summary className="text-sm">Comparar disponibilidade em conjunto</summary>
        <p className="mt-3 text-sm text-muted-foreground">
          Cada pessoa responde neste dispositivo e autoriza apenas um resumo conjunto. As respostas
          ficam temporariamente nesta página, sem envio à instituição.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(
            [
              { key: "activity", label: "Atividade", value: activity, set: setActivity },
              { key: "dailyTime", label: "Tempo diário", value: dailyTime, set: setDailyTime },
              { key: "routine", label: "Rotina", value: routine, set: setRoutine },
            ] as const
          ).map((f) => (
            <label key={f.key} className="text-sm">
              {f.label}
              <select
                className="mt-2 w-full rounded-lg border border-input bg-card p-3"
                value={f.value}
                onChange={(e) => f.set(Number(e.target.value))}
              >
                {ANSWER_LABELS[f.key].map((v, i) => (
                  <option key={v} value={i}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className="mt-4 flex gap-3 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Autorizo que estas respostas sejam incluídas no resumo conjunto visível às pessoas aqui
          presentes.
        </label>
        <div className="mt-4 flex gap-3">
          <Button
            disabled={!consent}
            onClick={() => {
              setMembers([...members, { consent, activity, dailyTime, routine }]);
              setConsent(false);
            }}
          >
            Incluir no resumo
          </Button>
          <Button variant="outline" onClick={() => setMembers([])}>
            Apagar respostas
          </Button>
        </div>
        {summary.count > 0 && (
          <div role="status" className="mt-4 text-sm">
            <p>
              {summary.count} {summary.count === 1 ? "pessoa participou" : "pessoas participaram"}.
            </p>
            {summary.count < 2 ? (
              <p>Falta outra pessoa para comparar.</p>
            ) : summary.differences.length ? (
              <p>
                Convém conversar sobre:{" "}
                {summary.differences
                  .map((k) =>
                    k === "activity"
                      ? "ritmo de atividade"
                      : k === "dailyTime"
                        ? "tempo disponível"
                        : "estabilidade da rotina",
                  )
                  .join(", ")}
                . Combinem responsabilidades que todos consigam assegurar.
              </p>
            ) : (
              <p>
                As respostas coincidem no ritmo, tempo disponível e estabilidade da rotina.
                Confirmem quem assume cada tarefa.
              </p>
            )}
          </div>
        )}
      </details>
    </section>
  );
}
