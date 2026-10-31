import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Share2, ClipboardList } from "lucide-react";
import type { Animal } from "@/lib/animals";
import type { QuizAnswers } from "@/lib/matching";
import { loadQuiz } from "@/lib/state/quiz";
import { useSession } from "@/lib/state/session";
import { adaptationPlan } from "@/lib/adoption-guide.ts";
import { saveWorkspace } from "@/lib/pets.functions";
import { Button } from "./ui/button";
export function AdoptionPreparation({ a }: { a: Animal }) {
  const user = useSession();
  const save = useServerFn(saveWorkspace);
  const [q, setQ] = useState<QuizAnswers | null>(null);
  const [interest, setInterest] = useState(false);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    setQ(loadQuiz());
    setInterest(false);
    setNotice("");
  }, [a.id]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await save({
        data: {
          action: "apply",
          animalId: a.id,
          institutionId: a.institutionId ?? null,
          isDemo: a.isDemo,
          message,
          answers: q,
          consent: true,
        },
      });
      setNotice(
        a.isDemo
          ? "Interesse de demonstração guardado. Nenhuma instituição real foi contactada."
          : "Candidatura guardada. Podes acompanhar o estado no teu painel.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setInterest(!interest)}
          disabled={a.status === "adopted"}
          className="h-auto whitespace-normal rounded-full px-6 py-3"
        >
          <ClipboardList />
          {a.status === "adopted"
            ? "Já adotado"
            : interest
              ? "Fechar preparação"
              : "Tenho interesse · preparar a adoção"}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              if (navigator.share)
                await navigator.share({
                  title: `${a.name} — PataCerta`,
                  url: window.location.href,
                });
              else {
                await navigator.clipboard.writeText(window.location.href);
                setNotice("Ligação copiada.");
              }
            } catch {
              setError("Não foi possível partilhar a ligação.");
            }
          }}
        >
          <Share2 />
          Partilhar perfil
        </Button>
      </div>
      {interest && (
        <div className="mt-8">
          <p className="eyebrow">
            Plano inicial · {a.isDemo ? "Demonstração" : "a confirmar com a instituição"}
          </p>
          <h2 className="mt-3 text-3xl">Preparar a chegada de {a.name}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Baseado no perfil{q ? " e nas tuas respostas" : ""}; não é aconselhamento clínico ou
            comportamental. Confirma os dados em falta.
          </p>
          <ol className="mt-6 divide-y divide-border">
            {adaptationPlan(a, q).map((step, i) => (
              <li key={step.title} className="py-5">
                <h3 className="text-xl">
                  {i + 1}. {step.title}
                </h3>
                <p className="mt-2 text-sm">{step.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Origem: {a.isDemo ? "dados ilustrativos · " : ""}
                  {step.source}
                </p>
              </li>
            ))}
          </ol>
          <h2 className="mt-8 text-2xl">Dar o próximo passo</h2>
          {a.isDemo && (
            <p className="mt-3 text-sm text-muted-foreground">
              Este animal e a instituição são fictícios. O interesse fica marcado como demonstração,
              sem envio a uma instituição real.
            </p>
          )}
          {!user?.id ? (
            <p className="mt-4 text-sm">
              <Link to="/entrar" className="text-accent-deep underline">
                Entrar numa conta real
              </Link>{" "}
              para guardar o interesse e acompanhar a candidatura.
            </p>
          ) : (
            !notice && (
              <form onSubmit={submit} className="mt-4 space-y-4">
                <label className="block text-sm">
                  O que gostarias de partilhar ou confirmar com a instituição?
                  <textarea
                    required
                    minLength={10}
                    maxLength={3000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2 min-h-28 w-full rounded-lg border border-input bg-card p-3"
                  />
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1"
                  />
                  Autorizo a partilha desta mensagem e das minhas respostas ao questionário com a
                  instituição responsável, apenas para avaliar esta candidatura.
                </label>
                <Button type="submit" disabled={busy || !consent}>
                  {busy
                    ? "A guardar…"
                    : a.isDemo
                      ? "Guardar interesse de demonstração"
                      : "Enviar candidatura"}
                </Button>
              </form>
            )
          )}
        </div>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm">
          {notice}{" "}
          <Link to="/painel" className="text-accent-deep underline">
            Ver painel
          </Link>
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
