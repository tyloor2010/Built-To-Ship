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

- App pages render inside the shell's shared 1200px container and start with `PageHeader` from primitives; why: identical width and header on every page.
- Empty states use `EmptyState` with a lucide icon, never emoji; why: one consistent zero-state style.
- Only ship nav items and buttons backed by a working feature; why: no dead links in a paid product.
