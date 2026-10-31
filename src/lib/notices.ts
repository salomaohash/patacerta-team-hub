import { getAnimal } from "@/lib/animals";
import { normalize } from "@/lib/catalog";

export interface Notice {
  id: string;
  tipo: "desaparecido" | "encontrado";
  nomeAnimal?: string;
  especie: string;
  foto: string;
  zona: string;
  dataDocumento: string;
  descricaoCurta: string;
  contactoEmail: string;
}
const photo = (id: string) => getAnimal(id)?.photo ?? "";
export const notices: Notice[] = [
  { id: "lola-serralves", tipo: "desaparecido", nomeAnimal: "Lola", especie: "cão", foto: photo("luna"), zona: "Porto", dataDocumento: "2026-10-30", descricaoCurta: "Vista pela última vez junto ao Parque de Serralves, de coleira azul. É tranquila, mas poderá estar assustada.", contactoEmail: "lola@example.com" },
  { id: "bento-braga", tipo: "desaparecido", nomeAnimal: "Bento", especie: "cão", foto: photo("thor"), zona: "Braga", dataDocumento: "2026-10-28", descricaoCurta: "Visto junto ao Parque da Ponte. Tem uma mancha clara no peito e responde ao nome Bento. Não o persigas se estiver assustado.", contactoEmail: "bento@example.com" },
  { id: "mia-lisboa", tipo: "desaparecido", nomeAnimal: "Mia", especie: "gato", foto: photo("kika"), zona: "Lisboa", dataDocumento: "2026-10-29", descricaoCurta: "Saiu de casa em Alvalade. Poderá estar escondida numa garagem ou jardim próximo. Não tinha coleira.", contactoEmail: "mia@example.com" },
  { id: "tito-coimbra", tipo: "desaparecido", nomeAnimal: "Tito", especie: "gato", foto: photo("simba"), zona: "Coimbra", dataDocumento: "2026-10-27", descricaoCurta: "Visto pela última vez perto do Jardim da Sereia. É jovem e curioso. A família procura informações sobre a sua localização.", contactoEmail: "tito@example.com" },
  { id: "cao-coimbra", tipo: "encontrado", especie: "cão", foto: photo("kiko"), zona: "Coimbra", dataDocumento: "2026-10-30", descricaoCurta: "Encontrado perto da estação de Coimbra-B, sem identificação visível. Está num local seguro. A identificação deverá ser confirmada com fotografias ou registos veterinários.", contactoEmail: "encontrado.coimbra@example.com" },
  { id: "gata-porto", tipo: "encontrado", especie: "gato", foto: photo("pantufa"), zona: "Porto", dataDocumento: "2026-10-29", descricaoCurta: "Encontrado no Bonfim, junto a um prédio residencial. Está a receber água e abrigo enquanto se procura a família.", contactoEmail: "encontrado.porto@example.com" },
];
export const getNotice = (id: string) => notices.find((notice) => notice.id === id);
export const noticeName = (notice: Notice) => notice.nomeAnimal ?? (notice.especie === "cão" ? "Cão encontrado" : "Gato encontrado");
export function filterNotices(type: string, q = "", zone = "") {
  return notices.filter((n) => n.tipo === type && (!zone || n.zona === zone) && normalize(`${n.nomeAnimal ?? ""} ${n.especie} ${n.zona} ${n.descricaoCurta}`).includes(normalize(q))).sort((a, b) => b.dataDocumento.localeCompare(a.dataDocumento));
}
export function daysSince(date: string, now = new Date()) {
  return Math.max(0, Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.parse(`${date}T00:00:00Z`)) / 86400000));
}
export function noticeMailto(n: Notice) {
  const subject = n.tipo === "desaparecido" ? `Informação sobre ${noticeName(n)} — ${n.zona}` : `Identificação de animal encontrado — ${n.zona}`;
  return `mailto:${n.contactoEmail}?subject=${encodeURIComponent(subject)}`;
}