import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/painel")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Painel pessoal, PataCerta" },
    { name: "description", content: "Acede ao teu painel pessoal da PataCerta." },
    { property: "og:title", content: "Painel pessoal, PataCerta" },
    { property: "og:description", content: "Acede ao teu painel pessoal da PataCerta." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <Navigate to="/dashboard" replace />,
});
