import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { signIn, type Role } from "@/lib/state/session";

const input = "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-accent-deep";

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
    signIn({ name: isReg ? name.trim() : email.split("@")[0], email: email.toLowerCase(), role });
    navigate({ to: "/painel" });
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <p className="eyebrow">{isReg ? "Criar conta" : "Bem-vindo de volta"}</p>
      <h1 className="mt-4 text-4xl">{isReg ? "Registar" : "Entrar"}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Modo de demonstração: os dados ficam apenas neste navegador.
      </p>
      <form onSubmit={submit} className="mt-10 space-y-4">
        {isReg && (
          <input className={input} placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" placeholder="Palavra-passe" value={password} onChange={(e) => setPassword(e.target.value)} />
        {isReg && (
          <fieldset className="grid grid-cols-2 gap-3">
            {([["adopter", "Quero adotar"], ["association", "Represento uma associação"]] as const).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setRole(v)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${role === v ? "border-accent-deep bg-secondary" : "border-input bg-card"}`}
              >
                {l}
              </button>
            ))}
          </fieldset>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button className="w-full rounded-full bg-primary py-3 text-primary-foreground transition-colors hover:bg-accent-deep">
          {isReg ? "Criar conta" : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isReg ? "Já tens conta? " : "Ainda não tens conta? "}
        <Link to={isReg ? "/entrar" : "/registar"} className="text-accent-deep underline">
          {isReg ? "Entrar" : "Registar"}
        </Link>
      </p>
    </main>
  );
}
