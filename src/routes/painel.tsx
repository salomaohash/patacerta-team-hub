import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/painel")({
  head: () => ({ meta: [{ title: "Painel · PataCerta" }] }),
  component: () => <Navigate to="/dashboard" replace />,
});
