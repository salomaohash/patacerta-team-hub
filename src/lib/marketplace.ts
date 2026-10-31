import type { Size, Species } from "./animals";

export type ProductCategory =
  | "alimentação"
  | "higiene"
  | "passeio"
  | "conforto"
  | "brinquedos"
  | "mobilidade";
export type AgeRange = "júnior" | "adulto" | "sénior";
export type ProductNeed = "mobilidade" | "conforto" | "higiene" | "energia" | "sénior";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "alimentação",
  "higiene",
  "passeio",
  "conforto",
  "brinquedos",
  "mobilidade",
];
export const AGE_RANGES: AgeRange[] = ["júnior", "adulto", "sénior"];
export const PRODUCT_NEEDS: ProductNeed[] = [
  "mobilidade",
  "conforto",
  "higiene",
  "energia",
  "sénior",
];

export interface ProductData {
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  photos: string[];
  price: string;
  availability: string;
  purchaseUrl: string;
  species: Species[];
  sizes: Size[];
  ageRanges: AgeRange[];
  materials: string;
  sizeInfo: string;
  instructions: string;
  warnings: string;
  needs: ProductNeed[];
  therapeutic: boolean;
  sponsored: boolean;
}

export interface Product {
  id: string;
  companyId: string;
  companyName: string;
  companyCity: string;
  status: "draft" | "published" | "paused";
  isDemo: boolean;
  data: ProductData;
  createdAt: string;
}

export interface ProductFilters {
  q?: string | undefined;
  category?: string | undefined;
  species?: string | undefined;
  size?: string | undefined;
  age?: string | undefined;
}

export function ageRangeOf(ageYears: number): AgeRange {
  if (ageYears < 1) return "júnior";
  if (ageYears < 8) return "adulto";
  return "sénior";
}

function supports<T extends string>(declared: T[], value: string): boolean {
  return declared.length > 0 && declared.includes(value as T);
}

/**
 * Filtra o catálogo apenas por correspondências explícitas: um produto sem
 * indicação de espécie, porte ou idade não aparece quando esse filtro está
 * ativo, porque não há dados verificáveis que o sustentem.
 */
