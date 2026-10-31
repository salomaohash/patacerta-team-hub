import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { sessionDestination, signIn, signOut, useSession } from "./session";

describe("local session", () => {
  it("stores only the Portuguese session fields and notifies subscribers", () => {
    const { result } = renderHook(() => useSession());
    act(() => signIn({ nome: "Ana", email: "ana@example.com", papel: "associacao" }));
    expect(JSON.parse(localStorage.getItem("patacerta.session") ?? "null")).toEqual({ nome: "Ana", email: "ana@example.com", papel: "associacao" });
    expect(result.current?.papel).toBe("associacao");
    expect(result.current?.role).toBe("association");
    act(() => signOut());
    expect(result.current).toBeNull();
    expect(localStorage.getItem("patacerta.session")).toBeNull();
  });
  it("returns to the original protected destination, never an external address", () => {
    expect(sessionDestination("/dashboard")).toBe("/dashboard");
    expect(sessionDestination("/favoritos")).toBe("/favoritos");
    expect(sessionDestination("https://example.com")).toBe("/painel");
  });
});