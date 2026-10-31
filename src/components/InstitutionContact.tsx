import { Mail, Phone, Globe, MessageSquare, MapPin, ExternalLink } from "lucide-react";
import {
  getAssociation,
  type Animal,
  type InstitutionContact,
} from "@/lib/animals";

function socialLinks(social: string) {
  return social
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function InstitutionContact({ a }: { a: Animal }) {
  const association = getAssociation(a.associationId);
  const contact: InstitutionContact | undefined = a.isDemo
    ? association?.contact
    : a.institutionContact;
  const hasAny =
    !!contact &&
    [contact.contact, contact.email, contact.phone, contact.website, contact.social].some(
      (v) => v.trim().length > 0,
    );
  const responsible = a.associationName ?? association?.name;

  return (
    <section aria-label="Contactos da instituição" className="mt-12 border-t border-border pt-8">
      <p className="eyebrow">Contactos</p>
      <h2 className="mt-3 text-3xl">Quem responde por {a.name}</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Contactos declarados pela instituição responsável pelo animal. A PataCerta não intermedeia
        esta comunicação e não valida os dados apresentados.
      </p>

      {hasAny ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <p className="font-medium">{responsible ?? "Instituição responsável"}</p>
          {association?.city || a.isDemo ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={15} strokeWidth={1.5} />
              {association?.city}
              {a.isDemo ? " · Demonstração" : ""}
            </p>
          ) : null}
          <ul className="mt-4 space-y-2.5 text-sm">
            {contact?.contact.trim() ? (
              <li className="flex items-start gap-2.5">
                <MessageSquare size={16} className="mt-0.5 shrink-0 text-accent-deep" />
                <span>{contact.contact}</span>
              </li>
            ) : null}
            {contact?.email.trim() ? (
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-accent-deep" />
                <a className="underline underline-offset-2" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </li>
            ) : null}
            {contact?.phone.trim() ? (
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-accent-deep" />
                <a className="underline underline-offset-2" href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                  {contact.phone}
                </a>
              </li>
            ) : null}
            {contact?.website.trim() ? (
              <li className="flex items-center gap-2.5">
                <Globe size={16} className="shrink-0 text-accent-deep" />
                <a
                  className="underline underline-offset-2"
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website <ExternalLink size={12} className="inline" aria-hidden />
                </a>
              </li>
            ) : null}
            {socialLinks(contact?.social ?? "").length ? (
              <li className="flex items-center gap-2.5">
                <MessageSquare size={16} className="shrink-0 text-accent-deep" />
                <span className="flex flex-wrap gap-x-3 gap-y-1">
                  {socialLinks(contact?.social ?? "").map((s) => (
                    <a
                      key={s}
                      className="underline underline-offset-2"
                      href={s}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.replace(/^https?:\/\//, "")}
                    </a>
                  ))}
                </span>
              </li>
            ) : null}
          </ul>
          {a.isDemo ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Demonstração · contactos fictícios, apenas para ilustrar o formato de uma ficha real.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <p className="text-sm">
            A instituição ainda não publicou contactos nesta ficha. Podes submeter a candidatura
            com o teu consentimento de partilha e a equipa responde por aqui; se preferires,
            procura os contactos oficiais da instituição no sítio dela.
          </p>
        </div>
      )}
    </section>
  );
}
