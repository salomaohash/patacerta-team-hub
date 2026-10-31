import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";
import { getNotice, noticeName, noticeMailto, noticePhotoAlt } from "@/lib/notices";
import { NoticeStatus } from "@/components/NoticeCard";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { photoInfo } from "@/lib/pet-media";

export const Route = createFileRoute("/avisos/$id")({
  loader: ({ params }) => {
    const notice = getNotice(params.id);
    if (!notice) throw notFound();
    return notice;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${noticeName(loaderData)} em ${loaderData.zona} — PataCerta` : "Aviso indisponível — PataCerta";
    const description = loaderData?.descricaoCurta ?? "Este aviso não está disponível. Consulta os avisos de animais desaparecidos e encontrados.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  notFoundComponent: () => <main className="mx-auto max-w-4xl px-6 py-20"><h1 className="text-4xl">Aviso não encontrado</h1><p className="mt-4 text-muted-foreground">Este aviso não existe ou já não está disponível.</p><Button asChild variant="link" className="mt-6 px-0"><Link to="/animais">Ver animais e avisos</Link></Button></main>,
  component: NoticeDetail,
});
function NoticeDetail() {
  const notice = Route.useLoaderData();
  const info = photoInfo(notice.foto);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: noticeName(notice), text: notice.descricaoCurta, url }); }
      else { await navigator.clipboard.writeText(url); toast.success("Ligação copiada"); }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try { await navigator.clipboard.writeText(url); toast.success("Ligação copiada"); } catch { toast.error("Não foi possível copiar a ligação."); }
    }
  };
  return <><main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
    <Button asChild variant="link" className="px-0 font-normal"><Link to="/animais" search={{ estado: notice.tipo }}><ArrowLeft />Perdidos e Encontrados</Link></Button>
    <img src={notice.foto} alt={noticePhotoAlt(notice)} width={768} height={768} className="mt-6 aspect-[16/9] w-full rounded-lg object-cover" />
    {info && <p className="mt-2 text-xs text-muted-foreground"><a href={info.source} target="_blank" rel="noreferrer" className="underline">Fotografia: {info.artist}</a> · <a href={info.licenseUrl} target="_blank" rel="noreferrer" className="underline">{info.license}</a> · Imagem ilustrativa</p>}
    <div className="mt-8 flex flex-wrap items-start justify-between gap-5"><div><NoticeStatus notice={notice} /><h1 className="mt-4 text-[38px] leading-tight md:text-[48px]">{noticeName(notice)}</h1><p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><MapPin size={16} />{notice.zona} · {new Date(`${notice.dataDocumento}T12:00:00Z`).toLocaleDateString("pt-PT", { timeZone: "UTC" })} · {notice.especie}</p></div><Button variant="outline" onClick={share}><Share2 />Partilhar aviso</Button></div>
    <p className="mt-8 max-w-[60ch] font-serif text-[23px] leading-relaxed">{notice.descricaoCurta}</p>
    <div className="mt-10 grid gap-10 border-t border-border pt-8 md:grid-cols-2">
      <section><p className="eyebrow">Contacto do aviso</p><h2 className="mt-4 text-2xl">{notice.tipo === "desaparecido" ? "Tens alguma informação?" : "Reconheces este animal?"}</h2><p className="mt-4 break-all text-sm text-muted-foreground">{notice.contactoEmail}</p>{notice.tipo === "desaparecido" && <Button asChild className="mt-5 h-auto whitespace-normal py-3 font-normal"><a href={noticeMailto(notice)}><Mail />Avisar se o vires</a></Button>}<p className="mt-4 text-xs text-muted-foreground">Aviso fictício e contacto de exemplo. Este endereço não recebe pedidos reais.</p></section>
      <section><p className="eyebrow">O que fazer agora</p><ul className="mt-4 list-disc space-y-3 pl-5 text-[15px] text-muted-foreground"><li>Mantém a calma. Não persigas um animal assustado; anota a localização e a hora.</li><li>Contacta os centros de recolha municipais ou um veterinário para verificar a identificação.</li><li>Partilha apenas avisos verificados nas redes locais; confirma a identidade antes de entregar um animal.</li></ul></section>
    </div>
  </main><SiteFooter /></>;
}