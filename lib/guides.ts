export type GuideCategory = "start" | "hooks" | "integration" | "workflow";

export interface Guide {
  slug: string;
  category: GuideCategory;
  title: string;
  summary: string;
  readMinutes: number;
}

export const GUIDE_CATEGORIES: Record<GuideCategory, string> = {
  start: "Start here",
  hooks: "Transfer hooks",
  integration: "Integration & fees",
  workflow: "CLI & CI",
};

export const GUIDES: Guide[] = [
  {
    slug: "token2022-not-spl",
    category: "start",
    title: "Token-2022 Is Not SPL Token",
    summary:
      "Why copying SPL patterns into Token-2022 code ships criticals — extensions rewrite assumptions the old model never had.",
    readMinutes: 6,
  },
  {
    slug: "transfer-hook-checklist",
    category: "hooks",
    title: "Transfer Hook Security Checklist",
    summary:
      "Assert transferring state, validate ExtraAccountMetaList seeds, avoid same-mint CPI, and wire the Anchor fallback dispatcher.",
    readMinutes: 8,
  },
  {
    slug: "transfer-fees",
    category: "integration",
    title: "Transfer Fee Math That Auditors Flag",
    summary:
      "Why calculate_fee and calculate_inverse_fee are not inverses, and when to use transfer_checked_with_fee.",
    readMinutes: 5,
  },
  {
    slug: "vault-extensions",
    category: "integration",
    title: "CPI Guard & ImmutableOwner for Vaults",
    summary:
      "Program-controlled token accounts should enable CPI Guard and ImmutableOwner before they custody user funds.",
    readMinutes: 5,
  },
  {
    slug: "ci-setup",
    category: "workflow",
    title: "Gate PRs with Token2022 Guard + SARIF",
    summary:
      "Copy the GitHub Action, run --fail-on=high, and surface findings in the Security tab.",
    readMinutes: 4,
  },
  {
    slug: "cli-quickstart",
    category: "workflow",
    title: "CLI Quickstart",
    summary:
      "npm run scan, JSON/SARIF/Markdown output, --only and --except filters for focused runs.",
    readMinutes: 3,
  },
];
