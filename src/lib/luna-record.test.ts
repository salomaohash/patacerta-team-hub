import { describe, expect, it } from "vitest";
import { lunaRecord, todayCare, toggleCare } from "./luna-record";
const record = (section: string, field: string) => lunaRecord.find((item) => item.title === section)?.entries.find(([label]) => label === field)?.[1];
describe("Dados de saúde da Luna", () => {
  it("mantém a data de nascimento indicada", () => expect(record("Identificação", "Data de nascimento")).toBe("14 de março de 2024"));
  it("mantém o peso indicado", () => expect(record("Identificação", "Peso atual")).toBe("8,4 kg"));
  it("mantém a vacina anual agendada", () => expect(record("Vacinação", "Reforço anual")).toBe("15 de novembro de 2026 — Agendada"));
  it("mantém a consulta anual indicada", () => expect(record("Consultas e intervenções", "Próxima consulta anual")).toBe("15 de novembro de 2026"));
  it("mantém dois passeios diários de 20 a 30 minutos", () => expect(record("Cuidados e necessidades", "Passeios")).toBe("Dois por dia, entre 20 e 30 minutos"));
  it("não atribui medicação atual", () => expect(record("Cuidados e necessidades", "Medicação atual")).toBe("Nenhuma"));
  it("não atribui alergias conhecidas", () => expect(record("Cuidados e necessidades", "Saúde")).toBe("Sem alergias conhecidas"));
  it("mantém a alimentação de manhã e à noite", () => expect(record("Cuidados e necessidades", "Alimentação")).toBe("Ração para cão adulto, de manhã e à noite"));
  it("conclui e reabre cuidados sem duplicados", () => {
    const firstCare = todayCare[0];
    if (!firstCare) throw new Error("Cuidados de demonstração em falta");
    const id = firstCare.id;
    const checked = toggleCare([], id);
    expect(checked).toEqual([id]);
    expect(toggleCare(checked, id)).toEqual([]);
  });
});
