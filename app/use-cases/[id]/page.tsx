import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { USE_CASE_CONTENT } from "@/lib/use-case-content";
import { USE_CASE_BY_ID, USE_CASE_CATEGORIES, USE_CASES } from "@/lib/use-cases";

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ id: u.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return params.then((p) => {
    const uc = USE_CASE_BY_ID[p.id];
    if (!uc) return { title: "Use case" };
    return { title: uc.title, description: uc.summary };
  });
}

export default async function UseCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uc = USE_CASE_BY_ID[id];
  const detail = USE_CASE_CONTENT[id];
  if (!uc || !detail) notFound();

  return (
    <article className="space-y-14">
      <PageHeader
        eyebrow={USE_CASE_CATEGORIES[uc.category]}
        title={uc.title}
        subtitle={uc.summary}
        actions={
          <>
            <Link href={uc.tryHref} className="btn btn-primary">
              {uc.tryLabel}
            </Link>
            <Link href="/use-cases" className="btn btn-ghost">
              All use cases
            </Link>
          </>
        }
      />

      <div className="max-w-2xl space-y-14">
        <section className="space-y-3">
          <SectionHead index="01" label="The problem" />
          <p className="prose-body">{detail.problem}</p>
          <p className="text-[13px] text-[var(--ink-faint)]">
            <span className="eyebrow">Audience</span> — {detail.audience}
          </p>
        </section>

        <section className="space-y-3">
          <SectionHead index="02" label="When to run this pass" />
          <ul className="space-y-2.5">
            {detail.when.map((w) => (
              <li key={w} className="flex gap-2.5 text-[14.5px] leading-relaxed text-[var(--ink-muted)]">
                <span className="mono shrink-0 text-xs text-[var(--accent-ink)]">›</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <SectionHead index="03" label="Workflow" />
          <ol className="divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
            {detail.workflow.map((w, i) => (
              <li key={w.step} className="flex gap-5 py-4">
                <span className="mono shrink-0 text-xs text-[var(--accent-ink)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <p className="font-medium text-[var(--ink)]">{w.step}</p>
                  <p className="text-[14px] leading-relaxed text-[var(--ink-muted)]">{w.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <SectionHead index="04" label="What the review catches" />
          <ul className="space-y-2.5">
            {detail.whatWeCatch.map((w) => (
              <li key={w} className="flex gap-2.5 text-[14.5px] leading-relaxed text-[var(--ink-muted)]">
                <span className="mono shrink-0 text-xs text-[var(--ok)]">✓</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
          <p className="mono text-[11px] text-[var(--ink-faint)]">
            Primary checks: {uc.checks.join("  ·  ")}
          </p>
        </section>

        <section className="space-y-3">
          <SectionHead index="05" label="Common mistakes" />
          <ul className="space-y-2.5">
            {detail.avoid.map((a) => (
              <li key={a} className="flex gap-2.5 text-[14.5px] leading-relaxed text-[var(--ink-muted)]">
                <span className="mono shrink-0 text-xs text-[var(--critical)]">✕</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <SectionHead index="06" label="Related guides" />
          <div className="link-list">
            {detail.relatedGuides.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="link-row flex items-center justify-between gap-3">
                <span className="text-[14px] font-medium text-[var(--ink)]">{g.title}</span>
                <span className="mono text-xs text-[var(--accent-ink)]">↗</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Link href="/use-cases" className="nav-link-inline mono text-sm">
        ← All use cases
      </Link>
    </article>
  );
}
