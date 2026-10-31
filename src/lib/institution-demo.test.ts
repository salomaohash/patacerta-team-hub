import { describe, expect, it } from "vitest";
import { showsInstitutionDemo, institutionDemo } from "./institution-demo";
import { institutionEvolution, institutionMetrics } from "./institution-metrics";

describe("public institution preview", () => {
  it("shows a demo without an account", () => {
    expect(showsInstitutionDemo(null)).toBe(true);
    expect(institutionDemo().pets.length).toBeGreaterThan(0);
  });
  it("keeps browser demo sessions in the demo", () => {
    expect(showsInstitutionDemo({ id: "demo", isDemo: true })).toBe(true);
  });
  it("does not substitute the demo for a real signed-in workspace", () => {
    expect(showsInstitutionDemo({ id: "real", isDemo: false })).toBe(false);
  });
  it("populates adoption indicators with coherent fictional records", () => {
    const today = new Date("2026-10-31T12:00:00Z");
    const data = institutionDemo(today);
    expect(institutionMetrics(data.pets, data.applications, data.checkins, today)).toMatchObject({
      published: 8, adopted: 3, waiting: 9, received: 2, reviewing: 5,
      concluded: 5, completed: 3, pending: 3, adoptionSamples: 3, averageDays: 28,
    });
    expect(data.applications.every(a => a.is_demo)).toBe(true);
  });
  it("keeps recent activity visible as the preview date changes", () => {
    const today = new Date("2027-04-15T12:00:00Z");
    const data = institutionDemo(today);
    const weeks = institutionEvolution(data.applications, "week", today);
    expect(weeks.at(-1)?.applications).toBe(2);
    expect(weeks.reduce((sum, w) => sum + w.adoptions, 0)).toBe(2);
    expect(data.events[0]?.occurred_at.slice(0, 10)).toBe("2027-04-15");
    expect(data.checkins.filter(c => c.needs_help)).toHaveLength(1);
  });
});