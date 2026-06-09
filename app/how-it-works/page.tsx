import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { CHECKS } from "@/lib/checks";

const STEPS = [
  {
    n: "01",
    title: "Scope",
    body: "Point Token2022 Guard at your Anchor or Rust source — a file, a programs/ directory, or pasted into the web UI. The engine detects transfer-hook programs and custodial flows automatically.",
  },
  {
    n: "02",
    title: "Scan",
    body: `${CHECKS.length} static checks run against your source. Each finding carries a severity, a confidence, the offending line when detectable, a remediation, and a specification reference.`,
  },
  {
    n: "03",
    title: "Fix & gate",
    body: "Patch the flagged patterns, re-run until high and critical clear, then wire --fail-on=high into CI so regressions never reach mainnet.",
  },
];

const SURFACES = [
  { title: "Web UI", desc: "Paste source or load specimens for instant findings.", href: "/" },
  {
    title: "CLI",
    desc: "npm run scan — JSON, SARIF, Markdown, and CI exit codes.",
    href: "/guides/cli-quickstart",
  },
  {
    title: "VS Code",
    desc: "Inline diagnostics on .rs files (extension prototype).",
    href: "https://github.com/panagot/token2022-guard/tree/main/vscode-extension",
  },
  {
    title: "GitHub Action",
    desc: "Fail pull requests on high or critical, with SARIF upload.",
    href: "/guides/ci-setup",
  },
];

export const metadata = {
  title: "How it works",
  description: "Scope, scan, and fix Token-2022 integration footguns before mainnet.",
};

export default function HowItWorksPage() {
  return (
    <div className="space-y-14">
      <PageHeader
        eyebrow="Method"
        title="How the review works"
        subtitle="Three steps — scope the program, run the checks, fix and gate in CI. The same engine runs in the browser, the terminal, VS Code, and GitHub Actions."
      />

      <section className="space-y-3">
        <SectionHead index="01" label="The procedure" />
        <ol className="divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-6 py-6">
              <span className="mono shrink-0 text-sm text-[var(--accent-ink)]">{s.n}</span>
              <div className="space-y-1.5">
                <h2 className="display text-[1.25rem] text-[var(--ink)]">{s.title}</h2>
                <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--ink-muted)]">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <SectionHead index="02" label="Four surfaces, one engine" />
        <div className="link-list">
          {SURFACES.map((item) => (
            <Link key={item.title} href={item.href} className="link-row flex items-baseline gap-4">
              <span className="display w-32 shrink-0 text-[15px] text-[var(--ink)]">
                {item.title}
              </span>
              <span className="text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
                {item.desc}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-7">
        <div>
          <p className="eyebrow mb-1.5">Next</p>
          <p className="text-sm text-[var(--ink-muted)]">
            See when teams run these checks — hooks, vaults, CI, and pre-audit.
          </p>
        </div>
        <Link href="/use-cases" className="btn btn-ghost">
          Use cases ↗
        </Link>
      </section>
    </div>
  );
}
