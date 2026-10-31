// Sessão de demonstração — guardada apenas no navegador (localStorage).
import { useSyncExternalStore } from "react";

export type Role = "adopter" | "association";
export interface DemoUser {
  name: string;
  email: string;
  role: Role;
}

const KEY = "patacerta.session";
const listeners = new Set<() => void>();
let cache: DemoUser | null | undefined;

function read(): DemoUser | null {
  if (typeof window === "undefined") return null;
  if (cache === undefined) {
    try {
      cache = JSON.parse(localStorage.getItem(KEY) || "null");
    } catch {
      cache = null;
    }
  }
  return cache ?? null;
}

function write(u: DemoUser | null) {
  cache = u;
  if (u) localStorage.setItem(KEY, JSON.stringify(u));
  else localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

export const signIn = (u: DemoUser) => write(u);
export const signOut = () => write(null);

export function useSession(): DemoUser | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => null,
  );
}
