import { Link } from "@tanstack/react-router";
import { getAssociation, type Animal } from "@/lib/animals";
import { DIMENSION_LABELS, keyFriction, verdict, WEIGHTS, type Dimension, type MatchResult } from "@/lib/matching";
import { MatchRing } from "@/components/MatchRing";
import { FavoriteButton } from "@/components/FavoriteButton";

const chip: Record<string, string> = {
  Excelente: "bg-accent-deep text-primary-foreground",
  Compatível: "bg-secondary text-foreground",
  Atenção: "bg-accent-warm text-primary-foreground",
};

export function MatchCard({ a, m }: { a: Animal; m: MatchResult }) {
  const assoc = getAssociation(a.associationId);
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card md:grid md:grid-cols-[280px_1fr]">
      <Link to="/animais/$id" params={{ id: a.id }} className="relative block self-start">
        <img src={a.photo} alt={a.name} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover" />
        <FavoriteButton id={a.id} className="absolute bottom-3 right-3" />
      </Link>
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to="/animais/$id" params={{ id: a.id }} className="font-serif text-3xl hover:text-accent-deep">{a.name}</Link>
            <p className="mt-1 text-sm text-muted-foreground">
              {a.ageYears} {a.ageYears === 1 ? "ano" : "anos"} · {assoc?.name}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MatchRing value={m.score} size={72} label="Compatibilidade indicativa" />
            <span className="text-[11px] text-muted-foreground">Compatibilidade indicativa</span>
          </div>
        </div>

        <h3 className="eyebrow mt-8">Porque combina contigo</h3>
        <ul className="mt-3 divide-y divide-border text-sm">
          {(Object.keys(WEIGHTS) as Dimension[]).map((k) => {
            const v = verdict(m.dimensions[k].score);
            return (
              <li key={k} className="flex items-center justify-between gap-3 py-2">
                <span>
                  {DIMENSION_LABELS[k]}
                  <span className="block text-xs text-muted-foreground">{m.dimensions[k].reason}</span>
                </span>
                <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs ${chip[v]}`}>{v}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 rounded-xl bg-muted p-4">
          <h3 className="eyebrow text-accent-warm">Uma coisa que deves saber</h3>
          <p className="mt-2 text-sm">{keyFriction(a)}</p>
        </div>
      </div>
    </article>
  );
}
