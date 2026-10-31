import { createFileRoute } from "@tanstack/react-router";
import { RequireSession } from "@/components/RequireSession";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Cuidados do animal · PataCerta" },
    { name: "description", content: "Acompanha a saúde da Luna, cuidados diários e locais pet-friendly no teu dashboard." },
    { property: "og:title", content: "Dashboard de cuidados, PataCerta" },
    { property: "og:description", content: "O teu animal, perfil e etapas de adoção, guardados na experiência do navegador." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequireSession><Dashboard /></RequireSession>,
});