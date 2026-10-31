import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { globalSearch, type SearchFilters as Filters } from "@/lib/global-search";
import { SearchFilters } from "@/components/SearchFilters";
import { getAssociation } from "@/lib/animals";
import { noticeName } from "@/lib/notices";

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [filters, setFilters] = useState<Filters>({});
  const container = useRef<HTMLDivElement>(null);
  const id = useId();
  const navigate = useNavigate();
  const results = globalSearch(q, filters);
  const items = [
    ...results.adoption.map((a) => ({ id: a.id, name: a.name, photo: a.photo, meta: `${getAssociation(a.associationId)?.city} · ${a.ageYears < 1 ? `${Math.round(a.ageYears * 12)} meses` : `${a.ageYears} anos`}`, group: "Para adoção", kind: "animal" })),
    ...results.community.map((n) => ({ id: n.id, name: noticeName(n), photo: n.foto, meta: `${n.zona} · ${n.tipo === "desaparecido" ? "Desaparecido" : "Encontrado"}`, group: "Perdidos & Encontrados", kind: "notice" })),
  ];
  const visible = open && (q.trim().length >= 2 || Object.values(filters).some(Boolean));
  useEffect(() => {
    const close = (e: PointerEvent) => { if (e.target instanceof Node && !container.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  useEffect(() => { if (visible) document.getElementById(`${id}-${selected}`)?.scrollIntoView({ block: "nearest" }); }, [selected, visible, id]);
  function choose(index: number) {
    const item = items[index];
    if (!item) return;
    setOpen(false); setQ("");
    if (item.kind === "animal") navigate({ to: "/animais/$id", params: { id: item.id } });
    else navigate({ to: "/avisos/$id", params: { id: item.id } });
  }
  return <div ref={container} className="relative order-last w-full min-w-0 md:order-none md:flex-1 md:basis-80 md:max-w-xl">
    <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <Input role="combobox" aria-label="Pesquisa global" aria-autocomplete="list" aria-expanded={visible} aria-controls={visible ? id : undefined} aria-activedescendant={visible && items[selected] ? `${id}-${selected}` : undefined} value={q} placeholder="Procurar por nome, raça ou localização…" className="h-12 rounded-full pl-11 pr-14" onFocus={() => setOpen(true)} onChange={(e) => { setQ(e.target.value); setSelected(0); setOpen(true); }} onKeyDown={(e) => {
      if (e.key === "Escape") { setOpen(false); e.preventDefault(); }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setSelected((v) => items.length ? (v + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length : 0); }
      if (e.key === "Enter" && visible) { e.preventDefault(); choose(selected); }
      if (e.key === "Tab") setOpen(false);
    }} />
    <SearchFilters filters={filters} onShow={() => setOpen(false)} onChange={(next) => { setFilters(next); setSelected(0); }} />
    {visible && <div id={id} role="listbox" aria-label="Resultados da pesquisa" className="absolute left-0 top-14 z-50 max-h-96 w-full overflow-y-auto rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-soft">
      {items.length === 0 ? <p role="status" className="p-3 text-sm">{q ? `Sem resultados para ‘${q}’` : "Sem resultados para estes filtros."}</p> : items.map((item, i) => <div key={`${item.kind}-${item.id}`}>
        {(i === 0 || items[i - 1]?.group !== item.group) && <p className="eyebrow px-3 pb-2 pt-3">{item.group}</p>}
        <div role="option" id={`${id}-${i}`} aria-selected={selected === i} onPointerMove={() => setSelected(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)} className={`flex cursor-pointer items-center gap-3 rounded-md p-2 ${selected === i ? "bg-secondary" : ""}`}>
          <img src={item.photo} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-md object-cover" /><div className="min-w-0"><p className="truncate text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.meta}</p></div>
        </div>
      </div>)}
    </div>}
  </div>;
}