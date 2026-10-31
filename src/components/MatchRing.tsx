import { useEffect, useState } from "react";

/** Anel de compatibilidade que se desenha e conta de 0 até ao valor (900ms). */
export function MatchRing({ value, size = 72, stroke = 3, label = "Compatibilidade" }: { value: number; size?: number; stroke?: number; label?: string }) {
  const target = Math.max(0, Math.min(100, Math.round(value)));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      setShown(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${target}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-border" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (shown / 100) * c} className="stroke-accent-deep" />
      </svg>
      <span className="absolute flex items-baseline font-serif leading-none" style={{ fontSize: Math.max(10, Math.round(size * 0.28)) }}>
        {shown}
        <span className="text-muted-foreground" style={{ fontSize: Math.max(7, Math.round(size * 0.15)) }}>%</span>
      </span>
    </div>
  );
}
