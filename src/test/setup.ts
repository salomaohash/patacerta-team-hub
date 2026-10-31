import "@testing-library/jest-dom/vitest";

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      _m: new Map<string, string>(),
      getItem(k: string) { return this._m.get(k) ?? null; },
      setItem(k: string, v: string) { this._m.set(k, String(v)); },
      removeItem(k: string) { this._m.delete(k); },
      clear() { this._m.clear(); },
    },
    configurable: true,
  });
}

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
