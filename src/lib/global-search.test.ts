import { describe, expect, it } from "vitest";
import { globalSearch } from "./global-search";
import { animals, getAnimal } from "./animals";
import { filterNotices } from "./notices";

describe("expanded demo catalog", () => {
  it("adds fourteen animals to the original fourteen", () => { expect(animals).toHaveLength(28); expect(new Set(animals.map((a) => a.id)).size).toBe(28); });
  it("provides three to four photos and retains each primary photo", () => { for (const a of animals) { expect(a.photos.length).toBeGreaterThanOrEqual(3); expect(a.photos.length).toBeLessThanOrEqual(4); expect(a.photos[0]).toBe(a.photo); } });
  it("includes at least two adopted animals", () => { expect(animals.filter((a) => a.status === "adopted").length).toBeGreaterThanOrEqual(2); });
  it("keeps the two puppies in the same litter", () => { expect(getAnimal("pipoca")?.litterId).toBe("ninhada-laos-demo"); expect(getAnimal("lume")?.litterId).toBe("ninhada-laos-demo"); expect(getAnimal("pipoca")?.ageYears).toBe(0.25); });
  it("search begins at two characters", () => { expect(globalSearch("a")).toEqual({ adoption: [], community: [] }); expect(globalSearch("pé").adoption.map((a) => a.id)).toContain("pezinho"); });
  it("searches both groups and excludes adopted animals", () => { expect(globalSearch("porto").adoption.length).toBeGreaterThan(0); expect(globalSearch("porto").community.length).toBeGreaterThan(0); expect(globalSearch("vitória").adoption).toEqual([]); });
  it("combines notice species and zone without adoption attributes", () => { expect(filterNotices("desaparecido", "", "Lisboa", "cão").map((n) => n.id)).toEqual(["nico-lisboa"]); });
});