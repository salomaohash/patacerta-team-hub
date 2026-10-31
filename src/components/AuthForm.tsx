import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { signIn, type Role } from "@/lib/state/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const input = "w-full rounded-full border border-input bg-card px-4 py-3 text-sm outline-none focus:border-accent-deep";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("adopter");
  const [error, setError] = useState("");
  const isReg = mode === "register";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Indica um email válido.");
    if (password.length < 6) return setError("A palavra-passe precisa de pelo menos 6 caracteres.");
    if (isReg && !name.trim()) return setError("Indica o teu nome.");
    signIn({ name: isReg ? name.trim() : (email.split("@")[0] ?? email), email: email.toLowerCase(), role });
    navigate({ to: "/painel" });
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <p className="eyebrow">{isReg ? "Criar conta" : "Bem-vindo de volta"}</p>
      <h1 className="mt-4 text-4xl">{isReg ? "Registar" : "Entrar"}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Os dados ficam apenas neste navegador.
      </p>
      <form onSubmit={submit} className="mt-12 space-y-4">
        {isReg && (
          <Input aria-label="Nome" autoComplete="name" className={input} placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <Input aria-label="Email" autoComplete="email" className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input aria-label="Palavra-passe" autoComplete={isReg ? "new-password" : "current-password"} className={input} type="password" placeholder="Palavra-passe" value={password} onChange={(e) => setPassword(e.target.value)} />
        {isReg && (
          <fieldset className="grid grid-cols-2 gap-3">
            {([["adopter", "Quero adotar"], ["association", "Represento uma associação"]] as const).map(([v, l]) => (
              <Button variant="outline"
                key={v}
                type="button"
                onClick={() => setRole(v)}
                aria-pressed={role === v}
                className={`h-auto whitespace-normal rounded-full border px-4 py-3 text-left text-sm transition-colors ${role === v ? "border-accent-deep bg-secondary" : "border-input bg-card"}`}
              >
                {l}
              </Button>
            ))}
          </fieldset>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="h-auto w-full rounded-full py-3">
          {isReg ? "Criar conta" : "Entrar"}
        </Button>
      </form>
      {!isReg && <Button variant="outline" className="mt-4 h-auto w-full rounded-full py-3" onClick={() => { signIn({ name: "Sofia Martins", email: "sofia@example.com", role: "adopter" }); navigate({ to: "/dashboard" }); }}>Explorar com perfil de exemplo</Button>}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isReg ? "Já tens conta? " : "Ainda não tens conta? "}
        <Link to={isReg ? "/entrar" : "/registar"} className="text-accent-deep underline">
          {isReg ? "Entrar" : "Registar"}
        </Link>
      </p>
    </main>
  );
}
