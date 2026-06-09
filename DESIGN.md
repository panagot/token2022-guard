# Token2022 Guard — Design System

A deliberate visual language: a **security audit workbook**. Warm paper, editorial
serif display type, hairline rules, and a single consistent ledger-row pattern for
findings. The opposite of the dark crypto-dashboard reflex.

## Thesis

1. Read like a printed technical specification, not a DeFi dashboard.
2. One instrument: the analyzer, the catalog, and the docs share the same ledger
   row language (severity dot, tabular check ID, monospace line number).
3. Character comes from typography and restraint, not effects.

## Theme: warm paper (light)

Chosen on purpose. Grant reviewers read long-form prose; developers read code.
A document-grade light UI is more legible for reading, and code stays on dark
surfaces (GitHub / Stripe docs convention). It also differentiates instantly from
every dark Solana tool.

## Palette (OKLCH, tinted neutrals)

| Token | Role |
|-------|------|
| `--paper` | warm off-white page background |
| `--paper-2` | subtle fill for alternating rows / insets |
| `--card` | raised surfaces (near-white, never `#fff`) |
| `--ink` / `--ink-muted` / `--ink-faint` | cool-tinted near-black text scale |
| `--line` / `--line-soft` | hairline rules |
| `--accent` | one restrained indigo, ≤10% of surface |
| `--critical` `--high` `--medium` `--low` `--ok` | muted, print-like severity hues |
| `--code-bg` / `--code-ink` | dark code surfaces |

No neon, no gradients, no glows.

## Typography

- **Display:** Fraunces (editorial serif) — headings only.
- **UI / body:** IBM Plex Sans.
- **Code / IDs / line numbers:** IBM Plex Mono, `font-variant-numeric: tabular-nums`.

Hierarchy via scale + weight; prose capped near 68ch.

## Signature patterns

- **Masthead** page header: serif title, lede, hairline rule, optional actions.
- **`§` section heads:** monospace index + label + hairline that fills the row.
- **Ledger findings:** severity dot, tabular-nums check ID, finding, monospace line,
  expandable detail with evidence, an inset tinted fix block, and a spec link.
- **Severity strip:** compact inline pills with dot indicators — never four big metric tiles.
- **Link rows:** dense bordered lists for indexes (guides, use cases) — never card grids.

## What we deliberately avoided

- Neon cyan/purple, electric glows, radial hero glows, visible CSS grid backgrounds.
- Corner-bracket "hacker" panels, glassmorphism, gradient text, bounce/elastic motion.
- Identical floating card grids and the big-number hero-metric template.
- Inter + purple, default Shadcn/Lucide template look, ALL-CAPS everywhere.

## Motion

Opacity / color transitions only, ~150ms ease-out. Respects
`prefers-reduced-motion`. No layout-property animation.
