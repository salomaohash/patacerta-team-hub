import { describe, expect, it } from "vitest";
import {
  activityEvolution,
  activityIndicators,
  describeEvent,
  levelAt,
  liveDelay,
  relTime,
  type DemoActivityEvent,
} from "./demo-activity";

const NOW = new Date("2026-10-31T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600000).toISOString();

function ev(partial: Partial<DemoActivityEvent>): DemoActivityEvent {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    kind: partial.kind ?? "visit",
    actor_name: partial.actor_name ?? "Mariana",
    animal_name: partial.animal_name ?? "Luna",
    match_pct: partial.match_pct ?? null,
    batch: partial.batch ?? "history",
    seq: partial.seq ?? null,
    occurred_at: partial.occurred_at ?? hoursAgo(2),
  };
}

describe("activityIndicators", () => {
  it("conta cada tipo de evento nos indicadores certos", () => {
    const events = [
      ev({ kind: "visit" }),
      ev({ kind: "profile_view" }),
      ev({ kind: "quiz" }),
      ev({ kind: "match", match_pct: 90 }),
      ev({ kind: "application" }),
      ev({ kind: "interview" }),
      ev({ kind: "adoption" }),
      ev({ kind: "favorite" }),
      ev({ kind: "followup" }),
    ];
    const m = activityIndicators(events, NOW);
    expect(m.visits).toBe(2);
    expect(m.quizzes).toBe(1);
    expect(m.matches).toBe(1);
    expect(m.applications).toBe(1);
    expect(m.interviews).toBe(1);
    expect(m.adoptions).toBe(1);
  });

  it("conta visitantes ativos distintos apenas nos últimos 7 dias", () => {
    const events = [
      ev({ actor_name: "Ana", occurred_at: hoursAgo(2) }),
      ev({ actor_name: "Ana", occurred_at: hoursAgo(5) }),
      ev({ actor_name: "Rui", occurred_at: hoursAgo(24 * 3) }),
      ev({ actor_name: "Sofia", occurred_at: hoursAgo(24 * 10) }),
    ];
    expect(activityIndicators(events, NOW).activeVisitors).toBe(2);
  });

  it("sem eventos, todos os indicadores são zero", () => {
    const m = activityIndicators([], NOW);
    expect(m).toEqual({
      visits: 0,
      activeVisitors: 0,
      quizzes: 0,
      matches: 0,
      applications: 0,
      interviews: 0,
      adoptions: 0,
    });
  });
});

describe("activityEvolution", () => {
  it("agrupa por 8 semanas com início à segunda-feira e inclui a semana atual", () => {
    const events = [
      ev({ kind: "visit", occurred_at: hoursAgo(3) }),
      ev({ kind: "application", occurred_at: hoursAgo(3) }),
      ev({ kind: "adoption", occurred_at: hoursAgo(24 * 9) }),
    ];
    const series = activityEvolution(events, "week", NOW);
    expect(series).toHaveLength(8);
    expect(new Date(series.at(0)?.start ?? "").getUTCDay()).toBe(1);
    const last = series.at(-1);
    expect(last?.visits).toBe(1);
    expect(last?.applications).toBe(1);
    expect(series.at(-2)?.adoptions).toBe(1);
  });

  it("agrupa por 6 meses incluindo o mês atual", () => {
    const events = [ev({ kind: "visit", occurred_at: hoursAgo(5) })];
    const series = activityEvolution(events, "month", NOW);
    expect(series).toHaveLength(6);
    expect(series.at(5)?.visits).toBe(1);
    expect(series.at(0)?.start.endsWith("-01")).toBe(true);
  });

  it("ignora eventos fora do intervalo apresentado", () => {
    const events = [ev({ kind: "visit", occurred_at: hoursAgo(24 * 400) })];
    const series = activityEvolution(events, "week", NOW);
    expect(series.reduce((acc, b) => acc + b.visits, 0)).toBe(0);
  });
});

describe("describeEvent", () => {
  it("descreve cada tipo de evento sem expor dados reais", () => {
    expect(describeEvent(ev({ kind: "profile_view", actor_name: "Inês", animal_name: "Luna" }))).toBe(
      "Inês consultou o perfil de Luna.",
    );
    expect(describeEvent(ev({ kind: "match", animal_name: "Max", match_pct: 92 }))).toBe(
      "Foi encontrada uma correspondência de 92% para Max.",
    );
    expect(describeEvent(ev({ kind: "application", animal_name: "Max" }))).toBe(
      "Foi submetida uma candidatura para Max.",
    );
    expect(describeEvent(ev({ kind: "interview", animal_name: "Rex" }))).toBe(
      "Foi agendada uma entrevista para Rex.",
    );
    expect(describeEvent(ev({ kind: "adoption", animal_name: "Nala" }))).toContain("adoção foi concluída");
  });
});

describe("relTime", () => {
  it("formata tempos relativos em português europeu", () => {
    expect(relTime(hoursAgo(0), NOW)).toBe("agora mesmo");
    expect(relTime(new Date(NOW.getTime() - 5 * 60000).toISOString(), NOW)).toBe("há 5 min");
    expect(relTime(hoursAgo(3), NOW)).toBe("há 3 h");
    expect(relTime(hoursAgo(24 * 2), NOW)).toBe("há 2 dias");
    expect(relTime(hoursAgo(24 * 14), NOW)).toBe("há 2 semanas");
  });
});

describe("liveDelay e níveis de atividade", () => {
  it("varia os níveis de atividade ao longo da sequência", () => {
    const levels = new Set(Array.from({ length: 28 }, (_, i) => levelAt(i)));
    expect(levels.has("calmo")).toBe(true);
    expect(levels.has("moderado")).toBe(true);
    expect(levels.has("intenso")).toBe(true);
  });

  it("produz intervalos dentro dos limites de cada nível e determinísticos", () => {
    for (let i = 0; i < 28; i++) {
      const d = liveDelay(i);
      expect(d).toBeGreaterThanOrEqual(4000);
      expect(d).toBeLessThanOrEqual(30000);
      expect(liveDelay(i)).toBe(d);
    }
  });

  it("não repete sempre o mesmo intervalo", () => {
    const delays = new Set(Array.from({ length: 28 }, (_, i) => liveDelay(i)));
    expect(delays.size).toBeGreaterThan(10);
  });
});
