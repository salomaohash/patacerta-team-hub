import { describe, expect, it } from "vitest";
import {
  animalsNeedingAttention,
  attentionAlerts,
  greeting,
  intelligence,
  kanbanColumnOf,
  KANBAN_TARGET_STATUS,
  monthGrid,
  weekOf,
  type AppLike,
  type CalendarEventLike,
  type CheckinLike,
  type PetLike,
} from "./organization";

const today = new Date("2026-10-31T12:00:00Z");
const ago = (days: number) => new Date(today.getTime() - days * 86400000).toISOString();

const pet = (over: Partial<PetLike> & { id: string }): PetLike => ({
  status: "published",
  created_at: ago(10),
  updated_at: ago(2),
  profile: {},
  ...over,
});
const app = (over: Partial<AppLike> & { id: string }): AppLike => ({
  animal_id: "p1",
  status: "received",
  created_at: ago(1),
  adopted_at: null,
  institution_id: "inst",
  ...over,
});

describe("kanban", () => {
  it("mapeia estados para colunas e recusas discretas", () => {
    expect(kanbanColumnOf("received")).toBe("submitted");
    expect(kanbanColumnOf("information")).toBe("review");
    expect(kanbanColumnOf("conversation")).toBe("interview");
    expect(kanbanColumnOf("visit")).toBe("interview");
    expect(kanbanColumnOf("pending_decision")).toBe("approved");
    expect(kanbanColumnOf("approved")).toBe("approved");
    expect(kanbanColumnOf("adopted")).toBe("adopted");
    expect(kanbanColumnOf("declined")).toBe("declined");
    expect(kanbanColumnOf("withdrawn")).toBe("declined");
  });
  it("define o estado de destino de cada coluna", () => {
    expect(KANBAN_TARGET_STATUS.submitted).toBe("received");
    expect(KANBAN_TARGET_STATUS.interview).toBe("conversation");
    expect(KANBAN_TARGET_STATUS.adopted).toBe("adopted");
  });
});

describe("attentionAlerts", () => {
  it("sinaliza candidaturas novas, perfis desatualizados, eventos próximos, acompanhamentos e esperas longas", () => {
    const pets = [
      pet({ id: "p1", updated_at: ago(30) }),
      pet({ id: "p2", created_at: ago(90) }),
      pet({ id: "p3", status: "adopted" }),
    ];
    const apps = [
      app({ id: "a1" }),
      app({ id: "a2", status: "adopted", adopted_at: ago(40).slice(0, 10) }),
    ];
    const checkins: CheckinLike[] = [];
    const events: CalendarEventLike[] = [
      {
        id: "e1",
        kind: "interview",
        status: "scheduled",
        starts_at: new Date(today.getTime() + 2 * 86400000).toISOString(),
        title: "Entrevista",
      },
      {
        id: "e2",
        kind: "meeting",
        status: "cancelled",
        starts_at: new Date(today.getTime() + 86400000).toISOString(),
        title: "Reunião",
      },
    ];
    const alerts = attentionAlerts(pets, apps, checkins, events, today);
    const kinds = alerts.map((a) => a.kind);
    expect(kinds).toContain("applications");
    expect(kinds).toContain("stale");
    expect(kinds).toContain("events");
    expect(kinds).toContain("followups");
    expect(kinds).toContain("waiting");
    expect(alerts.find((a) => a.kind === "events")?.count).toBe(1);
  });
  it("não inventa alertas quando não há dados", () => {
    expect(attentionAlerts([], [], [], [], today)).toEqual([]);
  });
});

