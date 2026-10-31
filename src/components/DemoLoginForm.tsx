import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoVideoCarousel } from "@/components/DemoVideoCarousel";
import { signInDemo, type Papel } from "@/lib/demo-session";
import { signIn, sessionDestination } from "@/lib/state/session";
import { validateAuth } from "@/components/AuthForm";

export function DemoLoginForm() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [papel, setPapel] = useState<Papel>("adotante");

  function enterDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = validateAuth("login", name, email, password);
    if (invalid) { setError(invalid.message); return; }
    signIn({ nome: name.trim() || email.split("@")[0] || email, email: email.trim().toLowerCase(), papel });
    signInDemo(name, papel);
    setEmail("");
    setPassword("");
    void navigate({ to: sessionDestination(search.returnTo ?? "/dashboard") });
  }

  const inputClass = "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-accent-deep focus:ring-1 focus:ring-ring";

  return (
    <main className="grid min-h-dvh w-full bg-background lg:grid-cols-[45%_55%]">
        <section className="login-surface grain order-2 flex min-w-0 flex-col px-6 py-6 sm:px-10 lg:order-1 lg:px-10 lg:py-8 xl:px-16">
          <Link to="/" className="relative z-10 flex w-fit items-center gap-2.5 font-serif text-2xl">
            <PawPrint className="h-6 w-6 text-accent-deep" /> PataCerta
          </Link>
          <div className="relative z-10 flex flex-1 items-center justify-center py-8 lg:py-10">
          <div className="w-full max-w-md space-y-7">
          <div className="space-y-3">
            <h1 className="text-3xl leading-tight sm:text-4xl">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground">Entra para acompanhares a tua jornada de adoção.</p>
          </div>
          <form noValidate autoComplete="off" onSubmit={enterDemo} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="demo-name" className="text-sm font-medium">Nome</label>
              <input id="demo-name" name="name" className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="demo-email" className="text-sm font-medium">Email</label>
              <input id="demo-email" name="email" type="text" autoComplete="email" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="demo-password" className="text-sm font-medium">Palavra-passe</label>
              <input id="demo-password" name="password" type="password" autoComplete="new-password" className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                {([["adotante", "Utilizador"], ["associacao", "Organizações"]] as const).map(([value, label]) => (
                  <Button key={value} type="button" variant="outline" aria-pressed={papel === value} onClick={() => setPapel(value)} className={`h-12 rounded-xl border border-input text-sm ${papel === value ? "border-accent-deep bg-secondary" : "bg-background"}`}>
                    {label}
                  </Button>
                ))}
              </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="login" className="mt-2 h-13 w-full rounded-full text-base">Entrar</Button>
            <Button type="button" variant="outline" className="h-12 w-full rounded-full text-sm">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor"><path d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02 6.1 6.1 0 0 1-9.36-5.08 6.1 6.1 0 0 1 9.76-4.85l2.89-2.89A10 10 0 1 0 12 22c5.77 0 9.6-4.06 9.6-9.77Z" /></svg>
              Continuar com Google
            </Button>
            <p className="text-center text-sm text-muted-foreground">Ainda não tens conta? <Link to="/registar" className="text-accent-deep underline underline-offset-4">Cria a tua</Link></p>
          </form>
          <Button asChild variant="link" className="h-auto justify-start self-start px-0 text-muted-foreground">
            <Link to="/"><ArrowLeft /> Voltar à página inicial</Link>
          </Button>
          </div>
        </div>
        </section>
        <div className="relative order-1 h-[280px] min-w-0 sm:h-[340px] lg:order-2 lg:h-auto lg:min-h-dvh">
          <DemoVideoCarousel />
        </div>
    </main>
  );
}