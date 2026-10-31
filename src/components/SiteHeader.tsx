import { Link, useNavigate } from "@tanstack/react-router";
import { signOut, useSession } from "@/lib/state/session";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Button } from "@/components/ui/button";
import logo from "@/assets/patacerta-logo.png";

const linkCls = "text-sm hover:text-accent-deep";
const activeCls = { className: "text-sm text-accent-deep" };

export function SiteHeader() {
  const user = useSession();
  const navigate = useNavigate();
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link to="/" aria-label="PataCerta — página inicial" className="shrink-0">
          <img src={logo} alt="PataCerta" width={180} height={41} className="h-auto w-36 object-contain sm:w-[180px]" />
        </Link>
        <GlobalSearch />
        <nav aria-label="Menu principal" className="flex flex-wrap items-center gap-4 sm:gap-6">
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
              <Link to="/painel" className={linkCls} activeProps={activeCls}>
                Painel
              </Link>
            </>
          )}
          {user ? (
            <Button variant="outline"
              onClick={() => {
                signOut();
                navigate({ to: "/" });
              }}
              className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              Sair
            </Button>
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
