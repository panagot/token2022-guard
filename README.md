# Token2022 Guard

**Pre-mainnet safety checks for Solana Token-2022 integrations.**

[![Live demo](https://img.shields.io/badge/demo-token2022--guard.vercel.app-0f766e?style=flat-square)](https://token2022-guard.vercel.app/?sample=vulnerable)
[![Version](https://img.shields.io/badge/version-v0.2.3-92400e?style=flat-square)](https://github.com/panagot/token2022-guard/releases)
[![Tests](https://img.shields.io/badge/tests-60_passing-166534?style=flat-square)](https://github.com/panagot/token2022-guard/actions)
[![License](https://img.shields.io/badge/license-MIT-1e3a5f?style=flat-square)](./LICENSE)

Token-2022 is not SPL Token. Extensions — transfer hooks, transfer fees, permanent delegates,
confidential transfers, pointer metadata — introduce an attack surface auditors keep hitting
the same way: missing `transferring`-state guards, hook re-entrancy, fee rounding drift,
hardcoded account sizes, and more.

Token2022 Guard scans Anchor / Rust source for those footguns **before** you ship. One analysis
engine powers the web UI, CLI, GitHub Action, and VS Code extension.

| | |
|---|---|
| **Live demo** | [token2022-guard.vercel.app](https://token2022-guard.vercel.app/?sample=vulnerable) |
| **Check catalog** | [token2022-guard.vercel.app/checks](https://token2022-guard.vercel.app/checks) |
| **Guides** | [token2022-guard.vercel.app/guides](https://token2022-guard.vercel.app/guides) |
| **CI status** | [GitHub Actions](https://github.com/panagot/token2022-guard/actions/workflows/token2022-guard.yml) |
| **npm** | Package smoke-tested locally; publish pending — use clone + `npm run scan` below |

> Static heuristics. A complement to professional audits, not a replacement.

---

## Try it now

**No install** — open the [live demo](https://token2022-guard.vercel.app/?sample=vulnerable),
load **Vulnerable transfer hook**, run checks, then switch to **Secure transfer hook** and watch
findings drop to zero.

**CLI (30 seconds):**

```bash
git clone https://github.com/panagot/token2022-guard.git
cd token2022-guard
npm install
npm run scan -- ./examples/vulnerable_hook.rs
```

Sample output:

```
Token2022 Guard · Token-2022 safety scan
Scanned 1 file(s)

examples\vulnerable_hook.rs
  CRITICAL T22-001 (conf: high) examples\vulnerable_hook.rs:12
    Transfer hook missing transferring-state guard
    fix: At the top of the hook, read the TransferHookAccount extension and reject if not
         transferring, e.g. `assert_is_transferring(&source_account_info)?;` before any logic.

  HIGH     T22-003 (conf: low)
    ExtraAccountMetaList seeds not validated
    fix: Build the ExtraAccountMetaList from `Seed::` derivations (PDAs) and re-derive/verify
         those seeds inside the hook instead of trusting passed accounts.
  ...
```

---

## Why this exists

Teams copy SPL Token patterns into Token-2022 code and ship criticals. Recent audit write-ups
document the same recurring issues:

| Pattern | What goes wrong |
|---------|-----------------|
| Hook without `transferring` guard | Hook callable outside a real transfer |
| Same-mint CPI inside a hook | Recursion / griefing |
| `ExtraAccountMetaList` without seed checks | Spoofed whitelist PDAs bypass logic |
| `transfer` on fee or hooked mints | Should use `transfer_checked` |
| `calculate_fee` vs `calculate_inverse_fee` | Off-by-one balance drift |
| Fixed `Mint::LEN` / `space = N` | Extension-bearing accounts need realloc |

Token2022 Guard flags these from source — in the editor, in CI, or in the browser.

---

## Install & usage

### Web UI (local)

```bash
npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

### CLI

```bash
# Scan a directory or single file
npm run scan -- ./programs
npm run scan -- ./programs --fail-on=high    # exit 1 on high/critical

# Output formats
npm run scan -- ./programs --json
npm run scan -- ./programs --sarif > token2022-guard.sarif
npm run scan -- ./programs --md > report.md

# Filter checks
npm run scan -- ./programs --only=T22-001,T22-002
npm run scan -- ./programs --except=T22-007
```

**Flags:** `--format=table|json|sarif|markdown`, `--fail-on=<severity>`,
`--only`, `--except`, `--no-color`, `--version`, `--help`.

After `npm publish` (maintainers): `npx token2022-guard ./programs --fail-on=high`.

### VS Code

```bash
cd vscode-extension && npm install && npm run build
```

Press **F5** to launch an Extension Development Host. Open `examples/vulnerable_hook.rs` —
findings appear as inline diagnostics with hover remediation and spec links.

---

## What it checks

**26 checks** (T22-001 → T22-026) · **60 unit tests** · each finding includes severity,
confidence, line (when detectable), remediation, and a link to the
[Token-2022 extensions spec](https://spl.solana.com/token-2022/extensions).

<details>
<summary><strong>Full catalog</strong> — also browsable at <a href="https://token2022-guard.vercel.app/checks">/checks</a></summary>

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

</details>

**Severity breakdown:** 1 critical · 8 high · 13 medium · 4 low

---

## Examples

| File | Findings (approx.) | Purpose |
|------|-------------------|---------|
| `examples/vulnerable_hook.rs` | 16 (1 critical, 6 high) | Intentionally bad transfer-hook + deposit patterns |
| `examples/secure_hook.rs` | 0 | Audit-derived guards: transferring assertion, PDA whitelist, `token_interface`, fallback dispatcher |
| `examples/fee_mint_program.rs` | 11 (3 high) | Bad fee handling + SPL Token wiring on a deposit vault |
| `examples/extensions_program.rs` | 13 (2 high) | Pointer, fee-epoch, pausable, and post-CPI authority bugs |

```bash
npm run scan:examples
```

The web UI loads the same samples — useful for demos and reviewer walkthroughs.

---

## CI / GitHub Action

This repo runs on every push and PR ([workflow](.github/workflows/token2022-guard.yml)):

1. Unit tests (`npm test`)
2. Scan `./examples`, fail on high/critical
3. Upload SARIF to the **Security** tab

**Drop into your repo** — copy `.github/workflows/token2022-guard.yml` and change the scan path:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 22
- run: npm ci
- run: npm test
- run: npm run scan -- ./programs --fail-on=high
- run: npx tsx cli/index.ts ./programs --sarif > token2022-guard.sarif
  if: always()
- uses: github/codeql-action/upload-sarif@v4
  if: always()
  with:
    sarif_file: token2022-guard.sarif
```

Point `npm ci` at a checkout of this repo, or vendor the `lib/` + `cli/` package once npm is published.

---

## Tests & benchmark

```bash
npm test              # 60 tests — per-check fixtures + integration examples
npm run smoke         # pack + fresh-install CLI verification (pre-publish)
npm run benchmark     # corpus scan → benchmark/results.json
```

See [BENCHMARK.md](./BENCHMARK.md) for false-positive notes. `examples/secure_hook.rs` is the
negative control — **0 findings** across all 26 checks.

---

## Architecture

```
lib/                 Shared analysis engine (analyze(source))
cli/                 Terminal interface + JSON / SARIF / Markdown
app/                 Next.js web UI
examples/            Reference Anchor programs
vscode-extension/    Inline diagnostics (same engine)
```

No duplicated logic — every surface calls `lib/analyzer.ts`.

---

## Limitations

- **Static heuristics** — pattern-based detection, not a full AST or runtime analysis
- **False positives / negatives** — tune with `--only` / `--except` until config files ship
- **Token-2022 focus** — does not replace general Anchor linters (see [Anchor Security Prep](https://github.com/panagot/Anchor-Security-Prep))
- **Not an audit** — use alongside professional review before mainnet

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full plan. Highlights:

- Expand toward 30+ checks (extension init, realloc, withheld-fee harvest)
- Config files, baselines, inline suppressions
- VS Code quick-fixes and Marketplace publish
- `npx token2022-guard` on npm
- Secure transfer-hook template + Mollusk/LiteSVM test harness

**v0.2.3:** 26 checks, 60 tests, 4 web samples, SARIF CI, product overview at [/reviewer](https://token2022-guard.vercel.app/reviewer).

---

## Related

Built by the same author as [Anchor Security Prep](https://github.com/panagot/Anchor-Security-Prep) —
general pre-audit static analysis for Anchor programs (26 rules, SARIF, CI). Token2022 Guard is a
**separate, complementary** tool focused on Token-2022 extension integration safety.

---

## License

MIT — see [LICENSE](./LICENSE).
