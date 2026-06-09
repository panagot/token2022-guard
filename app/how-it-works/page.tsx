import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { CHECKS } from "@/lib/checks";

const STEPS = [
  {
    n: "01",
    title: "Scope",
    body: "Point Token2022 Guard at your Anchor / Rust source — a file, a programs/ directory, or paste into the web UI. The engine detects transfer-hook programs and custodial flows automatically.",
  },
  {
    n: "02",
    title: "Scan",
    body: `${CHECKS.length} static checks run against your source. Each finding includes severity, confidence, the offending line when detectable, a fix, and a spec reference.`,
  },
  {
    n: "03",
    title: "Fix & gate",
    body: "Patch the flagged patterns, re-run until high/critical clear, then wire --fail-on=high in CI so regressions never reach mainnet.",
  },
];

export const metadata = {
  title: "How it works",
  description: "Scope, scan, and fix Token-2022 integration footguns before mainnet.",
};

export default function HowItWorksPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Product"
        title="How Token2022 Guard works"
        subtitle="Three steps — scope your program, run checks, fix and gate in CI. Same engine in the browser, terminal, VS Code, and GitHub Actions."
        actions={
          <Link href="/" className="btn btn-primary text-[10px]">
            Run checks
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="panel">
            <div className="panel-inner space-y-3">
              <p className="font-mono text-2xl font-bold text-[var(--accent)]">{s.n}</p>
              <h2 className="display text-xl font-bold">{s.title}</h2>
              <p className="text-sm leading-relaxed text-[var(--ink-muted)]">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="label">Surfaces</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Web UI", desc: "Paste source or load samples — instant findings.", href: "/" },
            { title: "CLI", desc: "npm run scan — JSON, SARIF, Markdown, CI exit codes.", href: "/guides/cli-quickstart" },
            { title: "VS Code", desc: "Inline diagnostics on .rs files (extension prototype).", href: "https://github.com/panagot/token2022-guard/tree/main/vscode-extension" },
            { title: "GitHub Action", desc: "Fail PRs on high/critical + SARIF upload.", href: "/guides/ci-setup" },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="panel block hover:border-[var(--accent)]/40">
              <div className="panel-inner">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-inner flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label text-[var(--accent)]">Next</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              See when teams run these checks — transfer hooks, vaults, CI, pre-audit.
            </p>
          </div>
          <Link href="/use-cases" className="btn btn-ghost text-[10px]">
            Use cases →
          </Link>
        </div>
      </section>
    </div>
  );
}
