import { Link, useNavigate } from "@tanstack/react-router";
import { signOut, useSession } from "@/lib/state/session";

const linkCls = "text-sm hover:text-accent-deep";
const activeCls = { className: "text-sm text-accent-deep" };

export function SiteHeader() {
  const user = useSession();
  const navigate = useNavigate();
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link to="/" className="font-serif text-xl tracking-tight">
          PataCerta
        </Link>
        <nav aria-label="Menu principal" className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link to="/animais" className={linkCls} activeProps={activeCls}>
            Animais
          </Link>
          <Link to="/acerca" className={linkCls} activeProps={activeCls}>
            Acerca
          </Link>
          <Link to="/animais" search={{ estado: "desaparecido" }} className={linkCls}>
            Perdidos
          </Link>
          {user && (
            <>
              <Link to="/favoritos" className={linkCls} activeProps={activeCls}>
                Favoritos
              </Link>
              <Link to="/painel" className={`${linkCls} hidden sm:inline`} activeProps={activeCls}>
                Painel
              </Link>
            </>
          )}
          {user ? (
            <button
              onClick={() => {
                signOut();
                navigate({ to: "/" });
              }}
              className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              Sair
            </button>
          ) : (
            <Link
              to="/entrar"
              className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
