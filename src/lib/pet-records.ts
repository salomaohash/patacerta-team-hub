import type { Animal } from "./animals";
import type { publicPets } from "./pets.functions";
export type PublicPetRow = Awaited<ReturnType<typeof publicPets>>[number];
export function petFromRow(row: PublicPetRow): Animal | null {
  const p = row.profile as Record<string, unknown>;
  if (
    typeof p["name"] !== "string" ||
    typeof p["photo"] !== "string" ||
    typeof p["description"] !== "string"
  )
    return null;
  const raw = row.institutions as unknown;
  const institution = (Array.isArray(raw) ? raw[0] : raw) as
    | Record<string, string | undefined>
    | undefined;
  return {
    id: row.id,
    name: p["name"],
    photo: p["photo"],
    description: p["description"],
    species: p["species"] === "gato" ? "gato" : "cão",
    breed: typeof p["breed"] === "string" ? p["breed"] : "Por confirmar",
    ageYears: typeof p["ageYears"] === "number" ? p["ageYears"] : 0,
    size: p["size"] === "pequeno" || p["size"] === "grande" ? p["size"] : "médio",
    energy: p["energy"] === "baixa" || p["energy"] === "alta" ? p["energy"] : "média",
    goodWithKids: p["goodWithKids"] === true,
    goodWithPets: p["goodWithPets"] === true,
    apartmentOk: p["apartmentOk"] === true,
    careComplexity:
      p["careComplexity"] === "baixa" || p["careComplexity"] === "alta"
        ? p["careComplexity"]
        : "média",
    associationId: row.institution_id,
    institutionId: row.institution_id,
    associationName: institution?.["name"],
    ...(institution
      ? {
          institutionContact: {
            contact: institution["contact"] ?? "",
            email: institution["email"] ?? "",
            phone: institution["phone"] ?? "",
            website: institution["website"] ?? "",
            social: institution["social"] ?? "",
          },
        }
      : {}),
    isDemo: false,
    status: row.status === "adopted" ? "adopted" : "active",
    dataSource: typeof p["dataSource"] === "string" ? p["dataSource"] : "Por confirmar",
    careNotes: typeof p["careNotes"] === "string" ? p["careNotes"] : "",
    unknownFields: Object.keys(p).filter((k) => p[k] === null || p[k] === ""),
  };
}
