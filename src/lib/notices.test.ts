import { describe, expect, it } from "vitest";
import { notices, filterNotices, daysSince, getNotice, noticeMailto } from "./notices";
import { filterAnimals, sortAnimals } from "./catalog";

describe("community catalog", () => {
  it("contains seven missing and three found notices", () => {
    expect(notices.filter((n) => n.tipo === "desaparecido")).toHaveLength(7);
    expect(notices.filter((n) => n.tipo === "encontrado")).toHaveLength(3);
  });
  it("uses different photographs for Lola and Patusco", () => {
    const lola = getNotice("lola-serralves");
    const patusco = getNotice("patusco-porto");
    expect(lola).toBeDefined(); expect(patusco).toBeDefined();
    expect(lola?.foto).not.toBe(patusco?.foto);
  });
  it("searches missing posts by name, description and zone ignoring accents", () => {
    expect(filterNotices("desaparecido", "lola").map((n) => n.id)).toEqual(["lola-serralves"]);
    expect(filterNotices("desaparecido", "coleira azul").map((n) => n.id)).toEqual(["nico-lisboa"]);
    expect(filterNotices("desaparecido", "", "Lisboa", "gato").map((n) => n.id)).toEqual(["mia-lisboa"]);
  });
  it("orders notices newest first", () => {
    expect(filterNotices("desaparecido").map((n) => n.dataDocumento)).toEqual(["2026-10-31", "2026-10-31", "2026-10-30", "2026-10-30", "2026-10-29", "2026-10-28", "2026-10-27"]);
  });
  it("excludes adopted animals and searches adoption by breed and zone", () => {
    expect(filterAnimals({})).toHaveLength(26);
    expect(filterAnimals({ q: "Paco" }).map((a) => a.id)).not.toContain("paco");
    expect(filterAnimals({ q: "Jack Russell" }).map((a) => a.id)).toEqual(["kiko"]);
    expect(filterAnimals({ q: "coimbra" }).map((a) => a.id)).toEqual(["zeca", "nala", "pantufa", "mel", "bolota", "tono", "pezinho", "tremoço"]);
  });
  it("orders older adoption animals first", () => {
    expect(sortAnimals(filterAnimals({}), "idade", null)[0]?.id).toBe("rosinha");
  });
  it("calculates days by UTC date and never shows negative days", () => {
    expect(daysSince("2026-10-28", new Date("2026-10-31T11:15:00Z"))).toBe(3);
    expect(daysSince("2026-11-01", new Date("2026-10-31T11:15:00Z"))).toBe(0);
  });
  it("uses example contacts and a prefilled subject", () => {
    for (const notice of notices) {
      expect(notice.contactoEmail.endsWith("@example.com")).toBe(true);
      expect(noticeMailto(notice)).toContain("?subject=");
    }
    expect(getNotice("missing-id")).toBeUndefined();
  });
});