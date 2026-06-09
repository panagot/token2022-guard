import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import {
  FEATURED_USE_CASES,
  USE_CASES,
  USE_CASE_CATEGORIES,
  type UseCaseCategory,
} from "@/lib/use-cases";

export const metadata = {
  title: "Use cases",
  description: "When to run Token2022 Guard — transfer hooks, vaults, CI gates, and pre-audit hygiene.",
};

function UseCaseCard({ uc }: { uc: (typeof USE_CASES)[number] }) {
  return (
    <div className="panel flex h-full flex-col">
      <div className="panel-inner flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-pass text-[9px]">{USE_CASE_CATEGORIES[uc.category]}</span>
        </div>
        <h3 className="text-sm font-semibold">{uc.title}</h3>
        <p className="flex-1 text-xs leading-relaxed text-[var(--ink-muted)]">{uc.summary}</p>
        <p className="font-mono text-[10px] text-[var(--ink-faint)]">
          Checks: {uc.checks.join(", ")}
        </p>
        <Link href={uc.tryHref} className="btn btn-ghost mt-1 w-fit text-[10px]">
          {uc.tryLabel} →
        </Link>
      </div>
    </div>
  );
}

export default function UseCasesPage() {
  const categories = Object.keys(USE_CASE_CATEGORIES) as UseCaseCategory[];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Use cases"
        title="When to run Token2022 Guard"
        subtitle="More than a linter demo — scenarios we built for: transfer hooks before mainnet, vault integrations, fee mints, CI gating, and pre-audit hygiene. Each card links to a sample or guide."
        actions={
          <Link href="/" className="btn btn-primary text-[10px]">
            Run checks
          </Link>
        }
      />

      <section className="space-y-4">
        <h2 className="label">Featured</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURED_USE_CASES.map((uc) => (
            <UseCaseCard key={uc.id} uc={uc} />
          ))}
        </div>
      </section>

      {categories.map((cat) => {
        const items = USE_CASES.filter((u) => u.category === cat);
        return (
          <section key={cat} className="space-y-4">
            <h2 className="label">{USE_CASE_CATEGORIES[cat]}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((uc) => (
                <UseCaseCard key={uc.id} uc={uc} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="panel">
        <div className="panel-inner flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[var(--ink-muted)]">
            New to Token-2022 extensions? Start with the guides before you pay for an audit.
          </p>
          <Link href="/guides" className="btn btn-ghost text-[10px]">
            All guides →
          </Link>
        </div>
      </section>
    </div>
  );
}
