import { media } from "@/lib/pet-media";
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
export const notices: Notice[] = [
  { id: "lola-serralves", tipo: "desaparecido", nomeAnimal: "Lola", especie: "cão", foto: media.p2.url, zona: "Porto", dataDocumento: "2026-10-30", descricaoCurta: "Vista pela última vez junto ao Parque de Serralves. Afastou-se durante o passeio e poderá estar escondida num jardim próximo. Se a vires, mantém a distância e indica o local e a hora.", contactoEmail: "lola@example.com" },
  { id: "bento-braga", tipo: "desaparecido", nomeAnimal: "Bento", especie: "cão", foto: media.p29.url, zona: "Braga", dataDocumento: "2026-10-28", descricaoCurta: "Visto junto ao Parque da Ponte. Tem uma mancha clara no peito e responde ao nome Bento. Não o persigas se estiver assustado.", contactoEmail: "bento@example.com" },
  { id: "mia-lisboa", tipo: "desaparecido", nomeAnimal: "Mia", especie: "gato", foto: media.p33.url, zona: "Lisboa", dataDocumento: "2026-10-29", descricaoCurta: "Saiu de casa em Alvalade. Poderá estar escondida numa garagem ou jardim próximo. Não tinha coleira.", contactoEmail: "mia@example.com" },
  { id: "tito-coimbra", tipo: "desaparecido", nomeAnimal: "Tito", especie: "gato", foto: media.p32.url, zona: "Coimbra", dataDocumento: "2026-10-27", descricaoCurta: "Visto pela última vez perto do Jardim da Sereia. É jovem e curioso. A família procura informações sobre a sua localização.", contactoEmail: "tito@example.com" },
  { id: "cao-coimbra", tipo: "encontrado", especie: "cão", foto: media.p31.url, zona: "Coimbra", dataDocumento: "2026-10-30", descricaoCurta: "Encontrado perto da estação de Coimbra-B, sem identificação visível. Está num local seguro. A identificação deverá ser confirmada com fotografias ou registos veterinários.", contactoEmail: "encontrado.coimbra@example.com" },
  { id: "gata-porto", tipo: "encontrado", especie: "gato", foto: media.p35.url, zona: "Porto", dataDocumento: "2026-10-29", descricaoCurta: "Encontrado no Bonfim, junto a um prédio residencial. Está a receber água e abrigo enquanto se procura a família.", contactoEmail: "encontrado.porto@example.com" },
  { id: "nico-lisboa", tipo: "desaparecido", nomeAnimal: "Nico", especie: "cão", foto: media.p30.url, zona: "Lisboa", dataDocumento: "2026-10-31", descricaoCurta: "Visto pela última vez em Benfica. Fugiu do quintal na terça-feira, de coleira azul, e é muito medroso. Se o vires, não o persigas; anota a hora e o local e avisa pelo contacto do aviso.", contactoEmail: "nico@example.com" },
  { id: "patusco-porto", tipo: "desaparecido", nomeAnimal: "Patusco", especie: "cão", foto: media.p28.url, zona: "Porto", dataDocumento: "2026-10-31", descricaoCurta: "Visto pela última vez perto da Praça do Marquês. Saiu durante uma trovoada e poderá procurar abrigo. Aproxima-te apenas se estiver tranquilo.", contactoEmail: "patusco@example.com" },
  { id: "fifi-aveiro", tipo: "desaparecido", nomeAnimal: "Fifi", especie: "gato", foto: media.p34.url, zona: "Aveiro", dataDocumento: "2026-10-30", descricaoCurta: "Vista pela última vez junto ao canal de São Roque. É uma gata reservada; verifica garagens e arrecadações sem a assustar.", contactoEmail: "fifi@example.com" },
  { id: "gato-setubal", tipo: "encontrado", especie: "gato", foto: media.p35.url, zona: "Setúbal", dataDocumento: "2026-10-31", descricaoCurta: "Encontrado perto do Jardim do Bonfim. Está abrigado e tem água disponível. Quem o reconhecer deverá apresentar fotografias ou registos que confirmem a identidade.", contactoEmail: "encontrado.setubal@example.com" },
];
export const getNotice = (id: string) => notices.find((notice) => notice.id === id);
export const noticeName = (notice: Notice) => notice.nomeAnimal ?? (notice.especie === "cão" ? "Cão encontrado" : "Gato encontrado");
export const noticePhotoAlt = (notice: Notice) => `${notice.especie === "cão" ? "Cão" : "Gato"} na fotografia de identificação do aviso${notice.nomeAnimal ? ` de ${notice.nomeAnimal}` : ""}`;
export function filterNotices(type: string, q = "", zone = "", species = "") {
  return notices.filter((n) => n.tipo === type && (!zone || n.zona === zone) && (!species || n.especie === species) && normalize(`${n.nomeAnimal ?? ""} ${n.especie} ${n.zona} ${n.descricaoCurta}`).includes(normalize(q))).sort((a, b) => b.dataDocumento.localeCompare(a.dataDocumento));
}
export function daysSince(date: string, now = new Date()) {
  return Math.max(0, Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.parse(`${date}T00:00:00Z`)) / 86400000));
}
export function noticeMailto(n: Notice) {
  const subject = n.tipo === "desaparecido" ? `Informação sobre ${noticeName(n)} — ${n.zona}` : `Identificação de animal encontrado — ${n.zona}`;
  return `mailto:${n.contactoEmail}?subject=${encodeURIComponent(subject)}`;
}