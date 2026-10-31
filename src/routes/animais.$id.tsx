import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, X, MapPin } from "lucide-react";
import { QuizInline } from "@/components/QuizInline";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getAnimal, getAssociation } from "@/lib/animals";
import { AnimalGallery } from "@/components/AnimalGallery";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/animais/$id")({
  loader: async ({ params }) => {
    const animal = getAnimal(params.id);
    if (!animal) throw notFound();
    return animal;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name} — PataCerta` : "Animal — PataCerta";
    const d = loaderData?.description ?? "Perfil de animal para adoção.";
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
  errorComponent: ({ error }) => <div role="alert" className="p-10">{error instanceof Error ? error.message : String(error)}</div>,
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
        {a.status === "adopted" && <p role="status" className="mt-6 border-l-2 border-primary bg-muted px-5 py-4 text-accent-deep">Adotado — esta história já tem final feliz</p>}
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <AnimalGallery key={a.id} animal={a} />
          <div>
            <p className="eyebrow">{a.forgotten ? `Inesquecível: ${a.forgotten.kind}` : "Perfil do animal"}</p>
            <h1 className="mt-3 text-5xl">{a.name}</h1>
            <p className="mt-2 text-muted-foreground">{a.breed} · {a.ageYears < 1 ? `${Math.round(a.ageYears * 12)} meses` : `${a.ageYears} anos`} · porte {a.size} · energia {a.energy}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={16} strokeWidth={1.5} />{getAssociation(a.associationId)?.name}, {getAssociation(a.associationId)?.city}</p>
            <p className="mt-6">{a.description}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {traits.map(([label, ok]) => (
                <li key={label} className="flex items-center gap-2">
                  {ok ? <Check size={16} className="text-accent-deep" /> : <X size={16} className="text-muted-foreground" />}
                  {label}
                </li>
              ))}
            </ul>
            <QuizInline a={a} />
            <div className="mt-8 flex items-center gap-3">
              <Button disabled className="h-auto rounded-full px-7 py-3">
                Candidatar-me (em breve)
              </Button>
              <FavoriteButton id={a.id} className="border border-border" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
