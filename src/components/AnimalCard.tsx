import { Link } from "@tanstack/react-router";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getAssociation, type Animal } from "@/lib/animals";
import { useQuiz } from "@/hooks/use-quiz";
import { computeMatch } from "@/lib/matching";
import { MatchRing } from "@/components/MatchRing";
import { photoInfo } from "@/lib/pet-media";

export function AnimalCard({ a }: { a: Animal }) {
  const assoc = getAssociation(a.associationId);
  const quiz = useQuiz();
  return (
    <Link
      to="/animais/$id"
      params={{ id: a.id }}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-all duration-[250ms] ease-out hover:-translate-y-0.5 hover:shadow-soft motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={a.photo} alt={photoInfo(a.photo)?.alt ?? `${a.name}, ${a.breed}`} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" />
        {quiz && <div className="absolute right-3 top-3 rounded-full bg-card p-2"><MatchRing value={computeMatch(quiz, a).score} size={48} label="Compatibilidade indicativa" /></div>}
        <FavoriteButton id={a.id} className="absolute bottom-3 right-3" />
      </div>
      <div className="p-6">
        <h3 className="text-2xl">{a.name}</h3>
        <p className="text-sm text-muted-foreground">
          {a.ageYears < 1 ? `${Math.round(a.ageYears * 12)} meses` : `${a.ageYears} ${a.ageYears === 1 ? "ano" : "anos"}`}, {assoc?.name}
        </p>
      </div>
    </Link>
  );
}
