import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { signIn, sessionDestination, type Papel } from "@/lib/state/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const input = "w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent-deep";
type Field = "nome" | "email" | "password";
export function validateAuth(mode: "login" | "register", nome: string, email: string, password: string): { field: Field; message: string } | null {
  if (mode === "register" && !nome.trim()) return { field: "nome", message: "Indica o teu nome." };
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return { field: "email", message: "Indica um email válido." };
  if (password.length < 6) return { field: "password", message: "A palavra-passe precisa de pelo menos 6 caracteres." };
  return null;
}
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [papel, setPapel] = useState<Papel>("adotante");
  const [error, setError] = useState<ReturnType<typeof validateAuth>>(null);
  const isReg = mode === "register";
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateAuth(mode, name, email, password);
    setError(invalid);
    if (invalid) return;
    signIn({ nome: isReg ? name.trim() : (email.trim().split("@")[0] ?? email.trim()), email: email.trim().toLowerCase(), papel });
    navigate({ to: sessionDestination(search.returnTo) });
  }
  const accessibility = (field: Field) => ({ "aria-invalid": error?.field === field, "aria-describedby": error?.field === field ? "auth-error" : undefined });
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <p className="eyebrow">{isReg ? "Criar conta" : "Bem-vindo de volta"}</p>
      <h1 className="mt-4 text-4xl">{isReg ? "Registar" : "Entrar"}</h1>
      <p className="mt-3 text-sm text-muted-foreground">Os dados ficam apenas neste navegador.</p>
      <form onSubmit={submit} noValidate className="mt-12 space-y-4">
        {isReg && <div><label htmlFor="auth-nome" className="mb-2 block text-sm">Nome</label><Input id="auth-nome" autoComplete="name" className={input} value={name} {...accessibility("nome")} onChange={(e) => { setName(e.target.value); setError(null); }} /></div>}
        <div><label htmlFor="auth-email" className="mb-2 block text-sm">Email</label><Input id="auth-email" autoComplete="email" className={input} type="email" value={email} {...accessibility("email")} onChange={(e) => { setEmail(e.target.value); setError(null); }} /></div>
        <div><label htmlFor="auth-password" className="mb-2 block text-sm">Palavra-passe</label><Input id="auth-password" autoComplete={isReg ? "new-password" : "current-password"} className={input} type="password" value={password} {...accessibility("password")} onChange={(e) => { setPassword(e.target.value); setError(null); }} /></div>
        <fieldset><legend className="mb-2 text-sm">Papel</legend><div className="grid grid-cols-2 gap-3">{([["adotante", "Adotante"], ["associacao", "Associação"]] as const).map(([value, label]) => <Button variant="outline" key={value} type="button" aria-pressed={papel === value} onClick={() => { setPapel(value); setError(null); }} className={`h-auto rounded-lg border border-border px-4 py-3 ${papel === value ? "bg-secondary" : "bg-card"}`}>{label}</Button>)}</div></fieldset>
        {error && <p id="auth-error" role="alert" className="text-sm text-destructive">{error.message}</p>}
        <Button type="submit" className="h-auto w-full rounded-lg py-3">{isReg ? "Criar conta" : "Entrar"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">{isReg ? "Já tens conta? " : "Ainda não tens conta? "}<Link to={isReg ? "/entrar" : "/registar"} search={{ returnTo: search.returnTo }} className="text-accent-deep underline">{isReg ? "Entrar" : "Registar"}</Link></p>
    </main>
  );
}
