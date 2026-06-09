"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/Logo";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(7,9,11,0.88)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded border border-[var(--accent)] bg-[var(--accent-dim)]">
            <Logo size={28} />
          </span>
          <div className="hidden sm:block">
            <div className="display text-base font-bold leading-none text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
              {SITE.name}
            </div>
            <div className="label mt-1">{SITE.tagline}</div>
          </div>
        </Link>

        <nav
          className="flex max-w-[65vw] items-center gap-4 overflow-x-auto sm:max-w-none sm:gap-5"
          aria-label="Main"
        >
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link shrink-0"
                data-active={active}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
          <a
            href={SITE.github}
            className="nav-link shrink-0 hidden md:inline"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <Link href="/" className="btn btn-primary shrink-0 text-[10px]">
            Run checks
          </Link>
        </nav>
      </div>
    </header>
  );
}
