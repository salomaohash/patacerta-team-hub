import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { assistInstitution } from "@/lib/ai-assistance.functions";
import { Button } from "./ui/button";
export function AiAssistance({
  kind,
  source,
  onAccept,
}: {
  kind: "description" | "application" | "checkin";
  source: string;
  onAccept?: (text: string) => void;
}) {
  const call = useServerFn(assistInstitution);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="mt-5 border-t border-border pt-4">
      <Button
        variant="outline"
        disabled={busy || source.trim().length < 20}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const r = await call({ data: { kind, source } });
            setText(r.text);
            setOrigin(r.source);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Não foi possível gerar uma sugestão.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Sparkles />
        {busy ? "A preparar sugestão…" : "Pedir sugestão de IA"}
      </Button>
      {text && (
        <div className="mt-4">
          <p className="eyebrow">Sugestão gerada por IA · revisão obrigatória</p>
          <textarea
            aria-label="Sugestão gerada por IA"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-3 min-h-52 w-full rounded-lg border border-input bg-card p-3 text-sm"
          />
          <details className="mt-3 text-sm">
            <summary>Consultar informação de origem</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words font-sans">{origin}</pre>
          </details>
          <div className="mt-3 flex flex-wrap gap-3">
            {onAccept && (
              <Button
                onClick={() => {
                  onAccept(text);
                  setText("");
                }}
              >
                Revi · usar este texto
              </Button>
            )}
            <Button variant="outline" onClick={() => setText("")}>
              Rejeitar sugestão
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Não publica, envia mensagens ou altera estados. A decisão continua contigo.
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
