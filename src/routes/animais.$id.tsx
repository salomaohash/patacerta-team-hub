import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, X, PawPrint } from "lucide-react";
import { getAnimal } from "@/lib/animals";

export const Route = createFileRoute("/animais/$id")({
  loader: async ({ params }) => {
    const animal = getAnimal(params.id);
    if (!animal) throw notFound();
    return animal;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name} — PataCerta` : "Animal — PataCerta";
    const d = loaderData?.story ?? "Perfil de animal para adoção.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Detail,
  errorComponent: ({ error }) => <div role="alert" className="p-10">{error.message}</div>,
  notFoundComponent: () => (
    <div className="p-10">
      Animal não encontrado. <Link to="/animais" className="underline">Ver catálogo</Link>
    </div>
  ),
});

function Detail() {
  const a = Route.useLoaderData();
  const traits = [
    ["Bom com crianças", a.goodWithKids],
    ["Bom com outros animais", a.goodWithPets],
    ["Adequado a apartamento", a.apartmentOk],
  ] as const;
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Link to="/animais" className="text-sm text-muted-foreground hover:text-foreground">← Catálogo</Link>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-secondary text-accent-deep">
            <PawPrint size={64} strokeWidth={1.2} />
          </div>
          <div>
            <p className="eyebrow">{a.species} · {a.municipality}</p>
            <h1 className="mt-3 text-5xl">{a.name}</h1>
            <p className="mt-2 text-muted-foreground">{a.breed} · {a.ageYears} anos · porte {a.size} · energia {a.energy}</p>
            <p className="mt-6">{a.story}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {traits.map(([label, ok]) => (
                <li key={label} className="flex items-center gap-2">
                  {ok ? <Check size={16} className="text-accent-deep" /> : <X size={16} className="text-muted-foreground" />}
                  {label}
                </li>
              ))}
            </ul>
            <button disabled className="mt-8 rounded-full bg-primary px-7 py-3 text-primary-foreground opacity-60">
              Candidatar-me (em breve)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
