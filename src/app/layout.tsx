import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    ),
  ),
  title: {
    default: "Hephaestus' Automaton — Curated AI Directory & Library",
    template: "%s — Hephaestus' Automaton",
  },
  description:
    "A curated, public directory of AI models, applications, developer tools, hardware, and learning resources. Metadata and canonical links only.",
  openGraph: {
    type: "website",
    siteName: "Hephaestus' Automaton",
    title: "Hephaestus' Automaton — Curated AI Directory & Library",
    description:
      "A curated, public directory of AI models, applications, developer tools, hardware, and learning resources.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
