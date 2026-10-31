import { useEffect, useRef, useState } from "react";
import { homeStats } from "@/lib/home-stats";

export function HomeStats() {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setProgress(0);
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const fraction = Math.min((now - start) / 800, 1);
        setProgress(1 - Math.pow(1 - fraction, 3));
        if (fraction < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.25 });
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return <section ref={ref} aria-label="O catálogo em números" className="border-y border-border">
    <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-6 px-6 py-12 md:grid-cols-4 md:py-12">
      {homeStats.map((stat) => <div key={stat.label} className="flex flex-col text-center">
        <dt className="order-2 mt-2 text-sm text-muted-foreground">{stat.label}</dt>
        <dd className="font-serif text-5xl tabular-nums"><span aria-hidden="true">{Math.round(stat.value * progress)}</span><span className="sr-only">{stat.value}</span></dd>
      </div>)}
    </dl>
  </section>;
}