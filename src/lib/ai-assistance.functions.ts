import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
export const assistInstitution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        kind: z.enum(["description", "application", "checkin"]),
        source: z.string().trim().min(20).max(10000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: institutions, error } = await (context.supabase as unknown as SupabaseClient)
      .from("institutions")
      .select("id")
      .eq("owner_id", context.userId)
      .limit(1);
    if (error || !institutions?.length)
      throw new Error("Cria a ficha da tua instituição antes de usar o assistente.");
    const { generateAssistance } = await import("./ai/assistance.server");
    return generateAssistance(data);
  });
