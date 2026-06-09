import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { CHECKS } from "@/lib/checks";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Overview",
  description: "2-minute overview of Token2022 Guard for grant reviewers.",
};

const PROOF = [
  {
    label: "Live analyzer",
    href: "/?sample=vulnerable",
    detail: "Vulnerable hook → 16 findings. Toggle secure → 0 across all 26 checks.",
  },
  {
    label: "CLI + SARIF",
    href: SITE.github,
    detail: "npm run scan -- ./examples --sarif. GitHub Action uploads to Security tab.",
  },
  {
    label: "Check catalog",
    href: "/checks",
    detail: `${CHECKS.length} Token-2022-specific checks with spec references.`,
  },
  {
    label: "Benchmark",
    href: `${SITE.github}/blob/main/BENCHMARK.md`,
    detail: "External pattern corpus + bundled examples. Honest FP notes.",
  },
];

const MILESTONES = [
  {
    phase: "M1 · $1,500 · weeks 1–2",
    items: [
      "26 checks with unit tests (fire + pass per check)",
      "npm publish → npx token2022-guard",
      "BENCHMARK.md on real + pattern corpora",
      "fee_mint_program.rs example",
    ],
  },
  {
    phase: "M2 · $1,500 · weeks 3–4",
    items: [
      "VS Code .vsix release",
      ".t22guard.json config + inline suppressions",
      "Secure transfer-hook starter template",
      "Config + suppressions · reviewer-ready v1 polish",
    ],
  },
];

export default function ReviewerPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Overview · ~2 min"
        title="Token2022 Guard"
        subtitle="Pre-mainnet safety checks for Solana Token-2022 integrations. Complements Anchor Security Prep — does not duplicate it."
        actions={
          <>
            <Link href="/?sample=vulnerable" className="btn btn-primary text-[10px]">
              Try vulnerable sample
            </Link>
            <a href={SITE.github} className="btn btn-ghost text-[10px]" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel">
          <div className="panel-inner space-y-3">
            <p className="label text-[var(--accent)]">Problem</p>
            <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
              Token-2022 extensions (transfer hooks, fees, permanent delegates) introduce bugs
              auditors find repeatedly. Teams copy SPL Token patterns and ship criticals.
            </p>
          </div>
        </div>
        <div className="panel">
          <div className="panel-inner space-y-3">
            <p className="label text-[var(--accent)]">Solution</p>
            <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
              One MIT engine → web UI, CLI, VS Code, GitHub Action. Flags footguns from source
              before mainnet. Static heuristics — complement to professional audits.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="label">Proof chain</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROOF.map((p) => (
            <Link key={p.label} href={p.href} className="panel block hover:border-[var(--accent)]/40">
              <div className="panel-inner">
                <h3 className="text-sm font-semibold">{p.label}</h3>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">{p.detail}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="label">Shipped today ({SITE.version})</h2>
        <ul className="grid gap-2 text-sm text-[var(--ink-muted)] sm:grid-cols-2">
          <li>· {CHECKS.length} checks (T22-001 → T22-026)</li>
          <li>· Web analyzer + use cases + guides</li>
          <li>· CLI: JSON / SARIF / Markdown</li>
          <li>· GitHub Action + VS Code prototype</li>
          <li>· Unit tests per check</li>
          <li>· BENCHMARK.md corpus</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="label">Grant milestones ($3,000)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {MILESTONES.map((m) => (
            <div key={m.phase} className="panel">
              <div className="panel-inner space-y-3">
                <h3 className="text-sm font-semibold text-[var(--accent)]">{m.phase}</h3>
                <ul className="space-y-1 text-xs text-[var(--ink-muted)]">
                  {m.items.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-inner space-y-2">
          <p className="label">Not a duplicate of Anchor Security Prep</p>
          <p className="text-sm text-[var(--ink-muted)]">
            ASP = general Anchor static analysis (26 rules, global SF grant). Token2022 Guard =
            Token-2022 extension integration safety only. Separate repo, separate scope.
          </p>
          <a
            href="https://github.com/panagot/Anchor-Security-Prep"
            className="nav-link text-[10px]"
            target="_blank"
            rel="noreferrer"
          >
            Anchor Security Prep →
          </a>
        </div>
      </section>
    </div>
  );
}