export function filterProducts(products: Product[], f: ProductFilters): Product[] {
  const q = (f.q ?? "").trim().toLowerCase();
  return products.filter((p) => {
    const d = p.data;
    if (q) {
      const hay = `${d.name} ${d.brand} ${d.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.category && d.category !== f.category) return false;
    if (f.species && !supports(d.species, f.species)) return false;
    if (f.size && !supports(d.sizes, f.size)) return false;
    if (f.age && !supports(d.ageRanges, f.age)) return false;
    return true;
  });
}

export interface AnimalCriteria {
  species?: Species | undefined;
  size?: Size | undefined;
  ageYears?: number | undefined;
  needs?: ProductNeed[] | undefined;
}

export type SuitabilityLevel = "none" | "compatible" | "relevant" | "mismatch" | "unknown";

export interface Suitability {
  level: SuitabilityLevel;
  reasons: string[];
  missing: string[];
  vetNote: boolean;
}

export function hasCriteria(c: AnimalCriteria | null): boolean {
  return !!c && (!!c.species || !!c.size || c.ageYears !== undefined || !!(c.needs?.length));
}

/**
 * Avalia a adequação apenas com correspondências explícitas e verificáveis.
 * Nunca infere condições clínicas; produtos terapêuticos assinalam sempre
 * que a escolha deve ser confirmada com um veterinário.
 */
export function suitability(product: Product, c: AnimalCriteria | null): Suitability {
  const d = product.data;
  const vetNote = d.therapeutic;
  if (!hasCriteria(c) || !c)
    return { level: "none", reasons: [], missing: [], vetNote };

  const missing: string[] = [];
  const mismatches: string[] = [];
  const matches: string[] = [];

  if (c.species) {
    if (d.species.length === 0) missing.push("espécie não indicada pelo fabricante");
    else if (d.species.includes(c.species)) matches.push(`indicado para ${c.species}`);
    else mismatches.push(`não indicado para ${c.species}`);
  }
  if (c.size) {
    if (d.sizes.length === 0) matches.push("adequado a todos os portes");
    else if (d.sizes.includes(c.size)) matches.push(`indicado para porte ${c.size}`);
    else mismatches.push(`não indicado para porte ${c.size}`);
  }
  if (c.ageYears !== undefined) {
    const range = ageRangeOf(c.ageYears);
    if (d.ageRanges.length === 0) matches.push("sem restrição de idade indicada");
    else if (d.ageRanges.includes(range)) matches.push(`indicado para animais ${range}`);
    else mismatches.push(`indicado apenas para ${d.ageRanges.join(", ")}`);
  }
  const sharedNeeds = (c.needs ?? []).filter((n) => d.needs.includes(n));
  if (sharedNeeds.length)
    matches.push(`relacionado com ${sharedNeeds.join(", ")}`);

  if (mismatches.length)
    return { level: "mismatch", reasons: mismatches, missing, vetNote };
  if (!matches.length)
    return { level: "unknown", reasons: [], missing, vetNote };
  return {
    level: sharedNeeds.length ? "relevant" : "compatible",
    reasons: matches,
    missing,
    vetNote,
  };
}

export const SUITABILITY_LABEL: Record<Exclude<SuitabilityLevel, "none" | "mismatch">, string> = {
  compatible: "Compatível com os dados disponíveis",
  relevant: "Pode ser relevante para este animal",
  unknown: "Dados insuficientes para avaliar",
};

export const VET_NOTE =
  "A escolha deste produto deve ser confirmada com um veterinário.";

/**
 * Converte o perfil de um animal guardado em critérios de adequação,
 * usando apenas dados registados; nada é inferido clinicamente.
 */
export function criteriaFromAnimal(a: {
  species: Species;
  size: Size;
  ageYears: number;
  energy?: string;
  forgotten?: { kind: string } | undefined;
}): AnimalCriteria {
  const needs: ProductNeed[] = [];
  if (a.ageYears >= 8) needs.push("sénior");
  if (a.energy === "alta") needs.push("energia");
  if (a.forgotten && /mobilidade/i.test(a.forgotten.kind)) needs.push("mobilidade");
  return { species: a.species, size: a.size, ageYears: a.ageYears, needs };
}

export function missingForProductPublication(d: ProductData): string[] {
  const missing: string[] = [];
  if (!d.name.trim()) missing.push("nome");
  if (!d.brand.trim()) missing.push("marca");
  if (!d.description.trim()) missing.push("descrição");
  if (!d.photos.some((p) => p.trim())) missing.push("fotografia");
  if (!d.purchaseUrl.trim()) missing.push("ligação para compra");
  if (!d.species.length) missing.push("espécies suportadas");
  return missing;
}

interface ProductRow {
  id: string;
  company_id: string;
  status: string;
  product: unknown;
  created_at: string;
  companies?: { name: string; city: string } | null;
}

export function productFromRow(row: ProductRow): Product | null {
  const d = row.product as Partial<ProductData> | null;
  if (!d || typeof d.name !== "string" || !d.name) return null;
  const status =
    row.status === "published" || row.status === "paused" ? row.status : "draft";
  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.companies?.name ?? "Empresa",
    companyCity: row.companies?.city ?? "",
    status,
    isDemo: false,
    createdAt: row.created_at,
    data: {
      name: d.name,
      brand: typeof d.brand === "string" ? d.brand : "",
      category: (d.category as ProductCategory) ?? "conforto",
      description: typeof d.description === "string" ? d.description : "",
      photos: Array.isArray(d.photos) ? d.photos.filter((p) => typeof p === "string") : [],
      price: typeof d.price === "string" ? d.price : "",
      availability: typeof d.availability === "string" ? d.availability : "",
      purchaseUrl: typeof d.purchaseUrl === "string" ? d.purchaseUrl : "",
      species: Array.isArray(d.species) ? (d.species as Species[]) : [],
      sizes: Array.isArray(d.sizes) ? (d.sizes as Size[]) : [],
      ageRanges: Array.isArray(d.ageRanges) ? (d.ageRanges as AgeRange[]) : [],
      materials: typeof d.materials === "string" ? d.materials : "",
      sizeInfo: typeof d.sizeInfo === "string" ? d.sizeInfo : "",
      instructions: typeof d.instructions === "string" ? d.instructions : "",
      warnings: typeof d.warnings === "string" ? d.warnings : "",
      needs: Array.isArray(d.needs) ? (d.needs as ProductNeed[]) : [],
      therapeutic: d.therapeutic === true,
      sponsored: d.sponsored === true,
    },
  };
}