describe("animalsNeedingAttention", () => {
  it("identifica espera longa, ausência de candidaturas, informação desatualizada e necessidades especiais", () => {
    const pets = [
      pet({ id: "p1", created_at: ago(100), updated_at: ago(45) }),
      pet({ id: "p2", profile: { careComplexity: "alta" }, updated_at: ago(1) }),
      pet({ id: "p3", status: "adopted", created_at: ago(200) }),
    ];
    const apps = [app({ id: "a1", animal_id: "p2" })];
    const result = animalsNeedingAttention(pets, apps, today);
    const p1 = result.find((r) => r.petId === "p1");
    expect(p1?.reasons.join(" ")).toContain("À espera");
    expect(p1?.reasons.join(" ")).toContain("sem candidaturas");
    expect(p1?.reasons.join(" ")).toContain("sem atualização");
    expect(p1?.actions).toContain("Atualizar fotografias");
    const p2 = result.find((r) => r.petId === "p2");
    expect(p2?.reasons.join(" ")).toContain("Necessidades especiais");
    expect(result.some((r) => r.petId === "p3")).toBe(false);
  });
});

describe("intelligence", () => {
  it("calcula conversão, espera média, séniores, necessidades especiais e acompanhamentos", () => {
    const pets = [
      pet({ id: "p1", status: "adopted", created_at: ago(100), profile: { ageYears: 10 } }),
      pet({ id: "p2", status: "adopted", created_at: ago(70), profile: { careComplexity: "alta" } }),
      pet({ id: "p3", status: "adopted", created_at: ago(40) }),
      pet({ id: "p4" }),
    ];
    const apps = [
      app({ id: "a1", animal_id: "p1", status: "adopted", adopted_at: ago(20).slice(0, 10) }),
      app({ id: "a2", animal_id: "p2", status: "adopted", adopted_at: ago(10).slice(0, 10) }),
      app({ id: "a3", animal_id: "p3", status: "adopted", adopted_at: ago(5).slice(0, 10) }),
      app({ id: "a4", status: "declined" }),
      app({ id: "a5", status: "received" }),
    ];
    const checkins: CheckinLike[] = [
      { application_id: "a1", day: 7, needs_help: false },
      { application_id: "a1", day: 30, needs_help: false },
    ];
    const m = intelligence(pets, apps, checkins, today);
    expect(m.totalPublished).toBe(1);
    expect(m.totalAdopted).toBe(3);
    expect(m.applicationsReceived).toBe(5);
    expect(m.conversionRate).toBe(75);
    expect(m.averageWaitDays).toBe(Math.round((80 + 60 + 35) / 3));
    expect(m.seniorAdopted).toBe(1);
    expect(m.specialNeedsAdopted).toBe(1);
    expect(m.followupsCompleted).toBe(2);
    expect(m.followupsPending).toBeGreaterThan(0);
  });
  it("devolve valores nulos sem dados suficientes", () => {
    const m = intelligence([], [], [], today);
    expect(m.conversionRate).toBeNull();
    expect(m.averageWaitDays).toBeNull();
  });
});

describe("calendário", () => {
  it("gera semanas começadas à segunda-feira que cobrem o mês", () => {
    const weeks = monthGrid(2026, 9); // outubro 2026 começa numa quinta-feira
    expect(weeks[0]![0]!.toISOString().slice(0, 10)).toBe("2026-09-28");
    const last = weeks[weeks.length - 1];
    expect(last![6]!.getTime()).toBeGreaterThanOrEqual(Date.UTC(2026, 9, 31));
    for (const w of weeks) expect(w).toHaveLength(7);
  });
  it("calcula a semana de um dia", () => {
    const week = weekOf(new Date("2026-10-31T12:00:00Z")); // sábado
    expect(week[0]!.toISOString().slice(0, 10)).toBe("2026-10-26");
    expect(week[6]!.toISOString().slice(0, 10)).toBe("2026-11-01");
  });
});

describe("greeting", () => {
  it("saúda conforme a hora", () => {
    expect(greeting(new Date("2026-10-31T09:00:00"))).toBe("Bom dia");
    expect(greeting(new Date("2026-10-31T15:00:00"))).toBe("Boa tarde");
    expect(greeting(new Date("2026-10-31T22:00:00"))).toBe("Boa noite");
  });
});
