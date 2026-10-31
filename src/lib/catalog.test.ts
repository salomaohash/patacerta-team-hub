import { describe, expect, it } from "vitest";
import { filterAnimals } from "./catalog";

describe("Inesquecíveis", () => {
  it("filters situacao=esquecidos to active senior and special-needs animals", () => {
    expect(filterAnimals({ situacao: "esquecidos" }).map((a) => a.id)).toEqual([
      "zeca", "tobias", "nala", "mimi", "kika", "mel",
    ]);
  });
  it("combines the Inesquecíveis selection with species", () => {
    expect(filterAnimals({ situacao: "esquecidos", especie: "gato" }).map((a) => a.id)).toEqual(["mimi", "kika", "mel"]);
  });
});