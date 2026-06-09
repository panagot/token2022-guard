import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { GUIDE_CONTENT } from "@/lib/guide-content";
import { GUIDES } from "@/lib/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then((p) => {
    const guide = GUIDE_CONTENT[p.slug];
    if (!guide) return { title: "Guide" };
    return { title: guide.title, description: guide.summary };
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = GUIDE_CONTENT[slug];
  if (!guide) notFound();

  return (
    <article className="space-y-10">
      <PageHeader
        eyebrow="Guide"
        title={guide.title}
        subtitle={guide.summary}
        actions={
          <Link href={guide.ctaHref} className="btn btn-primary text-[10px]">
            {guide.ctaLabel}
          </Link>
        }
      />

      <div className="max-w-2xl space-y-8">
        {guide.sections.map((section, i) => (
          <section key={i} className="space-y-3">
            {section.heading && (
              <h2 className="display text-lg font-bold">{section.heading}</h2>
            )}
            {section.paragraphs?.map((p, j) => (
              <p key={j} className="text-sm leading-relaxed text-[var(--ink-muted)]">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-inside list-disc space-y-2 text-sm text-[var(--ink-muted)]">
                {section.bullets.map((b, k) => (
                  <li key={k}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {guide.relatedChecks.length > 0 && (
        <div className="panel">
          <div className="panel-inner space-y-2">
            <p className="label">Related checks</p>
            <p className="font-mono text-xs text-[var(--accent)]">
              {guide.relatedChecks.join(" · ")}
            </p>
            <Link href="/checks" className="btn btn-ghost mt-2 text-[10px]">
              Full check catalog →
            </Link>
          </div>
        </div>
      )}

      <Link href="/guides" className="nav-link">
        ← All guides
      </Link>
    </article>
  );
}
