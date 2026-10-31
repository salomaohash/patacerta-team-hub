import { describe, expect, it } from "vitest";
import { dashboardCounts } from "./dashboard";
import { homeStats } from "@/lib/home-stats";

describe("catalog dashboard totals", () => {
  it("counts the ten existing notices as seven lost and three found", () => {
    expect(dashboardCounts().find((stat) => stat.label === "Avisos de desaparecidos")?.value).toBe(7);
    expect(dashboardCounts().find((stat) => stat.label === "Avisos de encontrados")?.value).toBe(3);
  });
  it("counts the 28 catalog animals across associations", () => {
    expect(dashboardCounts().slice(0, 3).reduce((sum, stat) => sum + stat.value, 0)).toBe(28);
  });
  it("keeps nine questionnaire questions", () => {
    expect(homeStats.find((stat) => stat.label === "Perguntas no questionário")?.value).toBe(9);
  });
});