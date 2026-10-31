import animais from "@/assets/org-animaisderua.org.png.asset.json";
import bianca from "@/assets/org-bianca.pt.png.asset.json";
import uniao from "@/assets/org-uniaozoofila.org.png.asset.json";
import adopta from "@/assets/org-adopta-me.org.png.asset.json";
import petify from "@/assets/org-petify.pt.png.asset.json";

const partners = [
  { name: "Animais de Rua", domain: "animaisderua.org", logo: animais.url },
  { name: "Bianca", domain: "bianca.pt", logo: bianca.url },
  { name: "União Zoófila", domain: "uniaozoofila.org", logo: uniao.url },
  { name: "Adopta-me", domain: "adopta-me.org", logo: adopta.url },
  { name: "Petify", domain: "petify.pt", logo: petify.url },
  { name: "Quero Um Bicho", domain: "queroumbicho.com", logo: undefined },
];

export function PartnerMarquee() {
  const items = (duplicate: boolean) => partners.map((org) => <li key={org.domain}>
    <a href={`https://${org.domain}`} target="_blank" rel="noopener" tabIndex={duplicate ? -1 : 0} aria-label={org.name} title={org.name} className="group flex h-[72px] w-32 items-center justify-center rounded-2xl border border-border bg-card px-4 text-muted-foreground shadow-soft transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-[88px] md:w-40">
      {org.logo ? <img src={org.logo} alt={org.name} width={128} height={128} loading="lazy" className="max-h-12 max-w-full object-contain opacity-65 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 md:max-w-32" /> : <span className="text-center text-sm font-semibold">{org.name}</span>}
    </a>
  </li>);
  return <section aria-labelledby="partners-title" className="py-8 md:py-10">
    <div className="mx-auto max-w-6xl px-6"><h2 id="partners-title" className="font-sans text-base text-muted-foreground">Em rede com quem já cuida</h2></div>
    <div className="partner-marquee mt-4" aria-label="Organizações de referência">
      <div className="partner-track">
        <ul className="partner-group">{items(false)}</ul>
        <ul className="partner-group partner-copy" aria-hidden="true">{items(true)}</ul>
      </div>
    </div>
  </section>;
}