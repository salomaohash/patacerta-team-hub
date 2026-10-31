import { describe, expect, it } from "vitest";
import { animals, associations } from "@/lib/animals";
import { notices } from "@/lib/notices";
import { homeStats } from "@/lib/home-stats";

describe("Homepage demo statistics", () => {
  it("excludes adopted animals", () => {
    expect(homeStats[0]?.value).toBe(animals.filter((a) => a.status === "active").length);
    expect(homeStats[0]?.value).toBeLessThan(animals.length);
  });
  it("counts catalog associations rather than external references", () => {
    expect(homeStats[1]?.value).toBe(associations.length);
  });
  it("counts disappeared notices only", () => {
    expect(homeStats[2]?.value).toBe(notices.filter((n) => n.tipo === "desaparecido").length);
    expect(homeStats[2]?.value).toBeLessThan(notices.length);
  });
  it("shows nine questionnaire questions", () => {
    expect(homeStats[3]?.value).toBe(9);
  });
});