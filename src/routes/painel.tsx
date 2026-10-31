import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireSession } from "@/components/RequireSession";
import { useSession } from "@/lib/state/session";
import { useFavorites } from "@/lib/state/favorites";
import { useDemoUser } from "@/lib/demo-session";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel — PataCerta" },
      { name: "description", content: "O teu painel PataCerta." },
      { property: "og:title", content: "Painel — PataCerta" },
      { property: "og:description", content: "O teu painel PataCerta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireSession>
      <Painel />
    </RequireSession>
  ),
});

function Painel() {
  const sessionUser = useSession();
  const demoUser = useDemoUser();
  const favs = useFavorites();
  const user = sessionUser ?? (demoUser ? { name: demoUser.name || "Utilizador", role: demoUser.papel === "associacao" ? "association" as const : "adopter" as const } : null);
  if (!user) return null;
  const isAssoc = user.role === "association";
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="eyebrow">{isAssoc ? "Associação" : "Adotante"}</p>
      <h1 className="mt-4 text-4xl">Olá, {user.name}</h1>
      {isAssoc && <Link to="/instituicao" className="mt-4 inline-block text-accent-deep underline">Área da instituição</Link>}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link to="/favoritos" className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-soft">
          <p className="eyebrow">Favoritos</p>
          <p className="mt-3 font-serif text-4xl">{favs.length}</p>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="eyebrow">{isAssoc ? "Candidaturas recebidas" : "Candidaturas"}</p>
          <p className="mt-3 text-sm text-muted-foreground">Disponível num passo seguinte.</p>
        </div>
      </div>
    </main>
  );
}
