import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tambahkan Bukti Publik | Remotika",
  description: "Tambahkan bukti keanggotaan publik GitHub atau GitLab Anda ke direktori Remotika.",
  openGraph: {
    title: "Tambahkan Bukti Publik | Remotika",
    description: "Periksa profil dan keanggotaan publik Anda untuk melengkapi data direktori.",
    url: "/suggest-yourself",
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
    title: "Tambahkan Bukti Publik | Remotika",
    description: "Periksa keanggotaan publik Anda.",
    images: ["/og-directory.png"],
  }
};

export default function SuggestYourselfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
