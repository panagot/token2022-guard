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
      "A different program id, variable account sizes, in-flight fees, and hook-invoking transfers. Where copying SPL patterns ships criticals, with a migration checklist to token_interface and transfer_checked.",
    readMinutes: 12,
  },
  {
    slug: "transfer-hook-checklist",
    category: "hooks",
    title: "Transfer Hook Security Checklist",
    summary:
      "Six guards before mainnet: assert the transferring state (T22-001), seed-validate ExtraAccountMetaList, stay acyclic, wire the Anchor fallback, validate extra-account owners, and verify hook upgrade authority.",
    readMinutes: 15,
  },
  {
    slug: "transfer-fees",
    category: "integration",
    title: "Transfer Fee Math That Auditors Flag",
    summary:
      "Use transfer_checked_with_fee, keep one fee direction so calculate_epoch_fee and the inverse helper do not drift balances, and resolve the fee for the current epoch (T22-021) instead of a static rate.",
    readMinutes: 10,
  },
  {
    slug: "vault-extensions",
    category: "integration",
    title: "CPI Guard & ImmutableOwner for Vaults",
    summary:
      "Harden program-owned accounts with CpiGuard (T22-010) and ImmutableOwner (T22-011), then screen incoming mints for permanent delegate, close authority, NonTransferable, Pausable, and frozen state.",
    readMinutes: 10,
  },
  {
    slug: "extension-pointers",
    category: "integration",
    title: "Pointer & Pausable Extensions",
    summary:
      "Validate GroupPointer and MetadataPointer links, apply the ScaledUiAmount multiplier before pricing, check pause state before transfers, and reload the mint after a CPI before reading mint_authority (T22-025).",
    readMinutes: 12,
  },
  {
    slug: "pre-audit-prep",
    category: "workflow",
    title: "Pre-Audit Prep Workflow",
    summary:
      "Run a full scan one to two weeks before kickoff, export Markdown or SARIF, triage findings by extension area, and hand auditors a documented baseline of cleared and deferred items.",
    readMinutes: 8,
  },
  {
    slug: "ci-setup",
    category: "workflow",
    title: "Gate PRs with Token2022 Guard + SARIF",
    summary:
      "Set up the GitHub Action, grant security-events write for SARIF upload, fail builds on high and critical with --fail-on, and scope noisy runs with --only and --except.",
    readMinutes: 8,
  },
  {
    slug: "npm-ci",
    category: "workflow",
    title: "npx token2022-guard in CI",
    summary:
      "Run the published package in GitHub Actions without cloning the repo. Minimal runtime footprint, a smoke-tested install path, and version pinning for protected branches.",
    readMinutes: 6,
  },
  {
    slug: "cli-quickstart",
    category: "workflow",
    title: "CLI Quickstart",
    summary:
      "Run the same 26-check engine locally or in CI: table, JSON, SARIF, and Markdown output, severity-based exit codes with --fail-on, and check filters with --only and --except.",
    readMinutes: 7,
  },
];
