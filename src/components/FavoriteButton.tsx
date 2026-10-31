import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useSession } from "@/lib/state/session";
import { toggleFavorite, useFavorites } from "@/lib/state/favorites";

export function FavoriteButton({ id, className = "" }: { id: string; className?: string }) {
  const user = useSession();
  const favs = useFavorites();
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(false);
  const active = favs.includes(id);

  return (
    <button
      type="button"
      aria-label={active ? "Remover dos favoritos" : "Guardar nos favoritos"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          navigate({ to: "/entrar" });
          return;
        }
        toggleFavorite(user.email, id);
        setPulse(true);
      }}
      onAnimationEnd={() => setPulse(false)}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft transition-colors hover:text-accent-deep ${className}`}
    >
      <Heart className={`h-5 w-5 ${pulse ? "heart-pulse" : ""} ${active ? "fill-current text-accent-deep" : ""}`} />
    </button>
  );
}
