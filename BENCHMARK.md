# Token2022 Guard — Benchmark

**Generated:** 2026-06-09  
**Engine:** v0.2.3 · 26 checks  
**Command:** `npm run benchmark` → writes `benchmark/results.json`

This benchmark measures **detection on intentional bad patterns** and **false positives on secure
fixtures**. It is not a claim of 100% recall on mainnet code — static heuristics will miss novel
bugs and may flag style-only differences.

## Corpus (6 files)

| File | Role | Findings | High+ |
|------|------|----------|-------|
| `examples/vulnerable_hook.rs` | Intentionally bad hook + deposit | 16 | 7 (1 critical) |
| `examples/secure_hook.rs` | Audit-derived guards | **0** | **0** |
| `examples/fee_mint_program.rs` | Bad fee / SPL wiring | 11 | 3 |
| `examples/extensions_program.rs` | Bad pointers, fee epoch, pause, CPI auth | 13 | 2 |
| `benchmark/external/hook_without_guard.rs` | Minimal hook, no transferring guard | 3 | 2 (1 critical) |
| `benchmark/external/spl_style_vault.rs` | SPL Token vault (no Token-2022) | 9 | 3 |

## Negative control (false positives)

`examples/secure_hook.rs` is the primary **false-positive benchmark**:

- `assert_is_transferring` guard (T22-001)
- PDA whitelist with `require_keys_eq!` (T22-017)
- `token_interface` + no unsafe transfers (T22-004, T22-022, T22-026)
- Anchor fallback dispatcher (T22-012)

**Result: 0 findings** across all **26** checks.

## Extension example (`extensions_program.rs`)

New in v0.2.1 — exercises checks that only appeared in unit fixtures before:

| Check | Triggered |
|-------|-----------|
| T22-018 group/member pointer | ✓ |
| T22-019 metadata pointer | ✓ |
| T22-020 scaled UI amount | ✓ |
| T22-021 transfer fee epoch | ✓ |
| T22-023 pausable | ✓ |
| T22-025 mint authority after CPI | ✓ |
| T22-005, T22-022, T22-026 transfers | ✓ |

## Vault / deposit patterns

| Check | fee_mint | spl_style_vault | extensions |
|-------|----------|-----------------|------------|
| T22-004 SPL-only | ✓ | ✓ | — |
| T22-010 CPI Guard | ✓ | ✓ | ✓ |
| T22-016 close authority | ✓ | ✓ | ✓ |
| T22-022 non-transferable | ✓ | ✓ | ✓ |
| T22-026 frozen state | ✓ | ✓ | ✓ |

## Unit test + smoke gates

```bash
npm test    # 60 tests — fixtures + integration examples
npm run smoke   # npm pack → fresh install → npx token2022-guard scan
```

CI runs `npm test` before the example scan (see `.github/workflows/token2022-guard.yml`).

## Known limitations

1. **Regex heuristics** — pattern-based, not AST. Novel refactorings may evade checks.
2. **T22-022 / T22-026** — fire on any `token::transfer` without guards; tune with `--except` until config files ship.
3. **T22-025** — now code-aware (comments mentioning `reload` no longer suppress the check).
4. **External corpus** — minimal snippets from audit patterns, not full cloned repos.

## Reproduce

```bash
npm install
npm test
npm run smoke
npm run benchmark
npm run scan -- ./examples --fail-on=high
```
