import { describe, expect, it } from "vitest";
import { globalSearch } from "./global-search";
import { animals, getAnimal } from "./animals";
import { filterNotices } from "./notices";

describe("expanded demo catalog", () => {
  it("filters breed", () => { expect(globalSearch("", { breed: "Podengo" }).adoption.map((a) => a.id)).toEqual(["tobias"]); });
  it("filters sex", () => { const result = globalSearch("", { sex: "fêmea" }); expect(result.adoption.length).toBeGreaterThan(0); expect(result.adoption.every((a) => a.sex === "fêmea")).toBe(true); expect(result.adoption.map((a) => a.id)).not.toContain("thor"); });
  it("filters minimum and maximum age", () => { expect(globalSearch("", { minAge: "0", maxAge: "0.5" }).adoption.map((a) => a.id)).toEqual(["pipoca", "lume"]); expect(globalSearch("", { minAge: "14" }).adoption.map((a) => a.id)).toEqual(["rosinha"]); });
  it("filters size", () => { const result = globalSearch("", { size: "grande" }); expect(result.adoption.map((a) => a.id)).toContain("zeca"); expect(result.adoption.every((a) => a.size === "grande")).toBe(true); });
  it("filters location in both groups", () => { expect(globalSearch("", { location: "Braga" }).community.map((n) => n.id)).toEqual(["bento-braga"]); expect(globalSearch("", { location: "Braga" }).adoption).toEqual([]); });
  it("does not guess missing notice attributes", () => { expect(globalSearch("", { sex: "macho" }).community).toEqual([]); });
  it("adds fourteen animals to the original fourteen", () => { expect(animals).toHaveLength(28); expect(new Set(animals.map((a) => a.id)).size).toBe(28); });
  it("provides three to four photos and retains each primary photo", () => { for (const a of animals) { expect(a.photos.length).toBeGreaterThanOrEqual(3); expect(a.photos.length).toBeLessThanOrEqual(4); expect(a.photos[0]).toBe(a.photo); } });
  it("includes at least two adopted animals", () => { expect(animals.filter((a) => a.status === "adopted").length).toBeGreaterThanOrEqual(2); });
  it("keeps the two puppies in the same litter", () => { expect(getAnimal("pipoca")?.litterId).toBe("ninhada-laos-demo"); expect(getAnimal("lume")?.litterId).toBe("ninhada-laos-demo"); expect(getAnimal("pipoca")?.ageYears).toBe(0.25); });
  it("provides all four photos for the three-legged dog", () => { expect(getAnimal("pezinho")?.photos).toHaveLength(4); expect(getAnimal("pezinho")?.forgotten?.kind).toBe("Tripé"); expect(getAnimal("amalia")?.forgotten?.kind).toBe("Cegueira"); });
  it("distributes the new animals across the three existing associations", () => { const added = animals.slice(14); expect(added.filter((a) => a.associationId === "porto")).toHaveLength(5); expect(added.filter((a) => a.associationId === "lisboa")).toHaveLength(5); expect(added.filter((a) => a.associationId === "coimbra")).toHaveLength(4); expect(added.filter((a) => a.species === "cão")).toHaveLength(10); expect(added.filter((a) => a.species === "gato")).toHaveLength(4); });
  it("search begins at two characters", () => { expect(globalSearch("a")).toEqual({ adoption: [], community: [] }); expect(globalSearch("pé").adoption.map((a) => a.id)).toContain("pezinho"); });
  it("searches both groups and excludes adopted animals", () => { expect(globalSearch("porto").adoption.length).toBeGreaterThan(0); expect(globalSearch("porto").community.length).toBeGreaterThan(0); expect(globalSearch("vitória").adoption).toEqual([]); });
  it("combines notice species and zone without adoption attributes", () => { expect(filterNotices("desaparecido", "", "Lisboa", "cão").map((n) => n.id)).toEqual(["nico-lisboa"]); });
});