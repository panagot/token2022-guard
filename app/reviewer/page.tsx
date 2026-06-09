import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
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
    detail: "Vulnerable hook produces 16 findings. The secure twin produces zero. Fee and extension specimens included.",
  },
  {
    label: "CLI + SARIF",
    href: "/guides/cli-quickstart",
    detail: "npm run scan or npx token2022-guard, emitting JSON, SARIF, or Markdown. CI uploads to the Security tab.",
  },
  {
    label: "npm package",
    href: `${SITE.github}/blob/main/README.md#quick-start`,
    external: true,
    detail:
      "Package smoke-tested (`npm run smoke`). After publish: npx token2022-guard ./programs --fail-on=high.",
  },
  {
    label: "Check catalog",
    href: "/checks",
    detail: `${CHECKS.length} Token-2022-specific checks, each with a fix and a specification link.`,
  },
  {
    label: "Benchmark",
    href: `${SITE.github}/blob/main/BENCHMARK.md`,
    external: true,
    detail: "Six-file corpus, secure_hook at zero findings, honest false-positive notes.",
  },
  {
    label: "CI workflow",
    href: SITE.actions,
    external: true,
    detail: "60 unit tests plus scan and SARIF on every push and pull request.",
  },
];

const SHIPPED = [
  `${CHECKS.length} checks (T22-001 → T22-026)`,
  "60 unit tests + 6 integration examples",
  "npm package ready (`npm run smoke`); publish at apply",
  "CLI output: JSON / SARIF / Markdown",
  "GitHub Action + VS Code prototype",
  "BENCHMARK.md, 4 specimens, 9 guides, 9 use cases",
];

export default function ReviewerPage() {
  return (
    <div className="space-y-14">
      <PageHeader
        eyebrow="Reviewer brief · ~2 min"
        title="Token2022 Guard, in two minutes"
        subtitle="Pre-mainnet safety checks for Solana Token-2022 integrations. A complement to Anchor Security Prep, not a duplicate of it."
        actions={
          <>
            <Link href="/?sample=vulnerable" className="btn btn-primary">
              Try the vulnerable specimen
            </Link>
            <a href={SITE.github} className="btn btn-ghost" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </>
        }
      />

      <section className="grid gap-x-12 gap-y-8 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-3">The problem</p>
          <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
            Token-2022 extensions — transfer hooks, fees, permanent delegates — introduce bugs
            auditors find again and again. Teams copy SPL Token patterns and ship criticals.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">The instrument</p>
          <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
            One MIT engine drives a web UI, a CLI, a VS Code prototype, and a GitHub Action. It
            flags footguns from source before mainnet. Static heuristics, meant to complement a
            professional audit.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHead index="01" label="Clone → test → scan, in 60 seconds" />
        <pre className="code-block px-4 py-3.5 text-[12.5px] leading-relaxed">{`git clone https://github.com/panagot/token2022-guard.git
cd token2022-guard
npm install
npm test
npm run scan -- ./examples --fail-on=high
npx token2022-guard ./examples/vulnerable_hook.rs --json`}</pre>
      </section>

      <section className="space-y-4">
        <SectionHead index="02" label="Proof chain" />
        <div className="link-list">
          {PROOF.map((p) =>
            p.external ? (
              <a
                key={p.label}
                href={p.href}
                className="link-row flex items-baseline gap-4"
                target="_blank"
                rel="noreferrer"
              >
                <span className="display w-32 shrink-0 text-[15px] text-[var(--ink)]">
                  {p.label}
                </span>
                <span className="text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
                  {p.detail} <span className="text-[var(--accent-ink)]">↗</span>
                </span>
              </a>
            ) : (
              <Link key={p.label} href={p.href} className="link-row flex items-baseline gap-4">
                <span className="display w-32 shrink-0 text-[15px] text-[var(--ink)]">
                  {p.label}
                </span>
                <span className="text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
                  {p.detail}
                </span>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHead index="03" label={`Shipped today · ${SITE.version}`} />
        <ul className="grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
          {SHIPPED.map((s) => (
            <li key={s} className="flex items-baseline gap-2.5 text-[14px] text-[var(--ink-muted)]">
              <span className="mono text-xs text-[var(--accent-ink)]">›</span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-7">
        <div className="max-w-md">
          <p className="eyebrow mb-2">Grant · $3,000</p>
          <p className="text-sm text-[var(--ink-muted)]">
            M1 proof chain ready; npm publish is the last pre-apply step. M2 planned if approved.
            Full proposal: docs/GRANT.md.
          </p>
        </div>
        <a
          href={`${SITE.github}/blob/main/docs/GRANT.md`}
          className="btn btn-ghost"
          target="_blank"
          rel="noreferrer"
        >
          Grant proposal ↗
        </a>
      </section>

      <section className="callout callout-info">
        <p className="display mb-1.5 text-[15px] text-[var(--ink)]">
          Not a duplicate of Anchor Security Prep
        </p>
        <p className="text-[14px] leading-relaxed text-[var(--ink-muted)]">
          ASP performs general Anchor static analysis (26 rules, a separate global grant).
          Token2022 Guard covers Token-2022 extension integration safety only — separate repo,
          separate scope.{" "}
          <a
            href="https://github.com/panagot/Anchor-Security-Prep"
            className="nav-link-inline"
            target="_blank"
            rel="noreferrer"
          >
            Anchor Security Prep ↗
          </a>
        </p>
      </section>
    </div>
  );
}
