// Sessão local, guardada apenas no navegador.
import { useSyncExternalStore } from "react";

export type Role = "adopter" | "association";
export type Papel = "adotante" | "associacao";
export interface SessionData { nome: string; email: string; papel: Papel }
export interface DemoUser extends SessionData { name: string; role: Role }
type LegacyUser = { name: string; email: string; role: Role };
const KEY = "patacerta.session";
const listeners = new Set<() => void>();
let cache: DemoUser | null | undefined;

function normalize(value: unknown): DemoUser | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const nome = typeof data["nome"] === "string" ? data["nome"] : data["name"];
  const papel = data["papel"] ?? (data["role"] === "association" ? "associacao" : data["role"] === "adopter" ? "adotante" : null);
  if (typeof nome !== "string" || !nome.trim() || typeof data["email"] !== "string" || (papel !== "adotante" && papel !== "associacao")) return null;
  return { nome, name: nome, email: data["email"], papel, role: papel === "associacao" ? "association" : "adopter" };
}
function read(): DemoUser | null {
  if (typeof window === "undefined") return null;
  if (cache === undefined) {
    try { cache = normalize(JSON.parse(localStorage.getItem(KEY) || "null")); }
    catch { cache = null; }
  }
  return cache ?? null;
}
export function signIn(data: SessionData | LegacyUser) {
  const user = normalize(data);
  if (!user) return;
  localStorage.setItem(KEY, JSON.stringify({ nome: user.nome, email: user.email, papel: user.papel }));
  cache = user;
  listeners.forEach((listener) => listener());
}
export function signOut() {
  localStorage.removeItem(KEY);
  cache = null;
  listeners.forEach((listener) => listener());
}
export type SessionDestination = "/painel" | "/dashboard" | "/favoritos";
export function sessionDestination(value: unknown): SessionDestination {
  return value === "/dashboard" || value === "/favoritos" ? value : "/painel";
}
export function useSession(): DemoUser | null {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, read, () => null);
}
