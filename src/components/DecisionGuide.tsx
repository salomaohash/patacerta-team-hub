import type { Animal } from "@/lib/animals";
import { DIMENSION_LABELS, keyFriction, verdict, type QuizAnswers } from "@/lib/matching";
import { decisionGuide, practicalQuestion } from "@/lib/adoption-guide.ts";
import { MatchRing } from "./MatchRing";
export function DecisionGuide({
  a,
  q,
  compact = false,
}: {
  a: Animal;
  q: QuizAnswers;
  compact?: boolean;
}) {
  const { match, strengths, considerations } = decisionGuide(q, a);
  return (
    <section aria-label={`Compatibilidade com ${a.name}`}>
      <div className="flex items-center gap-4">
        {!a.unknownFields?.length && (
          <MatchRing
            value={match.score}
            size={compact ? 60 : 72}
            label="Compatibilidade indicativa"
          />
        )}
        <div>
          <p className="font-medium">
            {a.unknownFields?.length
              ? "Informação por confirmar"
              : `${verdict(match.score / 100)} · compatibilidade indicativa`}
          </p>
          <p className="text-xs text-muted-foreground">Não substitui a avaliação da instituição.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-6">
        <div>
          <h3 className="eyebrow">Onde combinam</h3>
          {strengths.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {strengths.map((k) => (
                <li key={k}>
                  <span className="font-medium">{DIMENSION_LABELS[k]}</span>
                  <p className="text-muted-foreground">{match.dimensions[k].reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">
              Há vários pontos a confirmar antes de decidir. Podes explorar necessidades diferentes
              sem compromisso.
            </p>
          )}
        </div>
        {considerations.length > 0 && (
          <div>
            <h3 className="eyebrow">O que merece uma conversa</h3>
            <ul className="mt-3 divide-y divide-border text-sm">
              {considerations.map((k) => (
                <li key={k} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{DIMENSION_LABELS[k]}</span>
                    <span className="text-muted-foreground">
                      {verdict(match.dimensions[k].score)}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{match.dimensions[k].reason}</p>
                  <p className="mt-2">{practicalQuestion(k, a, q)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-6 border-l-2 border-accent-deep pl-4">
        <h3 className="eyebrow">Uma coisa que deves saber</h3>
        <p className="mt-2 text-sm">{keyFriction(a)}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Pede à instituição uma descrição de um dia habitual e confirma o apoio disponível.
          Compara-a com o tempo e condições que consegues assegurar.
        </p>
      </div>
      {!a.unknownFields?.length && match.score < 55 && (
        <p className="mt-4 text-sm">
          Esta combinação pode exigir mudanças importantes. Não é um julgamento sobre ti ou sobre{" "}
          {a.name}; compara outros perfis nos resultados e conversa com a instituição antes de
          avançar.
        </p>
      )}
    </section>
  );
}
