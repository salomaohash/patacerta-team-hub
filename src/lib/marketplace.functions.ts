import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { missingForProductPublication, type ProductData } from "./marketplace";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Ligação indisponível.");
  return createClient(url, key, {
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
}

export const publicProducts = createServerFn({ method: "GET" }).handler(async () => {
  const client = publicClient();
  const { data, error } = await client
    .from("marketplace_products")
    .select("id,company_id,status,product,created_at,companies(name,city)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Não foi possível carregar os produtos.");
  return data ?? [];
});

export const marketplaceWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const c = context.supabase as unknown as SupabaseClient;
    const [companies, products, reports] = await Promise.all([
      c.from("companies").select("*").eq("owner_id", context.userId),
      c.from("marketplace_products").select("*").eq("owner_id", context.userId),
      c.from("product_reports").select("*").order("created_at", { ascending: false }),
    ]);
    for (const r of [companies, products, reports])
      if (r.error) throw new Error("Não foi possível carregar a área da empresa.");
    return {
      companies: companies.data ?? [],
      products: products.data ?? [],
      reports: reports.data ?? [],
      userId: context.userId,
    };
  });

const productFields = z.object({
  name: z.string().trim().max(150),
  brand: z.string().trim().max(100),
  category: z.enum(["alimentação", "higiene", "passeio", "conforto", "brinquedos", "mobilidade"]),
  description: z.string().max(5000),
  photos: z.array(z.string().url().or(z.literal(""))).max(5),
  price: z.string().max(50),
  availability: z.string().max(200),
  purchaseUrl: z.string().url().or(z.literal("")),
  species: z.array(z.enum(["cão", "gato"])).max(2),
  sizes: z.array(z.enum(["pequeno", "médio", "grande"])).max(3),
  ageRanges: z.array(z.enum(["júnior", "adulto", "sénior"])).max(3),
  materials: z.string().max(1000),
  sizeInfo: z.string().max(500),
  instructions: z.string().max(2000),
  warnings: z.string().max(1000),
  needs: z.array(z.enum(["mobilidade", "conforto", "higiene", "energia", "sénior"])).max(5),
  therapeutic: z.boolean(),
  sponsored: z.boolean(),
});

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("company"),
    name: z.string().trim().min(2).max(150),
    city: z.string().max(100),
    contact: z.string().max(300),
    description: z.string().max(2000),
  }),
  z.object({
    action: z.literal("companyUpdate"),
    id: z.string().uuid(),
    name: z.string().trim().min(2).max(150),
    city: z.string().max(100),
    contact: z.string().max(300),
    description: z.string().max(2000),
  }),
  z.object({
    action: z.literal("product"),
    id: z.string().uuid().optional(),
    companyId: z.string().uuid(),
    status: z.enum(["draft", "published"]),
    product: productFields,
    reviewed: z.boolean(),
  }),
  z.object({
    action: z.literal("productStatus"),
    id: z.string().uuid(),
    status: z.enum(["draft", "published", "paused"]),
  }),
  z.object({
    action: z.literal("report"),
    productId: z.string().uuid(),
    message: z.string().trim().min(10).max(2000),
  }),
]);

export const saveMarketplace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => actionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const c = context.supabase as unknown as SupabaseClient;
    let result;
    if (data.action === "company")
      result = await c
        .from("companies")
        .insert({
          owner_id: context.userId,
          name: data.name,
          city: data.city,
          contact: data.contact,
          description: data.description,
        })
        .select()
        .single();
    else if (data.action === "companyUpdate")
      result = await c
        .from("companies")
        .update({
          name: data.name,
          city: data.city,
          contact: data.contact,
          description: data.description,
        })
        .eq("id", data.id)
        .eq("owner_id", context.userId)
        .select("id")
        .single();
    else if (data.action === "product") {
      if (data.status === "published") {
        if (!data.reviewed)
          throw new Error("Revê a listagem antes de a publicar.");
        const missing = missingForProductPublication(data.product as ProductData);
        if (missing.length)
          throw new Error(`Completa antes de publicar: ${missing.join(", ")}.`);
      }
      const row = {
        owner_id: context.userId,
        company_id: data.companyId,
        status: data.status,
        product: data.product,
      };
      result = data.id
        ? await c
            .from("marketplace_products")
            .update(row)
            .eq("id", data.id)
            .eq("owner_id", context.userId)
            .select()
            .single()
        : await c.from("marketplace_products").insert(row).select().single();
    } else if (data.action === "productStatus") {
      if (data.status === "published") {
        const current = await c
          .from("marketplace_products")
          .select("product")
          .eq("id", data.id)
          .eq("owner_id", context.userId)
          .single();
        if (current.error) throw new Error("Listagem não encontrada.");
        const missing = missingForProductPublication(
          current.data.product as unknown as ProductData,
        );
        if (missing.length)
          throw new Error(`Completa antes de publicar: ${missing.join(", ")}.`);
      }
      result = await c
        .from("marketplace_products")
        .update({ status: data.status })
        .eq("id", data.id)
        .eq("owner_id", context.userId)
        .select("id")
        .single();
    } else
      result = await c
        .from("product_reports")
        .insert({ product_id: data.productId, user_id: context.userId, message: data.message })
        .select("id")
        .single();
    if (result.error) {
      if (result.error.code === "23505") throw new Error("Este registo já foi guardado.");
      throw new Error("Não foi possível guardar. Confirma os dados e as permissões.");
    }
    return { ok: true };
  });
