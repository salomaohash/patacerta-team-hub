import { describe, expect, it } from "vitest";
import {
  ageRangeOf,
  filterProducts,
  missingForProductPublication,
  suitability,
  type Product,
  type ProductData,
} from "./marketplace";

function product(over: Partial<ProductData> = {}): Product {
  return {
    id: "p1",
    companyId: "c1",
    companyName: "Empresa",
    companyCity: "",
    status: "published",
    isDemo: false,
    createdAt: "",
    data: {
      name: "Produto",
      brand: "Marca",
      category: "conforto",
      description: "Descrição",
      photos: ["https://example.com/foto.jpg"],
      price: "",
      availability: "",
      purchaseUrl: "https://example.com/comprar",
      species: ["cão"],
      sizes: ["médio"],
      ageRanges: ["adulto"],
      materials: "",
      sizeInfo: "",
      instructions: "",
      warnings: "",
      needs: [],
      therapeutic: false,
      sponsored: false,
      ...over,
    },
  };
}

describe("ageRangeOf", () => {
  it("classifica júnior, adulto e sénior", () => {
    expect(ageRangeOf(0)).toBe("júnior");
    expect(ageRangeOf(3)).toBe("adulto");
    expect(ageRangeOf(8)).toBe("sénior");
  });
});

describe("filterProducts", () => {
  it("pesquisa por nome, marca e descrição", () => {
    const list = [product({ name: "Cama redonda" }), product({ brand: "Soneca" })];
    expect(filterProducts(list, { q: "cama" })).toHaveLength(1);
    expect(filterProducts(list, { q: "soneca" })).toHaveLength(1);
  });
  it("só mostra correspondências explícitas de espécie, porte e idade", () => {
    const semIndicacao = product({ species: [], sizes: [], ageRanges: [] });
    const list = [product(), semIndicacao];
    expect(filterProducts(list, { species: "cão" })).toHaveLength(1);
    expect(filterProducts(list, { species: "gato" })).toHaveLength(0);
    expect(filterProducts(list, { size: "pequeno" })).toHaveLength(0);
    expect(filterProducts(list, { age: "adulto" })).toHaveLength(1);
    expect(filterProducts(list, {})).toHaveLength(2);
  });
});

describe("suitability", () => {
  it("sem critérios não avalia", () => {
    expect(suitability(product(), null).level).toBe("none");
    expect(suitability(product(), {}).level).toBe("none");
  });
  it("compatível quando todos os dados dados correspondem", () => {
    const s = suitability(product(), { species: "cão", size: "médio", ageYears: 3 });
    expect(s.level).toBe("compatible");
    expect(s.reasons.length).toBeGreaterThan(0);
  });
  it("relevante quando partilha necessidades do animal", () => {
    const s = suitability(product({ needs: ["mobilidade"] }), {
      species: "cão",
      needs: ["mobilidade"],
    });
    expect(s.level).toBe("relevant");
  });
  it("incompatível quando a indicação do fabricante exclui o animal", () => {
    expect(suitability(product(), { species: "gato" }).level).toBe("mismatch");
    expect(suitability(product(), { size: "grande" }).level).toBe("mismatch");
    expect(suitability(product(), { ageYears: 10 }).level).toBe("mismatch");
  });
  it("assinala dados em falta sem os inventar", () => {
    const s = suitability(product({ species: [] }), { species: "cão" });
    expect(s.missing).toContain("espécie não indicada pelo fabricante");
  });
  it("produtos terapêuticos pedem sempre confirmação veterinária", () => {
    const s = suitability(product({ therapeutic: true }), { species: "cão" });
    expect(s.vetNote).toBe(true);
  });
});

describe("missingForProductPublication", () => {
  it("exige nome, marca, descrição, fotografia, ligação e espécies", () => {
    const d = product().data;
    expect(missingForProductPublication(d)).toEqual([]);
    expect(
      missingForProductPublication({ ...d, photos: [], purchaseUrl: "", species: [] }),
    ).toEqual(["fotografia", "ligação para compra", "espécies suportadas"]);
  });
});
