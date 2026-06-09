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
    detail: "Vulnerable hook → 16 findings. Secure → 0. Fee + extensions samples available.",
  },
  {
    label: "CLI + SARIF",
    href: "/guides/cli-quickstart",
    detail: "npm run scan or npx token2022-guard — JSON, SARIF, Markdown. CI uploads to Security tab.",
  },
  {
    label: "npm package",
    href: SITE.npm,
    external: true,
    detail: "npx token2022-guard ./programs --fail-on=high — no clone required.",
  },
  {
    label: "Check catalog",
    href: "/checks",
    detail: `${CHECKS.length} Token-2022-specific checks with fix hints and guide links.`,
  },
  {
    label: "Benchmark",
    href: `${SITE.github}/blob/main/BENCHMARK.md`,
    external: true,
    detail: "6-file corpus · secure_hook = 0 findings · honest FP notes.",
  },
  {
    label: "CI workflow",
    href: SITE.actions,
    external: true,
    detail: "60 tests + scan + SARIF on every push/PR.",
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
              One MIT engine → web UI, CLI, VS Code prototype, GitHub Action. Flags footguns from
              source before mainnet. Static heuristics — complement to professional audits.
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-inner space-y-3">
          <p className="label text-[var(--accent)]">Clone → test → scan (60 seconds)</p>
          <pre className="code-block overflow-x-auto px-4 py-3 text-xs leading-relaxed">{`git clone https://github.com/panagot/token2022-guard.git
cd token2022-guard
npm install
npm test
npm run scan -- ./examples --fail-on=high
npx token2022-guard ./examples/vulnerable_hook.rs --json`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="label">Proof chain</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROOF.map((p) =>
            p.external ? (
              <a
                key={p.label}
                href={p.href}
                className="panel block hover:border-[var(--accent)]/40"
                target="_blank"
                rel="noreferrer"
              >
                <div className="panel-inner">
                  <h3 className="text-sm font-semibold">{p.label}</h3>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">{p.detail}</p>
                </div>
              </a>
            ) : (
              <Link key={p.label} href={p.href} className="panel block hover:border-[var(--accent)]/40">
                <div className="panel-inner">
                  <h3 className="text-sm font-semibold">{p.label}</h3>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">{p.detail}</p>
                </div>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="label">Shipped today ({SITE.version})</h2>
        <ul className="grid gap-2 text-sm text-[var(--ink-muted)] sm:grid-cols-2">
          <li>· {CHECKS.length} checks (T22-001 → T22-026)</li>
          <li>· 60 unit tests + 6 integration examples</li>
          <li>· npm: npx token2022-guard</li>
          <li>· CLI: JSON / SARIF / Markdown</li>
          <li>· GitHub Action + VS Code prototype</li>
          <li>· BENCHMARK.md · 4 examples · 9 guides · 9 use cases</li>
        </ul>
      </section>

      <section className="panel">
        <div className="panel-inner flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label text-[var(--accent)]">Grant milestones ($3,000)</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              M1 complete · M2 planned if approved. See docs/GRANT.md for full proposal.
            </p>
          </div>
          <Link href="/milestones" className="btn btn-ghost text-[10px]">
            M1 & M2 details →
          </Link>
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
