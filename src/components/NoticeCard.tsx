import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { daysSince, noticeMailto, noticeName, type Notice } from "@/lib/notices";
import { photoInfo } from "@/lib/pet-media";

export function NoticeStatus({ notice }: { notice: Notice }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${notice.tipo === "desaparecido" ? "bg-notice-missing text-notice-foreground" : "bg-notice-found text-notice-foreground"}`}>{notice.tipo === "desaparecido" ? "Desaparecido" : "Encontrado"}</span>;
}
export function NoticeCard({ notice }: { notice: Notice }) {
  const days = daysSince(notice.dataDocumento);
  return <article className="overflow-hidden rounded-lg border border-border bg-card transition duration-300 hover:-translate-y-0.5 hover:shadow-soft motion-reduce:transform-none motion-reduce:transition-none">
    <Link to="/avisos/$id" params={{ id: notice.id }} className="relative block aspect-[4/3] overflow-hidden">
      <img src={notice.foto} alt={photoInfo(notice.foto)?.alt ?? `${noticeName(notice)}, ${notice.especie} em ${notice.zona}`} width={768} height={768} loading="lazy" className="h-full w-full object-cover" />
      <div className="absolute left-3 top-3"><NoticeStatus notice={notice} /></div>
    </Link>
    <div className="p-5"><Link to="/avisos/$id" params={{ id: notice.id }}><h3 className="text-2xl">{noticeName(notice)}</h3></Link>
      <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={14} />{notice.zona} · {days === 0 ? "visto hoje" : `visto há ${days} ${days === 1 ? "dia" : "dias"}`}</p>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{notice.descricaoCurta}</p>
      <Button asChild variant="link" className="mt-3 h-auto justify-start whitespace-normal px-0 font-normal underline"><a href={noticeMailto(notice)}>{notice.tipo === "desaparecido" ? "Avisar se o vires" : "Este é o meu animal"}</a></Button>
    </div>
  </article>;
}