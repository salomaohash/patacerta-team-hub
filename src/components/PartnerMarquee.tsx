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
];

export function PartnerMarquee() {
  const items = (duplicate: boolean) => [...partners, ...partners].map((org, index) => <li key={`${org.domain}-${index}`} aria-hidden={index >= partners.length ? true : undefined}>
    <a href={`https://${org.domain}`} target="_blank" rel="noopener" tabIndex={duplicate || index >= partners.length ? -1 : 0} aria-label={org.name} title={org.name} className="group flex h-[88px] w-[152px] items-center justify-center rounded-lg border-2 border-border bg-card px-4 text-muted-foreground shadow-soft transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-[104px] md:w-48">
      <img src={org.logo} alt={org.name} width={128} height={128} loading="lazy" className="max-h-16 max-w-full object-contain opacity-80 grayscale transition-all duration-[250ms] ease-out group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 md:max-h-20 md:max-w-40" />
    </a>
  </li>);
  return <section aria-labelledby="partners-title" className="py-6 md:py-12">
    <div className="mx-auto max-w-6xl px-6"><h2 id="partners-title" className="font-sans text-base text-muted-foreground">A trabalhar com várias organizações</h2></div>
    <div className="partner-marquee mt-4" aria-label="Organizações de referência">
      <div className="partner-track">
        <ul className="partner-group">{items(false)}</ul>
        <ul className="partner-group partner-copy" aria-hidden="true">{items(true)}</ul>
      </div>
    </div>
  </section>;
}