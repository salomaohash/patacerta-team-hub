import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/entrar")({
  validateSearch: (search: Record<string, unknown>): { returnTo?: string | undefined } => ({
    returnTo: typeof search["returnTo"] === "string" && ["/painel", "/dashboard", "/favoritos"].includes(search["returnTo"]) ? search["returnTo"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar · PataCerta" },
      { name: "description", content: "Entra na tua conta PataCerta para guardar favoritos e acompanhar candidaturas." },
      { property: "og:title", content: "Entrar, PataCerta" },
      { property: "og:description", content: "Entra na tua conta PataCerta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
