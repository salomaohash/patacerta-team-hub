import { animals, getAssociation } from "@/lib/animals";
import { normalize } from "@/lib/catalog";
import { notices, noticeName } from "@/lib/notices";

export function globalSearch(query: string) {
  const q = normalize(query);
  if (q.length < 2) return { adoption: [], community: [] };
  return {
    adoption: animals.filter((a) => a.status === "active" && normalize(`${a.name} ${a.breed} ${a.species} ${getAssociation(a.associationId)?.city}`).includes(q)).sort((a, b) => Number(normalize(b.name).startsWith(q)) - Number(normalize(a.name).startsWith(q))).slice(0, 6),
    community: notices.filter((n) => normalize(`${noticeName(n)} ${n.especie} ${n.zona} ${n.descricaoCurta}`).includes(q)).slice(0, 6),
  };
}