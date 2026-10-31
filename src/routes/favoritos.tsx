import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireSession } from "@/components/RequireSession";
import { AnimalCard } from "@/components/AnimalCard";
import { useFavorites } from "@/lib/state/favorites";
import { getAnimal, type Animal } from "@/lib/animals";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos · PataCerta" },
      { name: "description", content: "Os animais que guardaste na PataCerta." },
      { property: "og:title", content: "Favoritos, PataCerta" },
      { property: "og:description", content: "Os animais que guardaste." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireSession>
      <Favoritos />
    </RequireSession>
  ),
});

function Favoritos() {
  const animals = useFavorites().map(getAnimal).filter((a): a is Animal => !!a);
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <p className="eyebrow">Guardados</p>
      <h1 className="mt-4 text-4xl">Os teus favoritos</h1>
      {animals.length === 0 ? (
        <div className="mt-12 rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            Ainda não guardaste nenhum animal. Explora e guarda os que te conquistarem.
          </p>
          <Link to="/animais" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-primary-foreground">
            Explorar animais
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((a) => (
            <AnimalCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </main>
  );
}
