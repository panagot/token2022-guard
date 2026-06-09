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
    tagline: "Ship a hook with no direct-invocation critical",
    summary:
      "Before mainnet, assert the transferring state, keep the hook acyclic, seed-validate the ExtraAccountMetaList, wire the Anchor fallback, and verify extra-account owners. Walk the vulnerable and secure samples, then scan your crate and clear high and critical.",
    checks: ["T22-001", "T22-002", "T22-003", "T22-012", "T22-017", "T22-024"],
    tryHref: "/?sample=vulnerable",
    tryLabel: "Try vulnerable hook sample",
  },
  {
    id: "hook-review",
    category: "hooks",
    title: "Reviewing a third-party hook",
    tagline: "Due diligence before listing a hooked mint",
    summary:
      "Integrating a hook you did not write means inheriting its risk. Check for direct invocation, same-mint CPI, spoofable whitelist accounts, and an upgradeable program before you route user funds through it.",
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
      "Find code still wired to anchor_spl::token, a hardcoded SPL Token id, a fixed 165-byte space, and a bare transfer. Follow a phased checklist to the interface types, transfer_checked, and computed account sizes, scanning after each step.",
    checks: ["T22-004", "T22-005", "T22-009", "T22-022", "T22-026"],
    tryHref: "/guides/token2022-not-spl",
    tryLabel: "Read migration guide",
  },
  {
    id: "vault-deposit",
    category: "integration",
    title: "Accepting Token-2022 deposits",
    tagline: "Vault hardening plus a mint extension policy",
    summary:
      "Screen incoming mints for permanent delegate and close authority, enable CpiGuard and ImmutableOwner on the accounts you own, move tokens with transfer_checked, and read account state before every transfer.",
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
      "Fee mints need transfer_checked_with_fee, a single fee direction, and an epoch-aware fee read with calculate_epoch_fee. Scan the fee mint sample to see the patterns auditors flag for balance drift.",
    checks: ["T22-005", "T22-006", "T22-021"],
    tryHref: "/guides/transfer-fees",
    tryLabel: "Read fee guide",
  },
  {
    id: "extension-metadata",
    category: "integration",
    title: "Pointer and pausable extensions",
    tagline: "Metadata, group and member, scaled UI, pause",
    summary:
      "GroupPointer, MetadataPointer, ScaledUiAmount, and Pausable move data and policy off the mint. Validate pointer links, apply the scaled multiplier before pricing, and reload the mint after a CPI. The extensions sample exercises each check.",
    checks: ["T22-018", "T22-019", "T22-020", "T22-021", "T22-023", "T22-025"],
    tryHref: "/?sample=extensions",
    tryLabel: "Try extensions sample",
  },
  {
    id: "pre-audit",
    category: "workflow",
    title: "Pre-audit hygiene",
    tagline: "A documented scan in the kickoff package",
    summary:
      "Run a full scan one to two weeks before kickoff. Export Markdown or SARIF, triage by extension area, attach the benchmark results, and document the medium findings you defer so reviewers spend their hours on business logic.",
    checks: ["T22-001", "T22-004", "T22-007", "T22-016"],
    tryHref: "/guides/pre-audit-prep",
    tryLabel: "Pre-audit workflow",
  },
  {
    id: "ci-gate",
    category: "prevention",
    title: "CI gate on pull requests",
    tagline: "Block high and critical, upload SARIF",
    summary:
      "Copy the GitHub Action to run the tests and a scan on every pull request and upload SARIF to the Security tab. Use --fail-on=high to block, and switch to npx token2022-guard after publish so no clone is needed.",
    checks: ["T22-001", "T22-002", "T22-010"],
    tryHref: "/guides/ci-setup",
    tryLabel: "CI setup guide",
  },
  {
    id: "hackathon",
    category: "prevention",
    title: "Hackathon and indie sprint",
    tagline: "A five-minute scan before demo day",
    summary:
      "Paste your Anchor program into the web UI or run a local scan and get findings in seconds. Clear the hook and SPL wiring issues that break a live Token-2022 demo before you go on stage.",
    checks: ["T22-001", "T22-004", "T22-009", "T22-012"],
    tryHref: "/",
    tryLabel: "Run checks",
  },
];

export const USE_CASE_BY_ID = Object.fromEntries(USE_CASES.map((u) => [u.id, u]));

export const FEATURED_USE_CASES = USE_CASES.filter((u) =>
  ["transfer-hook", "vault-deposit", "extension-metadata", "ci-gate"].includes(u.id),
);
