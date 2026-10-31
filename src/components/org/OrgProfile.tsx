import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, ShieldQuestion } from "lucide-react";
import { saveWorkspace } from "@/lib/pets.functions";
import { Button } from "@/components/ui/button";
import { field, type Data } from "./shared";

export function OrgProfile({
  institution,
  reload,
}: {
  institution: Data["institutions"][number];
  reload: () => void;
}) {
  const save = useServerFn(saveWorkspace);
  const [form, setForm] = useState({
    name: institution.name,
    city: institution.city,
    contact: institution.contact,
    faq: institution.faq,
    description: institution.description,
    email: institution.email,
    phone: institution.phone,
    website: institution.website,
    social: institution.social,
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await save({ data: { action: "institutionUpdate", id: institution.id, ...form } });
      setNotice("Perfil da organização atualizado.");
      reload();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl">Perfil da organização</h2>
        {institution.verified ? (
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-accent-deep">
            <BadgeCheck className="h-4 w-4" aria-hidden /> Organização verificada
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            <ShieldQuestion className="h-4 w-4" aria-hidden /> Verificação pendente
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Estes dados aparecem nas fichas dos animais publicados.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Nome
          <input
            required
            minLength={2}
            className={field}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Localização
          <input
            className={field}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Descrição
          <textarea
            className={field}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Email
          <input
            type="email"
            className={field}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Telefone
          <input
            className={field}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Website
          <input
            type="url"
            className={field}
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Redes sociais
          <input
            className={field}
            value={form.social}
            onChange={(e) => setForm({ ...form, social: e.target.value })}
            placeholder="Ligações separadas por vírgulas"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Contacto público
          <input
            className={field}
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Perguntas frequentes
          <textarea
            className={field}
            value={form.faq}
            onChange={(e) => setForm({ ...form, faq: e.target.value })}
          />
        </label>
        <div>
          <Button type="submit" disabled={busy}>
            Guardar alterações
          </Button>
        </div>
      </form>
      <p role="status" className="mt-3 text-sm">
        {notice}
      </p>

      <section className="mt-10 rounded-xl border border-border bg-card p-5">
        <h3 className="text-xl">Verificação da organização</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {institution.verified
            ? "A tua organização está verificada. O selo «Organização verificada» aparece no painel e nas fichas publicadas."
            : "A verificação é feita pela equipa PataCerta com base na documentação da associação (estatutos, registo e contactos). Enquanto não estiver concluída, o selo de verificação não é apresentado."}
        </p>
      </section>
    </section>
  );
}
