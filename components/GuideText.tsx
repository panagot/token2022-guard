import Link from "next/link";

const PATH_RE = /(\/[a-z0-9][a-z0-9-/]*)/g;

/** Renders plain text with internal paths like /use-cases/foo as Next.js links. */
export function GuideText({ text }: { text: string }) {
  const parts = text.split(PATH_RE);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("/") ? (
          <Link key={i} href={part} className="nav-link">
            {part}
          </Link>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
