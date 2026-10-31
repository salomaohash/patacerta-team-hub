import racaoCao from "@/assets/products/racao-cao.jpg";
import racaoGato from "@/assets/products/racao-gato.jpg";
import suplemento from "@/assets/products/suplemento.jpg";
import champo from "@/assets/products/champo.jpg";
import trela from "@/assets/products/trela.jpg";
import cama from "@/assets/products/cama.jpg";
import brinquedo from "@/assets/products/brinquedo.jpg";
import rampa from "@/assets/products/rampa.jpg";
import type { Product, ProductData } from "./marketplace";

const DEMO_COMPANY = "Empresa de demonstração";
const DEMO_BRAND = "Marca de demonstração";

function demo(
  id: string,
  data: Partial<ProductData> & Pick<ProductData, "name" | "category" | "description">,
): Product {
  return {
    id,
    companyId: "demo",
    companyName: DEMO_COMPANY,
    companyCity: "",
    status: "published",
    isDemo: true,
    createdAt: "",
    data: {
      brand: DEMO_BRAND,
      photos: [],
      price: "",
      availability: "",
      purchaseUrl: "",
      species: [],
      sizes: [],
      ageRanges: [],
      materials: "",
      sizeInfo: "",
      instructions: "",
      warnings: "",
      needs: [],
      therapeutic: false,
      sponsored: false,
      ...data,
    },
  };
}

/**
 * Produtos fictícios para mostrar o marketplace enquanto não existem
 * listagens reais. Todos são identificados como «Demonstração» e nunca
 * substituem dados fornecidos por empresas reais.
 */
export const demoProducts: Product[] = [
  demo("demo-racao-cao", {
    name: "Ração seca para cães adultos",
    category: "alimentação",
    description:
      "Alimento seco de manutenção para cães adultos, com cereais e proteína de origem animal. Composição completa indicada na embalagem.",
    photos: [racaoCao],
    price: "18,90 €",
    availability: "Disponível na loja da empresa",
    purchaseUrl: "https://example.com/demonstracao/racao-cao",
    species: ["cão"],
    ageRanges: ["adulto"],
    instructions: "Seguir a tabela de quantidades da embalagem conforme o peso do animal.",
  }),
  demo("demo-racao-gato", {
    name: "Patê para gatos sénior",
    category: "alimentação",
    description:
      "Alimento húmido em patê, formulado para gatos a partir dos 8 anos. Textura macia e fácil de comer.",
    photos: [racaoGato],
    purchaseUrl: "https://example.com/demonstracao/pate-gato",
    species: ["gato"],
    ageRanges: ["sénior"],
    needs: ["sénior"],
  }),
  demo("demo-suplemento", {
    name: "Suplemento articular",
    category: "mobilidade",
    description:
      "Suplemento alimentar em comprimidos, apresentado pela empresa como apoio às articulações de cães adultos e sénior.",
    photos: [suplemento],
    price: "24,50 €",
    purchaseUrl: "https://example.com/demonstracao/suplemento",
    species: ["cão"],
    sizes: ["médio", "grande"],
    ageRanges: ["adulto", "sénior"],
    needs: ["mobilidade"],
    therapeutic: true,
    warnings: "Não substitui acompanhamento veterinário.",
  }),
  demo("demo-champo", {
    name: "Champô suave para cães e gatos",
    category: "higiene",
    description:
      "Champô de uso externo para cães e gatos, com perfume suave. Adequado a banhos regulares.",
    photos: [champo],
    price: "9,90 €",
    purchaseUrl: "https://example.com/demonstracao/champo",
    species: ["cão", "gato"],
    needs: ["higiene"],
    instructions: "Aplicar no pelo molhado, massajar e enxaguar bem. Evitar olhos e ouvidos.",
  }),
  demo("demo-trela", {
    name: "Trela ajustável em tecido",
    category: "passeio",
    description:
      "Trela em tecido resistente com mosquetão metálico e comprimento ajustável, para passeios diários.",
    photos: [trela],
    price: "14,00 €",
    purchaseUrl: "https://example.com/demonstracao/trela",
    species: ["cão"],
    materials: "Tecido de algodão e mosquetão metálico.",
    sizeInfo: "Comprimento ajustável entre 1,2 m e 2 m.",
    sponsored: true,
  }),
  demo("demo-cama", {
    name: "Cama ortopédica redonda",
    category: "conforto",
    description:
      "Cama redonda com enchimento espesso, apresentada pela empresa como apoio ao descanso de cães de porte médio e grande.",
    photos: [cama],
    price: "49,00 €",
    purchaseUrl: "https://example.com/demonstracao/cama",
    species: ["cão"],
    sizes: ["médio", "grande"],
    ageRanges: ["adulto", "sénior"],
    needs: ["conforto", "mobilidade", "sénior"],
    materials: "Tecido exterior lavável e enchimento em espuma.",
  }),
  demo("demo-brinquedo", {
    name: "Brinquedo de corda com nós",
    category: "brinquedos",
    description:
      "Brinquedo de corda de algodão com dois nós, para brincadeiras de puxar sob supervisão.",
    photos: [brinquedo],
    price: "6,50 €",
    purchaseUrl: "https://example.com/demonstracao/brinquedo",
    species: ["cão"],
    needs: ["energia"],
    warnings: "Vigiar a brincadeira e substituir quando desfiar.",
  }),
  demo("demo-rampa", {
    name: "Rampa de acesso dobrável",
    category: "mobilidade",
    description:
      "Rampa dobrável em madeira com superfície antiderrapante, para ajudar cães a entrar no carro ou subir para o sofá.",
    photos: [rampa],
    price: "59,00 €",
    purchaseUrl: "https://example.com/demonstracao/rampa",
    species: ["cão"],
    ageRanges: ["adulto", "sénior"],
    needs: ["mobilidade", "sénior"],
    materials: "Madeira e carpete antiderrapante.",
    sizeInfo: "Suporta até 40 kg, segundo a empresa.",
    instructions: "Apoiar em superfície estável e habituar o animal de forma gradual.",
  }),
];
