import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
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
    <article className="space-y-10">
      <PageHeader
        eyebrow={USE_CASE_CATEGORIES[uc.category]}
        title={uc.title}
        subtitle={uc.summary}
        actions={
          <>
            <Link href={uc.tryHref} className="btn btn-primary text-[10px]">
              {uc.tryLabel}
            </Link>
            <Link href="/use-cases" className="btn btn-ghost text-[10px]">
              All use cases
            </Link>
          </>
        }
      />

      <div className="max-w-2xl space-y-8">
        <section className="panel">
          <div className="panel-inner space-y-2">
            <p className="label text-[var(--accent)]">The problem</p>
            <p className="text-sm leading-relaxed text-[var(--ink-muted)]">{detail.problem}</p>
            <p className="text-xs text-[var(--ink-faint)]">
              <span className="label">Audience</span> — {detail.audience}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="display text-lg font-bold">When to run this pass</h2>
          <ul className="space-y-2 text-sm text-[var(--ink-muted)]">
            {detail.when.map((w) => (
              <li key={w} className="flex gap-2">
                <span className="text-[var(--accent)]">·</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="display text-lg font-bold">Workflow</h2>
          <ol className="space-y-4">
            {detail.workflow.map((w, i) => (
              <li key={w.step} className="panel">
                <div className="panel-inner space-y-2">
                  <p className="font-mono text-xs text-[var(--accent)]">
                    {String(i + 1).padStart(2, "0")} — {w.step}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--ink-muted)]">{w.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="display text-lg font-bold">What Token2022 Guard catches</h2>
          <ul className="space-y-2 text-sm text-[var(--ink-muted)]">
            {detail.whatWeCatch.map((w) => (
              <li key={w} className="flex gap-2">
                <span className="text-[var(--accent-2)]">✓</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] text-[var(--ink-faint)]">
            Primary checks: {uc.checks.join(", ")}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="display text-lg font-bold">Common mistakes</h2>
          <ul className="space-y-2 text-sm text-[var(--ink-muted)]">
            {detail.avoid.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="text-[var(--high)]">×</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="label">Related guides</h2>
          <div className="grid gap-2">
            {detail.relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="panel block hover:border-[var(--accent)]/40"
              >
                <div className="panel-inner text-sm font-semibold">{g.title} →</div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Link href="/use-cases" className="nav-link">
        ← All use cases
      </Link>
    </article>
  );
}
