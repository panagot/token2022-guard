import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { CHECK_GUIDE } from "@/lib/check-guides";
import { CHECKS } from "@/lib/checks";
import { GUIDES } from "@/lib/guides";

export const metadata = {
  title: "Checks",
  description: "Full catalog of Token2022 Guard checks — T22-001 through T22-026.",
};

const GUIDE_TITLE = Object.fromEntries(GUIDES.map((g) => [g.slug, g.title]));

const SEV_INDEX: Record<string, string> = {
  critical: "01",
  high: "02",
  medium: "03",
  low: "04",
};

export default function ChecksPage() {
  const bySeverity = ["critical", "high", "medium", "low"] as const;

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Reference"
        title="The check catalog"
        subtitle={`${CHECKS.length} static checks for Token-2022 integration footguns. Each row carries a one-line remediation and a link to the official extensions specification.`}
      />

      {bySeverity.map((sev) => {
        const items = CHECKS.filter((c) => c.severity === sev);
        if (items.length === 0) return null;
        return (
          <section key={sev} className="space-y-3.5">
            <SectionHead
              index={SEV_INDEX[sev]}
              label={`${sev} · ${items.length}`}
            />
            <div className="ledger">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th style={{ width: "1.4rem" }} aria-label="Severity" />
                    <th style={{ width: "5.2rem" }}>ID</th>
                    <th>Check &amp; remediation</th>
                    <th style={{ width: "8.5rem" }}>Guide</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => {
                    const extra = CHECK_GUIDE[c.id];
                    return (
                      <tr key={c.id} className={`sev-${c.severity}`}>
                        <td>
                          <span className="dot" title={c.severity} />
                        </td>
                        <td className="cell-id">{c.id}</td>
                        <td>
                          <p className="font-medium text-[var(--ink)]">{c.title}</p>
                          <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
                            {c.summary}
                          </p>
                          {extra?.fix && (
                            <p className="fix-inset">
                              <span className="fix-inset__label">Fix</span>
                              {extra.fix}
                            </p>
                          )}
                          <a
                            href={c.reference}
                            target="_blank"
                            rel="noreferrer"
                            className="nav-link-inline mono mt-2 inline-block text-xs"
                          >
                            Specification ↗
                          </a>
                        </td>
                        <td>
                          {extra?.guide ? (
                            <Link
                              href={`/guides/${extra.guide}`}
                              className="nav-link-inline text-[13px]"
                            >
                              {GUIDE_TITLE[extra.guide] ?? extra.guide}
                            </Link>
                          ) : (
                            <span className="text-xs text-[var(--ink-faint)]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-7">
        <p className="text-sm text-[var(--ink-muted)]">
          {CHECKS.length} checks shipped. Expansion toward 30+ is on the roadmap.
        </p>
        <Link href="/guides" className="btn btn-ghost">
          All guides ↗
        </Link>
      </section>
    </div>
  );
}
