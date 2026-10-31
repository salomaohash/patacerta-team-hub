import thor from "@/assets/pets/thor.jpg";
import luna from "@/assets/pets/luna.jpg";
import zeca from "@/assets/pets/zeca.jpg";
import tobias from "@/assets/pets/tobias.jpg";
import paco from "@/assets/pets/paco.jpg";
import kiko from "@/assets/pets/kiko.jpg";
import nala from "@/assets/pets/nala.jpg";
import mimi from "@/assets/pets/mimi.jpg";
import simba from "@/assets/pets/simba.jpg";
import pantufa from "@/assets/pets/pantufa.jpg";
import tareco from "@/assets/pets/tareco.jpg";
import kika from "@/assets/pets/kika.jpg";
import mel from "@/assets/pets/mel.jpg";
import biscoito from "@/assets/pets/biscoito.jpg";

export type Species = "cão" | "gato";
export type Size = "pequeno" | "médio" | "grande";
export type Energy = "baixa" | "média" | "alta";

export interface Association {
  id: string;
  name: string;
  city: string;
}

export const associations: Association[] = [
  { id: "porto", name: "Patudos do Porto", city: "Porto" },
  { id: "lisboa", name: "Cantinho de Lisboa", city: "Lisboa" },
  { id: "coimbra", name: "Amigos de Quatro Patas", city: "Coimbra" },
];

export interface ForgottenInfo {
  kind: string;
  needs: string;
  homeAdaptations: string;
  monthlyCost: number;
  resources: string;
  idealFamily: string;
}

export interface Animal {
  id: string;
  name: string;
  species: Species;
  breed: string;
  ageYears: number;
  size: Size;
  energy: Energy;
  associationId: string;
  goodWithKids: boolean;
  goodWithPets: boolean;
  apartmentOk: boolean;
  careComplexity: "baixa" | "média" | "alta";
  description: string;
  photo: string;
  status: "active" | "adopted";
  isDemo: true;
  forgotten?: ForgottenInfo;
}

