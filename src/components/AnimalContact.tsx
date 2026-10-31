import { useEffect, useState } from "react";
import { Building2, User, Mail, Phone, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getAssociation, type Animal } from "@/lib/animals";
import { animalContact, canApply, isExampleEmail, loadContactDraft, saveContactDraft } from "@/lib/institution-workspace";
import { useSession } from "@/lib/state/session";

export function AnimalContact({ animal }: { animal: Animal }) {
  const user = useSession();
  const contact = animalContact(animal, getAssociation(animal.associationId));
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<"application" | "message">("message");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { setSender(user?.email ?? ""); }, [user?.email]);
  const launch = (kind: typeof intent) => {
    setIntent(kind); setStatus(""); setError("");
    const saved = loadContactDraft(sender, animal.id); setMessage(saved?.message ?? ""); setOpen(true);
  };
  const example = isExampleEmail(contact.email);
  return <section className="mt-6 border-t border-border pt-6" aria-label="Contacto do responsável">
    <div className="flex items-center gap-3">{contact.kind === "organization" ? <Building2 size={20} className="text-accent-deep" /> : <User size={20} className="text-accent-deep" />}<div><p className="text-xs text-muted-foreground">{contact.kind === "organization" ? "Organização responsável" : "Dono responsável"}</p><h2 className="text-lg">{contact.name}</h2></div></div>
    {contact.city && <p className="mt-2 text-sm text-muted-foreground">{contact.city}</p>}
    {contact.email ? <p className="mt-3 flex items-center gap-2 break-all text-sm"><Mail size={16} className="shrink-0" />{example ? <span>{contact.email}</span> : <a className="text-accent-deep underline" href={`mailto:${contact.email}`}>{contact.email}</a>}</p> : <p className="mt-3 text-sm text-muted-foreground">Email por indicar</p>}
    {contact.phone && <p className="mt-2 flex items-center gap-2 text-sm"><Phone size={16} /><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>}
    {example && <p className="mt-2 text-xs text-muted-foreground">Contacto de exemplo, não recebe emails.</p>}
    <div className="mt-4 flex flex-wrap gap-3"><Button disabled={!canApply(animal)} onClick={() => launch("application")}>{canApply(animal) ? "Candidatar-me" : "Já adotado"}</Button><Button variant="outline" onClick={() => launch("message")}><MessageCircle size={16} /> Escrever mensagem</Button></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{intent === "application" ? `Candidatar-me à adoção de ${animal.name}` : `Mensagem sobre ${animal.name}`}</DialogTitle><DialogDescription>Para {contact.name}. {example ? "A mensagem será guardada apenas neste navegador, sem envio." : "Podes guardar um rascunho ou abrir a mensagem no teu email."}</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!message.trim()) { setError("Escreve uma mensagem."); return; } try { saveContactDraft({ animalId: animal.id, sender, message: message.trim(), intent, savedAt: new Date().toISOString() }); setError(""); setStatus("Mensagem guardada neste navegador. Não foi enviada."); } catch { setError("Não foi possível guardar a mensagem neste navegador."); } }}>
        <label htmlFor={`contact-email-${animal.id}`} className="block text-sm">O teu email<Input id={`contact-email-${animal.id}`} type="email" required value={sender} onChange={(e) => setSender(e.target.value)} className="mt-2" /></label>
        <label htmlFor={`contact-message-${animal.id}`} className="block text-sm">Mensagem<Textarea id={`contact-message-${animal.id}`} required rows={5} value={message} onChange={(e) => { setMessage(e.target.value); setError(""); }} placeholder={`O que gostarias de perguntar sobre ${animal.name}?`} className="mt-2" /></label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{status && <p role="status" className="text-sm text-accent-deep">{status}</p>}
        <div className="flex flex-wrap gap-3"><Button type="submit">Guardar mensagem</Button>{!example && contact.email && <Button variant="outline" disabled={!message.trim()} asChild><a href={`mailto:${contact.email}?subject=${encodeURIComponent(`${intent === "application" ? "Candidatura" : "Mensagem"}: ${animal.name}`)}&body=${encodeURIComponent(message)}`}><Send size={16} /> Abrir no email</a></Button>}</div>
      </form>
    </DialogContent></Dialog>
  </section>;
}