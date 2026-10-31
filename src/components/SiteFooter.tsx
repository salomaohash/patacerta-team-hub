import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground md:px-6">
          <nav aria-label="Rodapé" className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 md:flex md:justify-between md:gap-6">
            <Link to="/animais" className="hover:text-accent-deep">Adoção</Link>
            <Link to="/animais" search={{ estado: "desaparecido" }} className="hover:text-accent-deep">Perdidos</Link>
            <Link to="/acerca" className="hover:text-accent-deep">Acerca</Link>
            <Link to="/acerca" hash="faq" className="hover:text-accent-deep">FAQ</Link>
          </nav>
      </div>
    </footer>
  );
}