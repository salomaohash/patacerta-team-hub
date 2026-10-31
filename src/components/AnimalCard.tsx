import { Link } from "@tanstack/react-router";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getAssociation, type Animal } from "@/lib/animals";

export function AnimalCard({ a }: { a: Animal }) {
  const assoc = getAssociation(a.associationId);
  return (
    <Link
      to="/animais/$id"
      params={{ id: a.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={a.photo} alt={a.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        <span className="eyebrow absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1">Demonstração</span>
        {a.forgotten && (
          <span className="eyebrow absolute right-3 top-3 rounded-full bg-accent-warm px-3 py-1 text-primary-foreground">Esquecido</span>
        )}
        <FavoriteButton id={a.id} className="absolute bottom-3 right-3" />
      </div>
      <div className="p-5">
        <h3 className="text-2xl">{a.name}</h3>
        <p className="text-sm text-muted-foreground">
          {a.ageYears} {a.ageYears === 1 ? "ano" : "anos"} · {assoc?.name}
        </p>
      </div>
    </Link>
  );
}
