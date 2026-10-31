const partners = [
  "Patudos do Porto", "Cantinho de Lisboa", "Amigos de Quatro Patas",
  "Clínica Veterinária da Ribeira", "Município de Vila Verde", "Canil Municipal do Barreiro",
  "PetShop O Farol", "Fundação Patas Abertas", "Colégio Veterinário de Coimbra", "Abrigo S. Francisco",
];

export function PartnerMarquee() {
  return <section aria-labelledby="partners-title" className="border-t border-border py-12 md:py-16">
    <div className="mx-auto max-w-6xl px-6"><p className="eyebrow">Em parceria com quem cuida</p><h2 id="partners-title" className="mt-4 text-2xl md:text-3xl">Uma rede que não larga ninguém</h2></div>
    <div className="partner-marquee mt-8" aria-label="Rede de parceiros">
      <div className="partner-track">
        <ul className="partner-group">{partners.map((name) => <li key={name} className="font-serif text-xl text-muted-foreground transition-colors hover:text-foreground md:text-2xl">{name}</li>)}</ul>
        <ul className="partner-group partner-copy" aria-hidden="true">{partners.map((name) => <li key={name} className="font-serif text-xl text-muted-foreground transition-colors hover:text-foreground md:text-2xl">{name}</li>)}</ul>
      </div>
    </div>
  </section>;
}