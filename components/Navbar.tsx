"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/Logo";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 md:px-10 xl:px-14">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-[var(--accent-ink)]">
          <Logo size={24} />
          <span className="display text-[15px] font-semibold leading-none text-[var(--ink)]">
            {SITE.name}
          </span>
        </Link>

        <nav
          className="flex max-w-[62vw] items-center gap-5 overflow-x-auto sm:max-w-none"
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
            className="nav-link hidden shrink-0 md:inline"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <Link href="/" className="btn btn-primary shrink-0">
            Run checks
          </Link>
        </nav>
      </div>
    </header>
  );
}
