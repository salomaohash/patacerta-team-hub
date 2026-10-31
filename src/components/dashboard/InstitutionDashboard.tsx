import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, LayoutDashboard, PawPrint, ClipboardList, CalendarDays, HeartHandshake, Sparkles, Settings, Plus, Bell, Pencil, Trash2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { animals } from "@/lib/animals";
import { useSession } from "@/lib/state/session";
import { emptyWorkspace, loadInstitution, saveInstitution, institutionStats, type InstitutionWorkspace, type InstitutionEvent, type InstitutionPet } from "@/lib/institution-workspace";

const sections = [
  { id: "geral", label: "Visão geral", icon: LayoutDashboard },
  { id: "animais", label: "Os meus animais", icon: PawPrint },
  { id: "candidaturas", label: "Candidaturas", icon: ClipboardList },
  { id: "calendario", label: "Calendário", icon: CalendarDays },
  { id: "acompanhamento", label: "Acompanhamento", icon: HeartHandshake },
  { id: "intelligence", label: "PataCerta Intelligence", icon: Sparkles },
  { id: "perfil", label: "Perfil da organização", icon: Building2 },
  { id: "definicoes", label: "Definições", icon: Settings },
] as const;
type Section = typeof sections[number]["id"];
const statuses: Record<InstitutionPet["status"], string> = { published: "Disponível", draft: "Rascunho", paused: "Pausado", adopted: "Adotado" };
const selectClass = "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm";
const blankEvent = (): InstitutionEvent => ({ id: "", title: "", date: "", time: "10:00", kind: "Entrevista", status: "scheduled" });

