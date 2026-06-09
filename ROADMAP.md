# T22 Guard — Roadmap

The engine lives in `lib/` and already powers three surfaces (web UI, CLI, VS Code).
Everything below extends that one engine — no duplicated logic.

## Check catalog

### Shipped (15)

| ID | Severity | Issue |
|----|----------|-------|
| T22-001 | critical | Transfer hook missing `transferring`-state guard |
| T22-002 | high | Transfer hook re-entrancy / acyclicity risk |
| T22-003 | high | `ExtraAccountMetaList` seeds not validated |
| T22-004 | high | Token-2022 mints unsupported (SPL Token only) |
| T22-005 | medium | Deprecated `transfer` vs `transfer_checked` |
| T22-006 | medium | Transfer fee mishandled |
| T22-007 | medium | Permanent delegate not checked on incoming mint |
| T22-008 | low | Confidential transfer auditor key not handled |
| T22-009 | medium | Hardcoded account size for Token-2022 account |
| T22-010 | high | CPI Guard not enabled on custodied account |
| T22-011 | medium | ImmutableOwner not set on custodied account |
| T22-012 | medium | Transfer hook missing Anchor fallback dispatcher |
| T22-013 | medium | MemoTransfer requirement not handled |
| T22-014 | low | DefaultAccountState (frozen) not handled |
| T22-015 | low | Interest-bearing mint amount/UI confusion |

### Planned (toward 30+)

| ID | Severity | Issue |
|----|----------|-------|
| T22-016 | high | Mint close authority enables close/reopen confusion |
| T22-017 | high | Transfer hook reads extra accounts without owner checks |
| T22-018 | medium | Group/member pointer not bidirectionally validated |
| T22-019 | medium | Metadata pointer points outside the mint (spoofable) |
| T22-020 | medium | Scaled-UI-amount multiplier ignored in pricing |
| T22-021 | medium | `transfer_fee` epoch transition not handled (older vs newer fee) |
| T22-022 | medium | Non-transferable mint assumed transferable |
| T22-023 | low | Pausable extension state not checked before transfer |
| T22-024 | high | Hook program upgrade authority unverified before trust |
| T22-025 | medium | Mint authority not re-checked after CPI |
| T22-026 | low | Missing `AccountState` check before transfer (frozen at runtime) |

Each new check ships with: a vulnerable + secure fixture, a unit test asserting it
fires/passes, and a spec reference.

## CLI add-ons

### Shipped
- Output formats: `--format=table|json|sarif|markdown` (+ `--json`, `--sarif`, `--md` aliases)
- CI gating: `--fail-on=<severity>` with exit codes
- Check filtering: `--only=`, `--except=`
- `--no-color`, `--version`, `--help`

### Planned
- **npm publish** → `npx t22-guard ./programs` (no clone needed)
- **Config file** `.t22guard.json` — per-repo severity overrides, ignore paths, disabled checks
- **Baseline** `--baseline t22.baseline.json` — suppress known/accepted findings (clean PR diffs)
- **Watch mode** `--watch` for local dev loops
- **Inline suppression** — `// t22-guard-disable-next-line T22-007` comments
- **HTML report** `--format=html` (shareable, like the web UI)
- **`--diff`** — only scan files changed vs a base ref (fast PR scans)

## Editor integrations

### Shipped
- **VS Code extension** (`vscode-extension/`) — live diagnostics on `.rs` files, severity-mapped, hover shows fix + reference.

### Planned
- Quick-fix **code actions** (insert remediation snippet)
- Workspace-wide scan command + status-bar summary
- Per-check enable/disable in settings
- **Marketplace** publish
- Neovim / LSP server (reuse the same engine over a thin LSP layer)

## Test harness & templates (grant M2)

- **Secure transfer-hook template** repo devs can clone (`create-t22-hook`)
- **Mollusk / LiteSVM harness** proving each guard actually blocks the matching exploit
- **False-positive benchmark** against real Token-2022 repos with a published write-up

## Engine

- Optional **Rust core** (port `lib/` checks) for a native binary, keeping the TS engine for web/editor
- AST-based detection (via `syn` in the Rust core) to cut false positives beyond regex heuristics
