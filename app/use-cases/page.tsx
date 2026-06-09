import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import {
  USE_CASES,
  USE_CASE_CATEGORIES,
  type UseCaseCategory,
} from "@/lib/use-cases";

export const metadata = {
  title: "Use cases",
  description:
    "Detailed scenarios for Token2022 Guard — transfer hooks, vaults, fee mints, pointer extensions, CI gates, and pre-audit hygiene.",
};

const CAT_INDEX: Record<UseCaseCategory, string> = {
  hooks: "01",
  integration: "02",
  workflow: "03",
  prevention: "04",
};

function UseCaseRow({ uc }: { uc: (typeof USE_CASES)[number] }) {
  return (
    <Link href={`/use-cases/${uc.id}`} className="link-row">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="display text-[1.05rem] text-[var(--ink)]">{uc.title}</h3>
          <p className="text-[13.5px] leading-relaxed text-[var(--ink-muted)]">{uc.summary}</p>
          <p className="mono text-[11px] text-[var(--ink-faint)]">
            {uc.checks.join("  ·  ")}
          </p>
        </div>
        <span className="mono shrink-0 pt-1 text-xs text-[var(--accent-ink)]">↗</span>
      </div>
    </Link>
  );
}

export default function UseCasesPage() {
  const categories = Object.keys(USE_CASE_CATEGORIES) as UseCaseCategory[];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Field guide"
        title="When to run a review"
        subtitle="Nine scenarios, each with problem context, a step-by-step workflow, the checks involved, and links to specimens and guides."
      />

      {categories.map((cat) => {
        const items = USE_CASES.filter((u) => u.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="space-y-3.5">
            <SectionHead index={CAT_INDEX[cat]} label={USE_CASE_CATEGORIES[cat]} />
            <div className="link-list">
              {items.map((uc) => (
                <UseCaseRow key={uc.id} uc={uc} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-7">
        <p className="max-w-md text-sm text-[var(--ink-muted)]">
          Guides cover the extension mechanics; use cases cover when and how to scan in your
          workflow.
        </p>
        <Link href="/guides" className="btn btn-ghost">
          All guides ↗
        </Link>
      </section>
    </div>
  );
}
