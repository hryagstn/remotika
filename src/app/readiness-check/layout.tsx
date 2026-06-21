import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cek Kesiapan Kerja Remote | Remotika",
  description: "Uji dan ukur tingkat kesiapan Anda untuk melamar dan bekerja secara remote di perusahaan global dengan kuis interaktif Remotika.",
  openGraph: {
    title: "Cek Kesiapan Kerja Remote | Remotika",
    description: "Ukur kemampuan teknis, kesiapan bahasa, manajemen waktu, dan persiapan portofolio Anda untuk karir remote global melalui kuis kesiapan kami.",
    url: "/readiness-check",
    type: "website",
    images: [
      {
        url: "/og-directory.png",
        width: 1200,
        height: 630,
        alt: "Remotika - Cek Kesiapan Kerja Remote"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Cek Kesiapan Kerja Remote | Remotika",
    description: "Evaluasi kesiapan Anda untuk pasar kerja remote internasional.",
    images: ["/og-directory.png"],
  }
};

export default function ReadinessCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
