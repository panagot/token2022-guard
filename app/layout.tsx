import type { Metadata } from "next";
import { IBM_Plex_Mono, Syne } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
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
    "Pre-mainnet safety checks for Solana Token-2022 integrations. 26 checks for transfer hooks, fees, delegates, pointers, and vault wiring.",
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
          <Navbar />
          <main id="main-content" className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
