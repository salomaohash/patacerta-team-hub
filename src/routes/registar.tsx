import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/components/RegisterForm";

export const Route = createFileRoute("/registar")({
  validateSearch: (search: Record<string, unknown>): { returnTo?: string | undefined } => ({
    returnTo: typeof search["returnTo"] === "string" && ["/painel", "/dashboard", "/favoritos"].includes(search["returnTo"]) ? search["returnTo"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Criar conta · PataCerta" },
      { name: "description", content: "Cria conta para adotar ou para representar uma associação na PataCerta." },
      { property: "og:title", content: "Registar, PataCerta" },
      { property: "og:description", content: "Cria a tua conta PataCerta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <RegisterForm />,
});
