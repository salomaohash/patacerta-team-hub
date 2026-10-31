import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireSession } from "@/components/RequireSession";
import { useSession } from "@/lib/state/session";
import { useFavorites } from "@/lib/state/favorites";
import { notices } from "@/lib/notices";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/painel")({
  head: () => ({ meta: [
    { title: "O teu painel, PataCerta" },
    { name: "description", content: "Os teus favoritos, avisos e questionário no painel PataCerta." },
    { property: "og:title", content: "O teu painel, PataCerta" },
    { property: "og:description", content: "Consulta favoritos e acede ao catálogo PataCerta." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequireSession><Painel /></RequireSession>,
});
function Painel() {
  const user = useSession();
  const favorites = useFavorites();
  if (!user) return null;
  return <main className="mx-auto max-w-5xl px-6 py-12">
    <p className="eyebrow">{user.papel === "associacao" ? "Associação" : "Adotante"}</p>
    <h1 className="mt-4 break-words text-4xl">Olá, {user.nome}</h1>
    <dl className="mt-12 grid gap-6 sm:grid-cols-3">
      {[{ label: "Favoritos guardados", value: favorites.length }, { label: "Avisos ativos no catálogo", value: notices.length }, { label: "Perguntas do questionário", value: 9 }].map((stat) => <div key={stat.label} className="border-b border-border py-6"><dt className="text-sm text-muted-foreground">{stat.label}</dt><dd className="mt-3 text-4xl font-bold">{stat.value}</dd></div>)}
    </dl>
    {user.papel === "associacao" && <section className="mt-12 border-y border-border bg-secondary py-6"><h2 className="text-2xl">Painel da associação</h2><Button asChild className="mt-4"><Link to="/dashboard">Abrir dashboard</Link></Button></section>}
    <div className="mt-12 grid gap-6 sm:grid-cols-2">
      <article className="rounded-lg border border-border bg-card p-6"><h2 className="text-2xl">Candidaturas: em breve</h2><Button asChild variant="outline" className="mt-6"><Link to="/animais">Ver animais para adoção</Link></Button></article>
      <article className="rounded-lg border border-border bg-card p-6"><h2 className="text-2xl">Favoritos</h2><Button asChild variant="outline" className="mt-6"><Link to="/favoritos">Ver favoritos</Link></Button></article>
    </div>
  </main>;
}
