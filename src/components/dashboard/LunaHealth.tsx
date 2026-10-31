import { Stethoscope, CalendarDays, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { lunaRecord } from "@/lib/luna-record";

export function HealthBadge() {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-accent-deep"><ShieldCheck size={14} /> Saúde em dia</span>;
}

export function HealthSummary({ onOpen, heading = true }: { onOpen: () => void; heading?: boolean }) {
  return <div className="flex flex-1 h-full flex-col rounded-2xl bg-card p-5 shadow-soft">
    {heading && <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg"><Stethoscope size={18} className="text-accent-deep" /> Saúde da Luna</h2><HealthBadge /></div>}
    {!heading && <div className="flex justify-end"><HealthBadge /></div>}
    <p className="mt-3 text-2xl font-serif">Em dia</p>
    <dl className="mt-4 space-y-3 text-sm">
      <div><dt className="text-muted-foreground">Próxima consulta</dt><dd className="flex items-center gap-2"><CalendarDays size={14} className="text-accent-deep" />15 de novembro de 2026</dd></div>
      <div><dt className="text-muted-foreground">Próxima vacina · Reforço anual</dt><dd>15 de novembro de 2026</dd></div>
    </dl>
    <div className="mt-auto pt-4"><Button variant="secondary" onClick={onOpen} className="w-full rounded-full">Ver boletim completo <ArrowRight /></Button></div>
  </div>;
}

export function HealthRecord({ expanded = false }: { expanded?: boolean }) {
  return <div className={expanded ? "space-y-3" : "grid gap-4 lg:grid-cols-2"}>
    {lunaRecord.map((section, index) => <details key={section.title} open={expanded || index === 0} className="group rounded-2xl bg-card shadow-soft open:pb-5">
      <summary className="cursor-pointer p-5 font-medium text-sm marker:text-accent-deep">{section.title}</summary>
      <dl className="divide-y divide-border px-5 text-sm">
        {section.entries.map(([label, value]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}
      </dl>
    </details>)}
  </div>;
}

export function HealthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[85dvh] max-w-3xl overflow-y-auto">
    <DialogHeader><DialogTitle>Boletim de saúde e história da Luna</DialogTitle><DialogDescription>Identificação, história, vacinação e cuidados da Luna.</DialogDescription></DialogHeader>
    <HealthBadge /><HealthRecord expanded />
  </DialogContent></Dialog>;
}
