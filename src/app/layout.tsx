import type { Metadata } from "next";
import "./globals.css";
import "./research.css";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Remotika | Direktori Perusahaan Ramah-Remote untuk Talenta Indonesia",
  description: "Cari perusahaan global dan lokal dengan jejak publik talenta Indonesia. Bandingkan bukti anggota, lowongan, dan sumber datanya.",
  keywords: ["kerja remote", "developer indonesia", "lowongan remote indonesia", "perusahaan terverifikasi", "keanggotaan github", "freelancer indonesia", "remote work indonesia"],
  authors: [{ name: "Remotika Team" }],
  metadataBase: new URL("https://remotika.my.id"),
  openGraph: {
    title: "Remotika - Perusahaan Remote Terverifikasi untuk Talenta Indonesia",
    description: "Cari perusahaan global dan lokal dengan jejak publik talenta Indonesia. Lihat lowongan dan sumber datanya.",
    url: "/",
    siteName: "Remotika",
    type: "website",
    images: [
      {
        url: "/og-directory.png",
        width: 1200,
        height: 630,
        alt: "Remotika - Direktori Perusahaan Remote Terverifikasi untuk Talenta Indonesia"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Remotika - Perusahaan Remote Terverifikasi untuk Talenta Indonesia",
    description: "Temukan perusahaan teknologi global dan lokal yang terbukti mempekerjakan developer dari Indonesia.",
    images: ["/og-directory.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn("h-full antialiased scroll-smooth", "font-sans", geist.variable)}
    >
      <body className="min-h-full">
        <TooltipProvider>
          <SiteHeader />
          <div className="site-content">
            <div className="site-content__page">{children}</div>
          </div>
          <SiteFooter />
        </TooltipProvider>
      </body>
    </html>
  );
}
