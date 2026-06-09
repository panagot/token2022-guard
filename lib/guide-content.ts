const SITE_GITHUB = "https://github.com/panagot/token2022-guard";

export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  numbered?: string[];
  code?: string;
  callout?: { type: "tip" | "warn"; text: string };
}

export interface GuideContent {
  title: string;
  summary: string;
  sections: GuideSection[];
  relatedChecks: string[];
  ctaHref: string;
  ctaLabel: string;
}

export const GUIDE_CONTENT: Record<string, GuideContent> = {
  "token2022-not-spl": {
    title: "Token-2022 Is Not SPL Token",
    summary:
      "Token-2022 is a different program with different rules. Copying SPL patterns is where most criticals live — this guide maps what breaks and how to scan for it.",
    relatedChecks: ["T22-004", "T22-005", "T22-009", "T22-022", "T22-026"],
    ctaHref: "/?sample=vulnerable",
    ctaLabel: "Try vulnerable sample",
    sections: [
      {
        paragraphs: [
          "Teams treat Token-2022 as a drop-in upgrade. It is not. The Token-2022 program id differs from SPL Token. Accounts grow with extensions. Transfers can invoke hooks. Fees apply in-flight. Permanent delegates can move tokens from any account on a mint.",
          "Most production incidents we model in Token2022 Guard come from copying SPL Token tutorials into Token-2022 integrations.",
        ],
      },
      {
        heading: "What breaks when you copy SPL patterns",
        bullets: [
          "Fixed Mint::LEN or space = 165 — init fails when extensions are present (T22-009).",
          "anchor_spl::token and spl_token::ID — Token-2022 mints rejected or mishandled (T22-004).",
          "token::transfer without decimals — reverts on fee or hooked mints (T22-005).",
          "Ignoring NonTransferable — transfers revert at runtime (T22-022).",
          "Ignoring frozen AccountState — user flows fail mid-transaction (T22-026).",
        ],
      },
      {
        heading: "Migration checklist",
        numbered: [
          "Replace `anchor_spl::token` with `anchor_spl::token_interface` and `InterfaceAccount` / `Interface<'_, TokenInterface>`.",
          "Replace `transfer` with `transfer_checked` (or `transfer_checked_with_fee` for fee mints).",
          "Compute account size: `ExtensionType::try_calculate_account_len::<Mint>(&[...])`.",
          "Read mint extensions before accepting external deposits (delegate, close authority, pausable).",
          "Run `npm run scan -- ./programs --fail-on=high` after each migration phase.",
        ],
      },
      {
        heading: "Scan commands",
        code: `# Full program tree
npm run scan -- ./programs --fail-on=high

# Migration-focused checks only
npm run scan -- ./programs --only=T22-004,T22-005,T22-009

# After npm publish
npx token2022-guard ./programs --fail-on=high`,
      },
      {
        callout: {
          type: "warn",
          text: "Passing a scan does not mean your program is safe on mainnet. It means you cleared known Token-2022 integration footguns — still get a professional audit.",
        },
      },
      {
        heading: "Related use cases",
        bullets: [
          "Migrating from SPL — /use-cases/spl-migration",
          "Vault deposits — /use-cases/vault-deposit",
          "Hackathon sprint — /use-cases/hackathon",
        ],
      },
    ],
  },
  "transfer-hook-checklist": {
    title: "Transfer Hook Security Checklist",
    summary:
      "Audit-derived guards every hook program should implement before mainnet — with checks mapped to each step.",
    relatedChecks: ["T22-001", "T22-002", "T22-003", "T22-012", "T22-017", "T22-024"],
    ctaHref: "/?sample=secure",
    ctaLabel: "Compare secure sample",
    sections: [
      {
        paragraphs: [
          "A transfer hook runs during every transfer of a hooked mint. Token-2022 invokes it via the Execute instruction discriminator — not necessarily via your Anchor instruction handler unless you wire a fallback.",
        ],
      },
      {
        heading: "1. Assert transferring state (T22-001 — critical)",
        paragraphs: [
          "At the top of the hook, read the TransferHookAccount extension on the source token account. Reject if `transferring` is not set. Without this, anyone can call your hook directly and run policy logic outside a real transfer.",
        ],
        code: `// Read extension; reject if not mid-transfer
assert_is_transferring(&source_account_info)?;`,
        callout: {
          type: "warn",
          text: "This is the #1 critical in Token-2022 hook audits. The vulnerable sample fails here; the secure sample passes.",
        },
      },
      {
        heading: "2. Validate extra accounts with seeds (T22-003)",
        paragraphs: [
          "Build ExtraAccountMetaList from `Seed::` derivations when initializing the hook. Inside the hook, re-derive every PDA — never trust accounts because they appear in the account list. Attackers can pass a fake whitelist account with the same layout.",
        ],
        bullets: [
          "Use `Seed::AccountKey`, `Seed::Literal`, or program-specific seeds.",
          "Verify owner and seeds with `require_keys_eq!` or equivalent.",
        ],
      },
      {
        heading: "3. Stay acyclic — no same-mint CPI (T22-002)",
        paragraphs: [
          "Do not call `token::transfer` or `transfer_checked` on the same mint from inside the hook. Token-2022 re-enters the hook and can recurse until the transaction fails or griefs users.",
        ],
        callout: {
          type: "tip",
          text: "If you must CPI tokens, use a different mint or move logic outside the hook path entirely.",
        },
      },
      {
        heading: "4. Wire the Anchor fallback (T22-012)",
        paragraphs: [
          "Token-2022 does not call your `#[program]` instruction directly. Add a `fallback` that unpacks the Execute discriminator and dispatches to your `transfer_hook` handler. See `examples/secure_hook.rs` for the pattern.",
        ],
      },
      {
        heading: "5. Validate extra-account owners (T22-017)",
        paragraphs: [
          "If the hook reads whitelist, policy, or gate accounts, verify owner or re-derive PDAs. The secure sample uses `find_program_address` + `require_keys_eq!`.",
        ],
      },
      {
        heading: "6. Verify hook upgrade authority (T22-024)",
        paragraphs: [
          "Before pointing a mint at an external hook program, check whether upgrade authority is revoked or held by a trusted multisig. Upgradeable hooks can swap logic after integrators depend on them.",
        ],
      },
      {
        heading: "Scan your hook",
        code: `npm run scan -- ./programs/transfer-hook --fail-on=high
npm run scan -- ./programs/transfer-hook --only=T22-001,T22-002,T22-003,T22-012`,
      },
    ],
  },
  "transfer-fees": {
    title: "Transfer Fee Math That Auditors Flag",
    summary:
      "Fee mints need explicit fee context — mixing helper functions drifts balances and epoch changes break static assumptions.",
    relatedChecks: ["T22-005", "T22-006", "T22-021"],
    ctaHref: "/use-cases/fee-mint",
    ctaLabel: "Fee mint use case",
    sections: [
      {
        paragraphs: [
          "The TransferFee extension deducts fees during transfer. Legacy `transfer()` omits fee context and reverts. Even with `transfer_checked`, internal accounting often goes wrong when teams treat `calculate_fee` and `calculate_inverse_fee` as exact inverses — they are not (off-by-one rounding).",
        ],
      },
      {
        heading: "Deprecated transfer (T22-005)",
        paragraphs: [
          "Replace `token::transfer` with `transfer_checked` or `transfer_checked_with_fee`. Pass mint and decimals. Required for any mint with transfer fees or hooks.",
        ],
      },
      {
        heading: "Fee direction drift (T22-006)",
        bullets: [
          "Pick one direction: gross → net or net → gross.",
          "Settle with `transfer_checked_with_fee` and an explicit expected fee.",
          "Never mix `calculate_fee` and `calculate_inverse_fee` in the same accounting path.",
        ],
        callout: {
          type: "warn",
          text: "Treasury reconciliation drift after thousands of transfers is a common audit finding — often traced to inverse fee misuse.",
        },
      },
      {
        heading: "Epoch transitions (T22-021)",
        paragraphs: [
          "Transfer fee configuration can specify different rates for older vs newer epochs. Reading a static fee basis points value ignores epoch boundaries. Read the fee for the current clock epoch before pricing or moving tokens.",
        ],
        code: `// Pattern: read epoch-aware fee from mint extension
let epoch = clock.epoch;
// use newer_transfer_fee / older_transfer_fee for this epoch`,
      },
      {
        heading: "Example to scan",
        paragraphs: [
          "`examples/fee_mint_program.rs` intentionally mixes bad patterns — 11 findings including T22-004, T22-005, T22-006. Use it as a regression fixture.",
        ],
        code: `npm run scan -- ./examples/fee_mint_program.rs --json`,
      },
    ],
  },
  "vault-extensions": {
    title: "CPI Guard & ImmutableOwner for Vaults",
    summary:
      "Program-controlled token accounts and incoming mint policies — the vault security baseline for Token-2022.",
    relatedChecks: ["T22-007", "T22-010", "T22-011", "T22-016", "T22-026"],
    ctaHref: "/use-cases/vault-deposit",
    ctaLabel: "Vault deposit use case",
    sections: [
      {
        paragraphs: [
          "When your program custodies Token-2022 tokens — vaults, escrows, staking pools — you control token accounts that hold user funds. Two account-level extensions reduce CPI and ownership attacks. Mint-level extensions on deposits you accept need explicit policy.",
        ],
      },
      {
        heading: "CPI Guard (T22-010 — high)",
        paragraphs: [
          "Enable CpiGuard on program-owned token accounts. Without it, a malicious program invoked via CPI in the same transaction can transfer or approve tokens out of your vault.",
        ],
        bullets: [
          "Enable at account creation or via dedicated instruction.",
          "Applies to vault PDAs your program owns — not user ATAs.",
        ],
      },
      {
        heading: "ImmutableOwner (T22-011)",
        paragraphs: [
          "Set ImmutableOwner on custodied accounts so the owner field cannot be reassigned. Prevents account-hijacking where an attacker reassigns ownership of a vault ATA.",
        ],
        callout: {
          type: "tip",
          text: "ATAs created via the Associated Token Account program include ImmutableOwner by default. Raw token accounts your program creates may not.",
        },
      },
      {
        heading: "Incoming mint policy",
        bullets: [
          "Permanent delegate (T22-007) — third party can move tokens from any account on the mint.",
          "Mint close authority (T22-016) — closable mints break vault accounting.",
          "Non-transferable (T22-022) — ordinary transfers revert.",
          "Pausable (T22-023) — transfers halt when paused.",
          "Frozen account state (T22-026) — check before transfer.",
        ],
      },
      {
        heading: "Deposit flow scan",
        code: `npm run scan -- ./programs --only=T22-007,T22-010,T22-011,T22-016
npm run scan -- ./programs --fail-on=high`,
      },
    ],
  },
  "extension-pointers": {
    title: "Pointer & Pausable Extensions",
    summary:
      "Newer Token-2022 extensions move metadata and policy off the mint — validation mistakes enable spoofing and wrong pricing.",
    relatedChecks: ["T22-018", "T22-019", "T22-020", "T22-021", "T22-023", "T22-025"],
    ctaHref: "/?sample=extensions",
    ctaLabel: "Try extensions sample",
    sections: [
      {
        paragraphs: [
          "GroupPointer, MemberPointer, MetadataPointer, ScaledUiAmount, and Pausable extensions are increasingly common on launched mints. Integrators often read pointer accounts or raw amounts without validating authorities or pause state.",
        ],
      },
      {
        heading: "Group / member pointers (T22-018)",
        paragraphs: [
          "GroupPointer and MemberPointer must reference each other bidirectionally. Trusting a one-way pointer lets attackers supply spoofed group membership records — affecting allowlists, governance weight, or display logic.",
        ],
      },
      {
        heading: "Metadata pointer (T22-019)",
        paragraphs: [
          "MetadataPointer aims at an account holding token metadata. Require the metadata authority matches the mint (or a known program PDA) before reading name, symbol, or URI. Unvalidated pointers enable phishing-grade spoofing.",
        ],
      },
      {
        heading: "Scaled UI amount (T22-020)",
        paragraphs: [
          "ScaledUiAmount stores a multiplier separate from the raw token amount. Pricing, TVL, or collateral calculations on `.amount` alone misstate balances. Apply the multiplier or UI conversion helpers.",
        ],
      },
      {
        heading: "Pausable (T22-023)",
        paragraphs: [
          "Pausable mints can halt transfers at runtime. Check pause state before moving tokens — otherwise integrators see unexplained reverts after governance pauses a mint.",
        ],
      },
      {
        heading: "Mint authority after CPI (T22-025)",
        paragraphs: [
          "After any CPI that touches the token program, reload the mint account before reading `mint_authority`. Cached Anchor account data can be stale — a malicious CPI can change authority between calls.",
        ],
        callout: {
          type: "tip",
          text: "Token2022 Guard uses code-aware detection for T22-025 — comments mentioning reload do not suppress the check.",
        },
      },
      {
        heading: "Benchmark example",
        paragraphs: [
          "`examples/extensions_program.rs` triggers 13 findings across pointer, fee epoch, pause, and CPI authority checks. Listed in BENCHMARK.md and available as `?sample=extensions` in the web UI.",
        ],
        code: `npm run scan -- ./examples/extensions_program.rs --json
npm run benchmark   # includes extensions in corpus`,
      },
    ],
  },
  "pre-audit-prep": {
    title: "Pre-Audit Prep Workflow",
    summary:
      "Hand auditors a clean Token-2022 integration report — not a surprise extension footgun list on day one.",
    relatedChecks: ["T22-001", "T22-004", "T22-007", "T22-016"],
    ctaHref: "/use-cases/pre-audit",
    ctaLabel: "Pre-audit use case",
    sections: [
      {
        paragraphs: [
          "External audits are expensive. A structured Token2022 Guard pass one to two weeks before kickoff clears recurring extension bugs so reviewers spend time on business logic and economic attacks.",
        ],
      },
      {
        heading: "Week −2: baseline scan",
        numbered: [
          "Run `npm test` — proves all 26 checks have fixture coverage.",
          "Run `npm run scan -- ./programs --fail-on=high` — fix critical/high.",
          "Export `npm run scan -- ./programs --md > t22-report.md` for the audit package.",
          "Optional: `npm run scan -- ./programs --sarif > t22.sarif` for firms using SARIF tooling.",
        ],
      },
      {
        heading: "Week −1: triage and document",
        bullets: [
          "Group remaining medium/low by area: hooks, vault, fees, pointers.",
          "Assign owners; fix or document accepted risk with rationale.",
          "Attach BENCHMARK.md link — shows 0 FP on secure_hook and intentional bad examples.",
          "Link /milestones if grant reviewers need delivery context.",
        ],
      },
      {
        heading: "What to tell auditors",
        paragraphs: [
          "Token2022 Guard is static heuristics — complement, not replacement. Share the report as 'known integration checks cleared' plus your list of deferred findings. Auditors respect honesty over a claimed clean bill of health.",
        ],
        callout: {
          type: "warn",
          text: "Do not claim the tool replaces manual review of hook economics, oracle trust, or access control.",
        },
      },
    ],
  },
  "ci-setup": {
    title: "Gate PRs with Token2022 Guard + SARIF",
    summary:
      "Fail builds on high/critical Token-2022 findings and surface results in GitHub Security.",
    relatedChecks: ["T22-001", "T22-002", "T22-010"],
    ctaHref: `${SITE_GITHUB}/blob/main/.github/workflows/token2022-guard.yml`,
    ctaLabel: "View workflow on GitHub",
    sections: [
      {
        paragraphs: [
          "The repo ships `.github/workflows/token2022-guard.yml`. It runs on every push and PR: unit tests, example scan with `--fail-on=high`, SARIF generation, and upload to the Security tab.",
        ],
      },
      {
        heading: "Copy into your repo",
        numbered: [
          "Copy the workflow file to `.github/workflows/` in your project.",
          "Change the scan path from `./examples` to `./programs` (or your Anchor path).",
          "Ensure `permissions: security-events: write` for SARIF upload.",
          "Commit — first PR will run the scan.",
        ],
      },
      {
        heading: "Workflow steps explained",
        bullets: [
          "`npm ci` — install dependencies.",
          "`npm test` — 60 tests, per-check fixtures.",
          "`npm run scan -- ./programs --fail-on=high` — blocks PR on critical/high.",
          "SARIF upload — findings in GitHub Security → Code scanning alerts.",
        ],
      },
      {
        heading: "Tuning noisy checks",
        paragraphs: [
          "Until `.t22guard.json` ships in M2, use CLI filters:",
        ],
        code: `# Skip checks you accept for this repo
npm run scan -- ./programs --except=T22-007,T22-026 --fail-on=high

# Hook-only PRs
npm run scan -- ./programs/transfer-hook --only=T22-001,T22-002,T22-003`,
      },
      {
        callout: {
          type: "tip",
          text: "Run the same command locally before pushing — CI should confirm, not discover, findings.",
        },
      },
    ],
  },
  "npm-ci": {
    title: "npx token2022-guard in CI",
    summary:
      "Use the published npm package in CI without cloning the Token2022 Guard monorepo.",
    relatedChecks: [],
    ctaHref: "/milestones",
    ctaLabel: "M1 milestones",
    sections: [
      {
        paragraphs: [
          "After `npm publish`, consumers run `npx token2022-guard` with only `tsx` as a runtime dependency — no Next.js, no web UI. The package includes `npm run smoke` verification before publish.",
        ],
      },
      {
        heading: "GitHub Actions example",
        code: `- uses: actions/setup-node@v4
  with:
    node-version: 20

- name: Token2022 Guard
  run: npx token2022-guard@latest ./programs --fail-on=high`,
      },
      {
        heading: "Verify locally before publish",
        code: `npm run smoke
# pack → fresh temp dir → npx token2022-guard scan`,
      },
      {
        heading: "Publish (maintainers)",
        code: `npm login
npm publish`,
        callout: {
          type: "tip",
          text: "prepublishOnly runs tests + smoke automatically.",
        },
      },
    ],
  },
  "cli-quickstart": {
    title: "CLI Quickstart",
    summary:
      "Run the same 26-check engine from your terminal, CI, or via npx after publish.",
    relatedChecks: [],
    ctaHref: "/",
    ctaLabel: "Open web analyzer",
    sections: [
      {
        heading: "From clone",
        code: `git clone https://github.com/panagot/token2022-guard.git
cd token2022-guard
npm install
npm run scan -- ./examples`,
      },
      {
        heading: "Output formats",
        bullets: [
          "Default table — human-readable terminal report.",
          "`--json` — machine-readable for scripts.",
          "`--sarif` — GitHub code scanning.",
          "`--md` / `--markdown` — PR comments or audit attachments.",
        ],
        code: `npm run scan -- ./programs --sarif > token2022-guard.sarif
npm run scan -- ./programs --md > report.md`,
      },
      {
        heading: "CI exit codes",
        paragraphs: [
          "Use `--fail-on=high` to exit non-zero on high or critical findings. Severity order: critical > high > medium > low.",
        ],
        code: `npm run scan -- ./programs --fail-on=high
echo $?   # 1 if high/critical found`,
      },
      {
        heading: "Filters",
        code: `npm run scan -- ./programs --only=T22-001,T22-002
npm run scan -- ./programs --except=T22-007,T22-026`,
      },
      {
        heading: "After npm publish",
        code: `npx token2022-guard ./programs --fail-on=high
npx token2022-guard --version`,
      },
      {
        heading: "Quality gates (maintainers)",
        code: `npm test          # 60 unit tests
npm run smoke     # pack + fresh install
npm run benchmark # update BENCHMARK.md corpus`,
      },
    ],
  },
};
