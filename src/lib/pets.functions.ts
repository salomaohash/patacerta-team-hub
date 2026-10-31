import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { missingForPublication } from "./dashboard";
export const publicPets = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Ligação indisponível.");
  const client = createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await client
    .from("pet_profiles")
    .select(
      "id,institution_id,status,profile,institutions(name,city,contact,email,phone,website,social)",
    )
    .in("status", ["published", "adopted"])
    .order("created_at", { ascending: false });
  if (error) throw new Error("Não foi possível carregar os animais.");
  return data ?? [];
});
export const workspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const c = context.supabase as unknown as SupabaseClient;
    const [institutions, pets, applications, events, checkins, visiblePets, calendar] =
      await Promise.all([
        c.from("institutions").select("*").eq("owner_id", context.userId),
        c.from("pet_profiles").select("*").eq("owner_id", context.userId),
        c
          .from("adoption_applications")
          .select(
            "id,user_id,animal_id,institution_id,is_demo,status,answers,message,next_step,adopted_at,created_at,updated_at",
          )
          .order("created_at", { ascending: false }),
        c.from("application_events").select("*").order("occurred_at", { ascending: false }),
        c.from("adoption_checkins").select("*"),
        c.from("pet_profiles").select("*").in("status", ["published", "adopted"]),
        c.from("calendar_events").select("*").order("starts_at", { ascending: true }),
      ]);
    for (const r of [institutions, pets, applications, events, checkins, visiblePets, calendar])
      if (r.error) throw new Error("Não foi possível carregar o painel.");
    const safeApplications = (applications.data ?? []).map((a) => ({
      ...a,
      notes:
        events.data
          ?.filter((e) => e.application_id === a.id && e.kind === "note")
          .map((e) => e.content)
          .join("\n") ?? "",
    }));
    return {
      institutions: institutions.data ?? [],
      pets: [
        ...(pets.data ?? []),
        ...(visiblePets.data ?? []).filter((p) => !pets.data?.some((owned) => owned.id === p.id)),
      ],
      applications: safeApplications,
      events: events.data ?? [],
      checkins: checkins.data ?? [],
      calendarEvents: calendar.data ?? [],
      userId: context.userId,
    };
  });
