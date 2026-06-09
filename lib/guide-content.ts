const SITE_GITHUB = "https://github.com/panagot/token2022-guard";

export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
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
      "Token-2022 is a different program with different rules. Copying SPL patterns is where most criticals live.",
    relatedChecks: ["T22-004", "T22-005", "T22-009"],
    ctaHref: "/?sample=vulnerable",
    ctaLabel: "Try vulnerable sample",
    sections: [
      {
        paragraphs: [
          "Teams treat Token-2022 as a drop-in upgrade. It is not. Extensions such as transfer hooks, transfer fees, permanent delegates, and confidential transfers rewrite assumptions the original SPL Token model never had.",
        ],
      },
      {
        heading: "What changes in practice",
        bullets: [
          "Account sizes vary by extension — fixed Mint::LEN fails at init.",
          "transfer() omits decimals and reverts on fee or hooked mints.",
          "A transfer hook runs during every transfer — your program must handle it.",
          "Permanent delegates can move tokens from any account on a mint.",
        ],
      },
      {
        heading: "What to do instead",
        bullets: [
          "Use anchor_spl::token_interface for mints and token accounts.",
          "Use transfer_checked or transfer_checked_with_fee.",
          "Compute account size with ExtensionType::try_calculate_account_len.",
          "Read mint extensions before accepting external tokens.",
        ],
      },
    ],
  },
  "transfer-hook-checklist": {
    title: "Transfer Hook Security Checklist",
    summary: "Audit-derived guards every hook program should implement before mainnet.",
    relatedChecks: ["T22-001", "T22-002", "T22-003", "T22-012"],
    ctaHref: "/?sample=secure",
    ctaLabel: "Compare secure sample",
    sections: [
      {
        heading: "1. Assert transferring state",
        paragraphs: [
          "At the top of the hook, read the TransferHookAccount extension and reject if the source account is not mid-transfer. Without this, anyone can invoke your hook directly.",
        ],
      },
      {
        heading: "2. Validate extra accounts",
        paragraphs: [
          "Build ExtraAccountMetaList from Seed:: derivations. Re-derive PDAs inside the hook — never trust accounts passed without seed verification.",
        ],
      },
      {
        heading: "3. Stay acyclic",
        paragraphs: [
          "Do not perform a same-mint token transfer inside the hook. Token-2022 will re-enter the hook and can recurse until the transaction fails.",
        ],
      },
      {
        heading: "4. Wire the Anchor fallback",
        paragraphs: [
          "Token-2022 calls the hook via the interface Execute discriminator. Add a fallback that routes to your transfer_hook handler.",
        ],
      },
    ],
  },
  "transfer-fees": {
    title: "Transfer Fee Math That Auditors Flag",
    summary: "Fee mints need explicit fee context — mixing helper functions drifts balances.",
    relatedChecks: ["T22-005", "T22-006"],
    ctaHref: "/?sample=vulnerable",
    ctaLabel: "Try vulnerable sample",
    sections: [
      {
        paragraphs: [
          "Transfer-fee extensions take fees in-flight. Using transfer() without fee context will revert. Using calculate_fee and calculate_inverse_fee interchangeably causes off-by-one drift across many transfers.",
        ],
      },
      {
        heading: "Safe pattern",
        bullets: [
          "Use transfer_checked_with_fee with an explicit expected fee.",
          "Pick one fee direction and stick to it in accounting logic.",
          "Never assume calculate_fee(amount) inverts calculate_inverse_fee(post_amount).",
        ],
      },
    ],
  },
  "vault-extensions": {
    title: "CPI Guard & ImmutableOwner for Vaults",
    summary: "Program-controlled token accounts need extension hardening before they custody funds.",
    relatedChecks: ["T22-010", "T22-011", "T22-007"],
    ctaHref: "/use-cases",
    ctaLabel: "Vault use cases",
    sections: [
      {
        paragraphs: [
          "When your program custodies Token-2022 tokens in a vault or escrow, enable CPI Guard so malicious CPIs cannot transfer or approve tokens out. Set ImmutableOwner so the account owner cannot be reassigned.",
        ],
      },
      {
        heading: "Also check incoming mints",
        paragraphs: [
          "Before accepting deposits, read the mint for a PermanentDelegate extension. A permanent delegate can drain deposited tokens from any account on that mint.",
        ],
      },
    ],
  },
  "ci-setup": {
    title: "Gate PRs with Token2022 Guard + SARIF",
    summary: "Fail builds on high/critical findings and upload SARIF to GitHub Security.",
    relatedChecks: ["T22-001", "T22-002", "T22-010"],
    ctaHref: SITE_GITHUB,
    ctaLabel: "Copy workflow from GitHub",
    sections: [
      {
        paragraphs: [
          "The repo ships .github/workflows/token2022-guard.yml. Copy it into your project and point the scan path at your programs/ directory.",
        ],
      },
      {
        heading: "Local commands",
        bullets: [
          "npm run scan -- ./programs --fail-on=high",
          "npm run scan -- ./programs --sarif > token2022-guard.sarif",
          "npm run scan -- ./programs --md > report.md",
        ],
      },
    ],
  },
  "cli-quickstart": {
    title: "CLI Quickstart",
    summary: "Run the same engine from your terminal or CI pipeline.",
    relatedChecks: [],
    ctaHref: "/",
    ctaLabel: "Open web analyzer",
    sections: [
      {
        paragraphs: ["Clone the repo, npm install, then:"],
        bullets: [
          "npm run scan -- ./examples — terminal report",
          "npm run scan -- ./programs --json — machine-readable output",
          "npm run scan -- ./programs --only=T22-001,T22-002 — focused run",
          "npm run scan -- ./programs --except=T22-007 — skip noisy checks",
        ],
      },
    ],
  },
};
