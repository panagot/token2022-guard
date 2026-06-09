# Token2022 Guard — Benchmark

**Generated:** 2026-06-09  
**Engine:** v0.2.0 · 26 checks  
**Command:** `npm run benchmark` → writes `benchmark/results.json`

This benchmark measures **detection on intentional bad patterns** and **false positives on secure
fixtures**. It is not a claim of 100% recall on mainnet code — static heuristics will miss novel
bugs and may flag style-only differences.

## Corpus

| File | Role | Findings | High+ |
|------|------|----------|-------|
| `examples/vulnerable_hook.rs` | Intentionally bad hook + deposit | 16 | 7 (1 critical) |
| `examples/secure_hook.rs` | Audit-derived guards | **0** | **0** |
| `examples/fee_mint_program.rs` | Bad fee / SPL wiring | 11 | 3 |
| `benchmark/external/hook_without_guard.rs` | Minimal hook, no transferring guard | 3 | 2 (1 critical) |
| `benchmark/external/spl_style_vault.rs` | SPL Token vault (no Token-2022) | 9 | 3 |

## Negative control (false positives)

`examples/secure_hook.rs` is the primary **false-positive benchmark**. It implements:

- `assert_is_transferring` guard (T22-001)
- PDA whitelist with `require_keys_eq!` (T22-017)
- `token_interface` + no unsafe transfers (T22-004, T22-022, T22-026)
- Anchor fallback dispatcher (T22-012)

**Result: 0 findings** across all **26** checks.

## Detection highlights

### Transfer hooks (`vulnerable_hook.rs`, `hook_without_guard.rs`)

| Check | vulnerable_hook | hook_without_guard |
|-------|-----------------|-------------------|
| T22-001 transferring guard | ✓ | ✓ |
| T22-002 re-entrancy | ✓ | — |
| T22-003 ExtraAccountMeta seeds | ✓ | — |
| T22-012 fallback dispatcher | ✓ | ✓ |
| T22-017 extra account owner | — | ✓ |
| T22-022 non-transferable | ✓ | — |
| T22-026 frozen state | ✓ | — |

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
| T22-022 non-transferable | ✓ | ✓ |
| T22-026 frozen state | ✓ | ✓ |

### New extension checks (v0.2.0)

T22-018 → T22-026 are covered by **per-check unit fixtures** (`lib/fixtures.ts`). Integration
examples above exercise the highest-traffic subset (transfers, fees, vault custody). Pointer,
pausable, and epoch-fee checks fire on isolated bad snippets and will appear in corpus files as
we add extension-specific examples.

## Known limitations (honest FP/FN notes)

1. **Regex heuristics** — checks look for patterns, not full AST. Refactors that preserve unsafe
   behavior but rename symbols may evade detection.
2. **T22-022 / T22-026** — fire on any program that transfers without extension/state guards.
   Legitimate internal tools may need `--except` until M2 config ships.
3. **T22-021** — requires `TransferFee` in source; programs using only `transfer_checked_with_fee`
   without explicit fee config may not trigger.
4. **External corpus** — `benchmark/external/` holds minimal pattern snippets, not cloned repos.

## Unit test gate

Every shipped check has an isolated **bad** and **good** fixture in `lib/fixtures.ts`, asserted
in `lib/__tests__/checks.test.ts`:

```bash
npm test   # 59 tests — fire + pass per check + integration examples
```

CI runs `npm test` before the example scan (see `.github/workflows/token2022-guard.yml`).

## Reproduce

```bash
npm install
npm test
npm run benchmark
npm run scan -- ./examples --fail-on=high
```
