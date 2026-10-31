import { createFileRoute } from "@tanstack/react-router";
import { RequireSession } from "@/components/RequireSession";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel — PataCerta" },
      { name: "description", content: "O teu animal, boletim de saúde, cuidados e pedido de adoção no painel demonstrativo PataCerta." },
      { property: "og:title", content: "Painel — PataCerta" },
      { property: "og:description", content: "Saúde, cuidados, perfil e acompanhamento da adoção numa experiência demonstrativa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireSession>
      <Dashboard />
    </RequireSession>
  ),
});

