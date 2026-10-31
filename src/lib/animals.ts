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
import { media } from "@/lib/pet-media";

export type Species = "cão" | "gato";
export type Size = "pequeno" | "médio" | "grande";
export type Energy = "baixa" | "média" | "alta";

export interface InstitutionContact {
  contact: string;
  email: string;
  phone: string;
  website: string;
  social: string;
}

export interface Association {
  id: string;
  name: string;
  city: string;
  contact?: InstitutionContact;
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
  sex?: "macho" | "fêmea";
  breed: string;
  ageYears: number;
  size: Size;
  energy: Energy;
  associationId: string;
  institutionId?: string;
  associationName?: string | undefined;
  institutionContact?: InstitutionContact;
  unknownFields?: string[];
  contact?: { kind: "owner" | "organization"; name: string; city?: string; email?: string; phone?: string };
  goodWithKids: boolean;
  goodWithPets: boolean;
  apartmentOk: boolean;
  careComplexity: "baixa" | "média" | "alta";
  description: string;
  photo: string;
  photos: string[];
  litterId?: string;
  status: "active" | "adopted";
  isDemo: boolean;
  dataSource?: string;
  careNotes?: string;
  listedAt?: string;
  forgotten?: ForgottenInfo;
}

const originalAnimals: Omit<Animal, "photos">[] = [
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

const dogGallery = [media.p0.url, media.p1.url, media.p8.url];
const catGallery = [media.p12.url, media.p22.url, media.p23.url];
const newAnimal = (data: Pick<Animal, "id" | "name" | "species" | "ageYears" | "size" | "energy" | "associationId" | "description" | "photos"> & Partial<Animal>): Animal => ({
  breed: data.species === "cão" ? "Rafeiro" : "Europeu comum", goodWithKids: true, goodWithPets: true, apartmentOk: true, careComplexity: "baixa", status: "active", isDemo: true, photo: data.photos[0] ?? "", ...data,
});
const extraAnimals: Animal[] = [
  newAnimal({ id: "farrusco", name: "Farrusco", species: "cão", ageYears: 3, size: "médio", energy: "média", associationId: "porto", photos: [media.p0.url, media.p1.url, media.p8.url], description: "Chegou do canil municipal, desconfiado no início. Agora aproxima-se devagar e pede companhia. Precisa de conhecer a família ao seu ritmo." }),
  newAnimal({ id: "ruca", name: "Ruca", species: "cão", ageYears: 5, size: "grande", energy: "média", associationId: "lisboa", apartmentOk: false, photos: [media.p3.url, media.p2.url, media.p9.url], description: "O Ruca gosta de passeios longos e de farejar sem pressas. Está a aprender a andar à trela; precisa de consistência, não de uma família perfeita." }),
  newAnimal({ id: "bolota", name: "Bolota", species: "cão", ageYears: 4, size: "pequeno", energy: "baixa", associationId: "coimbra", goodWithKids: false, photos: [media.p1.url, media.p0.url, media.p2.url], description: "Depois de uma mudança de casa, o Bolota ficou sem família. Gosta de estar por perto, mas prefere que o deixem iniciar o contacto." }),
  newAnimal({ id: "faisca", name: "Faísca", species: "cão", ageYears: 2, size: "pequeno", energy: "alta", associationId: "porto", careComplexity: "média", photos: [media.p6.url, media.p7.url, media.p5.url], description: "A Faísca transforma cada passeio numa descoberta. Precisa de exercício e de aprender a parar; uma bola não substitui uma rotina equilibrada." }),
  newAnimal({ id: "vitoria", name: "Vitória", species: "cão", breed: "Samoiedo", ageYears: 6, size: "grande", energy: "média", associationId: "lisboa", status: "adopted", photos: [media.p4.url, media.p9.url, media.p8.url], description: "A Vitória já encontrou uma família que respeita o seu ritmo. Este perfil fica como uma história com final feliz." }),
  newAnimal({ id: "tono", name: "Tono", species: "cão", ageYears: 10, size: "grande", energy: "baixa", associationId: "coimbra", careComplexity: "média", photos: [media.p10.url, media.p1.url, media.p0.url], description: "O Tono chegou quando o seu cuidador deixou de poder acompanhá-lo. Escolhe passeios curtos e uma cama perto das pessoas.", forgotten: { kind: "Sénior", needs: "Passeios curtos e acompanhamento próprio da idade.", homeAdaptations: "Cama acessível e poucos degraus.", monthlyCost: 60, resources: "Orientação da associação durante a adaptação.", idealFamily: "Uma família com rotina tranquila." } }),
  newAnimal({ id: "nesga", name: "Nêsga", species: "cão", ageYears: 12, size: "médio", energy: "baixa", associationId: "porto", goodWithKids: false, careComplexity: "média", photos: [media.p10.url, media.p2.url, media.p1.url], description: "A Nêsga gosta de pequenas voltas e de dormir ao sol. Ouve menos do que antes; agradece aproximações suaves e um lar sossegado.", forgotten: { kind: "Sénior", needs: "Rotina calma e aproximações sem sobressaltos.", homeAdaptations: "Acesso fácil à cama e à água.", monthlyCost: 55, resources: "Apoio na escolha de uma rotina adequada.", idealFamily: "Pessoas pacientes, com tempo para companhia." } }),
  newAnimal({ id: "pipoca", name: "Pipoca", species: "cão", ageYears: 0.25, size: "pequeno", energy: "alta", associationId: "lisboa", litterId: "ninhada-laos-demo", careComplexity: "média", photos: [media.p14.url, media.p11.url, media.p15.url], description: "A Pipoca e o Lume são irmãos da mesma ninhada. Ainda está a aprender tudo: higiene, trela e pausas. O porte adulto é apenas uma estimativa." }),
  newAnimal({ id: "lume", name: "Lume", species: "cão", ageYears: 0.25, size: "pequeno", energy: "alta", associationId: "lisboa", litterId: "ninhada-laos-demo", careComplexity: "média", photos: [media.p11.url, media.p14.url, media.p15.url], description: "Irmão da Pipoca, o Lume observa antes de se juntar às brincadeiras. Precisa de uma família disponível para educação e socialização gradual." }),
  newAnimal({ id: "pezinho", name: "Pézinho", species: "cão", ageYears: 4, size: "médio", energy: "média", associationId: "coimbra", careComplexity: "média", photos: [media.p37.url, media.p36.url, media.p38.url, media.p17.url], description: "O Pézinho perdeu uma pata, ganhou simpatia a dobrar. Caminha com três patas e gosta de passeios ao seu ritmo, com pausas quando precisa.", forgotten: { kind: "Tripé", needs: "Respeitar o esforço e manter um peso adequado.", homeAdaptations: "Pisos antiderrapantes e poucos degraus.", monthlyCost: 65, resources: "Orientação sobre mobilidade e adaptação.", idealFamily: "Uma casa acessível e companhia sem pressas." } }),
  newAnimal({ id: "amalia", name: "Amália", species: "gato", ageYears: 5, size: "pequeno", energy: "baixa", associationId: "porto", goodWithKids: false, careComplexity: "média", photos: [media.p20.url, media.p21.url, media.p22.url], description: "A Amália é cega e navega pela casa à memória. Precisa de mobiliário estável e de ouvir a tua voz antes de lhe tocares. Conhece os seus cantos favoritos sem pressa.", forgotten: { kind: "Cegueira", needs: "Rotina previsível e mobiliário estável.", homeAdaptations: "Proteger janelas, varandas e escadas; não mudar móveis.", monthlyCost: 45, resources: "Acompanhamento da adaptação ao novo espaço.", idealFamily: "Um lar tranquilo e seguro." } }),
  newAnimal({ id: "pinta", name: "Pinta", species: "gato", ageYears: 3, size: "pequeno", energy: "média", associationId: "lisboa", photos: [media.p12.url, media.p22.url, media.p23.url], description: "A Pinta foi encontrada num pátio e demorou a confiar. Hoje procura colo, mas mantém a sua independência. Gosta de observar a rua de uma janela protegida." }),
  newAnimal({ id: "tremoço", name: "Tremoço", species: "gato", ageYears: 6, size: "médio", energy: "média", associationId: "coimbra", goodWithPets: false, photos: [media.p18.url, media.p19.url, media.p23.url], description: "O Tremoço chegou após uma mudança familiar. Prefere ser o único gato e gosta de brincadeiras curtas antes de se instalar no sofá." }),
  newAnimal({ id: "rosinha", name: "Rosinha", species: "gato", ageYears: 14, size: "pequeno", energy: "baixa", associationId: "porto", careComplexity: "média", photos: [media.p19.url, media.p22.url, media.p23.url], description: "A Rosinha conhece bem o valor de uma tarde tranquila. Precisa de locais de descanso fáceis de alcançar e de uma família atenta às mudanças da idade.", forgotten: { kind: "Sénior", needs: "Acompanhamento regular e rotina serena.", homeAdaptations: "Caixa de areia baixa e camas acessíveis.", monthlyCost: 50, resources: "Orientação sobre cuidados sénior.", idealFamily: "Um lar calmo, com companhia diária." } }),
];
// Datas e histórias editoriais fictícias; fotografias ilustrativas.
export const animals: Animal[] = [...originalAnimals.map((animal) => ({ ...animal, photos: [animal.photo, ...(animal.species === "cão" ? dogGallery.slice(0, 2) : catGallery.slice(0, 2))] })), ...extraAnimals].map((animal, i) => ({ ...animal, sex: ["luna", "nala", "mimi", "kika", "biscoito", "faisca", "vitoria", "nesga", "pipoca", "amalia", "pinta", "rosinha"].includes(animal.id) ? "fêmea" : "macho", listedAt: new Date(Date.UTC(2026, 9, 4 + i)).toISOString().slice(0, 10) }));

export const getAnimal = (id: string) => animals.find((a) => a.id === id);
export const getAssociation = (id: string) => associations.find((a) => a.id === id);
