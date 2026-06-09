import Link from "next/link";
import { notFound } from "next/navigation";

import { GuideText } from "@/components/GuideText";
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

  const meta = GUIDES.find((g) => g.slug === slug);

  return (
    <article className="space-y-12">
      <PageHeader
        eyebrow={meta ? `Guide · ${meta.readMinutes} min read` : "Guide"}
        title={guide.title}
        subtitle={guide.summary}
        actions={
          <Link href={guide.ctaHref} className="btn btn-primary">
            {guide.ctaLabel}
          </Link>
        }
      />

      <div className="max-w-[68ch] space-y-9">
        {guide.sections.map((section, i) => (
          <section key={i} className="space-y-3.5">
            {section.heading && (
              <h2 className="display text-[1.4rem] text-[var(--ink)]">{section.heading}</h2>
            )}
            {section.paragraphs?.map((p, j) => (
              <p key={j} className="prose-body">
                <GuideText text={p} />
              </p>
            ))}
            {section.bullets && (
              <ul className="space-y-2.5">
                {section.bullets.map((b, k) => (
                  <li key={k} className="flex gap-2.5 prose-body">
                    <span className="mono shrink-0 text-xs text-[var(--accent-ink)]">›</span>
                    <span>
                      <GuideText text={b} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {section.numbered && (
              <ol className="space-y-2.5">
                {section.numbered.map((n, k) => (
                  <li key={k} className="flex gap-3 prose-body">
                    <span className="mono shrink-0 text-xs text-[var(--accent-ink)]">
                      {String(k + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <GuideText text={n} />
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {section.code && (
              <pre className="code-block overflow-x-auto px-4 py-3.5 text-[12.5px] leading-relaxed">
                {section.code}
              </pre>
            )}
            {section.callout && (
              <div
                className={`callout ${
                  section.callout.type === "warn" ? "callout-warn" : "callout-info"
                }`}
              >
                <span className="callout__label">
                  {section.callout.type === "warn" ? "Warning" : "Note"}
                </span>
                <GuideText text={section.callout.text} />
              </div>
            )}
          </section>
        ))}
      </div>

      {guide.relatedChecks.length > 0 && (
        <section className="max-w-[68ch] space-y-3 border-t border-[var(--line)] pt-7">
          <p className="eyebrow">Related checks</p>
          <p className="mono text-[13px] text-[var(--ink-muted)]">
            {guide.relatedChecks.join("  ·  ")}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/checks" className="btn btn-ghost">
              Full catalog ↗
            </Link>
            <Link href="/use-cases" className="btn btn-ghost">
              Use cases ↗
            </Link>
          </div>
        </section>
      )}

      <Link href="/guides" className="nav-link-inline mono text-sm">
        ← All guides
      </Link>
    </article>
  );
}
