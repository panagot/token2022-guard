export interface UseCaseDetail {
  problem: string;
  audience: string;
  when: string[];
  workflow: { step: string; detail: string }[];
  whatWeCatch: string[];
  avoid: string[];
  relatedGuides: { slug: string; title: string }[];
}

export const USE_CASE_CONTENT: Record<string, UseCaseDetail> = {
  "transfer-hook": {
    problem:
      "Transfer hooks run inside every transfer of a hooked mint. A missing transferring-state guard lets anyone invoke your hook directly. Same-mint CPI inside the hook can recurse until the transaction fails. Extra accounts passed to the hook are a common bypass vector when seeds are not re-derived.",
    audience: "Teams shipping a custom Token-2022 transfer hook in Anchor or native Rust.",
    when: [
      "You are writing `transfer_hook` or `Execute` handler logic for the first time.",
      "You added a whitelist, policy gate, or fee logic that reads extra accounts.",
      "You are about to point a production mint at your hook program id.",
      "An audit flagged hook invocation or ExtraAccountMetaList issues.",
    ],
    workflow: [
      {
        step: "Load the vulnerable sample",
        detail:
          "Open the analyzer with `?sample=vulnerable` and note T22-001 (critical), T22-002, T22-003, T22-012. These map to the four hook footguns auditors report most often.",
      },
      {
        step: "Scan your hook crate",
        detail:
          "Run `npm run scan -- ./programs/transfer-hook --fail-on=high` or paste your source in the web UI. Focus on high/critical first.",
      },
      {
        step: "Compare against the secure sample",
        detail:
          "Toggle `?sample=secure` — 0 findings across all 26 checks. Use it as a structural reference: transferring assertion, PDA whitelist, token_interface, fallback dispatcher.",
      },
      {
        step: "Re-scan after fixes",
        detail:
          "Clear high/critical before mainnet. Keep medium findings on a checklist for audit — static analysis will not catch every runtime edge case.",
      },
    ],
    whatWeCatch: [
      "T22-001 — hook callable outside a real transfer",
      "T22-002 — same-mint CPI / re-entrancy inside the hook",
      "T22-003 — ExtraAccountMetaList without Seed:: validation",
      "T22-012 — missing Anchor fallback for Execute discriminator",
      "T22-017 — extra accounts (whitelist) without owner/PDA checks",
      "T22-024 — hook program id set without upgrade authority check",
    ],
    avoid: [
      "Trusting extra accounts because they are in the account list — always re-derive PDAs.",
      "Shipping without a fallback if you use Anchor's `#[program]` macro.",
      "Assuming the hook only runs during user-initiated transfers — it can be invoked directly.",
    ],
    relatedGuides: [
      { slug: "transfer-hook-checklist", title: "Transfer Hook Security Checklist" },
      { slug: "token2022-not-spl", title: "Token-2022 Is Not SPL Token" },
    ],
  },
  "hook-review": {
    problem:
      "You are integrating a third-party hook program you did not write. If it lacks a transferring guard or performs same-mint CPI, your protocol inherits that risk when you list hooked mints or route user transfers through them.",
    audience: "Integrators, listing teams, and auditors reviewing external hook programs.",
    when: [
      "A partner mint uses an external transfer hook you do not control.",
      "You are adding a allowlist of hooked mints to your DEX, vault, or payment rail.",
      "Due diligence before listing a memecoin or RWA with custom hook logic.",
    ],
    workflow: [
      {
        step: "Obtain hook source",
        detail:
          "Request the verified program source or IDL. Scan the entire crate — hooks are often small but dense.",
      },
      {
        step: "Run focused checks",
        detail:
          "Use `--only=T22-001,T22-002,T22-017,T22-024` for a fast pass on direct invocation, re-entrancy, extra-account trust, and upgrade authority.",
      },
      {
        step: "Compare to secure baseline",
        detail:
          "Diff mentally against the secure sample: transferring assertion, no in-hook transfer, validated PDAs.",
      },
      {
        step: "Document residual risk",
        detail:
          "Static scan ≠ audit. Note findings you accept vs blockers for listing.",
      },
    ],
    whatWeCatch: [
      "T22-001 — direct hook invocation",
      "T22-002 — recursion / griefing via in-hook transfer",
      "T22-017 — spoofed whitelist or policy accounts",
      "T22-024 — upgradeable hook logic after users integrate",
    ],
    avoid: [
      "Listing a mint because the hook 'looks simple' — complexity hides in extra accounts.",
      "Skipping review because the hook is 'battle tested' on another chain — Solana invocation model differs.",
    ],
    relatedGuides: [
      { slug: "transfer-hook-checklist", title: "Transfer Hook Security Checklist" },
      { slug: "pre-audit-prep", title: "Pre-Audit Prep Workflow" },
    ],
  },
  "spl-migration": {
    problem:
      "Code written for SPL Token often hardcodes `anchor_spl::token`, `spl_token::ID`, fixed `space = 165`, and `transfer()` without decimals. Token-2022 mints use a different program id, variable account sizes, and extensions that make those patterns fail or behave dangerously at runtime.",
    audience: "Teams upgrading an existing Anchor program to support Token-2022 mints.",
    when: [
      "Product asked for Token-2022 support on an existing SPL-only program.",
      "You added `spl_token_2022` imports but kept legacy `token::transfer` calls.",
      "Init accounts use `Mint::LEN` or `space = 165` without extension sizing.",
    ],
    workflow: [
      {
        step: "Scan the full programs/ tree",
        detail:
          "Run `npm run scan -- ./programs` and sort by severity. T22-004 and T22-005 are the first migration blockers.",
      },
      {
        step: "Replace SPL wiring",
        detail:
          "Move to `anchor_spl::token_interface`, `InterfaceAccount`, and `transfer_checked`. See the token2022-not-spl guide for the checklist.",
      },
      {
        step: "Fix account sizing",
        detail:
          "Replace hardcoded lengths with `ExtensionType::try_calculate_account_len` for each mint's extension set.",
      },
      {
        step: "Re-test on devnet with a real Token-2022 mint",
        detail:
          "Static fixes clear many findings; devnet confirms init and transfer paths with fees/hooks enabled.",
      },
    ],
    whatWeCatch: [
      "T22-004 — SPL Token only wiring or hardcoded program id",
      "T22-005 — deprecated transfer()",
      "T22-009 — fixed account size",
      "T22-022 — transfers without NonTransferable check",
      "T22-026 — transfers without frozen-state check",
    ],
    avoid: [
      "Feature-flagging Token-2022 without changing the token program interface — both mint types need token_interface.",
      "Copy-pasting SPL init macros for extension-bearing mints.",
    ],
    relatedGuides: [
      { slug: "token2022-not-spl", title: "Token-2022 Is Not SPL Token" },
      { slug: "cli-quickstart", title: "CLI Quickstart" },
    ],
  },
  "vault-deposit": {
    problem:
      "Vaults, escrows, and staking programs custody user tokens. Token-2022 adds permanent delegates, closable mints, CPI-driven drains, and reassignable account owners — each can break the assumption that deposited funds stay until your program releases them.",
    audience: "DeFi vaults, escrow, staking, and payment-hold programs accepting external mints.",
    when: [
      "You accept arbitrary Token-2022 mints as collateral or deposits.",
      "You create program-owned token accounts (vault PDAs).",
      "Users can deposit without your program creating the mint.",
    ],
    workflow: [
      {
        step: "Scan deposit and withdraw instructions",
        detail:
          "Focus on `deposit`, `stake`, `lock`, `escrow` handlers and their account structs.",
      },
      {
        step: "Check mint extensions on the way in",
        detail:
          "Permanent delegate (T22-007), close authority (T22-016), non-transferable (T22-022), pausable (T22-023).",
      },
      {
        step: "Harden vault token accounts",
        detail:
          "Enable CPI Guard (T22-010) and ImmutableOwner (T22-011) on accounts your program owns.",
      },
      {
        step: "Use transfer_checked",
        detail:
          "Replace bare `transfer` with `transfer_checked` so fee and hook mints do not revert silently in production.",
      },
    ],
    whatWeCatch: [
      "T22-007 — permanent delegate not inspected",
      "T22-010 — CPI Guard missing on vault",
      "T22-011 — ImmutableOwner missing",
      "T22-016 — mint close authority not disabled",
      "T22-005 — deprecated transfer",
      "T22-026 — frozen account state ignored",
    ],
    avoid: [
      "Assuming ATA defaults are enough — program-created accounts need explicit extension init.",
      "Accepting any mint without an allowlist or extension policy for high-value vaults.",
    ],
    relatedGuides: [
      { slug: "vault-extensions", title: "CPI Guard & ImmutableOwner for Vaults" },
      { slug: "transfer-fees", title: "Transfer Fee Math" },
    ],
  },
  "fee-mint": {
    problem:
      "Transfer-fee mints deduct fees during transfer. Using `transfer()` fails. Mixing `calculate_fee` and `calculate_inverse_fee` drifts accounting. Fee rates can change at epoch boundaries — static fee assumptions break reconciliation.",
    audience: "DEXs, payment apps, and treasuries integrating fee-on-transfer tokens.",
    when: [
      "You integrate a Token-2022 mint with TransferFee extension.",
      "Your accounting recomputes fees in both directions.",
      "Treasury reports do not match on-chain balances after many transfers.",
    ],
    workflow: [
      {
        step: "Scan fee_mint_program example",
        detail:
          "Load `examples/fee_mint_program.rs` via scan or the fee patterns in guides — expect T22-004, T22-005, T22-006.",
      },
      {
        step: "Replace fee math",
        detail:
          "Use `transfer_checked_with_fee` with an explicit expected fee. Pick one direction for internal accounting.",
      },
      {
        step: "Handle epoch transitions",
        detail:
          "Read newer/older transfer fee for the current epoch (T22-021). See extension-pointers guide for fee + pointer combos.",
      },
      {
        step: "Gate in CI",
        detail:
          "Add `--only=T22-005,T22-006,T22-021` on PRs touching token movement code.",
      },
    ],
    whatWeCatch: [
      "T22-005 — transfer() instead of transfer_checked",
      "T22-006 — calculate_fee + calculate_inverse_fee mixed",
      "T22-021 — epoch fee transition not handled",
    ],
    avoid: [
      "Treating fee as optional — hooked + fee mints revert on legacy transfer.",
      "Using inverse fee to 'undo' a transfer in ledger logic.",
    ],
    relatedGuides: [
      { slug: "transfer-fees", title: "Transfer Fee Math" },
      { slug: "extension-pointers", title: "Pointer & Pausable Extensions" },
    ],
  },
  "extension-metadata": {
    problem:
      "GroupPointer, MemberPointer, MetadataPointer, and ScaledUiAmount move metadata and pricing off-chain or to sibling accounts. Trusting pointers without bidirectional validation or mint-authority checks lets attackers spoof membership, token metadata, or UI balances.",
    audience: "Token launchers, RWA platforms, and apps displaying Token-2022 metadata or custom UI amounts.",
    when: [
      "Your mint uses MetadataPointer or Group/Member pointers.",
      "You display token symbol/name from a pointer account.",
      "You price ScaledUiAmount mints using raw `amount`.",
    ],
    workflow: [
      {
        step: "Try the extensions sample",
        detail:
          "Open `?sample=extensions` in the analyzer — 13+ findings including T22-018 through T22-021 and T22-025.",
      },
      {
        step: "Scan mint init and read paths",
        detail:
          "Pointer validation belongs in both init and any instruction that reads metadata or group membership.",
      },
      {
        step: "Fix pricing paths",
        detail:
          "Apply ScaledUiAmount multiplier or UI helpers before displaying balances (T22-020).",
      },
      {
        step: "Re-run benchmark entry",
        detail:
          "`examples/extensions_program.rs` is in BENCHMARK.md — use it as a regression fixture.",
      },
    ],
    whatWeCatch: [
      "T22-018 — group/member pointer not bidirectional",
      "T22-019 — metadata pointer not validated",
      "T22-020 — scaled UI multiplier ignored",
      "T22-021 — transfer fee epoch ignored",
      "T22-023 — pausable not checked before transfer",
      "T22-025 — mint authority used after CPI without reload",
    ],
    avoid: [
      "Reading metadata from whatever account the client passes.",
      "Assuming pointer addresses are immutable without on-chain verification.",
    ],
    relatedGuides: [
      { slug: "extension-pointers", title: "Pointer & Pausable Extensions" },
      { slug: "token2022-not-spl", title: "Token-2022 Is Not SPL Token" },
    ],
  },
  "pre-audit": {
    problem:
      "Auditors charge by depth. Showing up with known Token-2022 footguns already fixed — and a scan report attached — reduces back-and-forth on recurring extension bugs and lets reviewers focus on business logic.",
    audience: "Founders and lead devs one to two weeks before an external audit.",
    when: [
      "Audit kickoff is scheduled and code freeze is approaching.",
      "You want a structured pass before paying for review hours.",
      "You need a findings export for the audit firm (Markdown / SARIF).",
    ],
    workflow: [
      {
        step: "Full scan with tests",
        detail:
          "Run `npm test` then `npm run scan -- ./programs --fail-on=high`. Export `--md` or `--sarif` for the audit package.",
      },
      {
        step: "Triage by extension area",
        detail:
          "Group findings: hooks, vault/custody, fees, pointers. Assign owners per area.",
      },
      {
        step: "Attach BENCHMARK context",
        detail:
          "Link BENCHMARK.md — shows secure_hook = 0 FP and intentional bad examples for regression.",
      },
      {
        step: "Document accepted risks",
        detail:
          "Medium/low findings you defer should be listed with rationale — auditors appreciate honesty.",
      },
    ],
    whatWeCatch: [
      "All 26 checks — prioritize critical/high before audit handoff.",
      "Regression examples in repo prove engine coverage.",
    ],
    avoid: [
      "Claiming 'clean scan' replaces audit — it does not.",
      "Hiding medium findings auditors will find anyway.",
    ],
    relatedGuides: [
      { slug: "pre-audit-prep", title: "Pre-Audit Prep Workflow" },
      { slug: "transfer-hook-checklist", title: "Transfer Hook Checklist" },
    ],
  },
  "ci-gate": {
    problem:
      "Token-2022 regressions land in PRs the same way SPL bugs do — a quick SPL-style transfer in a hook path or a hardcoded account size. Without CI, nobody runs the linter until mainnet.",
    audience: "Teams with GitHub Actions and a programs/ directory in the repo.",
    when: [
      "You merge Anchor code via pull requests.",
      "Multiple devs touch token integration code.",
      "You want SARIF in the GitHub Security tab.",
    ],
    workflow: [
      {
        step: "Copy the workflow",
        detail:
          "Use `.github/workflows/token2022-guard.yml` from the repo — runs tests, scan, SARIF upload.",
      },
      {
        step: "Point at your programs path",
        detail:
          "Change `./examples` to `./programs` or your Anchor workspace path.",
      },
      {
        step: "Set fail threshold",
        detail:
          "`--fail-on=high` blocks critical/high. Tune with `--except` until M2 config ships.",
      },
      {
        step: "Optional: npx in CI without clone",
        detail:
          "After `npm publish`, use `npx token2022-guard@latest ./programs --fail-on=high` — see npm-ci guide.",
      },
    ],
    whatWeCatch: [
      "Same 26 checks on every PR.",
      "Unit tests in CI prove check catalog integrity.",
      "SARIF upload for GitHub code scanning alerts.",
    ],
    avoid: [
      "Scanning only on release branches — hook regressions happen in feature PRs.",
      "Ignoring SARIF upload permissions — workflow needs security-events: write.",
    ],
    relatedGuides: [
      { slug: "ci-setup", title: "CI + SARIF Setup" },
      { slug: "npm-ci", title: "npx token2022-guard in CI" },
    ],
  },
  "hackathon": {
    problem:
      "Hackathon timelines skip audits. A five-minute scan before demo day catches the critical hook and SPL-wiring mistakes that blow up live demos on Token-2022 mints.",
    audience: "Hackathon teams and solo builders shipping a vertical slice in days.",
    when: [
      "Demo uses a Token-2022 mint with hooks or fees.",
      "No time for formal audit — need fast feedback.",
      "You want findings in the browser without CI setup.",
    ],
    workflow: [
      {
        step: "Paste in web UI",
        detail:
          "Open token2022-guard.vercel.app, load vulnerable sample, then paste your program.",
      },
      {
        step: "Fix critical/high first",
        detail:
          "T22-001 and T22-004 block most broken demos — fix those before polish.",
      },
      {
        step: "Local scan if offline",
        detail:
          "`npm run scan -- ./programs` or `npx token2022-guard` after publish.",
      },
      {
        step: "Ship the demo",
        detail:
          "Document known medium findings — judges care that you thought about security.",
      },
    ],
    whatWeCatch: [
      "Hook guards, SPL wiring, account sizing — the demo-breaking trifecta.",
      "Fast feedback in browser — no workflow YAML required.",
    ],
    avoid: [
      "Skipping scan because 'it's just a hackathon' — hooked mints fail live.",
      "Using mainnet mints in demo without checking your program supports Token-2022.",
    ],
    relatedGuides: [
      { slug: "cli-quickstart", title: "CLI Quickstart" },
      { slug: "token2022-not-spl", title: "Token-2022 Is Not SPL Token" },
    ],
  },
};
