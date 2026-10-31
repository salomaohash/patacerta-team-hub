import { createFileRoute, Link } from "@tanstack/react-router";
import { PawPrint } from "lucide-react";
import { animals } from "@/lib/animals";

type Search = { especie?: string | undefined; porte?: string | undefined; energia?: string | undefined };

export const Route = createFileRoute("/animais/")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const pick = (k: string) => (typeof s[k] === "string" ? (s[k] as string) : undefined);
    return { especie: pick("especie"), porte: pick("porte"), energia: pick("energia") };
  },
  head: () => ({
    meta: [
      { title: "Animais para adoção — PataCerta" },
      { name: "description", content: "Conhece os cães e gatos à procura da família certa." },
      { property: "og:title", content: "Animais para adoção — PataCerta" },
      { property: "og:description", content: "Conhece os cães e gatos à procura da família certa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalog,
});

const filters = [
  { key: "especie", label: "Espécie", options: ["cão", "gato"] },
  { key: "porte", label: "Porte", options: ["pequeno", "médio", "grande"] },
  { key: "energia", label: "Energia", options: ["baixa", "média", "alta"] },
] as const;

function Catalog() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const list = animals.filter(
    (a) =>
      (!search.especie || a.species === search.especie) &&
      (!search.porte || a.size === search.porte) &&
      (!search.energia || a.energy === search.energia),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-serif text-xl">PataCerta</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-4 text-4xl">Animais à procura de casa</h1>

        <div className="mt-10 flex flex-wrap gap-6">
          {filters.map((f) => (
            <label key={f.key} className="flex flex-col gap-1 text-sm">
              <span className="eyebrow">{f.label}</span>
              <select
                className="rounded-full border border-input bg-card px-4 py-2"
                value={search[f.key] ?? ""}
                onChange={(e) =>
                  navigate({ search: (p) => ({ ...p, [f.key]: e.target.value || undefined }) })
                }
              >
                <option value="">Todos</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <Link
              key={a.id}
              to="/animais/$id"
              params={{ id: a.id }}
              className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-soft"
            >
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-secondary text-accent-deep">
                <PawPrint size={40} strokeWidth={1.2} />
              </div>
              <h2 className="mt-5 text-2xl">{a.name}</h2>
              <p className="text-sm text-muted-foreground">
                {a.breed} · {a.ageYears} {a.ageYears === 1 ? "ano" : "anos"} · {a.municipality}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-secondary px-3 py-1">{a.size}</span>
                <span className="rounded-full bg-secondary px-3 py-1">energia {a.energy}</span>
                {a.apartmentOk && <span className="rounded-full bg-secondary px-3 py-1">apartamento</span>}
              </div>
            </Link>
          ))}
          {list.length === 0 && <p className="text-muted-foreground">Nenhum animal com estes filtros.</p>}
        </div>
      </main>
    </div>
  );
}
