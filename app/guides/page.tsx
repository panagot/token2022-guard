import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { GUIDES, GUIDE_CATEGORIES, type GuideCategory } from "@/lib/guides";

export const metadata = {
  title: "Guides",
  description:
    "In-depth Token-2022 security guides — hooks, fees, vaults, pointers, CI, and pre-audit workflows.",
};

const CAT_INDEX: Record<GuideCategory, string> = {
  start: "01",
  hooks: "02",
  integration: "03",
  workflow: "04",
};

export default function GuidesPage() {
  const categories = Object.keys(GUIDE_CATEGORIES) as GuideCategory[];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Reading room"
        title="Token-2022 security guides"
        subtitle="Nine in-depth pieces for builders and auditors — extension mechanics, scan commands, check mappings, and workflow steps. Each links to the related checks and use cases."
        actions={
          <Link href="/use-cases" className="btn btn-ghost">
            Use cases
          </Link>
        }
      />

      {categories.map((cat) => {
        const items = GUIDES.filter((g) => g.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="space-y-3.5">
            <SectionHead index={CAT_INDEX[cat]} label={GUIDE_CATEGORIES[cat]} />
            <div className="link-list">
              {items.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="link-row">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="display text-[1.05rem] text-[var(--ink)]">{g.title}</h3>
                      <p className="text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
                        {g.summary}
                      </p>
                    </div>
                    <span className="mono shrink-0 pt-1 text-[11px] text-[var(--ink-faint)]">
                      {g.readMinutes} min
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-7">
        <p className="max-w-md text-sm text-[var(--ink-muted)]">
          Guides explain the why. Use cases explain when to scan and the step-by-step workflow.
        </p>
        <Link href="/use-cases" className="btn btn-ghost">
          Browse use cases ↗
        </Link>
      </section>
    </div>
  );
}
