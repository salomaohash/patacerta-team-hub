import { animals, type Animal } from "@/lib/animals";

export type CatalogFilters = {
  especie?: string | undefined;
  porte?: string | undefined;
  energia?: string | undefined;
  situacao?: string | undefined;
};

export function filterAnimals(filters: CatalogFilters, source: Animal[] = animals) {
  return source.filter((a) =>
    a.status === "active" &&
    (!filters.especie || a.species === filters.especie) &&
    (!filters.porte || a.size === filters.porte) &&
    (!filters.energia || a.energy === filters.energia) &&
    (filters.situacao !== "esquecidos" || Boolean(a.forgotten)),
  );
}