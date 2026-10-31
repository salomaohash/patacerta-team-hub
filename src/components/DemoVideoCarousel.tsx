import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import dogsPlayingPoster from "@/assets/pets/biscoito.jpg";
import catRelaxingPoster from "@/assets/pets/simba.jpg";
import shelterAffectionPoster from "@/assets/pets/mel.jpg";
import dogWalkingPoster from "@/assets/pets/tobias.jpg";

const SLIDES = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/5/54/Goldendoodle_and_Black_Lab_puppies_playing_in_slow_motion.webm", poster: dogsPlayingPoster, caption: "Cada animal tem uma história.", alt: "Cães a brincar em câmara lenta" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Cat_drinking.webm", poster: catRelaxingPoster, caption: "A adoção muda duas vidas.", alt: "Gato a beber água" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/0/04/Goldendoodle_and_Black_Lab_puppies_play_fighting_in_slow_motion.webm", poster: shelterAffectionPoster, caption: "Encontra um companheiro à tua medida.", alt: "Cães a brincar juntos" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Pro_dog_walker_-_Tokyo_-_2024_Nov_1.webm", poster: dogWalkingPoster, caption: "Começa hoje a tua jornada.", alt: "Passeio com cão ao ar livre" },
];

const INTERVAL_MS = 5000;

export function DemoVideoCarousel() {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<boolean[]>([false, false, false, false]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // React não renderiza o atributo `muted` no SSR; força-o para o autoplay funcionar.
  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) v.play().catch(() => {});
      else v.pause();
    });
  }, [index]);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  const go = (dir: number) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  return (
    <div
      className="group relative h-full w-full overflow-hidden lg:rounded-l-[32px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Vídeos de animais"
    >
      {SLIDES.map((s, i) => (
        <video
          key={s.src}
          ref={(el) => {
            videoRefs.current[i] = el;
          }}
          src={s.src}
          poster={s.poster}
          onError={() => setFailed((f) => f.map((v, j) => (j === i ? true : v)))}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${i === index ? "opacity-100" : "opacity-0"}`}
          muted
          loop
          playsInline
          preload={i === 0 ? "auto" : "metadata"}
          aria-hidden={i !== index}
          aria-label={s.alt}
        />
      ))}
      {SLIDES.map((s, i) => (
        <img
          key={s.poster}
          src={s.poster}
          alt=""
          loading="lazy"
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${failed[i] && i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {/* Gradiente suave para legibilidade */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/15 to-transparent" />

      {/* Legenda */}
      <p className="absolute bottom-14 left-6 right-6 font-serif text-2xl leading-tight text-background sm:left-10 sm:right-10 lg:bottom-20 lg:text-4xl" aria-live="polite">
        {SLIDES[index]?.caption}
      </p>

      {/* Controlos anterior/seguinte */}
      <Button variant="ghost" size="icon"
        type="button"
        onClick={() => go(-1)}
        aria-label="Vídeo anterior"
        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/25 text-background backdrop-blur transition-colors hover:bg-background/45"
      >
        <ChevronLeft size={20} />
      </Button>
      <Button variant="ghost" size="icon"
        type="button"
        onClick={() => go(1)}
        aria-label="Vídeo seguinte"
        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/25 text-background backdrop-blur transition-colors hover:bg-background/45"
      >
        <ChevronRight size={20} />
      </Button>

      {/* Indicadores de progresso */}
      <div className="absolute bottom-5 left-6 flex items-center gap-1 sm:left-10 lg:bottom-10">
        {SLIDES.map((s, i) => (
          <Button variant="ghost" size="icon"
            key={s.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir para o vídeo ${i + 1}`}
            aria-current={i === index}
            className="h-6 w-10 rounded-full hover:bg-background/10"
          ><span className={`h-1.5 rounded-full transition-all duration-500 motion-reduce:transition-none ${i === index ? "w-8 bg-background" : "w-2.5 bg-background/45"}`} /></Button>
        ))}
      </div>
    </div>
  );
}
