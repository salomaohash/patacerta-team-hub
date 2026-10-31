import { describe, expect, it } from "vitest";
import { institutionEvolution, institutionMetrics } from "./institution-metrics";
const today = new Date("2026-10-31T12:00:00Z");
const pet = (id: string, status = "published") => ({ id, status, created_at: "2026-07-01T10:00:00Z" });
const app = (id: string, status = "received", date: string | null = null) => ({ id, animal_id: id, status, created_at: "2026-10-26T10:00:00Z", adopted_at: date });
describe("institution metrics", () => {
  it("counts published, adopted and waiting animals excluding drafts", () => {
    const m = institutionMetrics([pet("a"), pet("b", "paused"), pet("c", "adopted"), pet("d", "draft")], [], [], today);
    expect([m.published, m.adopted, m.waiting]).toEqual([1, 1, 2]);
  });
  it("recognizes recorded adoptions even when the pet status has not changed", () => {
    const m = institutionMetrics([pet("a")], [app("a", "adopted", "2026-10-01")], [], today);
    expect([m.published, m.adopted, m.waiting]).toEqual([0, 1, 0]);
  });
  it("groups received, reviewing and concluded applications", () => {
    const statuses = ["received", "information", "conversation", "visit", "pending_decision", "approved", "declined", "withdrawn", "adopted"];
    const m = institutionMetrics([], statuses.map((s, i) => app(String(i), s)), [], today);
    expect([m.received, m.reviewing, m.concluded]).toEqual([1, 5, 3]);
  });
  it("requires three valid distinct animals for the average", () => {
    const pets = [pet("a"), pet("b"), pet("c")];
    const apps = [app("a", "adopted", "2026-07-11"), app("b", "adopted", "2026-07-21"), app("c", "adopted", "2026-07-31")];
    expect(institutionMetrics(pets, apps.slice(0, 2), [], today).averageDays).toBeNull();
    expect(institutionMetrics(pets, apps, [], today).averageDays).toBe(20);
  });
  it("excludes missing, invalid, future and negative adoption durations", () => {
    const m = institutionMetrics([pet("a"), pet("b"), pet("c"), pet("d")], [app("a", "adopted", null), app("b", "adopted", "bad"), app("c", "adopted", "2027-01-01"), app("d", "adopted", "2026-06-01")], [], today);
    expect(m.adoptionSamples).toBe(0);
    expect(m.averageDays).toBeNull();
  });
  it("counts completed check-ins and only due unanswered check-ins as pending", () => {
    const m = institutionMetrics([], [app("a", "adopted", "2026-09-01")], [{ application_id: "a", day: 30 }], today);
    expect([m.completed, m.pending]).toEqual([1, 2]);
  });
  it("groups weekly applications and deduplicated dated adoptions with Monday boundaries", () => {
    const apps = [app("a", "adopted", "2026-10-26"), { ...app("duplicate", "adopted", "2026-10-26"), animal_id: "a", created_at: "2026-10-25T10:00:00Z" }];
    const rows = institutionEvolution(apps, "week", today);
    expect(rows).toHaveLength(8);
    expect(rows.at(-1)?.applications).toBe(1);
    expect(rows.at(-2)?.applications).toBe(1);
    expect(rows.at(-1)?.adoptions).toBe(1);
  });
  it("groups monthly counts and includes empty months", () => {
    const rows = institutionEvolution([app("a", "adopted", "2026-09-30")], "month", today);
    expect(rows).toHaveLength(6);
    expect(rows.at(-1)?.applications).toBe(1);
    expect(rows.at(-2)?.adoptions).toBe(1);
    expect(rows[0]?.applications).toBe(0);
  });
});