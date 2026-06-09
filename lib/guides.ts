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
      "Why copying SPL patterns ships criticals — extensions rewrite sizing, transfers, custody, and hook invocation. Migration checklist with scan commands.",
    readMinutes: 12,
  },
  {
    slug: "transfer-hook-checklist",
    category: "hooks",
    title: "Transfer Hook Security Checklist",
    summary:
      "Step-by-step: transferring state, ExtraAccountMetaList seeds, acyclicity, Anchor fallback, extra-account validation, and upgrade authority.",
    readMinutes: 15,
  },
  {
    slug: "transfer-fees",
    category: "integration",
    title: "Transfer Fee Math That Auditors Flag",
    summary:
      "Why calculate_fee ≠ inverse, when to use transfer_checked_with_fee, and how epoch transitions (T22-021) break static fee assumptions.",
    readMinutes: 10,
  },
  {
    slug: "vault-extensions",
    category: "integration",
    title: "CPI Guard & ImmutableOwner for Vaults",
    summary:
      "Harden program-owned token accounts, inspect incoming mints for permanent delegate and close authority, and gate deposits safely.",
    readMinutes: 10,
  },
  {
    slug: "extension-pointers",
    category: "integration",
    title: "Pointer & Pausable Extensions",
    summary:
      "GroupPointer, MetadataPointer, ScaledUiAmount, Pausable, and post-CPI mint authority — validation patterns and the extensions sample.",
    readMinutes: 12,
  },
  {
    slug: "pre-audit-prep",
    category: "workflow",
    title: "Pre-Audit Prep Workflow",
    summary:
      "Full scan, SARIF/Markdown export, triage by extension area, and what to hand auditors before kickoff.",
    readMinutes: 8,
  },
  {
    slug: "ci-setup",
    category: "workflow",
    title: "Gate PRs with Token2022 Guard + SARIF",
    summary:
      "GitHub Action setup, permissions, fail-on thresholds, and tuning with --only / --except until config files ship.",
    readMinutes: 8,
  },
  {
    slug: "npm-ci",
    category: "workflow",
    title: "npx token2022-guard in CI",
    summary:
      "Run the published npm package in GitHub Actions without cloning the linter repo — smoke-tested install path.",
    readMinutes: 6,
  },
  {
    slug: "cli-quickstart",
    category: "workflow",
    title: "CLI Quickstart",
    summary:
      "Local scan, npx after publish, JSON/SARIF/Markdown output, filters, and npm run smoke verification.",
    readMinutes: 7,
  },
];
