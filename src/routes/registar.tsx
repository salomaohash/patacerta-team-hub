import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/registar")({
  head: () => ({
    meta: [
      { title: "Registar, PataCerta" },
      { name: "description", content: "Cria conta para adotar ou para representar uma associação na PataCerta." },
      { property: "og:title", content: "Registar, PataCerta" },
      { property: "og:description", content: "Cria a tua conta PataCerta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});