const petFields = z.object({
  name: z.string().trim().max(100),
  species: z.enum(["cão", "gato"]),
  breed: z.string().max(100),
  ageYears: z.number().min(0).max(40).nullable(),
  size: z.enum(["pequeno", "médio", "grande"]).nullable(),
  energy: z.enum(["baixa", "média", "alta"]).nullable(),
  goodWithKids: z.boolean().nullable(),
  goodWithPets: z.boolean().nullable(),
  apartmentOk: z.boolean().nullable(),
  careComplexity: z.enum(["baixa", "média", "alta"]).nullable(),
  description: z.string().max(5000),
  photo: z.string().url().or(z.literal("")),
  dataSource: z.string().max(1000),
  careNotes: z.string().max(2000),
});
const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("institution"),
    name: z.string().trim().min(2).max(150),
    city: z.string().max(100),
    contact: z.string().max(300),
    faq: z.string().max(3000),
  }),
  z.object({
    action: z.literal("pet"),
    id: z.string().uuid().optional(),
    institutionId: z.string().uuid(),
    status: z.enum(["draft", "published"]),
    profile: petFields,
    reviewed: z.boolean(),
  }),
  z.object({
    action: z.literal("institutionUpdate"),
    id: z.string().uuid(),
    name: z.string().trim().min(2).max(150),
    city: z.string().max(100),
    contact: z.string().max(300),
    faq: z.string().max(3000),
    description: z.string().max(3000),
    email: z.string().max(200),
    phone: z.string().max(40),
    website: z.string().max(300),
    social: z.string().max(500),
  }),
  z.object({
    action: z.literal("petDelete"),
    id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("calendarEvent"),
    id: z.string().uuid().optional(),
    institutionId: z.string().uuid(),
    applicationId: z.string().uuid().nullable(),
    title: z.string().trim().min(2).max(200),
    kind: z.enum(["interview", "visit", "meeting", "followup"]),
    startsAt: z.string().min(10).max(40),
    notes: z.string().max(2000),
  }),
  z.object({
    action: z.literal("calendarEventStatus"),
    id: z.string().uuid(),
    status: z.enum(["scheduled", "completed", "cancelled"]),
  }),
  z.object({
    action: z.literal("calendarEventDelete"),
    id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("petStatus"),
    id: z.string().uuid(),
    status: z.enum(["draft", "published", "paused", "adopted"]),
  }),
  z.object({
    action: z.literal("apply"),
    animalId: z.string().max(100),
    institutionId: z.string().uuid().nullable(),
    isDemo: z.boolean(),
    message: z.string().trim().min(10).max(3000),
    answers: z.record(z.string(), z.number()).nullable(),
    consent: z.literal(true),
  }),
  z.object({
    action: z.literal("update"),
    id: z.string().uuid(),
    status: z.enum([
      "received",
      "information",
      "conversation",
      "visit",
      "pending_decision",
      "approved",
      "declined",
      "adopted",
    ]),
    notes: z.string().max(5000),
    nextStep: z.string().max(500),
    adoptedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    decisionReason: z.string().max(2000).optional(),
  }),
  z.object({
    action: z.literal("event"),
    id: z.string().uuid(),
    kind: z.enum(["note", "interview", "visit", "message", "decision", "followup"]),
    content: z.string().trim().min(1).max(5000),
  }),
  z.object({
    action: z.literal("checkin"),
    id: z.string().uuid(),
    day: z.union([z.literal(7), z.literal(30), z.literal(60), z.literal(90)]),
    response: z.string().trim().min(5).max(3000),
    needsHelp: z.boolean(),
  }),
]);
export const saveWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => actionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const c = context.supabase as unknown as SupabaseClient;
    let result;
    if (data.action === "institution")
      result = await c
        .from("institutions")
        .insert({
          owner_id: context.userId,
          name: data.name,
          city: data.city,
          contact: data.contact,
          faq: data.faq,
        })
        .select()
        .single();
    else if (data.action === "institutionUpdate")
      result = await c
        .from("institutions")
        .update({
          name: data.name,
          city: data.city,
          contact: data.contact,
          faq: data.faq,
          description: data.description,
          email: data.email,
          phone: data.phone,
          website: data.website,
          social: data.social,
        })
        .eq("id", data.id)
        .eq("owner_id", context.userId)
        .select("id")
        .single();
    else if (data.action === "petDelete")
      result = await c
        .from("pet_profiles")
        .delete()
        .eq("id", data.id)
        .eq("owner_id", context.userId)
        .select("id")
        .single();
    else if (data.action === "calendarEvent") {
      const startsAt = new Date(data.startsAt);
      if (Number.isNaN(startsAt.getTime())) throw new Error("Data do evento inválida.");
      const row = {
        institution_id: data.institutionId,
        owner_id: context.userId,
        application_id: data.applicationId,
        title: data.title,
        kind: data.kind,
        starts_at: startsAt.toISOString(),
        notes: data.notes,
      };
      result = data.id
        ? await c
            .from("calendar_events")
            .update(row)
            .eq("id", data.id)
            .eq("owner_id", context.userId)
            .select("id")
            .single()
        : await c
            .from("calendar_events")
            .insert(row)
            .select("id")
            .single();
    } else if (data.action === "calendarEventStatus")
      result = await c
        .from("calendar_events")
        .update({ status: data.status })
        .eq("id", data.id)
        .eq("owner_id", context.userId)
        .select("id")
        .single();
    else if (data.action === "calendarEventDelete")
      result = await c
        .from("calendar_events")
        .delete()
        .eq("id", data.id)
        .eq("owner_id", context.userId)
        .select("id")
        .single();
    else if (data.action === "petStatus") {
      const current = await c
        .from("pet_profiles")
        .select("profile")
        .eq("id", data.id)
        .eq("owner_id", context.userId)
        .single();
      if (current.error) throw new Error("Perfil não encontrado.");
      const p = current.data.profile as Record<string, unknown>;
      if (data.status === "published" && missingForPublication(p).length)
        throw new Error("Completa os campos em falta antes de publicar.");
      result = await c
        .from("pet_profiles")
        .update({ status: data.status })
        .eq("id", data.id)
        .eq("owner_id", context.userId)
        .select("id")
        .single();
    } else if (data.action === "pet") {
      if (
        data.status === "published" &&
        (!data.reviewed ||
          !data.profile.name ||
          !data.profile.description ||
          !data.profile.photo ||
          !data.profile.dataSource)
      )
        throw new Error(
          "Revê o perfil e completa nome, descrição, fotografia e origem antes de publicar.",
        );
      const row = {
        owner_id: context.userId,
        institution_id: data.institutionId,
        status: data.status,
        profile: data.profile,
      };
      result = data.id
        ? await c.from("pet_profiles").update(row).eq("id", data.id).select().single()
        : await c.from("pet_profiles").insert(row).select().single();
    } else if (data.action === "apply")
      result = await c
        .from("adoption_applications")
        .insert({
          user_id: context.userId,
          animal_id: data.animalId,
          institution_id: data.institutionId,
          is_demo: data.isDemo,
          message: data.message,
          answers: data.answers ?? {},
        })
        .select("id")
        .single();
    else if (data.action === "update") {
      if (data.status === "adopted" && !data.adoptedAt) throw new Error("Indica a data da adoção.");
      result = await c
        .from("adoption_applications")
        .update({
          status: data.status,
          next_step: data.nextStep,
          adopted_at: data.status === "adopted" ? data.adoptedAt : null,
        })
        .eq("id", data.id)
        .select("id")
        .single();
      if (!result.error && data.decisionReason?.trim()) {
        const decision = await c.from("application_events").insert({
          application_id: data.id,
          author_id: context.userId,
          kind: "decision",
          content: data.decisionReason,
        });
        if (decision.error)
          throw new Error("O estado foi guardado, mas não foi possível guardar o motivo.");
      }
      if (!result.error && data.notes.trim()) {
        const event = await c
          .from("application_events")
          .insert({
            application_id: data.id,
            author_id: context.userId,
            kind: "note",
            content: data.notes,
          });
        if (event.error)
          throw new Error("O estado foi guardado, mas não foi possível guardar a nota.");
      }
    } else if (data.action === "event")
      result = await c
        .from("application_events")
        .insert({
          application_id: data.id,
          author_id: context.userId,
          kind: data.kind,
          content: data.content,
        })
        .select()
        .single();
    else
      result = await c
        .from("adoption_checkins")
        .insert({
          application_id: data.id,
          user_id: context.userId,
          day: data.day,
          response: data.response,
          needs_help: data.needsHelp,
        })
        .select()
        .single();
    if (result.error) {
      if (result.error.code === "23505") throw new Error("Este registo já foi guardado.");
      throw new Error("Não foi possível guardar. Confirma os dados e as permissões.");
    }
    return { ok: true };
  });
