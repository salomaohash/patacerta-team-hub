import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useSession } from "@/lib/state/session";

export function RequireSession({ children }: { children: ReactNode }) {
  const user = useSession();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  if (!user)
    return (
      <main className="mx-auto max-w-md px-6 py-12 text-center">
        <h1 className="text-3xl">Precisas de entrar</h1>
        <p className="mt-3 text-muted-foreground">Esta página só está disponível com sessão iniciada.</p>
        <Link to="/entrar" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-primary-foreground">
          Entrar
        </Link>
      </main>
    );
  return <>{children}</>;
}
