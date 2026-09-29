import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCompanies } from "../../actions";
import BadgeEmbed from "./BadgeEmbed";
import ShareCompany from "./ShareCompany";

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const companies = await getCompanies();
  const params: { id: string }[] = [];
  companies.forEach((c) => {
    if (c.id) {
      params.push({ id: c.id });
    }
    if (c.githubOrg) {
      params.push({ id: c.githubOrg.toLowerCase() });
    } else {
      const slug = slugify(c.name);
      if (slug) {
        params.push({ id: slug });
      }
    }
  });
  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const companies = await getCompanies();
  const decodedId = decodeURIComponent(id).toLowerCase();
  const company = companies.find(
    (c) =>
      c.id.toLowerCase() === decodedId ||
      c.githubOrg.toLowerCase() === decodedId ||
      (c.githubOrg === "" && slugify(c.name) === decodedId)
  );

  if (!company) {
    return {
      title: "Perusahaan Tidak Ditemukan | Remotika",
      description: "Profil perusahaan ini tidak dapat ditemukan di Remotika."
    };
  }

  return {
    title: `${company.name} | Profil Perusahaan Remotika`,
    description: `Verifikasi talenta remote Indonesia dan lowongan aktif di ${company.name} pada Remotika. ${company.industry || ""}`,
    openGraph: {
      title: `${company.name} - Lowongan Remote Terverifikasi untuk Talenta Indonesia`,
      description: `Lihat anggota GitHub publik dari Indonesia yang bekerja di ${company.name}.`,
      type: "website"
    }
  };
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { id } = await params;
  const companies = await getCompanies();
  const decoded = decodeURIComponent(id).toLowerCase();
  const company = companies.find(c => c.id.toLowerCase() === decoded || c.githubOrg.toLowerCase() === decoded || (!c.githubOrg && slugify(c.name) === decoded));
  if (!company) notFound();
  const jobs = company.activeJobs || [];
  const slug = company.githubOrg?.toLowerCase() || slugify(company.name) || company.id;
  const date = company.lastVerifiedAt ? new Intl.DateTimeFormat("id-ID", {day:"numeric",month:"long",year:"numeric"}).format(new Date(company.lastVerifiedAt)) : "Belum diperiksa";
  return <main className="research-page profile-page">
    <Link href="/" className="back-link">← Semua perusahaan</Link>
    <header className="profile-intro"><div className="company-monogram company-monogram--large" aria-hidden="true">{company.name.slice(0,2).toUpperCase()}</div><div><p className="eyebrow">Profil perusahaan</p><h1>{company.name}</h1>{company.industry && <p>{company.industry}</p>}<div className="profile-links">{company.website && <a href={company.website} target="_blank" rel="noopener noreferrer">Situs perusahaan ↗</a>}{company.githubOrg && <a href={company.githubOrgUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}{company.gitlabOrgUrl && <a href={company.gitlabOrgUrl} target="_blank" rel="noopener noreferrer">GitLab ↗</a>}</div></div></header>
    <div className="profile-layout">
      <div className="profile-content">
        <section id="lowongan"><div className="section-heading"><h2>Lowongan tercatat</h2><span>{jobs.length} posisi</span></div><p className="section-description">Periksa kembali syarat lokasi dan ketersediaan di halaman perekrutan.</p>
          {jobs.length ? <ul className="job-list">{jobs.map((job,index)=><li key={job.url+index}><a href={job.url} target="_blank" rel="noopener noreferrer"><h3>{job.title}</h3><span aria-hidden="true">↗</span></a><p>{job.location || "Lokasi: lihat halaman lowongan"}{job.salary ? " · "+job.salary : ""}</p>{job.tags.length>0 && <p className="job-tags">{job.tags.slice(0,4).join(" · ")}</p>}</li>)}</ul> : <div className="margin-note"><p>Belum ada lowongan dalam data yang tersimpan.</p>{company.jobSources?.careerPageUrl && <a href={company.jobSources.careerPageUrl} target="_blank" rel="noopener noreferrer">Periksa halaman karier ↗</a>}</div>}
          {jobs.length>0 && <details className="disclosure profile-tools apple-page"><summary>Bagikan halaman perusahaan</summary><div><ShareCompany companyName={company.name} companyId={company.id} companySlug={slug} verifiedCount={company.verifiedIndonesianCount} hasActiveJobs={company.hasActiveJobs}/></div></details>}
        </section>
        <section id="bukti"><div className="section-heading"><h2>Bukti publik</h2><span>{company.verifiedMembers.length} anggota</span></div><p className="section-description">Profil berikut mencantumkan lokasi di Indonesia dan memiliki jejak publik pada organisasi ini.</p>
          {company.verifiedMembers.length ? <ul className="member-list">{company.verifiedMembers.map(member=><li key={member.id}><a href={member.githubProfileUrl} target="_blank" rel="noopener noreferrer"><span>{member.githubLogin}</span><span aria-hidden="true">↗</span></a><span>{member.locationRaw || "Indonesia"} · {member.provider === "gitlab" ? "GitLab" : "GitHub"}</span></li>)}</ul> : <div className="margin-note"><p>Belum ditemukan anggota publik dengan lokasi Indonesia. Keanggotaan privat tidak terlihat dalam pemeriksaan ini.</p></div>}
          <p className="source-note">Jejak publik tidak memastikan status kontrak atau pola kerja seseorang. <Link href="/cara-kerja#batasan">Baca batasan data →</Link></p>
          <Link href={`/suggest-yourself?company=${encodeURIComponent(company.name)}&org=${encodeURIComponent(company.githubOrg || company.gitlabOrg || "")}`} className="quiet-link">Anda anggota perusahaan ini? Tambahkan bukti →</Link>
          {company.githubOrg && <details className="disclosure profile-tools apple-page"><summary>Pasang badge di README</summary><div><BadgeEmbed githubOrg={company.githubOrg}/></div></details>}
        </section>
        {company.testimonials && company.testimonials.length>0 && <section><h2>Pengalaman yang dibagikan</h2>{company.testimonials.map((item,index)=><blockquote className="testimonial" key={index}><p>{item.text}</p><footer>{item.name} · {item.role}</footer></blockquote>)}</section>}
      </div>
      <aside className="profile-facts"><h2>Catatan direktori</h2><dl className="definition-list"><div><dt>Status</dt><dd>{company.status==="watchlist"?"Belum ada bukti publik":company.label}</dd></div><div><dt>Diperiksa</dt><dd>{date}</dd></div>{company.headquarters && <div><dt>Kantor pusat</dt><dd>{company.headquarters}</dd></div>}{company.foundationYear && <div><dt>Didirikan</dt><dd>{company.foundationYear}</dd></div>}</dl><nav aria-label="Bagian profil"><a href="#lowongan">Lowongan</a><a href="#bukti">Bukti publik</a></nav><Link href="/berkontribusi">Laporkan koreksi →</Link></aside>
    </div>
  </main>;
}
