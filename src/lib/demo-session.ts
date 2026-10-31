import { useSyncExternalStore } from "react";

export type Papel = "adotante" | "associacao";

export interface DemoUser {
  name: string;
  initials: string;
  papel: Papel;
}

// Estado apenas em memória: um refresh da página volta ao estado "sem sessão".
let demoUser: DemoUser | null = null;
const listeners = new Set<() => void>();

export function signInDemo(name = "", papel: Papel = "adotante") {
  const displayName = name.trim();
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toLocaleUpperCase("pt-PT");
  demoUser = { name: displayName, initials, papel };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function signOutDemo() {
  demoUser = null;
  listeners.forEach((l) => l());
}

export function useDemoUser(): DemoUser | null {
  return useSyncExternalStore(subscribe, () => demoUser, () => null);
}
