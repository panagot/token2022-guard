import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { GUIDES, GUIDE_CATEGORIES, type GuideCategory } from "@/lib/guides";

export const metadata = {
  title: "Guides",
  description:
    "In-depth Token-2022 security guides — hooks, fees, vaults, pointers, CI, and pre-audit workflows.",
};

export default function GuidesPage() {
  const categories = Object.keys(GUIDE_CATEGORIES) as GuideCategory[];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Guides"
        title="Token-2022 security guides"
        subtitle="Nine in-depth guides for builders and auditors — extension mechanics, scan commands, check mappings, and workflow steps. Each links to related checks and use cases."
        actions={
          <>
            <Link href="/use-cases" className="btn btn-ghost text-[10px]">
              Use cases
            </Link>
            <Link href="/" className="btn btn-primary text-[10px]">
              Run checks
            </Link>
          </>
        }
      />

      {categories.map((cat) => {
        const items = GUIDES.filter((g) => g.category === cat);
        return (
          <section key={cat} className="space-y-4">
            <h2 className="label">{GUIDE_CATEGORIES[cat]}</h2>
            <ul className="space-y-3">
              {items.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="panel block hover:border-[var(--accent)]/40"
                  >
                    <div className="panel-inner flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="text-sm font-semibold">{g.title}</h3>
                        <p className="text-xs leading-relaxed text-[var(--ink-muted)]">
                          {g.summary}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-[var(--ink-faint)]">
                        {g.readMinutes} min →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="panel">
        <div className="panel-inner flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[var(--ink-muted)]">
            Guides explain the why. Use cases explain when to scan and the step-by-step workflow.
          </p>
          <Link href="/use-cases" className="btn btn-ghost text-[10px]">
            Browse use cases →
          </Link>
        </div>
      </section>
    </div>
  );
}
