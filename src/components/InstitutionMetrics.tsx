import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { institutionEvolution, institutionMetrics, type Period } from "@/lib/institution-metrics";
import type { workspace } from "@/lib/pets.functions";

type Data = Awaited<ReturnType<typeof workspace>>;
export type MetricGroup = "animals" | "applications" | "checkins";

function MetricCard({ title, values, note }: { title: string; values: [string, number][]; note?: string }) {
  return (
    <section className="flex flex-col rounded-xl border border-border bg-card p-5">
      <h2 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">{title}</h2>
      <dl className="mt-4 space-y-3">
        {values.map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-background p-4">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-2xl font-semibold">{value}</dd>
        </div>)}
      </dl>
      {note && <p className="mt-auto pt-3 text-xs text-muted-foreground">{note}</p>}
    </section>
  );
}

export function MetricCards({ data, pets, groups }: { data: Data; pets: Data["pets"]; groups: MetricGroup[] }) {
  const m = institutionMetrics(pets, data.applications, data.checkins);
  const cards: { key: MetricGroup; title: string; values: [string, number][]; note: string }[] = [
    { key: "animals", title: "Animais", values: [["Publicados", m.published], ["Adotados", m.adopted], ["À espera de adoção", m.waiting]], note: "À espera: publicados ou pausados, ainda não adotados; exclui rascunhos." },
    { key: "applications", title: "Candidaturas", values: [["Recebidas", m.received], ["Em análise", m.reviewing], ["Concluídas", m.concluded]], note: "Em análise: da informação adicional à aprovação. Concluídas: adotadas, retiradas ou sem avanço." },
    { key: "checkins", title: "Acompanhamentos", values: [["Check-ins concluídos", m.completed], ["Check-ins pendentes", m.pending]], note: "Pendentes: check-ins de 30, 60 ou 90 dias já devidos, ainda sem resposta." },
  ];
  return <>{cards.filter(c => groups.includes(c.key)).map(({ key, ...card }) => <MetricCard key={key} {...card} />)}</>;
}

export function AverageTime({ data, pets }: { data: Data; pets: Data["pets"] }) {
  const m = institutionMetrics(pets, data.applications, data.checkins);
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">Tempo médio até à adoção</h2>
      <p className="mt-4 text-3xl font-semibold">{m.averageDays === null ? "Dados insuficientes" : `${m.averageDays} dias`}</p>
      <p className="mt-3 text-xs text-muted-foreground">Desde a criação do perfil até à data de adoção registada. {m.adoptionSamples} animais com datas válidas; mínimo de 3. Não mede o tempo desde a entrada na instituição.</p>
    </section>
  );
}

export function EvolutionSection({ data }: { data: Data }) {
  const [period, setPeriod] = useState<Period>("week");
  const series = institutionEvolution(data.applications, period);
  return (
    <section className="org-chart-panel rounded-xl border border-border bg-card p-5" aria-label="Evolução de candidaturas e adoções">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl">Evolução ao longo do tempo</h2>
        <ToggleGroup type="single" value={period} onValueChange={v => { if (v === "week" || v === "month") setPeriod(v); }} variant="outline" aria-label="Período">
          <ToggleGroupItem value="week">Semana</ToggleGroupItem><ToggleGroupItem value="month">Mês</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="mt-4 flex flex-wrap gap-5 text-sm"><span className="flex items-center gap-2"><span className="h-3 w-3 bg-primary" />Candidaturas</span><span className="flex items-center gap-2"><span className="h-3 w-3 bg-chart-3" />Adoções</span></div>
      <div className="mt-5 h-64 min-w-0" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={series} barGap={5} barCategoryGap="30%">
          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 5" /><XAxis axisLine={false} tickLine={false} tickMargin={12} dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} allowDecimals={false} width={30} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)", borderRadius: 8, boxShadow: "var(--shadow-dashboard)", fontSize: 12 }} />
          <Bar radius={[4, 4, 0, 0]} maxBarSize={32} dataKey="applications" name="Candidaturas" fill="var(--primary)" /><Bar radius={[4, 4, 0, 0]} maxBarSize={32} dataKey="adoptions" name="Adoções" fill="var(--chart-3)" />
        </BarChart></ResponsiveContainer>
      </div>
      <table className="mt-4 w-full text-left text-sm"><caption className="mb-3 text-left text-xs text-muted-foreground">{period === "week" ? "Últimas 8 semanas · início à segunda-feira" : "Últimos 6 meses"} · inclui o período atual. Adoções por animal com data registada.</caption><thead><tr className="border-b border-border"><th className="py-2">{period === "week" ? "Semana de" : "Mês"}</th><th className="py-2 text-right">Candidaturas</th><th className="py-2 text-right">Adoções</th></tr></thead><tbody>{series.map(row => <tr key={row.start} className="border-b border-border"><th className="py-2 font-normal">{row.label}</th><td className="py-2 text-right">{row.applications}</td><td className="py-2 text-right">{row.adoptions}</td></tr>)}</tbody></table>
    </section>
  );
}