export function InstitutionDashboard() {
  const user = useSession();
  const [active, setActive] = useState<Section>("geral");
  const [data, setData] = useState<InstitutionWorkspace>(emptyWorkspace);
  const [notice, setNotice] = useState("");
  const [animalOpen, setAnimalOpen] = useState(false);
  const [chosen, setChosen] = useState("");
  const [query, setQuery] = useState("");
  const [eventOpen, setEventOpen] = useState(false);
  const [event, setEvent] = useState<InstitutionEvent>(blankEvent);
  const [month, setMonth] = useState("");
  useEffect(() => {
    if (user) setData(loadInstitution(user.email));
    setMonth(new Date().toISOString().slice(0, 7));
  }, [user?.email]);
  if (!user) return null;
  function update(next: InstitutionWorkspace) {
    if (!user) return;
    try { saveInstitution(user.email, next); setData(next); setNotice("Alterações guardadas neste navegador."); }
    catch { setNotice("Não foi possível guardar. Verifica o espaço disponível no navegador."); }
  }
  const go = (section: Section) => { setActive(section); setNotice(""); };
  const addAnimal = () => { setChosen(""); setAnimalOpen(true); };
  const addEvent = () => { setEvent(blankEvent()); setEventOpen(true); };
  const stats = institutionStats(data);
  const filtered = data.pets.filter((p) => animals.find((a) => a.id === p.animalId)?.name.toLocaleLowerCase("pt-PT").includes(query.toLocaleLowerCase("pt-PT")));
  const statItems = [
    { label: "Animais disponíveis", value: stats.available, icon: PawPrint, section: "animais" as const },
    { label: "Candidaturas pendentes", value: stats.pending, icon: ClipboardList, section: "candidaturas" as const },
    { label: "Entrevistas agendadas", value: stats.interviews, icon: CalendarDays, section: "calendario" as const },
    { label: "Adoções concluídas", value: stats.adopted, icon: HeartHandshake, section: "acompanhamento" as const },
  ];
  function empty(title: string, copy: string, action: string, onClick: () => void) {
    return <div className="py-6"><h3 className="text-lg">{title}</h3><p className="mt-2 max-w-prose text-sm text-muted-foreground">{copy}</p><Button variant="outline" className="mt-4" onClick={onClick}>{action}</Button></div>;
  }
  function shiftMonth(direction: number) {
    const date = new Date(`${month}-01T12:00:00`); date.setMonth(date.getMonth() + direction); setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  return <main className="grid min-h-screen lg:grid-cols-[244px_minmax(0,1fr)]">
    <aside className="min-w-0 border-b border-border bg-sidebar lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 border-b border-border px-4 py-6"><Building2 className="h-6 w-6 shrink-0 text-accent-deep" /><div className="min-w-0"><p className="text-xs text-muted-foreground">Instituição</p><p className="break-words font-semibold">{data.profile.name || "Por configurar"}</p></div></div>
      <div className="p-4"><Button onClick={addAnimal} className="lg:w-full"><Plus size={16} /> Adicionar animal</Button></div>
      <nav aria-label="Secções da instituição" className="flex gap-2 overflow-x-auto p-3 lg:flex-col">{sections.map((s) => <Button key={s.id} variant={active === s.id ? "secondary" : "ghost"} aria-current={active === s.id ? "page" : undefined} onClick={() => go(s.id)} className="h-auto shrink-0 justify-start gap-3 rounded-lg px-3 py-3 text-left lg:whitespace-normal"><s.icon size={18} className="shrink-0" />{s.label}</Button>)}</nav>
    </aside>
    <div className="min-w-0">
      <header className="flex items-center justify-between gap-3 border-b border-border px-6 py-4"><h1 className="text-lg">{sections.find((s) => s.id === active)?.label}</h1><Popover><PopoverTrigger asChild><Button size="icon" variant="outline" aria-label="Notificações"><Bell size={18} /></Button></PopoverTrigger><PopoverContent align="end"><h2 className="text-base">Notificações</h2><p className="mt-2 text-sm text-muted-foreground">Não há notificações pendentes.</p><Button variant="link" onClick={() => go("calendario")} className="mt-3">Ver calendário</Button></PopoverContent></Popover></header>
      <div className="space-y-6 p-6">
        {notice && <p role="status" className="text-sm text-accent-deep">{notice}</p>}
        {active === "geral" && <>
          <div><h2 className="break-words text-3xl">Olá, {data.profile.name || user.nome}</h2><p className="mt-2 text-muted-foreground">Atividade da tua instituição</p></div>
          <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4">{statItems.map((s) => <li key={s.label}><Button variant="outline" onClick={() => go(s.section)} className="flex h-full w-full flex-col items-start gap-3 whitespace-normal rounded-lg bg-card p-4 text-left"><s.icon size={20} className="text-accent-deep" /><span className="text-3xl font-bold">{s.value}</span><span className="text-sm text-muted-foreground">{s.label}</span></Button></li>)}</ul>
          <section className="border-t border-border pt-6"><h3 className="text-xl">Precisa da tua atenção</h3>{!data.profile.name ? empty("Configura a organização", "Ainda não foi adicionada a ficha da instituição.", "Completar perfil", () => go("perfil")) : empty("Sem alertas pendentes", "Revê os animais e os eventos da instituição.", "Ver os meus animais", () => go("animais"))}</section>
          <section className="border-t border-border pt-6"><h3 className="text-xl">Candidaturas recentes</h3>{empty("Ainda não há candidaturas", "Não existem candidaturas recebidas nesta sessão local.", "Ver candidaturas", () => go("candidaturas"))}</section>
          <section className="border-t border-border pt-6"><h3 className="text-xl">Próximos eventos</h3>{data.events.filter((e) => e.status === "scheduled").length ? <ul className="mt-4 divide-y divide-border">{data.events.filter((e) => e.status === "scheduled").map((e) => <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{e.title}</p><p className="text-sm text-muted-foreground">{e.date}, {e.time}, {e.kind}</p></div><Button variant="outline" onClick={() => go("calendario")}>Ver evento</Button></li>)}</ul> : empty("Sem eventos agendados", "Entrevistas, visitas e reuniões aparecem aqui.", "Agendar evento", addEvent)}</section>
        </>}
        {active === "animais" && <section><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">Os meus animais</h2><Button onClick={addAnimal}><Plus size={16} /> Adicionar animal</Button></div><Input aria-label="Pesquisar os meus animais" placeholder="Pesquisar por nome" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-6 max-w-md" />{!filtered.length ? empty(data.pets.length ? "Nenhum resultado" : "Ainda não adicionaste animais", "Os animais do catálogo não são associados à tua conta automaticamente.", data.pets.length ? "Limpar pesquisa" : "Adicionar animal", data.pets.length ? () => setQuery("") : addAnimal) : <ul className="mt-6 divide-y divide-border">{filtered.map((p) => { const a = animals.find((a) => a.id === p.animalId); if (!a) return null; return <li key={a.id} className="flex flex-wrap items-center gap-4 py-4"><img src={a.photo} alt={a.name} className="h-16 w-16 rounded-lg object-cover" /><div className="min-w-0 flex-1"><h3 className="text-lg">{a.name}</h3><p className="text-sm text-muted-foreground">{a.species}, {a.ageYears} anos</p><Button variant="link" asChild className="h-auto px-0"><Link to="/animais/$id" params={{ id: a.id }}>Ver perfil</Link></Button></div><select aria-label={`Estado de ${a.name}`} className={`${selectClass} max-w-40`} value={p.status} onChange={(e) => update({ ...data, pets: data.pets.map((pet) => pet.animalId === a.id ? { ...pet, status: e.target.value as InstitutionPet["status"] } : pet) })}>{Object.entries(statuses).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select><Button variant="ghost" size="icon" aria-label={`Remover ${a.name}`} title={`Remover ${a.name}`} onClick={() => update({ ...data, pets: data.pets.filter((pet) => pet.animalId !== a.id) })}><Trash2 size={16} /></Button></li>; })}</ul>}</section>}
        {active === "candidaturas" && <section><h2 className="text-2xl">Candidaturas</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{["Recebidas", "Em análise", "Visita", "Decisão"].map((label) => <div key={label} className="min-h-40 border-t-2 border-primary bg-muted p-4"><h3 className="text-base">{label} <span className="text-muted-foreground">0</span></h3><p className="mt-4 text-sm text-muted-foreground">Sem candidaturas</p></div>)}</div>{empty("Ainda não recebeste candidaturas", "As mensagens guardadas nos perfis dos animais não são enviadas a outras contas.", "Ver os meus animais", () => go("animais"))}</section>}
        {active === "calendario" && <section><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">Calendário</h2><Button onClick={addEvent}><Plus size={16} /> Agendar evento</Button></div><div className="mt-6 flex flex-wrap items-center gap-3"><Button size="icon" variant="outline" aria-label="Mês anterior" onClick={() => shiftMonth(-1)}><ChevronLeft /></Button><Input type="month" aria-label="Mês do calendário" value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto" /><Button size="icon" variant="outline" aria-label="Mês seguinte" onClick={() => shiftMonth(1)}><ChevronRight /></Button></div>{!data.events.filter((e) => e.date.startsWith(month)).length ? empty("Sem eventos neste mês", "Escolhe uma data para uma entrevista, visita ou reunião.", "Agendar evento", addEvent) : <ul className="mt-6 divide-y divide-border">{data.events.filter((e) => e.date.startsWith(month)).sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map((e) => <li key={e.id} className="flex flex-wrap items-center gap-3 py-4"><CalendarDays className="text-accent-deep" /><div className="min-w-0 flex-1"><h3 className="break-words text-base">{e.title}</h3><p className="text-sm text-muted-foreground">{e.date}, {e.time}, {e.kind}, {e.status === "completed" ? "Concluído" : e.status === "cancelled" ? "Cancelado" : "Agendado"}</p></div><Button variant="ghost" size="icon" aria-label={`Editar ${e.title}`} title="Editar evento" onClick={() => { setEvent(e); setEventOpen(true); }}><Pencil size={16} /></Button><Button variant="ghost" size="icon" aria-label={`Concluir ${e.title}`} title="Concluir evento" disabled={e.status === "completed"} onClick={() => update({ ...data, events: data.events.map((row) => row.id === e.id ? { ...row, status: "completed" } : row) })}><Check size={16} /></Button><Button variant="ghost" size="icon" aria-label={`Eliminar ${e.title}`} title="Eliminar evento" onClick={() => update({ ...data, events: data.events.filter((row) => row.id !== e.id) })}><Trash2 size={16} /></Button></li>)}</ul>}</section>}
        {active === "acompanhamento" && <section><h2 className="text-2xl">Acompanhamento pós-adoção</h2>{data.pets.filter((p) => p.status === "adopted").map((p) => <div key={p.animalId} className="mt-4 border-b border-border py-4"><h3 className="text-lg">{animals.find((a) => a.id === p.animalId)?.name}</h3><p className="text-sm text-muted-foreground">Sem check-ins registados</p></div>)}{empty("Check-ins de 30 e 60 dias", "Ainda não existem respostas de famílias nesta sessão.", "Ver animais adotados", () => go("animais"))}</section>}
        {active === "intelligence" && <section><h2 className="text-2xl">PataCerta Intelligence</h2><dl className="mt-6 grid gap-6 sm:grid-cols-2"><div><dt className="text-sm text-muted-foreground">Perfis em rascunho</dt><dd className="text-3xl font-bold">{data.pets.filter((p) => p.status === "draft").length}</dd></div><div><dt className="text-sm text-muted-foreground">Perfis pausados</dt><dd className="text-3xl font-bold">{data.pets.filter((p) => p.status === "paused").length}</dd></div></dl>{empty("Rever os perfis", "Estes indicadores são calculados a partir dos animais que adicionaste. Não há análise por IA ou previsões.", "Rever animais", () => go("animais"))}</section>}
        {active === "perfil" && <section className="max-w-2xl"><h2 className="text-2xl">Perfil da organização</h2><form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); update(data); }} >{([['name','Nome da organização'],['city','Localização'],['email','Email de contacto'],['phone','Telefone']] as const).map(([field,label]) => <label key={field} className="block text-sm">{label}<Input className="mt-2" type={field === "email" ? "email" : field === "phone" ? "tel" : "text"} required={field === "name"} value={data.profile[field]} onChange={(e) => setData({ ...data, profile: { ...data.profile, [field]: e.target.value } })} /></label>)}<label className="block text-sm">Descrição<Textarea className="mt-2" value={data.profile.description} onChange={(e) => setData({ ...data, profile: { ...data.profile, description: e.target.value } })} /></label><Button type="submit">Guardar perfil</Button></form></section>}
        {active === "definicoes" && <section className="max-w-2xl"><h2 className="text-2xl">Definições</h2><h3 className="mt-6 text-xl">Conta responsável</h3><p className="mt-2 break-words text-sm text-muted-foreground">{user.nome}, {user.email}</p><h3 className="mt-6 text-xl">Dados e privacidade</h3><p className="mt-2 text-sm text-muted-foreground">Os dados ficam neste navegador. Não existem convites de equipa, partilha entre contas ou envio de notificações.</p><Button variant="outline" className="mt-6" onClick={() => { if (window.confirm("Apagar os dados locais desta instituição?")) update(emptyWorkspace()); }}><Trash2 size={16} /> Apagar dados da instituição</Button></section>}
      </div>
    </div>
    <Dialog open={animalOpen} onOpenChange={setAnimalOpen}><DialogContent><DialogHeader><DialogTitle>Adicionar animal</DialogTitle><DialogDescription>Seleciona um perfil do catálogo para a tua lista local. Isto não altera a organização responsável pelo animal.</DialogDescription></DialogHeader><label className="text-sm">Animal<select className={`${selectClass} mt-2`} value={chosen} onChange={(e) => setChosen(e.target.value)}><option value="">Selecionar animal</option>{animals.filter((a) => !data.pets.some((p) => p.animalId === a.id)).map((a) => <option key={a.id} value={a.id}>{a.name}, {a.species}</option>)}</select></label><Button disabled={!chosen} onClick={() => { update({ ...data, pets: [...data.pets, { animalId: chosen, status: "draft" }] }); setAnimalOpen(false); go("animais"); }}>Adicionar à lista</Button></DialogContent></Dialog>
    <Dialog open={eventOpen} onOpenChange={setEventOpen}><DialogContent><DialogHeader><DialogTitle>{event.id ? "Editar evento" : "Agendar evento"}</DialogTitle><DialogDescription>O evento fica neste navegador. Não serão enviados convites.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const saved = { ...event, id: event.id || crypto.randomUUID() }; update({ ...data, events: [...data.events.filter((row) => row.id !== saved.id), saved] }); setEventOpen(false); setActive("calendario"); setMonth(saved.date.slice(0,7)); }}><label className="block text-sm">Título<Input required value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} className="mt-2" /></label><label className="block text-sm">Tipo<select className={`${selectClass} mt-2`} value={event.kind} onChange={(e) => setEvent({ ...event, kind: e.target.value })}>{["Entrevista","Visita","Reunião","Acompanhamento"].map((kind) => <option key={kind}>{kind}</option>)}</select></label><div className="grid grid-cols-2 gap-4"><label className="text-sm">Data<Input className="mt-2" required type="date" value={event.date} onChange={(e) => setEvent({ ...event, date: e.target.value })} /></label><label className="text-sm">Hora<Input className="mt-2" required type="time" value={event.time} onChange={(e) => setEvent({ ...event, time: e.target.value })} /></label></div><Button type="submit">Guardar evento</Button></form></DialogContent></Dialog>
  </main>;
}