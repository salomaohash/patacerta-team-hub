import { createFileRoute } from "@tanstack/react-router";
import { DemoLoginForm } from "@/components/DemoLoginForm";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — PataCerta" },
      { name: "description", content: "Entra na PataCerta e acompanha a tua jornada de adoção." },
      { property: "og:title", content: "Entrar — PataCerta" },
      { property: "og:description", content: "Entra na PataCerta e acompanha a tua jornada de adoção." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoLoginForm,
});
