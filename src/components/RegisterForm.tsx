import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoVideoCarousel } from "@/components/DemoVideoCarousel";
import { signIn, sessionDestination } from "@/lib/state/session";
import { validateAuth } from "@/components/AuthForm";

export function RegisterForm() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cidade, setCidade] = useState("");
  const [papel, setPapel] = useState<"adotante" | "associacao">("adotante");
  const [error, setError] = useState<{ message: string } | null>(null);
  const isOrg = papel === "associacao";

  function registar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid =
      validateAuth("register", nome, email, password) ??
      (isOrg && !cidade.trim() ? { field: "nome" as const, message: "Indica a localidade da associação." } : null);
    setError(invalid ? { message: invalid.message } : null);
    if (invalid) return;
    signIn({ nome: nome.trim(), email: email.trim().toLowerCase(), papel });
    navigate({ to: sessionDestination(search.returnTo ?? (isOrg ? "/dashboard" : "/painel")) });
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
              <h1 className="text-3xl leading-tight sm:text-4xl">Criar conta</h1>
              <p className="text-sm text-muted-foreground">Para adotar ou para representar uma associação.</p>
            </div>
            <form noValidate autoComplete="off" onSubmit={registar} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {([["adotante", "Utilizador"], ["associacao", "Organizações"]] as const).map(([value, label]) => (
                  <Button key={value} type="button" variant="outline" aria-pressed={papel === value} onClick={() => { setPapel(value); setError(null); }} className={`h-12 rounded-xl border border-input text-sm ${papel === value ? "border-accent-deep bg-secondary" : "bg-background"}`}>
                    {label}
                  </Button>
                ))}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reg-nome" className="text-sm font-medium">{isOrg ? "Nome da associação" : "Nome"}</label>
                <input id="reg-nome" name="nome" className={inputClass} aria-invalid={error && !nome.trim() ? true : undefined} value={nome} onChange={(event) => { setNome(event.target.value); setError(null); }} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-sm font-medium">Email</label>
                <input id="reg-email" name="email" type="email" className={inputClass} value={email} onChange={(event) => { setEmail(event.target.value); setError(null); }} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-sm font-medium">Palavra-passe</label>
                <input id="reg-password" name="password" type="password" autoComplete="new-password" className={inputClass} value={password} onChange={(event) => { setPassword(event.target.value); setError(null); }} />
              </div>
              {isOrg && (
                <div className="space-y-1.5">
                  <label htmlFor="reg-cidade" className="text-sm font-medium">Localidade</label>
                  <input id="reg-cidade" name="cidade" className={inputClass} placeholder="Ex.: Porto" value={cidade} onChange={(event) => { setCidade(event.target.value); setError(null); }} />
                </div>
              )}
              {error && <p id="reg-error" role="alert" className="text-sm text-destructive">{error.message}</p>}
              <Button type="submit" variant="login" className="mt-2 h-13 w-full rounded-full text-base">Criar conta <ArrowRight /></Button>
              <Button asChild variant="outline" className="h-12 w-full rounded-full text-sm">
                <Link to="/entrar"><ArrowRight /> Já tens conta? Entrar</Link>
              </Button>
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
