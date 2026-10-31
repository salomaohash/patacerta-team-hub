import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { saveWorkspace } from "@/lib/pets.functions";
import { eventsOnDay, monthGrid, sameDay, weekOf } from "@/lib/organization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  animalName,
  field,
  type CalendarEvent,
  type Data,
} from "./shared";

const KINDS: Record<string, string> = {
  interview: "Entrevista",
  visit: "Visita",
  meeting: "Reunião",
  followup: "Acompanhamento",
};
const EVENT_STATUS: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
};
type View = "month" | "week" | "day";

const blank = {
  title: "",
  kind: "interview" as keyof typeof KINDS,
  date: "",
  time: "10:00",
  applicationId: "",
  notes: "",
};

export function OrgCalendar({
  data,
  reload,
  readOnly,
}: {
  data: Data;
  reload: () => void;
  readOnly: boolean;
}) {
  const save = useServerFn(saveWorkspace);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const institution = data.institutions[0];
  const events = data.calendarEvents;
  const today = new Date();

  function shift(dir: number) {
    const d = new Date(cursor);
    if (view === "month") d.setUTCMonth(d.getUTCMonth() + dir);
    else if (view === "week") d.setUTCDate(d.getUTCDate() + dir * 7);
    else d.setUTCDate(d.getUTCDate() + dir);
    setCursor(d);
  }

  function openNew(day?: Date) {
    setEditing(null);
    setForm({
      ...blank,
      date: (day ?? cursor).toISOString().slice(0, 10),
    });
    setFormOpen(true);
  }

  function openEdit(e: CalendarEvent) {
    const start = new Date(e.starts_at);
    setEditing(e);
    setForm({
      title: e.title,
      kind: (e.kind as keyof typeof KINDS) || "meeting",
      date: start.toISOString().slice(0, 10),
      time: start.toISOString().slice(11, 16),
      applicationId: e.application_id ?? "",
      notes: e.notes,
    });
    setFormOpen(true);
  }

  async function submit() {
    if (!institution) return;
    setBusy(true);
    setNotice("");
    try {
      await save({
        data: {
          action: "calendarEvent",
          id: editing?.id,
          institutionId: institution.id,
          applicationId: form.applicationId || null,
          title: form.title,
          kind: form.kind,
          startsAt: new Date(`${form.date}T${form.time}:00`).toISOString(),
          notes: form.notes,
        },
      });
      setFormOpen(false);
      setNotice(editing ? "Evento atualizado." : "Evento agendado.");
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }

  async function setEventStatus(id: string, status: "scheduled" | "completed" | "cancelled") {
    setBusy(true);
    setNotice("");
    try {
      await save({ data: { action: "calendarEventStatus", id, status } });
      setNotice(`Evento marcado como ${(EVENT_STATUS[status] ?? status).toLowerCase()}.`);
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível atualizar.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(e: CalendarEvent) {
    if (!window.confirm(`Eliminar o evento «${e.title}»?`)) return;
    setBusy(true);
    setNotice("");
    try {
      await save({ data: { action: "calendarEventDelete", id: e.id } });
      setNotice("Evento eliminado.");
      reload();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Não foi possível eliminar.");
    } finally {
      setBusy(false);
    }
  }

  const eventChip = (e: CalendarEvent) => (
    <li key={e.id}>
      <button
        onClick={() => (readOnly ? undefined : openEdit(e))}
        className={`org-calendar-event w-full rounded-md px-2 py-1 text-left text-xs ${
          e.status === "cancelled"
            ? "bg-secondary text-muted-foreground line-through"
            : e.status === "completed"
              ? "bg-secondary text-muted-foreground"
              : "bg-primary/10 text-accent-deep"
        }`}
      >
        {new Date(e.starts_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}{" "}
        · {e.title}
      </button>
    </li>
  );

  const dayCell = (day: Date, inMonth: boolean) => {
    const dayEvents = eventsOnDay(events, day);
    return (
      <div
        key={day.toISOString()}
        className={`org-calendar-day min-h-24 rounded-lg border border-border p-1.5 ${
          inMonth ? "bg-card" : "bg-secondary/40 text-muted-foreground"
        } ${sameDay(day, today) ? "ring-2 ring-accent-deep" : ""}`}
      >
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium">{day.getUTCDate()}</span>
          {!readOnly && (
            <button
              onClick={() => openNew(day)}
              aria-label={`Agendar evento a ${day.toLocaleDateString("pt-PT")}`}
              className="rounded p-0.5 text-muted-foreground hover:bg-accent"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
        <ul className="mt-1 space-y-1">{dayEvents.slice(0, 3).map(eventChip)}</ul>
        {dayEvents.length > 3 && (
          <p className="px-1 text-[11px] text-muted-foreground">+{dayEvents.length - 3} eventos</p>
        )}
      </div>
    );
  };

  const upcoming = events
    .filter((e) => e.status === "scheduled" && new Date(e.starts_at) >= new Date(today.toDateString()))
    .slice(0, 8);

  return (
    <section className="org-calendar">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">Calendário</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1" role="group" aria-label="Vista do calendário">
            {(["month", "week", "day"] as const).map((v) => (
              <Button
                key={v}
                variant={view === v ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView(v)}
                aria-pressed={view === v}
              >
                {v === "month" ? "Mês" : v === "week" ? "Semana" : "Dia"}
              </Button>
            ))}
          </div>
          {!readOnly && (
            <Button size="sm" onClick={() => openNew()}>
              <Plus className="h-4 w-4" aria-hidden /> Agendar
            </Button>
          )}
        </div>
      </div>
      <p role="status" className="mt-2 text-sm">
        {notice}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => shift(-1)} aria-label="Anterior">
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
          Hoje
        </Button>
        <Button variant="outline" size="sm" onClick={() => shift(1)} aria-label="Seguinte">
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
        <p className="ml-2 font-medium first-letter:uppercase">
          {view === "month" &&
            cursor.toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
          {view === "week" &&
            `Semana de ${weekOf(cursor)[0]?.toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}`}
          {view === "day" &&
            cursor.toLocaleDateString("pt-PT", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
        </p>
      </div>

      {view === "month" && (
        <div className="org-month-scroll mt-4">
          <div className="org-month-grid grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="org-month-grid grid grid-cols-7 gap-1">
            {monthGrid(cursor.getUTCFullYear(), cursor.getUTCMonth())
              .flat()
              .map((day) => dayCell(day, day.getUTCMonth() === cursor.getUTCMonth()))}
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {weekOf(cursor).map((day) => (
            <div key={day.toISOString()}>
              <p className="mb-1 text-center text-xs text-muted-foreground">
                {day.toLocaleDateString("pt-PT", { weekday: "short" })}
              </p>
              {dayCell(day, true)}
            </div>
          ))}
        </div>
      )}

      {view === "day" && (
        <ul className="mt-4 space-y-3">
          {eventsOnDay(events, cursor).length === 0 && (
            <li className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Sem eventos neste dia.
            </li>
          )}
          {eventsOnDay(events, cursor).map((e) => (
            <EventRow
              key={e.id}
              e={e}
              data={data}
              readOnly={readOnly}
              onEdit={() => openEdit(e)}
              onStatus={setEventStatus}
              onDelete={() => remove(e)}
              busy={busy}
            />
          ))}
        </ul>
      )}

      <section className="mt-8">
        <h3 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
          Próximos eventos
        </h3>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Não há eventos agendados.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {upcoming.map((e) => (
              <EventRow
                key={e.id}
                e={e}
                data={data}
                readOnly={readOnly}
                onEdit={() => openEdit(e)}
                onStatus={setEventStatus}
                onDelete={() => remove(e)}
                busy={busy}
              />
            ))}
          </ul>
        )}
      </section>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar evento" : "Agendar evento"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 text-sm">
            <label>
              Título
              <input
                className={field}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label>
                Tipo
                <select
                  className={field}
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value as keyof typeof KINDS })}
                >
                  {Object.entries(KINDS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Candidatura associada · opcional
                <select
                  className={field}
                  value={form.applicationId}
                  onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
                >
                  <option value="">Nenhuma</option>
                  {data.applications
                    .filter((a) => a.institution_id)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {animalName(a.animal_id, data)} · {APP_STATUS_SHORT[a.status] ?? a.status}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Data
                <input
                  type="date"
                  className={field}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label>
                Hora
                <input
                  type="time"
                  className={field}
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </label>
            </div>
            <label>
              Notas
              <textarea
                className={field}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            <div className="flex gap-2">
              <Button
                disabled={busy || form.title.trim().length < 2 || !form.date}
                onClick={submit}
              >
                {editing ? "Guardar alterações" : "Agendar"}
              </Button>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Os eventos ficam registados no painel; não são enviados convites ou lembretes por
              email.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const APP_STATUS_SHORT: Record<string, string> = {
  received: "Recebida",
  information: "Em análise",
  conversation: "Conversa",
  visit: "Visita",
  pending_decision: "Decisão pendente",
  approved: "Aprovada",
  adopted: "Adotado",
};

function EventRow({
  e,
  data,
  readOnly,
  onEdit,
  onStatus,
  onDelete,
  busy,
}: {
  e: CalendarEvent;
  data: Data;
  readOnly: boolean;
  onEdit: () => void;
  onStatus: (id: string, s: "scheduled" | "completed" | "cancelled") => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const start = new Date(e.starts_at);
  return (
    <li className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">{e.title}</p>
        <span className="text-xs text-muted-foreground">
          {KINDS[e.kind] ?? e.kind} · {EVENT_STATUS[e.status] ?? e.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {start.toLocaleDateString("pt-PT", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}{" "}
        às {start.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
        {e.application_id ? ` · ${animalName(
          data.applications.find((a) => a.id === e.application_id)?.animal_id ?? "",
          data,
        )}` : ""}
      </p>
      {e.notes && <p className="mt-2 text-sm whitespace-pre-wrap">{e.notes}</p>}
      {!readOnly && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={busy}>
            Editar
          </Button>
          {e.status === "scheduled" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatus(e.id, "completed")}
                disabled={busy}
              >
                Marcar como concluído
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatus(e.id, "cancelled")}
                disabled={busy}
              >
                Cancelar evento
              </Button>
            </>
          )}
          {e.status === "cancelled" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatus(e.id, "scheduled")}
              disabled={busy}
            >
              Reagendar
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete} disabled={busy}>
            Eliminar
          </Button>
        </div>
      )}
    </li>
  );
}
