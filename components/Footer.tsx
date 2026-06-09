import Link from "next/link";

import { Logo } from "@/components/Logo";
import { CHECKS } from "@/lib/checks";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--line)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 md:px-10 xl:px-14">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 text-[var(--accent-ink)]">
              <Logo size={22} />
              <span className="display text-[15px] font-semibold text-[var(--ink)]">
                {SITE.name}
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-faint)]">
              An open security workbook for Solana Token-2022 integrations. MIT licensed,
              built as a public good.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3">
            <nav className="flex flex-col gap-2.5">
              <p className="eyebrow mb-1">Product</p>
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="nav-link w-fit text-[13.5px]">
                  {l.label}
                </Link>
              ))}
            </nav>
            <nav className="flex flex-col gap-2.5">
              <p className="eyebrow mb-1">Resources</p>
              <a href={SITE.spec} className="nav-link w-fit text-[13.5px]" target="_blank" rel="noreferrer">
                Token-2022 spec
              </a>
              <a href={SITE.github} className="nav-link w-fit text-[13.5px]" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={SITE.npm} className="nav-link w-fit text-[13.5px]" target="_blank" rel="noreferrer">
                npm package
              </a>
              <Link href="/guides" className="nav-link w-fit text-[13.5px]">
                Guides
              </Link>
            </nav>
            <nav className="flex flex-col gap-2.5">
              <p className="eyebrow mb-1">Related</p>
              <a
                href="https://github.com/panagot/Anchor-Security-Prep"
                className="nav-link w-fit text-[13.5px]"
                target="_blank"
                rel="noreferrer"
              >
                Anchor Security Prep
              </a>
              <a href={SITE.github} className="nav-link w-fit text-[13.5px]" target="_blank" rel="noreferrer">
                Report an issue
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line-soft)] pt-6">
          <p className="mono text-xs text-[var(--ink-faint)]">
            {SITE.version} · {CHECKS.length} checks · T22-001 → T22-026
          </p>
          <p className="text-xs text-[var(--ink-faint)]">
            Static heuristics — not a substitute for a professional audit.
          </p>
        </div>
      </div>
    </footer>
  );
}
