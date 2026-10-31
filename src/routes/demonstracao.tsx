import { createFileRoute } from "@tanstack/react-router";
import { DemoLoginForm } from "@/components/DemoLoginForm";

export const Route = createFileRoute("/demonstracao")({
  head: () => ({
    meta: [
      { title: "A tua jornada de adoção — PataCerta" },
      { name: "description", content: "Acompanha a tua jornada de adoção na PataCerta." },
      { property: "og:title", content: "A tua jornada de adoção — PataCerta" },
      { property: "og:description", content: "Acompanha a tua jornada de adoção na PataCerta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoLoginForm,
});
