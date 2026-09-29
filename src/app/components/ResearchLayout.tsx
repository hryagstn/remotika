import Link from "next/link";
import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

export function PageIntro({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <header className="page-intro"><p className="eyebrow">{label}</p><h1>{title}</h1><div className="page-intro__copy">{children}</div></header>;
}

export function GuideLayout({ title, description, sections, children }: { title: string; description: string; sections: { id: string; label: string }[]; children: ReactNode }) {
  return <main className="research-page guide-page">
    <PageIntro label="Remotika / Panduan" title={title}><p>{description}</p></PageIntro>
    <div className="guide-layout">
      <aside className="guide-index">
        <nav aria-label="Daftar isi">{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</nav>
        <Separator className="my-4" />
        <Link href="/" className="quiet-link">Kembali ke direktori</Link>
      </aside>
      <div className="guide-content">{children}</div>
    </div>
  </main>;
}
