import type { Metadata } from "next";
import { IBM_Plex_Mono, Syne } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Token2022 Guard",
    template: "%s · Token2022 Guard",
  },
  description:
    "Pre-mainnet safety checks for Solana Token-2022 integrations. 15 checks for transfer hooks, fees, delegates, and account sizing.",
  metadataBase: new URL("https://token2022-guard.vercel.app"),
  openGraph: {
    title: "Token2022 Guard",
    description: "Pre-mainnet safety checks for Solana Token-2022 integrations",
    type: "website",
    url: "https://token2022-guard.vercel.app",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${ibmPlexMono.variable} antialiased`}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <div className="app-shell">
          <header className="border-b border-[var(--line)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-baseline gap-2">
                <span className="display text-lg font-bold text-[var(--accent)]">Token2022</span>
                <span className="display text-lg font-bold">Guard</span>
              </Link>
              <nav className="flex items-center gap-5">
                <a
                  className="nav-link"
                  href="https://github.com/panagot/token2022-guard"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                <a
                  className="nav-link"
                  href="https://spl.solana.com/token-2022/extensions"
                  target="_blank"
                  rel="noreferrer"
                >
                  Spec
                </a>
                <span className="badge badge-pass">v0.1</span>
              </nav>
            </div>
          </header>
          <main id="main-content" className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          <footer className="border-t border-[var(--line)] py-6">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 text-xs text-[var(--ink-faint)]">
              <span>Token2022 Guard · MIT · not a substitute for a professional audit</span>
              <a
                href="https://github.com/panagot/token2022-guard"
                className="nav-link"
                target="_blank"
                rel="noreferrer"
              >
                github.com/panagot/token2022-guard
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
