import { animals, getAssociation, type Animal } from "@/lib/animals";
import { computeMatch, type QuizAnswers } from "@/lib/matching";

export type CatalogFilters = {
  especie?: string | undefined;
  porte?: string | undefined;
  energia?: string | undefined;
  situacao?: string | undefined;
  estado?: string | undefined;
  q?: string | undefined;
  zona?: string | undefined;
  ordem?: string | undefined;
};

export const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function filterAnimals(filters: CatalogFilters, source: Animal[] = animals) {
  return source.filter((a) =>
    a.status === "active" &&
    (!filters.especie || a.species === filters.especie) &&
    (!filters.porte || a.size === filters.porte) &&
    (!filters.energia || a.energy === filters.energia) &&
    (filters.situacao !== "esquecidos" || Boolean(a.forgotten)),
  ).filter((a) => normalize(`${a.name} ${a.species} ${a.breed} ${getAssociation(a.associationId)?.city ?? ""} ${a.description}`).includes(normalize(filters.q ?? "")));
}

export function sortAnimals(list: Animal[], order: string, quiz: QuizAnswers | null) {
  return [...list].sort((a, b) => {
    if (order === "compatibilidade" && quiz) return computeMatch(quiz, b).score - computeMatch(quiz, a).score;
    if (order === "idade") return b.ageYears - a.ageYears;
    return (b.listedAt ?? "").localeCompare(a.listedAt ?? "");
  });
}