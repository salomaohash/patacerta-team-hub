import type { Animal } from "./animals";

export interface InstitutionProfile { name: string; city: string; email: string; phone: string; description: string }
export interface InstitutionEvent { id: string; title: string; date: string; time: string; kind: string; status: "scheduled" | "completed" | "cancelled" }
export interface InstitutionPet { animalId: string; status: "published" | "draft" | "paused" | "adopted" }
export interface InstitutionWorkspace { profile: InstitutionProfile; pets: InstitutionPet[]; events: InstitutionEvent[] }
export const emptyWorkspace = (): InstitutionWorkspace => ({ profile: { name: "", city: "", email: "", phone: "", description: "" }, pets: [], events: [] });
export function loadInstitution(email: string): InstitutionWorkspace {
  try {
    const value = JSON.parse(localStorage.getItem(`patacerta.institution.${email}`) ?? "null");
    if (value?.profile && Array.isArray(value.pets) && Array.isArray(value.events)) return value;
  } catch { /* Keep inaccessible storage from breaking the view. */ }
  return emptyWorkspace();
}
export function saveInstitution(email: string, data: InstitutionWorkspace) {
  localStorage.setItem(`patacerta.institution.${email}`, JSON.stringify(data));
}
export function institutionStats(data: InstitutionWorkspace) {
  return { available: data.pets.filter((p) => p.status === "published").length, pending: 0, interviews: data.events.filter((e) => e.status === "scheduled" && ["Entrevista", "Visita"].includes(e.kind)).length, adopted: data.pets.filter((p) => p.status === "adopted").length };
}
export interface AnimalContact { kind: "owner" | "organization"; name: string; city?: string; email?: string; phone?: string }
export function animalContact(animal: Animal, organization?: { name: string; city: string }): AnimalContact {
  if (animal.contact) return animal.contact;
  return { kind: "organization", name: organization?.name ?? "Organização responsável", city: organization?.city, email: `${animal.associationId}@example.invalid` };
}
export function isExampleEmail(email?: string) { return !email || /@(example\.(invalid|com|org|net)|[^@]+\.invalid)$/i.test(email); }
export interface ContactDraft { animalId: string; sender: string; message: string; intent: "application" | "message"; savedAt: string }
export function saveContactDraft(draft: ContactDraft) {
  localStorage.setItem(`patacerta.contact.${draft.sender}.${draft.animalId}`, JSON.stringify(draft));
}
export function loadContactDraft(sender: string, animalId: string): ContactDraft | null {
  try { return JSON.parse(localStorage.getItem(`patacerta.contact.${sender}.${animalId}`) ?? "null"); } catch { return null; }
}
export function canApply(animal: Pick<Animal, "status">) { return animal.status === "active"; }