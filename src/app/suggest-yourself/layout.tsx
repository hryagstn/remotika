import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Mandiri Instan | Remotika",
  description: "Daftarkan diri Anda sebagai talenta remote Indonesia secara real-time dan transparan via integrasi API organisasi GitHub.",
  openGraph: {
    title: "Verifikasi Mandiri Instan | Remotika",
    description: "Buktikan keaslian keanggotaan organisasi GitHub Anda secara real-time dan dukung keterbukaan data kerja remote talenta Indonesia.",
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
    title: "Verifikasi Mandiri Instan | Remotika",
    description: "Buktikan keaslian keanggotaan organisasi GitHub Anda secara real-time.",
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
