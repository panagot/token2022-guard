import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-20 text-center">
      <p className="mono text-sm text-[var(--accent-ink)]">404</p>
      <h1 className="display text-[2rem] text-[var(--ink)]">This page is off the map</h1>
      <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
        That route does not exist. Head back to the analyzer or browse the guides.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary">
          Run checks
        </Link>
        <Link href="/guides" className="btn btn-ghost">
          Guides
        </Link>
      </div>
    </div>
  );
}
