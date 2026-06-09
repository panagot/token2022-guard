import Link from "next/link";

import { NAV_LINKS, SITE } from "@/lib/site";
import { CHECKS } from "@/lib/checks";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="display text-sm font-bold text-[var(--ink)]">{SITE.name}</p>
            <p className="mt-1 text-xs text-[var(--ink-faint)]">
              MIT · Solana public good · Pre-mainnet Token-2022 checks
            </p>
          </div>
          <Link href="/" className="btn btn-primary text-[10px]">
            Run checks
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="label mb-3">Product</p>
            <nav className="flex flex-col gap-2 text-xs text-[var(--ink-muted)]">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="nav-link w-fit">
                  {l.label}
                </Link>
              ))}
              <Link href="/" className="nav-link w-fit">
                Analyzer
              </Link>
            </nav>
          </div>
          <div>
            <p className="label mb-3">Resources</p>
            <nav className="flex flex-col gap-2 text-xs text-[var(--ink-muted)]">
              <a href={SITE.spec} className="nav-link w-fit" target="_blank" rel="noreferrer">
                Token-2022 spec
              </a>
              <a href={SITE.github} className="nav-link w-fit" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <Link href="/use-cases" className="nav-link w-fit">
                Use cases
              </Link>
              <Link href="/guides" className="nav-link w-fit">
                Guides
              </Link>
            </nav>
          </div>
          <div>
            <p className="label mb-3">Related</p>
            <nav className="flex flex-col gap-2 text-xs text-[var(--ink-muted)]">
              <a
                href="https://github.com/panagot/Anchor-Security-Prep"
                className="nav-link w-fit"
                target="_blank"
                rel="noreferrer"
              >
                Anchor Security Prep
              </a>
              <a href={SITE.github} className="nav-link w-fit" target="_blank" rel="noreferrer">
                Report an issue
              </a>
            </nav>
          </div>
        </div>

        <p className="text-[10px] leading-relaxed text-[var(--ink-faint)]">
          {SITE.version} · {CHECKS.length} checks · Static heuristics — not a substitute for a
          professional audit. Review findings before sharing externally.
        </p>
      </div>
    </footer>
  );
}