export const animals: Animal[] = [
  { id: "thor", name: "Thor", species: "cão", breed: "Rafeiro", ageYears: 2, size: "médio", energy: "alta", associationId: "porto", goodWithKids: true, goodWithPets: true, apartmentOk: false, careComplexity: "média", photo: thor, status: "active", isDemo: true, description: "O Thor é jovem e tem muita energia. Precisa de exercício diário e de companhia durante boa parte do dia." },
  { id: "luna", name: "Luna", species: "cão", breed: "Rafeiro", ageYears: 5, size: "médio", energy: "baixa", associationId: "lisboa", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "baixa", photo: luna, status: "active", isDemo: true, description: "A Luna é tranquila e paciente. Convive muito bem com crianças e gosta de rotinas calmas." },
  { id: "zeca", name: "Zeca", species: "cão", breed: "Labrador (cruzado)", ageYears: 11, size: "grande", energy: "baixa", associationId: "coimbra", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "média", photo: zeca, status: "active", isDemo: true, description: "O Zeca tem 11 anos e um temperamento calmo. Prefere passeios curtos e uma casa sossegada.",
    forgotten: { kind: "Sénior", needs: "Cão sénior com o ritmo próprio da idade.", homeAdaptations: "Cama ortopédica e acesso sem escadas sempre que possível.", monthlyCost: 60, resources: "A associação assegura o seguimento veterinário no primeiro ano.", idealFamily: "Uma família calma, com tempo para passeios curtos e regulares." } },
  { id: "tobias", name: "Tobias", species: "cão", breed: "Podengo", ageYears: 4, size: "médio", energy: "média", associationId: "porto", goodWithKids: false, goodWithPets: true, apartmentOk: true, careComplexity: "alta", photo: tobias, status: "active", isDemo: true, description: "O Tobias foi resgatado e tem ansiedade de separação. Está a aprender, com tempo, a ficar sozinho.",
    forgotten: { kind: "Comportamental", needs: "Ansiedade de separação pós-resgate.", homeAdaptations: "Um espaço seguro e previsível; ausências introduzidas de forma gradual.", monthlyCost: 70, resources: "A associação oferece sessões com um treinador de comportamento.", idealFamily: "Alguém que passe muito tempo em casa e tenha paciência para progressos lentos." } },
  { id: "paco", name: "Paco", species: "cão", breed: "Rafeiro", ageYears: 3, size: "médio", energy: "média", associationId: "lisboa", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "baixa", photo: paco, status: "adopted", isDemo: true, description: "O Paco é sociável e dá-se bem com outros animais. Já encontrou a sua família." },
  { id: "kiko", name: "Kiko", species: "cão", breed: "Jack Russell (cruzado)", ageYears: 4, size: "pequeno", energy: "média", associationId: "lisboa", goodWithKids: true, goodWithPets: false, apartmentOk: true, careComplexity: "baixa", photo: kiko, status: "active", isDemo: true, description: "O Kiko é pequeno e adapta-se bem a um apartamento. Tem energia moderada e gosta de passeios regulares." },
  { id: "nala", name: "Nala", species: "cão", breed: "Golden Retriever (cruzado)", ageYears: 6, size: "grande", energy: "média", associationId: "coimbra", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "alta", photo: nala, status: "active", isDemo: true, description: "A Nala tem mobilidade reduzida nos membros posteriores e usa uma cadeira de rodas canina. É alegre e sociável.",
    forgotten: { kind: "Mobilidade reduzida", needs: "Mobilidade reduzida; desloca-se com cadeira de rodas canina.", homeAdaptations: "Piso térreo ou elevador, tapetes antiderrapantes.", monthlyCost: 90, resources: "A associação fornece a cadeira e acompanhamento de fisioterapia.", idealFamily: "Uma família com casa acessível e disponibilidade para a ajudar no dia a dia." } },
  { id: "mimi", name: "Mimi", species: "gato", breed: "Europeu comum", ageYears: 13, size: "pequeno", energy: "baixa", associationId: "porto", goodWithKids: true, goodWithPets: false, apartmentOk: true, careComplexity: "média", photo: mimi, status: "active", isDemo: true, description: "A Mimi tem 13 anos e é serena. Gosta de lugares quentes e de uma casa tranquila.",
    forgotten: { kind: "Sénior", needs: "Gata sénior que precisa de rotina estável.", homeAdaptations: "Caixa de areia de entrada baixa e locais de descanso acessíveis.", monthlyCost: 45, resources: "Check-up veterinário anual coberto pela associação.", idealFamily: "Um lar sossegado, sem outros animais." } },
  { id: "simba", name: "Simba", species: "gato", breed: "Europeu comum", ageYears: 1, size: "pequeno", energy: "alta", associationId: "lisboa", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "baixa", photo: simba, status: "active", isDemo: true, description: "O Simba é jovem e brincalhão. Precisa de estímulo e de tempo para brincar." },
  { id: "pantufa", name: "Pantufa", species: "gato", breed: "Europeu comum", ageYears: 5, size: "pequeno", energy: "baixa", associationId: "coimbra", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "baixa", photo: pantufa, status: "active", isDemo: true, description: "O Pantufa é tranquilo e independente. Fica bem sozinho durante o dia." },
  { id: "tareco", name: "Tareco", species: "gato", breed: "Europeu comum", ageYears: 4, size: "pequeno", energy: "média", associationId: "porto", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "baixa", photo: tareco, status: "active", isDemo: true, description: "O Tareco é sociável e está habituado a conviver com cães." },
  { id: "kika", name: "Kika", species: "gato", breed: "Europeu comum", ageYears: 6, size: "pequeno", energy: "baixa", associationId: "lisboa", goodWithKids: false, goodWithPets: true, apartmentOk: true, careComplexity: "média", photo: kika, status: "active", isDemo: true, description: "A Kika tem deficiência visual. Orienta-se muito bem num espaço que conhece.",
    forgotten: { kind: "Deficiência visual", needs: "Deficiência visual.", homeAdaptations: "Manter os móveis no mesmo sítio e proteger varandas e escadas.", monthlyCost: 40, resources: "A associação acompanha a adaptação nas primeiras semanas.", idealFamily: "Uma casa calma e estável, sem mudanças frequentes." } },
  { id: "mel", name: "Mel", species: "gato", breed: "Europeu comum", ageYears: 8, size: "pequeno", energy: "baixa", associationId: "coimbra", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "alta", photo: mel, status: "active", isDemo: true, description: "O Mel tem doença renal crónica e faz dieta e medicação diárias. É sereno e afetuoso.",
    forgotten: { kind: "Necessidades médicas", needs: "Doença renal crónica.", homeAdaptations: "Ração renal e água fresca sempre disponível; medicação diária.", monthlyCost: 80, resources: "Seguimento veterinário e análises periódicas apoiadas pela associação.", idealFamily: "Alguém organizado, disponível para medicação diária." } },
  { id: "biscoito", name: "Biscoito", species: "gato", breed: "Europeu comum", ageYears: 1, size: "pequeno", energy: "alta", associationId: "porto", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "baixa", photo: biscoito, status: "active", isDemo: true, description: "A Biscoito é jovem e cheia de energia. Adora brincar." },
];

export const getAnimal = (id: string) => animals.find((a) => a.id === id);
export const getAssociation = (id: string) => associations.find((a) => a.id === id);
