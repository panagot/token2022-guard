# Token2022 Guard

**Pre-mainnet safety checks for Solana Token-2022 integrations.**

Token-2022 is not SPL Token. Extensions such as transfer hooks, transfer fees, permanent
delegates, and confidential transfers introduce an attack surface that auditors keep finding
the same bugs in — missing `transferring`-state guards, hook re-entrancy, fee rounding drift,
hardcoded account sizes, and more.

Token2022 Guard scans your Anchor / Rust source for those footguns before you ship. One
analysis engine powers the web UI, CLI, GitHub Action, and VS Code extension.

**Live demo:** [token2022-guard.vercel.app](https://token2022-guard.vercel.app)  
**npm:** [token2022-guard](https://www.npmjs.com/package/token2022-guard) · `npx token2022-guard`  
**License:** MIT

---

## Why this exists

Teams copy SPL Token patterns into Token-2022 code and ship criticals. Recent audit write-ups
document the same recurring issues:

- Transfer hooks callable outside a real transfer (no `transferring`-state check)
- Same-mint CPI inside a hook causing recursion / griefing
- `ExtraAccountMetaList` accounts trusted without seed validation
- `transfer` used instead of `transfer_checked` on fee or hooked mints
- `calculate_fee` and `calculate_inverse_fee` mixed (off-by-one balance drift)
- Fixed `Mint::LEN` / `space = N` on extension-bearing accounts

Token2022 Guard flags these from source — in the editor, in CI, or in the browser.

> Static heuristics. A complement to professional audits, not a replacement.

---

## Quick start

### Web UI

```bash
git clone https://github.com/panagot/token2022-guard.git
cd token2022-guard
npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002). Load **Vulnerable transfer hook** to see
findings, then **Secure transfer hook** to see them clear (0 high/critical).

### CLI (local or npm)

```bash
# After clone
npm run scan -- ./examples

# After npm publish (no clone) — v0.2.1+
npx token2022-guard ./programs --fail-on=high

# Verify package locally before publish
npm run smoke

# CI gate — exit 1 on high/critical
npm run scan -- ./programs --fail-on=high

# SARIF for GitHub code scanning
npm run scan -- ./programs --sarif > token2022-guard.sarif

# Markdown for PR comments
npm run scan -- ./programs --md > report.md

# JSON
npm run scan -- ./programs --json
```

**Flags:** `--format=table|json|sarif|markdown`, `--fail-on=<severity>`,
`--only=T22-001,T22-002`, `--except=T22-007`, `--no-color`, `--version`, `--help`.

### VS Code

```bash
cd vscode-extension
npm install
npm run build
```

Press **F5** to launch an Extension Development Host. Open `examples/vulnerable_hook.rs` —
findings appear as inline diagnostics with hover remediation and spec links.

---

## What it checks (26)

| ID | Severity | Issue |
|----|----------|-------|
| T22-001 | critical | Transfer hook missing `transferring`-state guard |
| T22-002 | high | Transfer hook re-entrancy / acyclicity risk |
| T22-003 | high | `ExtraAccountMetaList` seeds not validated |
| T22-004 | high | Token-2022 mints unsupported (SPL Token only) |
| T22-005 | medium | Deprecated `transfer` instead of `transfer_checked` |
| T22-006 | medium | Transfer fee not accounted for |
| T22-007 | medium | Permanent delegate not checked on incoming mint |
| T22-008 | low | Confidential transfer auditor key not handled |
| T22-009 | medium | Hardcoded account size for Token-2022 account |
| T22-010 | high | CPI Guard not enabled on custodied token account |
| T22-011 | medium | ImmutableOwner not set on custodied token account |
| T22-012 | medium | Transfer hook missing Anchor fallback dispatcher |
| T22-013 | medium | MemoTransfer requirement not handled |
| T22-014 | low | DefaultAccountState (frozen) not handled |
| T22-015 | low | Interest-bearing mint amount/UI confusion |
| T22-016 | high | Mint close authority not checked on deposit |
| T22-017 | high | Hook extra accounts lack owner validation |
| T22-018 | medium | Group/member pointer not bidirectionally validated |
| T22-019 | medium | Metadata pointer not validated against mint |
| T22-020 | medium | Scaled UI amount multiplier ignored |
| T22-021 | medium | Transfer fee epoch transition not handled |
| T22-022 | medium | Non-transferable mint assumed transferable |
| T22-023 | low | Pausable extension not checked before transfer |
| T22-024 | high | Hook program upgrade authority not verified |
| T22-025 | medium | Mint authority not re-checked after CPI |
| T22-026 | low | Account frozen state not checked before transfer |

Each finding includes severity, confidence, the offending line (when detectable), a
remediation, and a link to the [Token-2022 extensions spec](https://spl.solana.com/token-2022/extensions).

Full catalog with summaries: [token2022-guard.vercel.app/checks](https://token2022-guard.vercel.app/checks).

---

## Bundled examples

| File | Findings (approx.) | Purpose |
|------|-------------------|---------|
| `examples/vulnerable_hook.rs` | 16 (1 critical, 6 high) | Intentionally bad transfer-hook + deposit patterns |
| `examples/secure_hook.rs` | 0 | Audit-derived guards: transferring assertion, PDA whitelist, `token_interface`, fallback dispatcher |
| `examples/fee_mint_program.rs` | 11 (3 high) | Bad fee handling + SPL Token wiring on a deposit vault |
| `examples/extensions_program.rs` | 13 (2 high) | Pointer, fee-epoch, pausable, and post-CPI authority bugs |

```bash
npm run scan:examples
```

---

## Tests & benchmark

```bash
npm test              # 60 tests — fire + pass per check + integration examples
npm run smoke         # pack + fresh install CLI verification
npm run benchmark     # corpus scan → benchmark/results.json
```

See [BENCHMARK.md](./BENCHMARK.md) for false-positive notes and corpus results.

---

## CI / GitHub Action

`.github/workflows/token2022-guard.yml` runs on every push and PR:

1. Runs unit tests (`npm test`)
2. Scans `./examples` and fails on high/critical findings
3. Uploads SARIF to the repository **Security** tab

Copy the workflow into your own repo and point the scan path at your `programs/` directory.

---

## Architecture

```
lib/          Shared analysis engine (analyze(source))
cli/          Terminal interface + JSON / SARIF / Markdown
app/          Next.js web UI
examples/     Reference Anchor programs
vscode-extension/   Inline diagnostics (same engine)
```

No duplicated logic — the web UI, CLI, GitHub Action, and VS Code extension all call
`lib/analyzer.ts`.

---

## Deploy to Vercel

1. Import [github.com/panagot/token2022-guard](https://github.com/panagot/token2022-guard) in Vercel
2. Framework preset: **Next.js** (auto-detected)
3. Build command: `npm run build`
4. Output: default (`.next`)
5. Deploy

No environment variables required for the web UI.

---

## Limitations

- **Static heuristics** — pattern-based detection, not a full AST or runtime analysis
- **False positives / negatives** — tune with `--only` / `--except` until config files ship
- **Token-2022 focus** — does not replace general Anchor linters (see [Anchor Security Prep](https://github.com/panagot/Anchor-Security-Prep) for that)
- **Not an audit** — use alongside professional review before mainnet

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md):

- Expand toward 30+ checks (extension init, realloc, withheld-fee harvest)
- Config files, baselines, inline suppressions (M2)
- VS Code quick-fixes and Marketplace publish
- Secure transfer-hook template + Mollusk/LiteSVM test harness

**Shipped in v0.2.1:** 26 checks, 60 tests, `npm run smoke`, extensions example, slim npm package. Publish: `npm publish --access public`.
Grant reviewer walkthrough: [token2022-guard.vercel.app/reviewer](https://token2022-guard.vercel.app/reviewer).

---

## Related

Built by the same author as [Anchor Security Prep](https://github.com/panagot/Anchor-Security-Prep) —
general pre-audit static analysis for Anchor programs (26 rules, SARIF, CI). Token2022 Guard is a
**separate, complementary** tool focused on Token-2022 extension integration safety.

---

## License

MIT — see [LICENSE](./LICENSE).
