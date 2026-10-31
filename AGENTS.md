<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep scroll-reveal behavior and the home/about footer in shared components so both pages maintain identical motion and navigation.
- Keep catalog selection rules in a browser-safe pure module so URL filters and their tests use the same logic without backend access.
- Keep lost/found demo notices in a browser-safe data module and hydrate saved questionnaire answers only after mount; notice contacts must remain non-deliverable example addresses.
- Keep global search in a browser-safe pure module and the shared header search control; adoption and notice results must use the same demo sources as the catalog.
- Use the shared Embla carousel for animal galleries and a media registry for photo descriptions and attribution; preserve the primary photo field for cards.
- Keep reference organizations in their own marquee component and animation in global CSS; hide duplicate links from accessibility and use a static snap-scroll list under reduced motion.
- Derive homepage statistics in a browser-safe module from existing demo sources; animate counts only after mount to preserve SSR.
- Use a notice-specific photo description helper for list and detail alt text; keep source provenance in media attribution rather than notice alt text.
- Keep /painel and /dashboard as distinct adopter and catalog-management views; derive counts from existing local sources and preserve legacy session aliases while storing only the canonical Portuguese session fields so existing favorites remain compatible.
- Keep institution workspace and animal contact drafts browser-only and account-scoped; never seed catalog ownership or applications, and never imply local messages are delivered to other accounts.
- Use one shared header logo asset and derive the favicon from its symbol so site identity stays consistent.
- Keep visual hierarchy and motion in global tokens and shared controls so page-specific styling cannot diverge.
- Keep the six-question adoption profile, validation, species preference and scoring in a browser-safe pure module; preserve legacy quiz answers while excluding unasked dimensions from new scores so all result surfaces agree without invented household facts.
