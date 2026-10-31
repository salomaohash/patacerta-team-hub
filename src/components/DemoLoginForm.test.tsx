import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoLoginForm } from "./DemoLoginForm";
import { useDemoUser } from "@/lib/demo-session";
import { renderHook } from "@testing-library/react";

const navigate = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  useSearch: () => ({ returnTo: undefined }),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock("@/components/DemoVideoCarousel", () => ({ DemoVideoCarousel: () => null }));
afterEach(() => { cleanup(); navigate.mockClear(); });

describe("Optional PataCerta entry", () => {
  it("opens the dashboard with all fields empty", () => {
    render(<DemoLoginForm />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" });
    const { result } = renderHook(() => useDemoUser());
    expect(result.current).toEqual({ name: "", initials: "", papel: "adotante" });
  });

  it("does not validate email or password and keeps only the name", () => {
    render(<DemoLoginForm />);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "António Cardoso" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "invalid" } });
    fireEvent.change(screen.getByLabelText("Palavra-passe"), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" });
    const { result } = renderHook(() => useDemoUser());
    expect(result.current).toEqual({ name: "António Cardoso", initials: "AC", papel: "adotante" });
  });

  it("does not start authentication or entry from the Google button", () => {
    render(<DemoLoginForm />);
    fireEvent.click(screen.getByRole("button", { name: "Continuar com Google" }));
    expect(navigate).not.toHaveBeenCalled();
  });
});