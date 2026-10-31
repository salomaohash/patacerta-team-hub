// Favoritos de demonstração — guardados no navegador, por email.
import { useSyncExternalStore } from "react";
import { useSession } from "./session";

const listeners = new Set<() => void>();
const caches = new Map<string, string[]>();
const EMPTY: string[] = [];
const key = (email: string) => `patacerta.favorites.${email}`;

function read(email: string): string[] {
  if (typeof window === "undefined") return EMPTY;
  if (!caches.has(email)) {
    try {
      caches.set(email, JSON.parse(localStorage.getItem(key(email)) || "[]"));
    } catch {
      caches.set(email, []);
    }
  }
  return caches.get(email)!;
}

export function toggleFavorite(email: string, id: string) {
  const cur = read(email);
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  caches.set(email, next);
  localStorage.setItem(key(email), JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useFavorites(): string[] {
  const user = useSession();
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => (user ? read(user.email) : EMPTY),
    () => EMPTY,
  );
}
