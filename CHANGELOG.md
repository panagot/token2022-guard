# Changelog

## v0.2.3

- Full UI redesign (audit workbook aesthetic, golden accent, ledger findings)
- Deeper guides and use-case content (9 + 9)
- Remove public `/milestones` page
- Responsive layout (1440px), editor scroll fixes, DESIGN.md
- Improved README

## v0.2.2

- Fix CI SARIF (tsx direct output; CodeQL v4; Node 22)
- fee_mint + extensions web samples; richer /checks catalog
- Reviewer proof chain, clickable guide links
- npm URL in footer and overview page

## v0.2.1

- Add `examples/extensions_program.rs` (pointer, fee epoch, pausable, CPI authority patterns)
- Add `npm run smoke` — pack + fresh-install CLI verification
- Slim npm package: only `tsx` as production dependency
- CLI `--version` reads from `package.json`
- Web UI: **Bad extension wiring** sample (`?sample=extensions`)
- Fix T22-025: ignore `reload` in comments, not in code

## v0.2.0 — Full check catalog

- 26 checks (T22-001 → T22-026)
- 59 unit tests, BENCHMARK.md

## v0.1.1

- 18 checks, Vitest, npm bin, `/reviewer` overview page

## v0.1.0

- Initial release: Token2022 Guard web UI and CLI
