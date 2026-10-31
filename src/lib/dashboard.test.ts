import { describe, expect, it } from "vitest";
import { deriveTasks, missingForPublication, overview, stageOf } from "./dashboard";
const app = (o: Partial<{ id: string; status: string; next_step: string; adopted_at: string | null; institution_id: string | null }>) => ({
  id: "a", status: "received", next_step: "Responder à candidatura", adopted_at: null, institution_id: "i", ...o,
});
describe("dashboard rules", () => {
  it("blocks publication without name, photo, description and data source", () => {
    expect(missingForPublication({ name: "Mel" })).toEqual(["Fotografia", "Descrição", "Origem dos dados"]);
  });
  it("groups declined, adopted and withdrawn as closed", () => {
    expect(["declined", "adopted", "withdrawn"].map(stageOf)).toEqual(["closed", "closed", "closed"]);
    expect(stageOf("pending_decision")).toBe("decision");
  });
  it("creates no next-step task for closed applications", () => {
    expect(deriveTasks([app({ status: "declined" })], [])).toEqual([]);
  });
  it("creates a 30-day check-in task once due", () => {
    const t = deriveTasks([app({ status: "adopted", adopted_at: "2026-01-01", next_step: "Sem tarefa pendente" })], [], new Date("2026-02-05"));
    expect(t.map((x) => x.label)).toEqual(["Check-in dos 7 dias", "Check-in dos 30 dias"]);
  });
  it("flags help requests for team review", () => {
    const t = deriveTasks([app({ status: "adopted", adopted_at: "2026-01-01", next_step: "Sem tarefa pendente" })], [{ application_id: "a", day: 30, needs_help: true }], new Date("2026-02-05"));
    expect(t.some((x) => x.kind === "help")).toBe(true);
  });
  it("counts unanswered applications", () => {
    expect(overview([app({}), app({ id: "b", status: "visit" })], [], []).unanswered).toBe(1);
  });
});
