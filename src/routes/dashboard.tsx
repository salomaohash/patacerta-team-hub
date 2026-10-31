import { createFileRoute } from "@tanstack/react-router";
import { RequireSession } from "@/components/RequireSession";
import { animals, associations } from "@/lib/animals";
import { notices } from "@/lib/notices";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard das associações, PataCerta" },
    { name: "description", content: "Contagens de animais por associação e avisos do catálogo PataCerta." },
    { property: "og:title", content: "Dashboard das associações, PataCerta" },
    { property: "og:description", content: "Consulta animais do catálogo e avisos de desaparecidos e encontrados." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequireSession><Dashboard /></RequireSession>,
});
export function dashboardCounts() {
  return [
    ...associations.map((association) => ({ label: association.name, value: animals.filter((animal) => animal.associationId === association.id).length })),
    { label: "Avisos de desaparecidos", value: notices.filter((notice) => notice.tipo === "desaparecido").length },
    { label: "Avisos de encontrados", value: notices.filter((notice) => notice.tipo === "encontrado").length },
  ];
}
function Dashboard() {
  return <main className="mx-auto max-w-6xl px-6 py-12">
    <p className="eyebrow">Associações</p><h1 className="mt-4 text-4xl">Dashboard</h1>
    <dl className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{dashboardCounts().map((stat) => <div key={stat.label} className="border-b border-border py-6"><dt className="text-sm text-muted-foreground">{stat.label}</dt><dd className="mt-3 text-4xl font-bold">{stat.value}</dd></div>)}</dl>
    <section className="mt-12"><h2 className="text-2xl">Candidaturas</h2><div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border"><tr><th className="p-3 font-medium">Animal</th><th className="p-3 font-medium">Adotante</th><th className="p-3 font-medium">Estado</th></tr></thead><tbody><tr><td colSpan={3} className="py-12 text-center"><p className="text-muted-foreground">Ainda sem candidaturas</p><Button variant="outline" disabled className="mt-4">Em breve</Button></td></tr></tbody></table></div></section>
    <section className="mt-12"><h2 className="text-2xl">Animais da tua associação</h2><div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border"><tr><th className="p-3 font-medium">Nome</th><th className="p-3 font-medium">Espécie</th><th className="p-3 font-medium">Estado</th></tr></thead><tbody><tr><td colSpan={3} className="py-12 text-center"><p className="text-muted-foreground">Nenhum animal adicionado nesta associação</p><Button variant="outline" disabled className="mt-4">Em breve</Button></td></tr></tbody></table></div></section>
  </main>;
}
