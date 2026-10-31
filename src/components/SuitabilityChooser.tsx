import { useState } from "react";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Animal } from "@/lib/animals";
import {
  criteriaFromAnimal,
  type AnimalCriteria,
  type ProductNeed,
  PRODUCT_NEEDS,
} from "@/lib/marketplace";

interface Props {
  savedAnimals: Animal[];
  value: AnimalCriteria | null;
  onChange: (c: AnimalCriteria | null) => void;
}

/**
 * Escolha do animal para avaliar a adequação dos produtos: um animal
 * guardado nos favoritos ou características indicadas manualmente.
 * Os dados só são usados nesta página, para filtrar e explicar.
 */
export function SuitabilityChooser({ savedAnimals, value, onChange }: Props) {
  const [mode, setMode] = useState<"guardado" | "manual">("guardado");
  const [manual, setManual] = useState<{ species: string; size: string; age: string; needs: ProductNeed[] }>({
    species: "",
    size: "",
    age: "",
    needs: [],
  });

  const applyManual = (next: typeof manual) => {
    setManual(next);
    const c: AnimalCriteria = {
      species: (next.species || undefined) as AnimalCriteria["species"],
      size: (next.size || undefined) as AnimalCriteria["size"],
      ageYears: next.age === "" ? undefined : Number(next.age),
      needs: next.needs,
    };
    onChange(c.species || c.size || c.ageYears !== undefined || c.needs?.length ? c : null);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <PawPrint className="h-4 w-4 text-accent-deep" aria-hidden />
        <h2 className="font-serif text-xl">Adequação ao teu animal</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Escolhe um animal guardado ou indica as características. Usamos estes dados apenas
        aqui, para explicar porque é que um produto pode ser adequado — nunca para
        publicidade, e nunca como aconselhamento veterinário.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Origem dos dados do animal">
        <Button
          variant={mode === "guardado" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("guardado")}
        >
          Animal guardado
        </Button>
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("manual")}
        >
          Indicar manualmente
        </Button>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remover adequação
          </Button>
        )}
      </div>

      {mode === "guardado" ? (
        <div className="mt-4">
          {savedAnimals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não tens animais guardados nos favoritos. Podes indicar as
              características manualmente.
            </p>
          ) : (
            <label className="flex max-w-sm flex-col gap-1 text-sm">
              <span className="eyebrow">Animal</span>
              <select
                className="rounded-full border border-input bg-background px-4 py-2"
                value=""
                onChange={(e) => {
                  const a = savedAnimals.find((x) => x.id === e.target.value);
                  onChange(a ? criteriaFromAnimal(a) : null);
                }}
              >
                <option value="">Escolher…</option>
                {savedAnimals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.species}, {a.size}, {a.ageYears} anos)
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="eyebrow">Espécie</span>
            <select
              className="rounded-full border border-input bg-background px-4 py-2"
              value={manual.species}
              onChange={(e) => applyManual({ ...manual, species: e.target.value })}
            >
              <option value="">Sem indicação</option>
              <option value="cão">Cão</option>
              <option value="gato">Gato</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="eyebrow">Porte</span>
            <select
              className="rounded-full border border-input bg-background px-4 py-2"
              value={manual.size}
              onChange={(e) => applyManual({ ...manual, size: e.target.value })}
            >
              <option value="">Sem indicação</option>
              <option value="pequeno">Pequeno</option>
              <option value="médio">Médio</option>
              <option value="grande">Grande</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="eyebrow">Idade (anos)</span>
            <input
              type="number"
              min={0}
              max={40}
              className="w-28 rounded-full border border-input bg-background px-4 py-2"
              value={manual.age}
              onChange={(e) => applyManual({ ...manual, age: e.target.value })}
            />
          </label>
          <fieldset className="flex flex-col gap-1 text-sm">
            <legend className="eyebrow">Necessidades</legend>
            <div className="flex flex-wrap gap-3">
              {PRODUCT_NEEDS.map((n) => (
                <label key={n} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={manual.needs.includes(n)}
                    onChange={(e) =>
                      applyManual({
                        ...manual,
                        needs: e.target.checked
                          ? [...manual.needs, n]
                          : manual.needs.filter((x) => x !== n),
                      })
                    }
                  />
                  {n}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {value && (
        <p className="mt-4 text-sm text-muted-foreground">
          Os produtos sem correspondência explícita ficam escondidos enquanto este filtro
          estiver ativo. Se faltarem dados, podes continuar a pesquisa sem este filtro.
        </p>
      )}
    </section>
  );
}
