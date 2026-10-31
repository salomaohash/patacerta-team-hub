import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { animals, associations } from "@/lib/animals";
import { notices } from "@/lib/notices";
import { type SearchFilters as Filters } from "@/lib/global-search";

export function SearchFilters({ filters, onChange, onShow }: { filters: Filters; onChange: (filters: Filters) => void; onShow: (open: boolean) => void }) {
  const count = Object.values(filters).filter(Boolean).length;
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const fields = [
    { key: "breed", label: "Raça", options: [...new Set(animals.map((a) => a.breed))].sort() },
    { key: "sex", label: "Sexo", options: ["macho", "fêmea"] },
    { key: "size", label: "Porte", options: ["pequeno", "médio", "grande"] },
    { key: "location", label: "Localização", options: [...new Set([...associations.map((a) => a.city), ...notices.map((n) => n.zona)])].sort() },
  ] as const;
  return <Popover onOpenChange={onShow}>
    <PopoverTrigger asChild><Button variant="ghost" size="icon" title="Filtros de pesquisa" aria-label="Filtros de pesquisa" className={`absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full ${count ? "bg-foreground text-background hover:bg-foreground hover:text-background" : "text-muted-foreground"}`}><SlidersHorizontal size={18} />{count > 0 && <span className="sr-only">{count} filtros ativos</span>}</Button></PopoverTrigger>
    <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] space-y-4 motion-reduce:animate-none">
      <div className="flex items-center justify-between"><h2 className="text-xl">Filtros de pesquisa</h2><Button variant="link" size="sm" onClick={() => onChange({})}>Limpar</Button></div>
      <div className="grid grid-cols-2 gap-3">{fields.map((f) => <label key={f.key} className="space-y-2 text-sm"><span>{f.label}</span><select aria-label={f.label} value={filters[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">{f.key === "breed" ? "Todas" : "Todos"}</option>{f.options.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}</select></label>)}</div>
      <fieldset><legend className="mb-2 text-sm">Idade (anos)</legend><div className="grid grid-cols-2 gap-3"><label className="space-y-2 text-xs text-muted-foreground">Mínima<Input aria-label="Idade mínima" type="number" min="0" step="0.25" value={filters.minAge ?? ""} placeholder="Sem mínimo" onChange={(e) => set("minAge", e.target.value)} /></label><label className="space-y-2 text-xs text-muted-foreground">Máxima<Input aria-label="Idade máxima" type="number" min="0" step="0.25" value={filters.maxAge ?? ""} placeholder="Sem máximo" onChange={(e) => set("maxAge", e.target.value)} /></label></div></fieldset>
    </PopoverContent>
  </Popover>;
}