import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <Link to="/" className="font-serif text-base text-foreground">PataCerta</Link>
        <div className="space-y-3 md:text-right">
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/acerca" className="hover:text-accent-deep">Acerca</Link>
            <Link to="/acerca" hash="faq" className="hover:text-accent-deep">Perguntas frequentes</Link>
          </nav>
          <p className="eyebrow">Projeto de demonstração</p>
        </div>
      </div>
    </footer>
  );
}