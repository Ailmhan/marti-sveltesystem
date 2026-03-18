# Design Consistency System

## Core principles
- One semantic token system for all pages/components.
- One typography pair: display + body.
- One brand gradient for primary CTA and active states.
- One logo treatment with shared fallback behavior.

## Tokens source
- Global tokens live in `src/app.css` (`:root` and `.dark`).
- Tailwind is mapped to those tokens in `tailwind.config.js`.
- Shared component skin styles are in `src/lib/styles/common.css`.

## Color system (semantic)
- `--primary`: main brand action color.
- `--accent`: warm accent color for highlights.
- `--background`, `--card`, `--muted`: surfaces.
- `--foreground`, `--muted-foreground`: text.
- `--destructive`, `--success`, `--warning`: status colors.

## Typography
- Body: `--font-sans` (`Manrope`).
- Display/headings: `--font-display` (`Sora`).

## Brand assets
- Unified logo component: `src/lib/components/BrandLogo.svelte`.
- Usage: use `BrandLogo` instead of ad-hoc emoji/inline image blocks.
- Supports school emblem/logo URL with a branded monogram fallback.

## Motion and effects
- Reusable classes in `src/app.css`:
  - `.btn-modern`
  - `.card-hover`
  - `.animate-rise-in`
  - `.animate-float-soft`

## Rules for new UI
- Do not hardcode hex colors in page/component styles.
- Use semantic tokens (`hsl(var(--...))`) only.
- Prefer shared button/card patterns from existing components.
- For new brand visuals, reuse `--gradient-brand` or `--gradient-brand-reverse`.
