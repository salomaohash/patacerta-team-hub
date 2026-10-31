import { associations } from "@/lib/animals";
import { filterAnimals } from "@/lib/catalog";
import { notices } from "@/lib/notices";

export const homeStats = [
  { value: filterAnimals({}).length, label: "Animais para adoção" },
  { value: associations.length, label: "Associações no catálogo" },
  { value: notices.filter((notice) => notice.tipo === "desaparecido").length, label: "Avisos de desaparecidos" },
  { value: 9, label: "Perguntas no questionário" },
];