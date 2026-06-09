export type UseCaseCategory = "hooks" | "integration" | "workflow" | "prevention";

export interface UseCase {
  id: string;
  category: UseCaseCategory;
  title: string;
  summary: string;
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
    summary:
      "Before mainnet, verify transferring-state guards, hook acyclicity, ExtraAccountMetaList seed validation, and the Anchor fallback dispatcher.",
    checks: ["T22-001", "T22-002", "T22-003", "T22-012"],
    tryHref: "/?sample=vulnerable",
    tryLabel: "Try vulnerable hook sample",
  },
  {
    id: "hook-review",
    category: "hooks",
    title: "Reviewing a third-party hook",
    summary:
      "Integrating someone else's hook program? Scan for direct-invocation risk and same-mint CPI before you trust it with user funds.",
    checks: ["T22-001", "T22-002"],
    tryHref: "/?sample=secure",
    tryLabel: "Compare secure sample",
  },
  {
    id: "spl-migration",
    category: "integration",
    title: "Migrating from SPL Token to Token-2022",
    summary:
      "Catch programs still wired to anchor_spl::token or hardcoded spl_token::ID — they will reject or mishandle Token-2022 mints.",
    checks: ["T22-004", "T22-005", "T22-009"],
    tryHref: "/?sample=vulnerable",
    tryLabel: "Try vulnerable sample",
  },
  {
    id: "vault-deposit",
    category: "integration",
    title: "Accepting Token-2022 deposits",
    summary:
      "Vaults and escrow programs should check permanent delegates, enable CPI Guard and ImmutableOwner on custodied accounts, and use transfer_checked.",
    checks: ["T22-005", "T22-007", "T22-010", "T22-011"],
    tryHref: "/?sample=vulnerable",
    tryLabel: "Try vulnerable sample",
  },
  {
    id: "fee-mint",
    category: "integration",
    title: "Transfer-fee mints",
    summary:
      "Fee mints need transfer_checked_with_fee and consistent fee math — mixing calculate_fee and calculate_inverse_fee drifts balances.",
    checks: ["T22-005", "T22-006"],
    tryHref: "/guides/transfer-fees",
    tryLabel: "Read fee guide",
  },
  {
    id: "pre-audit",
    category: "workflow",
    title: "Pre-audit hygiene",
    summary:
      "Run a scan before you engage an auditor. Hand them a checklist of extension footguns already flagged — saves review time on known patterns.",
    checks: ["T22-001", "T22-004", "T22-007"],
    tryHref: "/",
    tryLabel: "Run checks",
  },
  {
    id: "ci-gate",
    category: "prevention",
    title: "CI gate on pull requests",
    summary:
      "Fail builds on high/critical Token-2022 findings and upload SARIF to GitHub Security. Ship the GitHub Action from the repo.",
    checks: ["T22-001", "T22-002", "T22-010"],
    tryHref: "/guides/ci-setup",
    tryLabel: "CI setup guide",
  },
  {
    id: "hackathon",
    category: "prevention",
    title: "Hackathon / indie sprint",
    summary:
      "Paste your Anchor program in the web UI or run npm run scan locally — get findings in seconds without setting up a full audit pipeline.",
    checks: ["T22-004", "T22-009", "T22-012"],
    tryHref: "/",
    tryLabel: "Run checks",
  },
];

export const FEATURED_USE_CASES = USE_CASES.filter((u) =>
  ["transfer-hook", "spl-migration", "ci-gate"].includes(u.id),
);
