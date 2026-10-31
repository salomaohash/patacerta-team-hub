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
- Keep partner marquee content in its own component and animation in global CSS; hide the duplicate from accessibility and show the entire original list under reduced motion.
- Use a notice-specific photo description helper for list and detail alt text; keep source provenance in media attribution rather than notice alt text.
