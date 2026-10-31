// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { animalContact, canApply, emptyWorkspace, institutionStats, isExampleEmail, loadContactDraft, loadInstitution, saveContactDraft, saveInstitution } from "./institution-workspace";

describe("institution local workspace", () => {
  it("does not assign catalog animals or applications to an institution automatically", () => {
    expect(institutionStats(emptyWorkspace())).toEqual({ available: 0, pending: 0, interviews: 0, adopted: 0 });
  });
  it("isolates saved institution records by account", () => {
    const data = emptyWorkspace(); data.profile.name = "Associação escolhida";
    saveInstitution("institution@example.invalid", data);
    expect(loadInstitution("institution@example.invalid").profile.name).toBe("Associação escolhida");
    expect(loadInstitution("other@example.invalid").profile.name).toBe("");
  });
  it("retains explicitly selected animals and their statuses", () => {
    const data = emptyWorkspace(); data.pets = [{ animalId: "luna", status: "published" }, { animalId: "thor", status: "adopted" }];
    expect(institutionStats(data).available).toBe(1); expect(institutionStats(data).adopted).toBe(1);
  });
  it("uses non-deliverable contacts for existing example organizations", () => {
    const contact = animalContact({ associationId: "lisboa" } as Parameters<typeof animalContact>[0], { name: "Cantinho de Lisboa", city: "Lisboa" });
    expect(contact.kind).toBe("organization"); expect(contact.name).toBe("Cantinho de Lisboa"); expect(contact.email).toBe("lisboa@example.invalid"); expect(isExampleEmail(contact.email)).toBe(true);
  });
  it("preserves supplied owner contact instead of assigning an organization", () => {
    const contact = { kind: "owner" as const, name: "Responsável", email: "owner@example.invalid" };
    expect(animalContact({ contact } as Parameters<typeof animalContact>[0])).toEqual(contact);
  });
  it("saves messages only for the sender and selected animal", () => {
    saveContactDraft({ animalId: "luna", sender: "ana@example.invalid", message: "Gostava de conhecer a Luna.", intent: "application", savedAt: "2026-10-31" });
    expect(loadContactDraft("ana@example.invalid", "luna")?.message).toBe("Gostava de conhecer a Luna.");
    expect(loadContactDraft("other@example.invalid", "luna")).toBeNull();
  });
  it("does not allow applications for adopted animals", () => {
    expect(canApply({ status: "adopted" })).toBe(false); expect(canApply({ status: "active" })).toBe(true);
  });
});