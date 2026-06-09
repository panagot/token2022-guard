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
    <article className="space-y-10">
      <PageHeader
        eyebrow={meta ? `${meta.readMinutes} min read` : "Guide"}
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
                <GuideText text={p} />
              </p>
            ))}
            {section.bullets && (
              <ul className="list-inside list-disc space-y-2 text-sm text-[var(--ink-muted)]">
                {section.bullets.map((b, k) => (
                  <li key={k}>
                    <GuideText text={b} />
                  </li>
                ))}
              </ul>
            )}
            {section.numbered && (
              <ol className="list-inside list-decimal space-y-2 text-sm text-[var(--ink-muted)]">
                {section.numbered.map((n, k) => (
                  <li key={k} className="pl-1">
                    <GuideText text={n} />
                  </li>
                ))}
              </ol>
            )}
            {section.code && (
              <pre className="code-block overflow-x-auto px-4 py-3 text-xs leading-relaxed">
                {section.code}
              </pre>
            )}
            {section.callout && (
              <div
                className={`panel border-l-2 ${
                  section.callout.type === "warn"
                    ? "border-[var(--high)]"
                    : "border-[var(--accent)]"
                }`}
              >
                <div className="panel-inner text-sm leading-relaxed text-[var(--ink-muted)]">
                  <span className="label mr-2">
                    {section.callout.type === "warn" ? "Warning" : "Tip"}
                  </span>
                  {section.callout.text}
                </div>
              </div>
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
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href="/checks" className="btn btn-ghost text-[10px]">
                Full catalog →
              </Link>
              <Link href="/use-cases" className="btn btn-ghost text-[10px]">
                Use cases →
              </Link>
            </div>
          </div>
        </div>
      )}

      <Link href="/guides" className="nav-link">
        ← All guides
      </Link>
    </article>
  );
}
