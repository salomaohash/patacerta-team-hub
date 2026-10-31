import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarCheck,
  ClipboardList,
  Eye,
  FileQuestion,
  HeartHandshake,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  activityEvolution,
  activityIndicators,
  describeEvent,
  liveDelay,
  relTime,
  type ActivityPeriod,
  type DemoActivityEvent,
} from "@/lib/demo-activity";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const FEED_SIZE = 8;

interface Indicator {
  key: string;
  label: string;
  icon: LucideIcon;
  value: (m: ReturnType<typeof activityIndicators>) => number;
}

const INDICATORS: Indicator[] = [
  { key: "visits", label: "Visitas aos animais", icon: Eye, value: (m) => m.visits },
  { key: "active", label: "Visitantes ativos (7 dias)", icon: Users, value: (m) => m.activeVisitors },
  { key: "quizzes", label: "Questionários concluídos", icon: FileQuestion, value: (m) => m.quizzes },
  { key: "matches", label: "Correspondências geradas", icon: Sparkles, value: (m) => m.matches },
  { key: "applications", label: "Candidaturas recebidas", icon: ClipboardList, value: (m) => m.applications },
  { key: "interviews", label: "Entrevistas agendadas", icon: CalendarCheck, value: (m) => m.interviews },
  { key: "adoptions", label: "Adoções realizadas", icon: HeartHandshake, value: (m) => m.adoptions },
];

/**
 * Atividade sintética de apresentação: lê apenas eventos is_demo da tabela
 * pública de demonstração e revela o lote «live» progressivamente.
 * Nunca lê nem escreve dados reais.
 */
export function OrgLiveActivity() {
  const [history, setHistory] = useState<DemoActivityEvent[] | null>(null);
  const [livePool, setLivePool] = useState<DemoActivityEvent[]>([]);
  const [revealed, setRevealed] = useState<DemoActivityEvent[]>([]);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<ActivityPeriod>("week");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("demo_activity_events")
      .select("id, kind, actor_name, animal_name, match_pct, batch, seq, occurred_at")
      .order("occurred_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError("Não foi possível carregar a atividade de apresentação.");
          return;
        }
        const rows = (data ?? []) as DemoActivityEvent[];
        setHistory(rows.filter((r) => r.batch === "history"));
        setLivePool(
          rows
            .filter((r) => r.batch === "live")
            .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0)),
        );
      });
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (revealed.length >= livePool.length || livePool.length === 0) return;
    timer.current = setTimeout(() => {
      setRevealed((prev) => {
        const next = livePool[prev.length];
        return next ? [...prev, { ...next, occurred_at: new Date().toISOString() }] : prev;
      });
    }, liveDelay(revealed.length));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [revealed, livePool]);

  const shown = useMemo(() => [...(history ?? []), ...revealed], [history, revealed]);
  const metrics = useMemo(() => activityIndicators(shown), [shown]);
  const series = useMemo(() => activityEvolution(shown, period), [shown, period]);
  const feed = useMemo(() => {
    const recent = [...revealed].reverse();
    const older = (history ?? []).slice(0, Math.max(0, FEED_SIZE - recent.length));
    return [...recent, ...older].slice(0, FEED_SIZE);
  }, [revealed, history]);

  if (error) return null;
  if (!history) {
    return (
      <section aria-label="A carregar atividade de apresentação" className="mt-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {INDICATORS.map((i) => (
            <div key={i.key} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="org-live mt-10" aria-label="Atividade da plataforma">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
          Atividade na plataforma
        </h3>
        <p className="text-xs text-muted-foreground">
          Dados de apresentação · atividade fictícia, sem utilizadores reais
        </p>
      </div>

      <ul className="org-live-stats mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {INDICATORS.map((i) => (
          <li
            key={i.key}
            className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm"
          >
            <i.icon className="h-5 w-5 text-accent-deep" aria-hidden />
            <span className="mt-2 block font-sans text-2xl font-semibold">{i.value(metrics)}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{i.label}</span>
          </li>
        ))}
      </ul>

      <div className="org-live-panels mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section
          className="org-chart-panel rounded-xl border border-border bg-card p-5"
          aria-label="Evolução da atividade"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-xl">Evolução da atividade</h4>
            <ToggleGroup
              type="single"
              value={period}
              onValueChange={(v) => {
                if (v === "week" || v === "month") setPeriod(v);
              }}
              variant="outline"
              aria-label="Período"
            >
              <ToggleGroupItem value="week">Semana</ToggleGroupItem>
              <ToggleGroupItem value="month">Mês</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="mt-4 flex flex-wrap gap-5 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 bg-primary" />
              Visitas
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 bg-chart-3" />
              Candidaturas
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 bg-accent-deep" />
              Adoções
            </span>
          </div>
          <div className="mt-5 h-64 min-w-0" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} barGap={4} barCategoryGap="28%">
                <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 5" />
                <XAxis axisLine={false} tickLine={false} tickMargin={12} minTickGap={20} dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={30} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: 8,
                    boxShadow: "var(--shadow-dashboard)",
                    fontSize: 12,
                  }}
                />
                <Bar radius={[4, 4, 0, 0]} maxBarSize={28} dataKey="visits" name="Visitas" fill="var(--primary)" />
                <Bar radius={[4, 4, 0, 0]} maxBarSize={28} dataKey="applications" name="Candidaturas" fill="var(--chart-3)" />
                <Bar radius={[4, 4, 0, 0]} maxBarSize={28} dataKey="adoptions" name="Adoções" fill="var(--accent-deep)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {period === "week" ? "Últimas 8 semanas · início à segunda-feira" : "Últimos 6 meses"} ·
            inclui o período atual e os eventos que vão surgindo.
          </p>
        </section>

        <section
          className="org-activity-feed rounded-xl border border-border bg-card p-5"
          aria-label="Atividade recente"
        >
          <h4 className="text-xl">Atividade recente</h4>
          <ul className="mt-4 space-y-3" aria-live="polite">
            {feed.map((e) => (
              <li key={e.id} className="org-feed-event flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                <span className="min-w-0">
                  <span className="block">{describeEvent(e)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {relTime(e.occurred_at)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            Dados de apresentação · os eventos surgem progressivamente e não correspondem a
            utilizadores reais.
          </p>
        </section>
      </div>
    </section>
  );
}
