import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { sessionDestination, useSession } from "@/lib/state/session";
import { Button } from "@/components/ui/button";

export function RequireSession({ children }: { children: ReactNode }) {
  const user = useSession();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  if (!user) return (
    <main className="mx-auto max-w-md px-6 py-12 text-center">
      <h1 className="text-3xl">Precisas de entrar</h1>
      <p className="mt-3 text-muted-foreground">Esta página só está disponível com sessão iniciada.</p>
      <Button asChild className="mt-6"><Link to="/entrar" search={{ returnTo: sessionDestination(location.pathname) }}>Entrar</Link></Button>
    </main>
  );
  return <>{children}</>;
}
