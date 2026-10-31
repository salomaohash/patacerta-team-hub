import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PawPrint } from "lucide-react";
import { saveWorkspace } from "@/lib/pets.functions";
import {
  DECLINED_STATUSES,
  KANBAN_COLUMNS,
  KANBAN_TARGET_STATUS,
  kanbanColumnOf,
  type KanbanColumnId,
} from "@/lib/organization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MatchRing } from "@/components/MatchRing";
import { ApplicationItem } from "@/components/ApplicationManager";
import {
  animalName,
  APP_STATUS,
  field,
  fmtDate,
  matchFor,
  petPhoto,
  type App,
  type Data,
} from "./shared";

const nextStepFor: Record<KanbanColumnId, string> = {
  submitted: "Responder à candidatura",
  review: "Pedir informação",
  interview: "Marcar conversa",
  approved: "Fazer acompanhamento",
  adopted: "Fazer acompanhamento",
};

export function OrgKanban({
  data,
  reload,
  selected,
  onClose,
  readOnly = false,
}: {
  data: Data;
  reload: () => void;
  selected: string | null;
  onClose: () => void;
  readOnly?: boolean;
}) {
  const save = useServerFn(saveWorkspace);
  const [dragOver, setDragOver] = useState<KanbanColumnId | null>(null);
  const [pending, setPending] = useState<{ app: App; column: KanbanColumnId } | null>(null);
  const [adoptedAt, setAdoptedAt] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState<App | null>(null);

  const active = data.applications
    .filter((a) => a.institution_id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const declined = active.filter((a) => (DECLINED_STATUSES as readonly string[]).includes(a.status));
  const detail = open ?? (selected ? (active.find((a) => a.id === selected) ?? null) : null);

  function requestMove(app: App, column: KanbanColumnId) {
    if (kanbanColumnOf(app.status) === column) return;
    setAdoptedAt(app.adopted_at ?? new Date().toISOString().slice(0, 10));
    setReason("");
    setPending({ app, column });
  }

  async function confirmMove() {
    if (!pending) return;
    const status = KANBAN_TARGET_STATUS[pending.column] as "received";
    setBusy(true);
    setNotice("");
    try {
      await save({
        data: {
          action: "update",
          id: pending.app.id,
          status,
          notes: "",
          nextStep: nextStepFor[pending.column],
          adoptedAt: pending.column === "adopted" ? adoptedAt : null,
          decisionReason: reason || undefined,
        },
      });
      setPending(null);
      setNotice(`Candidatura movida para «${columnLabel(pending.column)}».`);
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="org-applications">
      <h2 className="text-2xl">Candidaturas</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Arrasta os cartões entre colunas ou usa «Mover para» em cada cartão. A compatibilidade é
        apenas um apoio à conversa — a decisão final pertence à associação.
      </p>
      <p role="status" className="mt-2 text-sm">
        {notice}
      </p>

      <div className="org-kanban mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {KANBAN_COLUMNS.map((col) => {
          const items = active
            .filter((a) => kanbanColumnOf(a.status) === col.id)
            .sort((a, b) => a.created_at.localeCompare(b.created_at));
          return (
            <div
              key={col.id}
              data-stage={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(col.id);
              }}
              onDragLeave={() => setDragOver((d) => (d === col.id ? null : d))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData("text/plain");
                const app = active.find((a) => a.id === id);
                if (app) requestMove(app, col.id);
              }}
              className={`org-kanban-column rounded-xl border p-3 transition-colors ${
                dragOver === col.id ? "border-accent-deep bg-accent" : "border-border bg-secondary/50"
              }`}
            >
              <p className="flex items-center justify-between px-1 text-sm font-medium">
                {col.label}
                <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">
                  {items.length}
                </span>
              </p>
              <ul className="mt-3 space-y-3">
                {items.map((a) => (
                  <KanbanCard
                    key={a.id}
                    a={a}
                    data={data}
                    onOpen={readOnly ? () => undefined : () => setOpen(a)}
                    onMove={readOnly ? undefined : (col) => requestMove(a, col)}
                  />
                ))}
                {items.length === 0 && (
                  <li className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Sem candidaturas
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {declined.length > 0 && (
        <details className="mt-6 rounded-xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Candidaturas encerradas sem adoção ({declined.length})
          </summary>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {declined.map((a) => (
              <KanbanCard key={a.id} a={a} data={data} onOpen={() => setOpen(a)} discreet />
            ))}
          </ul>
        </details>
      )}

      <Dialog open={!!pending} onOpenChange={(v) => !v && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mover para «{pending ? columnLabel(pending.column) : ""}»
            </DialogTitle>
          </DialogHeader>
          {pending && (
            <div className="space-y-4 text-sm">
              <p>
                Confirmas a mudança da candidatura de{" "}
                <strong>{animalName(pending.app.animal_id, data)}</strong> de «
                {APP_STATUS[pending.app.status] ?? pending.app.status}» para «
                {columnLabel(pending.column)}»?
              </p>
              {pending.column === "adopted" && (
                <label className="block">
                  Data da adoção
                  <input
                    type="date"
                    className={field}
                    value={adoptedAt}
                    onChange={(e) => setAdoptedAt(e.target.value)}
                  />
                </label>
              )}
              {(pending.column === "approved" || pending.column === "adopted") && (
                <label className="block">
                  Motivo da decisão · fica registado com a data de hoje
                  <textarea
                    className={field}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
              )}
              <div className="flex gap-2">
                <Button disabled={busy} onClick={confirmMove}>
                  Confirmar mudança
                </Button>
                <Button variant="outline" disabled={busy} onClick={() => setPending(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!detail}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null);
            onClose();
          }
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhe da candidatura</DialogTitle>
          </DialogHeader>
          {detail && (
            <ApplicationItem a={detail} data={data} team reload={reload} />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function columnLabel(id: KanbanColumnId): string {
  return KANBAN_COLUMNS.find((c) => c.id === id)?.label ?? id;
}

function KanbanCard({
  a,
  data,
  onOpen,
  onMove,
  discreet = false,
}: {
  a: App;
  data: Data;
  onOpen: () => void;
  onMove?: ((col: KanbanColumnId) => void) | undefined;
  discreet?: boolean;
}) {
  const pet = data.pets.find((p) => p.id === a.animal_id);
  const photo = pet ? petPhoto(pet) : "";
  const match = matchFor(a, data);
  return (
    <li
      draggable={!!onMove}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", a.id)}
      className={`org-kanban-card rounded-lg border border-border bg-card p-3 shadow-sm ${onMove ? "cursor-grab" : ""} ${discreet ? "opacity-75" : ""}`}
    >
      <Button variant="ghost" onClick={onOpen} className="org-kanban-open block w-full text-left">
        <span className="flex items-center gap-3">
          {photo ? (
            <img src={photo} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
              <PawPrint className="h-4 w-4 text-muted-foreground" aria-hidden />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-medium">{animalName(a.animal_id, data)}</span>
            <span className="org-status-line block text-xs text-muted-foreground">
              {APP_STATUS[a.status] ?? a.status} · {fmtDate(a.created_at)}
            </span>
          </span>
        </span>
        {match && (
          <span className="mt-2 flex items-center gap-2">
            <MatchRing value={match.score} size={40} stroke={3} />
            <span className="text-xs text-muted-foreground">Compatibilidade indicativa</span>
          </span>
        )}
      </Button>
      {onMove && (
        <label className="mt-2 block text-xs text-muted-foreground">
          Mover para
          <select
            className="mt-1 w-full rounded-md border border-input bg-card p-1.5 text-xs"
            value={kanbanColumnOf(a.status)}
            onChange={(e) => onMove(e.target.value as KanbanColumnId)}
          >
            {KANBAN_COLUMNS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </li>
  );
}
