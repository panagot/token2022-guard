import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { CHECK_GUIDE } from "@/lib/check-guides";
import { CHECKS } from "@/lib/checks";
import { GUIDES } from "@/lib/guides";

export const metadata = {
  title: "Checks",
  description: "Full catalog of Token2022 Guard checks — T22-001 through T22-026.",
};

const GUIDE_TITLE = Object.fromEntries(GUIDES.map((g) => [g.slug, g.title]));

export default function ChecksPage() {
  const bySeverity = ["critical", "high", "medium", "low"] as const;

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Checks"
        title="Check catalog"
        subtitle={`${CHECKS.length} static checks for Token-2022 integration footguns. Each includes a fix hint, related guide, and link to the official extensions spec.`}
        actions={
          <Link href="/" className="btn btn-primary text-[10px]">
            Run checks
          </Link>
        }
      />

      {bySeverity.map((sev) => {
        const items = CHECKS.filter((c) => c.severity === sev);
        if (items.length === 0) return null;
        return (
          <section key={sev} className="space-y-4">
            <h2 className={`label sev-${sev}`}>{sev}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((c) => {
                const extra = CHECK_GUIDE[c.id];
                return (
                  <div key={c.id} className={`panel sev-${c.severity}`}>
                    <div className="panel-inner space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-[var(--accent)]">{c.id}</span>
                        <span className={`badge sev-${c.severity}`}>{c.severity}</span>
                      </div>
                      <h3 className="text-sm font-semibold">{c.title}</h3>
                      <p className="text-xs leading-relaxed text-[var(--ink-muted)]">{c.summary}</p>
                      {extra?.fix && (
                        <p className="text-xs leading-relaxed">
                          <span className="label text-[var(--accent-2)]">Fix</span>{" "}
                          <span className="text-[var(--ink)]">{extra.fix}</span>
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 pt-1">
                        {extra?.guide && (
                          <Link href={`/guides/${extra.guide}`} className="nav-link text-[10px]">
                            {GUIDE_TITLE[extra.guide] ?? extra.guide} →
                          </Link>
                        )}
                        <a
                          href={c.reference}
                          target="_blank"
                          rel="noreferrer"
                          className="nav-link text-[10px]"
                        >
                          Spec →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="panel">
        <div className="panel-inner flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[var(--ink-muted)]">
            26 checks shipped (T22-001 → T22-026). Expansion toward 30+ on the roadmap.
          </p>
          <Link href="/guides" className="btn btn-ghost text-[10px]">
            All guides →
          </Link>
        </div>
      </section>
    </div>
  );
}
