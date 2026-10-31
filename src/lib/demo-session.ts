import { useSyncExternalStore } from "react";

export interface DemoUser {
  name: string;
  initials: string;
}

// Estado apenas em memória: um refresh da página volta ao estado "sem sessão".
let demoUser: DemoUser | null = null;
const listeners = new Set<() => void>();

export function signInDemo(name = "") {
  const displayName = name.trim();
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toLocaleUpperCase("pt-PT");
  demoUser = { name: displayName, initials };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useDemoUser(): DemoUser | null {
  return useSyncExternalStore(subscribe, () => demoUser, () => null);
}
