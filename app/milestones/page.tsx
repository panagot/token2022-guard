import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { CHECKS } from "@/lib/checks";
import { GRANT_TOTAL, M1, M2 } from "@/lib/milestones";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Milestones",
  description: "M1 and M2 grant deliverables for Token2022 Guard — what is shipped, what remains, and what M2 adds if approved.",
};

function ListSection({
  title,
  items,
  variant,
}: {
  title: string;
  items: readonly string[];
  variant: "done" | "remaining" | "planned";
}) {
  const accent =
    variant === "done"
      ? "text-[var(--accent-2)]"
      : variant === "remaining"
        ? "text-[var(--medium)]"
        : "text-[var(--accent)]";

  return (
    <div className="space-y-3">
      <h3 className={`label ${accent}`}>{title}</h3>
      <ul className="space-y-2 text-sm text-[var(--ink-muted)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2 leading-relaxed">
            <span className={`shrink-0 font-mono text-xs ${accent}`}>
              {variant === "done" ? "✓" : variant === "remaining" ? "○" : "→"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MilestonesPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Grant · $3,000"
        title="M1 & M2 milestones"
        subtitle={`Superteam Balkan proposal — two tranches of $1,500. M1 makes the tool tested and discoverable; M2 embeds it in daily dev workflows. Current build: ${SITE.version} · ${CHECKS.length} checks.`}
        actions={
          <>
            <Link href="/reviewer" className="btn btn-ghost text-[10px]">
              Reviewer overview
            </Link>
            <Link href="/checks" className="btn btn-primary text-[10px]">
              Check catalog
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total ask", value: `$${GRANT_TOTAL.toLocaleString()}` },
          { label: "M1 tranche", value: `$${M1.amount.toLocaleString()}` },
          { label: "M2 tranche", value: `$${M2.amount.toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="panel">
            <div className="panel-inner text-center">
              <p className="label text-[var(--ink-faint)]">{s.label}</p>
              <p className="display mt-1 text-2xl font-bold text-[var(--accent)]">{s.value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="label">
            {M1.phase} · ${M1.amount.toLocaleString()} · {M1.timeline}
          </h2>
          <span className="text-xs text-[var(--ink-faint)]">{M1.theme}</span>
        </div>
        <div className="panel">
          <div className="panel-inner grid gap-8 md:grid-cols-2">
            <ListSection title="Shipped (pre-apply proof)" items={M1.done} variant="done" />
            <ListSection title="Still to complete for M1" items={M1.remaining} variant="remaining" />
          </div>
        </div>
        <p className="text-xs text-[var(--ink-faint)]">
          Most of M1 is already in the repo and live. The remaining items are publish + one more
          integration example so extension checks (T22-018–023) show up in the benchmark corpus, not
          only in unit fixtures.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="label">
            {M2.phase} · ${M2.amount.toLocaleString()} · {M2.timeline}
          </h2>
          <span className="text-xs text-[var(--ink-faint)]">{M2.theme}</span>
        </div>
        <div className="panel">
          <div className="panel-inner space-y-4">
            <p className="text-sm text-[var(--ink-muted)]">
              If the grant is approved and M1 is accepted, M2 focuses on adoption — editor
              distribution, repo config, suppressions, and a cloneable secure hook template. No M2
              work starts until M1 deliverables are signed off.
            </p>
            <ListSection title="Planned deliverables" items={M2.planned} variant="planned" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel">
          <div className="panel-inner space-y-2">
            <p className="label text-[var(--accent)]">6-month targets</p>
            <ul className="space-y-1 text-sm text-[var(--ink-muted)]">
              <li>· npm ≥150 weekly downloads</li>
              <li>· ≥10 public repos using CI workflow</li>
              <li>· ≥60 GitHub stars</li>
            </ul>
          </div>
        </div>
        <div className="panel">
          <div className="panel-inner space-y-2">
            <p className="label text-[var(--accent)]">Scope boundary</p>
            <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
              Token2022 Guard = Token-2022 extension integration safety only. Complements{" "}
              <a
                href="https://github.com/panagot/Anchor-Security-Prep"
                className="nav-link"
                target="_blank"
                rel="noreferrer"
              >
                Anchor Security Prep
              </a>{" "}
              (general Anchor rules) — separate repo, separate grant.
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-inner flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label text-[var(--accent)]">Proof today</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Try the vulnerable sample → {CHECKS.length} checks · secure sample → 0 findings.
            </p>
          </div>
          <Link href="/?sample=vulnerable" className="btn btn-primary text-[10px]">
            Run vulnerable sample
          </Link>
        </div>
      </section>
    </div>
  );
}
