import { describe, expect, it } from "vitest";
import { validateAuth } from "./AuthForm";

describe("manual authentication validation", () => {
  it("validates the registration name before email and password", () => {
    expect(validateAuth("register", " ", "bad", "1")?.field).toBe("nome");
  });
  it("requires a valid email before validating password", () => {
    expect(validateAuth("register", "Ana", "bad", "1")?.field).toBe("email");
  });
  it("requires at least six password characters", () => {
    expect(validateAuth("login", "", "ana@example.com", "12345")?.field).toBe("password");
    expect(validateAuth("login", "", "ana@example.com", "123456")).toBeNull();
  });
});