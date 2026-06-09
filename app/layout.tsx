import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="app-shell">
          <Navbar />
          <main id="main-content" className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 md:px-10 md:py-14 xl:px-14">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
