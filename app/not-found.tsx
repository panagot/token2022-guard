import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-6 py-16 text-center">
      <h1 className="display text-3xl font-bold">Page not found</h1>
      <p className="text-sm text-[var(--ink-muted)]">That route does not exist.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary text-[10px]">
          Run checks
        </Link>
        <Link href="/guides" className="btn btn-ghost text-[10px]">
          Guides
        </Link>
      </div>
    </div>
  );
}
