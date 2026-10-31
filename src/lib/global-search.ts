import { animals, getAssociation } from "@/lib/animals";
import { normalize } from "@/lib/catalog";
import { notices, noticeName } from "@/lib/notices";

export type SearchFilters = { breed?: string; sex?: string; minAge?: string; maxAge?: string; size?: string; location?: string };

export function globalSearch(query: string, filters: SearchFilters = {}) {
  const q = normalize(query);
  const filtered = Object.values(filters).some(Boolean);
  if (q.length < 2 && !filtered) return { adoption: [], community: [] };
  const matchesAge = (age: number) => (!filters.minAge || age >= Number(filters.minAge)) && (!filters.maxAge || age <= Number(filters.maxAge));
  return {
    adoption: animals.filter((a) => a.status === "active" && (!filters.breed || a.breed === filters.breed) && (!filters.sex || a.sex === filters.sex) && matchesAge(a.ageYears) && (!filters.size || a.size === filters.size) && (!filters.location || getAssociation(a.associationId)?.city === filters.location) && normalize(`${a.name} ${a.breed} ${a.species} ${getAssociation(a.associationId)?.city}`).includes(q)).sort((a, b) => Number(normalize(b.name).startsWith(q)) - Number(normalize(a.name).startsWith(q))).slice(0, 6),
    community: filters.breed || filters.sex || filters.minAge || filters.maxAge || filters.size ? [] : notices.filter((n) => (!filters.location || n.zona === filters.location) && normalize(`${noticeName(n)} ${n.especie} ${n.zona} ${n.descricaoCurta}`).includes(q)).slice(0, 6),
  };
}