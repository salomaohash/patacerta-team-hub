export type Species = "cão" | "gato";
export type Size = "pequeno" | "médio" | "grande";
export type Energy = "baixa" | "média" | "alta";

export interface Animal {
  id: string;
  name: string;
  species: Species;
  breed: string;
  ageYears: number;
  size: Size;
  energy: Energy;
  municipality: string;
  goodWithKids: boolean;
  goodWithPets: boolean;
  apartmentOk: boolean;
  temperament: string[];
  story: string;
}

export const animals: Animal[] = [
  { id: "luna", name: "Luna", species: "cão", breed: "Rafeiro", ageYears: 3, size: "médio", energy: "média", municipality: "Lisboa", goodWithKids: true, goodWithPets: true, apartmentOk: true, temperament: ["meiga", "curiosa"], story: "Encontrada perto do Tejo, a Luna adora passeios calmos e mantas quentes." },
  { id: "tobias", name: "Tobias", species: "cão", breed: "Podengo", ageYears: 6, size: "pequeno", energy: "alta", municipality: "Porto", goodWithKids: true, goodWithPets: false, apartmentOk: true, temperament: ["brincalhão", "leal"], story: "O Tobias precisa de uma família ativa que goste de caminhadas." },
  { id: "mia", name: "Mia", species: "gato", breed: "Europeu comum", ageYears: 2, size: "pequeno", energy: "baixa", municipality: "Coimbra", goodWithKids: true, goodWithPets: true, apartmentOk: true, temperament: ["tranquila", "independente"], story: "A Mia passa as tardes ao sol e gosta de rotinas previsíveis." },
  { id: "bruno", name: "Bruno", species: "cão", breed: "Serra da Estrela (cruzado)", ageYears: 4, size: "grande", energy: "média", municipality: "Braga", goodWithKids: true, goodWithPets: true, apartmentOk: false, temperament: ["protetor", "calmo"], story: "O Bruno precisa de espaço exterior e de uma família paciente." },
  { id: "nina", name: "Nina", species: "gato", breed: "Siamês (cruzado)", ageYears: 9, size: "pequeno", energy: "baixa", municipality: "Lisboa", goodWithKids: false, goodWithPets: false, apartmentOk: true, temperament: ["afetuosa", "sossegada"], story: "Sénior e cheia de carinho, a Nina procura uma casa calma só para ela." },
  { id: "faisca", name: "Faísca", species: "cão", breed: "Rafeiro", ageYears: 1, size: "médio", energy: "alta", municipality: "Faro", goodWithKids: true, goodWithPets: true, apartmentOk: false, temperament: ["enérgico", "sociável"], story: "Jovem e cheio de energia, o Faísca está a aprender comandos básicos." },
];

export const getAnimal = (id: string) => animals.find((a) => a.id === id);
