import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { type Animal } from "@/lib/animals";
import { photoInfo } from "@/lib/pet-media";

export function AnimalGallery({ animal }: { animal: Animal }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    update(); api.on("select", update); api.on("reInit", update);
    return () => { api.off("select", update); api.off("reInit", update); };
  }, [api]);
  const info = photoInfo(animal.photos[selected] ?? animal.photo);
  return <div className="min-w-0 self-start">
    <Carousel setApi={setApi} opts={{ loop: false, duration: reduced ? 0 : 25 }} aria-label={`Fotografias de ${animal.name}`}>
      <CarouselContent>{animal.photos.map((src, i) => <CarouselItem key={`${src}-${i}`} aria-label={`Fotografia ${i + 1} de ${animal.photos.length}`}><img src={src} alt={photoInfo(src)?.alt ?? `${animal.name}, ${animal.breed}, fotografia principal do perfil demonstrativo`} loading={i === 0 ? "eager" : "lazy"} width={816} height={816} className="aspect-square w-full rounded-lg object-cover" /></CarouselItem>)}</CarouselContent>
      <div className="mt-3 flex items-center justify-between"><p aria-live="polite" className="text-xs text-muted-foreground">{selected + 1} / {animal.photos.length}</p><div className="flex gap-2"><Button size="icon" variant="outline" title="Fotografia anterior" aria-label="Fotografia anterior" disabled={selected === 0} onClick={() => api?.scrollTo(selected - 1, reduced)}><ArrowLeft /></Button><Button size="icon" variant="outline" title="Fotografia seguinte" aria-label="Fotografia seguinte" disabled={selected === animal.photos.length - 1} onClick={() => api?.scrollTo(selected + 1, reduced)}><ArrowRight /></Button></div></div>
    </Carousel>
    <div className="mt-3 grid grid-cols-4 gap-2">{animal.photos.map((src, i) => <Button key={`${src}-${i}`} variant="outline" aria-label={`Ver fotografia ${i + 1} de ${animal.name}`} aria-pressed={selected === i} onClick={() => api?.scrollTo(i, reduced)} className={`aspect-square h-auto overflow-hidden rounded-md border-2 p-0 ${selected === i ? "border-foreground" : "border-transparent opacity-65"}`}><img src={src} alt={photoInfo(src)?.alt ?? `${animal.name}, miniatura da fotografia principal`} loading="lazy" className="h-full w-full object-cover" /></Button>)}</div>
    {info && <p className="mt-3 text-xs leading-relaxed text-muted-foreground"><a href={info.source} target="_blank" rel="noreferrer" className="underline">Fotografia: {info.artist}</a> · <a href={info.licenseUrl} target="_blank" rel="noreferrer" className="underline">{info.license}</a></p>}
    <p className="mt-2 text-xs text-muted-foreground">Fotografias ilustrativas de um perfil fictício; podem mostrar animais diferentes.</p>
  </div>;
}