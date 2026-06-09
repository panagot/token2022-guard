export type UseCaseCategory = "hooks" | "integration" | "workflow" | "prevention";

export interface UseCase {
  id: string;
  category: UseCaseCategory;
  title: string;
  summary: string;
  /** One-line hook for cards */
  tagline: string;
  checks: string[];
  tryHref: string;
  tryLabel: string;
}

export const USE_CASE_CATEGORIES: Record<UseCaseCategory, string> = {
  hooks: "Transfer hooks",
  integration: "Token acceptance & vaults",
  workflow: "Team workflow",
  prevention: "Prevention & CI",
};

export const USE_CASES: UseCase[] = [
  {
    id: "transfer-hook",
    category: "hooks",
    title: "Building a transfer hook",
    tagline: "Ship hooks without direct-invocation criticals",
    summary:
      "Before mainnet, verify transferring-state guards, hook acyclicity, ExtraAccountMetaList seed validation, Anchor fallback dispatcher, and extra-account owner checks. Walk through vulnerable → secure samples and scan your crate with --fail-on=high.",
    checks: ["T22-001", "T22-002", "T22-003", "T22-012", "T22-017", "T22-024"],
    tryHref: "/?sample=vulnerable",
    tryLabel: "Try vulnerable hook sample",
  },
  {
    id: "hook-review",
    category: "hooks",
    title: "Reviewing a third-party hook",
    tagline: "Due diligence before listing hooked mints",
    summary:
      "Integrating someone else's hook? Scan for direct-invocation risk, same-mint CPI, spoofed whitelist accounts, and upgradeable hook logic before you trust it with user funds.",
    checks: ["T22-001", "T22-002", "T22-017", "T22-024"],
    tryHref: "/?sample=secure",
    tryLabel: "Compare secure sample",
  },
  {
    id: "spl-migration",
    category: "integration",
    title: "Migrating from SPL Token to Token-2022",
    tagline: "token_interface, transfer_checked, dynamic sizing",
    summary:
      "Catch programs still wired to anchor_spl::token, hardcoded spl_token::ID, fixed space = 165, and legacy transfer(). Step-by-step migration checklist with scan gates at each phase.",
    checks: ["T22-004", "T22-005", "T22-009", "T22-022", "T22-026"],
    tryHref: "/guides/token2022-not-spl",
    tryLabel: "Read migration guide",
  },
  {
    id: "vault-deposit",
    category: "integration",
    title: "Accepting Token-2022 deposits",
    tagline: "Vault hardening + mint extension policy",
    summary:
      "Vaults and escrows should check permanent delegates and close authority, enable CPI Guard and ImmutableOwner on custodied accounts, use transfer_checked, and handle frozen account state.",
    checks: ["T22-005", "T22-007", "T22-010", "T22-011", "T22-016", "T22-026"],
    tryHref: "/guides/vault-extensions",
    tryLabel: "Read vault guide",
  },
  {
    id: "fee-mint",
    category: "integration",
    title: "Transfer-fee mints",
    tagline: "Fee math, epochs, and reconciliation",
    summary:
      "Fee mints need transfer_checked_with_fee, consistent fee direction, and epoch-aware fee reads. See fee_mint_program.rs example and the transfer-fees guide for auditor-flagged patterns.",
    checks: ["T22-005", "T22-006", "T22-021"],
    tryHref: "/guides/transfer-fees",
    tryLabel: "Read fee guide",
  },
  {
    id: "extension-metadata",
    category: "integration",
    title: "Pointer & pausable extensions",
    tagline: "Metadata, group/member, scaled UI, pause",
    summary:
      "GroupPointer, MetadataPointer, ScaledUiAmount, and Pausable extensions need validation before you trust metadata or move tokens. Use the extensions sample — 13 findings across T22-018–023 and T22-025.",
    checks: ["T22-018", "T22-019", "T22-020", "T22-021", "T22-023", "T22-025"],
    tryHref: "/?sample=extensions",
    tryLabel: "Try extensions sample",
  },
  {
    id: "pre-audit",
    category: "workflow",
    title: "Pre-audit hygiene",
    tagline: "Scan report in the audit kickoff package",
    summary:
      "Run a full scan before you engage an auditor. Export Markdown or SARIF, triage by extension area, attach BENCHMARK context, and document accepted medium risks — saves review time on known patterns.",
    checks: ["T22-001", "T22-004", "T22-007", "T22-016"],
    tryHref: "/guides/pre-audit-prep",
    tryLabel: "Pre-audit workflow",
  },
  {
    id: "ci-gate",
    category: "prevention",
    title: "CI gate on pull requests",
    tagline: "Fail PRs on high/critical + SARIF",
    summary:
      "Copy the GitHub Action, run npm test + scan on every PR, upload SARIF to Security. Optionally switch to npx token2022-guard after npm publish — no monorepo clone required.",
    checks: ["T22-001", "T22-002", "T22-010"],
    tryHref: "/guides/ci-setup",
    tryLabel: "CI setup guide",
  },
  {
    id: "hackathon",
    category: "prevention",
    title: "Hackathon / indie sprint",
    tagline: "Five-minute scan before demo day",
    summary:
      "Paste your Anchor program in the web UI or run a local scan — get findings in seconds. Fix critical/high hook and SPL wiring issues before you demo on a Token-2022 mint.",
    checks: ["T22-001", "T22-004", "T22-009", "T22-012"],
    tryHref: "/",
    tryLabel: "Run checks",
  },
];

export const USE_CASE_BY_ID = Object.fromEntries(USE_CASES.map((u) => [u.id, u]));

export const FEATURED_USE_CASES = USE_CASES.filter((u) =>
  ["transfer-hook", "vault-deposit", "extension-metadata", "ci-gate"].includes(u.id),
);
