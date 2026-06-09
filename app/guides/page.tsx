import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { GUIDES, GUIDE_CATEGORIES, type GuideCategory } from "@/lib/guides";

export const metadata = {
  title: "Guides",
  description: "Practical Token-2022 security guides — then run checks on token2022-guard.vercel.app.",
};

export default function GuidesPage() {
  const categories = Object.keys(GUIDE_CATEGORIES) as GuideCategory[];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Guides"
        title="Token-2022 security guides"
        subtitle="Free, practical steps for builders and auditors — then run Token2022 Guard when you need a structured pass over your source."
        actions={
          <>
            <Link href="/how-it-works" className="btn btn-ghost text-[10px]">
              How it works
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
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold">{g.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">
                          {g.summary}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-[var(--ink-faint)]">
                        {g.readMinutes} min read →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
