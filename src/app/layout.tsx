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
  title: "Remotika | Temukan Perusahaan Remote Terverifikasi",
  description: "Temukan perusahaan teknologi asing yang terbukti mempekerjakan developer dari Indonesia. Data akurat 100% yang diverifikasi langsung dari keanggotaan organisasi GitHub.",
  keywords: ["kerja remote", "developer indonesia", "lowongan remote indonesia", "perusahaan terverifikasi", "keanggotaan github", "freelancer indonesia"],
  authors: [{ name: "Remotika Team" }],
  openGraph: {
    title: "Remotika - Perusahaan Remote Terverifikasi untuk Talenta Indonesia",
    description: "Temukan perusahaan teknologi asing yang terbukti mempekerjakan developer dari Indonesia. Tanpa klaim sepihak, diverifikasi langsung via organisasi GitHub.",
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
