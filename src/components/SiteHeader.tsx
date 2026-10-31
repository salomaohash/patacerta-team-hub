import { Link, useNavigate } from "@tanstack/react-router";
import { signOut, useSession } from "@/lib/state/session";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Button } from "@/components/ui/button";
import logo from "@/assets/patacerta-logo.png";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const linkCls = "text-sm hover:text-accent-deep";
const activeCls = { className: "text-sm text-accent-deep" };

export function SiteHeader() {
  const user = useSession();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-6 py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-6 lg:py-4">
        <Link to="/" aria-label="PataCerta, página inicial" className="shrink-0 lg:justify-self-start">
          <img src={logo} alt="PataCerta" width={180} height={41} className="h-auto w-36 object-contain sm:w-[180px]" />
        </Link>
        <GlobalSearch />
        <Button variant="ghost" size="icon" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="main-navigation" className="col-start-3 row-start-1 shrink-0 justify-self-end lg:hidden" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</Button>
        <nav id="main-navigation" aria-label="Menu principal" onClick={() => setMenuOpen(false)} className={`${menuOpen ? "grid" : "hidden"} col-span-3 min-w-0 grid-cols-2 items-center gap-3 border-t border-border pt-3 lg:flex lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:shrink-0 lg:justify-self-end lg:gap-7 lg:border-0 lg:pt-0`}>
          <Link to="/acerca" className={linkCls} activeProps={activeCls}>
            Acerca
          </Link>
          <Link to="/animais" className={linkCls} activeProps={activeCls}>
            Adoção
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
