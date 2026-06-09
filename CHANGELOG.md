# Changelog

## v0.2.3 — Grant submission ready

- Full UI redesign (audit workbook aesthetic, golden accent, ledger findings)
- Deeper guides and use-case content (9 + 9)
- Honest M1 milestones (npm smoke-tested; publish listed as remaining)
- docs/APPLICATION.md for Superteam Balkan form
- Responsive layout (1440px), editor scroll fixes, DESIGN.md

## v0.2.2 — M1 grant polish

- Fix CI SARIF (tsx direct output; CodeQL v4; Node 22)
- fee_mint + extensions web samples; richer /checks catalog
- Reviewer proof chain, docs/GRANT.md, clickable guide links
- npm URL in footer and reviewer page

## v0.2.1 — M1 completion

- Add `examples/extensions_program.rs` (pointer, fee epoch, pausable, CPI authority patterns)
- Add `npm run smoke` — pack + fresh-install CLI verification
- Slim npm package: only `tsx` as production dependency
- CLI `--version` reads from `package.json`
- Web UI: **Bad extension wiring** sample (`?sample=extensions`)
- Fix T22-025: ignore `reload` in comments, not in code
- Milestones page reflects M1 shipped vs remaining

## v0.2.0 — Full check catalog

- 26 checks (T22-001 → T22-026)
- 59 unit tests, BENCHMARK.md, `/milestones` page

## v0.1.1 — M1 prep

- 18 checks, Vitest, npm bin, `/reviewer` page
