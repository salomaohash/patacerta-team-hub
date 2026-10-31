import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { signInDemo, useDemoUser } from "./demo-session";

describe("Demo entry identity", () => {
  it("keeps an empty name without inventing an account identity", () => {
    const { result } = renderHook(() => useDemoUser());
    act(() => signInDemo(""));
    expect(result.current).toEqual({ name: "", initials: "", papel: "adotante" });
  });

  it("uses the entered name in the dashboard identity", () => {
    const { result } = renderHook(() => useDemoUser());
    act(() => signInDemo("António Cardoso"));
    expect(result.current?.name).toBe("António Cardoso");
  });
});