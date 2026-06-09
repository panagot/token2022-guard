import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { CHECKS } from "@/lib/checks";
import { GRANT_TOTAL, M1, M2 } from "@/lib/milestones";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Milestones",
  description:
    "M1 and M2 grant deliverables for Token2022 Guard — what is shipped, what remains, and what M2 adds if approved.",
};

function DeliverableList({
  items,
  variant,
}: {
  items: readonly string[];
  variant: "done" | "remaining" | "planned";
}) {
  const marker = variant === "done" ? "✓" : variant === "remaining" ? "○" : "→";
  const markerColor = variant === "done" ? "text-[var(--ok)]" : "text-[var(--ink-faint)]";
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-[var(--ink-muted)]">
          <span className={`mono shrink-0 text-xs ${markerColor}`}>{marker}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function MilestonesPage() {
  return (
    <div className="space-y-14">
      <PageHeader
        eyebrow="Grant · Superteam Balkan"
        title="Milestones &amp; deliverables"
        subtitle={`Two tranches of $1,500. M1 makes the tool tested and discoverable; M2 embeds it in daily developer workflows. Current build: ${SITE.version}, ${CHECKS.length} checks.`}
        actions={
          <>
            <Link href="/reviewer" className="btn btn-ghost">
              Reviewer brief
            </Link>
            <Link href="/checks" className="btn btn-primary">
              Check catalog
            </Link>
          </>
        }
      />

      <section className="flex flex-wrap gap-x-12 gap-y-4">
        {[
          { label: "Total ask", value: `$${GRANT_TOTAL.toLocaleString()}` },
          { label: "M1 tranche", value: `$${M1.amount.toLocaleString()}` },
          { label: "M2 tranche", value: `$${M2.amount.toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="display text-[1.6rem] text-[var(--ink)]">{s.value}</span>
            <span className="eyebrow">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <SectionHead
          index="01"
          label={`${M1.phase} · ${M1.timeline} · ${M1.theme}`}
        />
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          <div className="space-y-3">
            <p className="eyebrow">Shipped — pre-apply proof</p>
            <DeliverableList items={M1.done} variant="done" />
          </div>
          {M1.remaining.length > 0 && (
            <div className="space-y-3">
              <p className="eyebrow">Still to complete</p>
              <DeliverableList items={M1.remaining} variant="remaining" />
            </div>
          )}
        </div>
        <p className="text-[13px] leading-relaxed text-[var(--ink-faint)]">
          M1 pre-apply proof is ready when CI is green and{" "}
          <code className="mono text-[var(--ink-muted)]">npm run smoke</code> passes. Final M1
          step: <code className="mono text-[var(--ink-muted)]">npm publish --access public</code>.
          Verify CI on the{" "}
          <a href={SITE.actions} className="nav-link-inline" target="_blank" rel="noreferrer">
            GitHub Actions workflow
          </a>
          .
        </p>
      </section>

      <section className="space-y-5">
        <SectionHead
          index="02"
          label={`${M2.phase} · ${M2.timeline} · ${M2.theme}`}
        />
        <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--ink-muted)]">
          If the grant is approved and M1 is accepted, M2 focuses on adoption — editor
          distribution, repo configuration, suppressions, and a cloneable secure hook template. No
          M2 work begins until M1 deliverables are signed off.
        </p>
        <div className="space-y-3">
          <p className="eyebrow">Planned deliverables</p>
          <DeliverableList items={M2.planned} variant="planned" />
        </div>
      </section>

      <section className="grid gap-x-12 gap-y-8 border-t border-[var(--line)] pt-8 md:grid-cols-2">
        <div className="space-y-2.5">
          <p className="eyebrow">Six-month targets</p>
          <ul className="space-y-1.5 text-[14px] text-[var(--ink-muted)]">
            <li>npm ≥ 150 weekly downloads</li>
            <li>≥ 10 public repos using the CI workflow</li>
            <li>≥ 60 GitHub stars</li>
          </ul>
        </div>
        <div className="space-y-2.5">
          <p className="eyebrow">Scope boundary</p>
          <p className="text-[14px] leading-relaxed text-[var(--ink-muted)]">
            Token2022 Guard covers Token-2022 extension integration safety only. It complements{" "}
            <a
              href="https://github.com/panagot/Anchor-Security-Prep"
              className="nav-link-inline"
              target="_blank"
              rel="noreferrer"
            >
              Anchor Security Prep
            </a>{" "}
            (general Anchor rules) — separate repo, separate grant.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-7">
        <div>
          <p className="eyebrow mb-1.5">Proof today</p>
          <p className="text-sm text-[var(--ink-muted)]">
            The vulnerable specimen surfaces findings; the secure twin returns zero.
          </p>
        </div>
        <Link href="/?sample=vulnerable" className="btn btn-primary">
          Run the vulnerable specimen
        </Link>
      </section>
    </div>
  );
}
