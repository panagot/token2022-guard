# Token2022 Guard — Benchmark

**Generated:** 2026-06-09  
**Engine:** v0.1.1 · 18 checks  
**Command:** `npm run benchmark` → writes `benchmark/results.json`

This benchmark measures **detection on intentional bad patterns** and **false positives on secure
fixtures**. It is not a claim of 100% recall on mainnet code — static heuristics will miss novel
bugs and may flag style-only differences.

## Corpus

| File | Role | Findings | High+ |
|------|------|----------|-------|
| `examples/vulnerable_hook.rs` | Intentionally bad hook + deposit | 14 | 7 (1 critical) |
| `examples/secure_hook.rs` | Audit-derived guards | **0** | **0** |
| `examples/fee_mint_program.rs` | Bad fee / SPL wiring | 9 | 3 |
| `benchmark/external/hook_without_guard.rs` | Minimal hook, no transferring guard | 3 | 2 (1 critical) |
| `benchmark/external/spl_style_vault.rs` | SPL Token vault (no Token-2022) | 7 | 3 |

## Negative control (false positives)

`examples/secure_hook.rs` is the primary **false-positive benchmark**. It implements:

- `assert_is_transferring` guard (T22-001)
- PDA whitelist with `require_keys_eq!` (T22-017)
- `token_interface` + `transfer_checked` (T22-004, T22-005)
- Anchor fallback dispatcher (T22-012)

**Result: 0 findings** across all 18 checks.

## Detection highlights

### Transfer hooks (`vulnerable_hook.rs`, `hook_without_guard.rs`)

| Check | vulnerable_hook | hook_without_guard |
|-------|-----------------|-------------------|
| T22-001 transferring guard | ✓ | ✓ |
| T22-002 re-entrancy | ✓ | — |
| T22-003 ExtraAccountMeta seeds | ✓ | — |
| T22-012 fallback dispatcher | ✓ | ✓ |
| T22-017 extra account owner | — | ✓ |

### Vault / deposit patterns (`spl_style_vault.rs`, `fee_mint_program.rs`)

| Check | spl_style_vault | fee_mint_program |
|-------|-----------------|------------------|
| T22-004 SPL-only wiring | ✓ | ✓ |
| T22-005 deprecated transfer | ✓ | ✓ |
| T22-007 permanent delegate | ✓ | ✓ |
| T22-009 hardcoded size | ✓ | ✓ |
| T22-010 CPI Guard | ✓ | ✓ |
| T22-011 ImmutableOwner | ✓ | ✓ |
| T22-016 mint close authority | ✓ | ✓ |
| T22-006 fee handling | — | ✓ |

## Known limitations (honest FP/FN notes)

1. **Regex heuristics** — checks look for patterns, not full AST. Refactors that preserve unsafe
   behavior but rename symbols may evade detection.
2. **T22-016** — fires when a deposit/vault path references `Mint` without any `close_authority`
   check. Programs that validate close authority in a separate module may still flag until
   config/inline suppressions ship (M2).
3. **T22-003** — requires `ExtraAccountMeta(List)` in source; snake_case field names alone do not
   trigger (by design — we anchor on the type).
4. **External corpus** — `benchmark/external/` holds **minimal pattern snippets** distilled from
   public audit write-ups, not cloned third-party repos. Full-repo scans are planned as the
   check catalog grows.

## Unit test gate

Every shipped check has an isolated **bad** and **good** fixture in `lib/fixtures.ts`, asserted
in `lib/__tests__/checks.test.ts`:

```bash
npm test   # 42 tests — fire + pass per check + integration examples
```

CI runs `npm test` before the example scan (see `.github/workflows/token2022-guard.yml`).

## Reproduce

```bash
npm install
npm test
npm run benchmark
npm run scan -- ./examples --fail-on=high
```
