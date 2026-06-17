import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Remotika | Companies Hiring Verified Indonesian Remote Talents",
  description: "Identify global, foreign tech companies proven to hire Indonesian developers. Highly-accurate data verified directly via GitHub organization memberships.",
  keywords: ["remote work", "indonesian developers", "remote jobs indonesia", "verified companies", "github org memberships", "freelancer indonesia"],
  authors: [{ name: "Remotika Team" }],
  openGraph: {
    title: "Remotika - Verified Remote Companies for Indonesian Talent",
    description: "Identify global, foreign tech companies proven to hire Indonesian developers. No self-reported claims, verified via GitHub organization memberships.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#030712] text-[#f3f4f6]">
        {children}
      </body>
    </html>
  );
}
