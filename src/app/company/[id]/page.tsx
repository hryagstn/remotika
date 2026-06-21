import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Globe, 
  MapPin, 
  Layers, 
  Calendar, 
  Briefcase, 
  Users, 
  ExternalLink,
  Quote
} from "lucide-react";
import { getCompanies } from "../../actions";
import BadgeEmbed from "./BadgeEmbed";

interface PageProps {
  params: Promise<{ id: string }>;
}

const GithubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export async function generateStaticParams() {
  const companies = await getCompanies();
  return companies.map((c) => ({
    id: c.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const companies = await getCompanies();
  const company = companies.find((c) => c.id === id);

  if (!company) {
    return {
      title: "Perusahaan Tidak Ditemukan | Remotika",
      description: "Profil perusahaan ini tidak dapat ditemukan di Remotika."
    };
  }

  return {
    title: `${company.name} | Profil Perusahaan Remotika`,
    description: `Verifikasi talenta remote Indonesia dan lowongan aktif di ${company.name} pada Remotika. ${company.industry}`,
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
  const company = companies.find((c) => c.id === id);

  if (!company) {
    notFound();
  }

  const getLabelStyles = (label: string) => {
    switch (label) {
      case "Top Pick":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Established":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "Indonesia-Friendly":
        return "bg-teal-500/10 text-teal-400 border-teal-500/30";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  const getTierFlatColor = (label: string) => {
    switch (label) {
      case "Top Pick":
        return "bg-amber-600";
      case "Established":
        return "bg-purple-600";
      case "Indonesia-Friendly":
        return "bg-teal-600";
      default:
        return "bg-blue-600";
    }
  };

  const formattedDate = company.lastVerifiedAt 
    ? new Date(company.lastVerifiedAt).toLocaleDateString("id-ID", { year: 'numeric', month: 'long' })
    : "N/A";

  const memberInitials = (login: string) => {
    return login.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative min-h-screen bg-bg-base overflow-hidden flex flex-col grid-pattern">
      {/* Navigation Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-border-faint backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="Remotika Logo" className="w-9 h-9 object-contain rounded-xl shadow-lg shadow-brand-primary/20" />
              <div>
                <span className="text-lg font-bold tracking-tight text-white font-outfit">Remotika</span>
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">v1.2</span>
              </div>
            </Link>
            <Link href="/" className="text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/5 transition-all">
              Beranda
            </Link>
            <Link href="/cara-kerja" className="text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/5 transition-all">
              Cara Kerja
            </Link>
            <Link href="/readiness-check" className="text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/5 transition-all">
              Cek Kesiapan
            </Link>
            <Link href="/berkontribusi" className="text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/5 transition-all">
              Berkontribusi
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <a 
              href={process.env.NEXT_PUBLIC_GITHUB_REPO || "https://github.com/hryagstn/remotika"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10 space-y-10 pt-20">
        
        {/* Back Link & Hero Profile Header */}
        <header className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Direktori</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${getTierFlatColor(company.label)}`}>
                <span className="text-white font-black text-2xl font-title-md">{company.name.substring(0, 2).toUpperCase()}</span>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-outfit text-text-primary">{company.name}</h1>
                  <span className={`px-3 py-1 border rounded-full font-label-xs text-[10px] uppercase tracking-wider font-bold ${getLabelStyles(company.label)}`}>
                    {company.label}
                  </span>
                </div>
                <p className="max-w-2xl text-text-secondary font-body-base text-sm sm:text-base leading-relaxed">
                  {company.industry}
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className="flex gap-2.5">
              {company.remoteokSlug && (
                <a 
                  href={`https://remoteok.com/companies/${company.remoteokSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center hover:bg-white/10 text-text-secondary hover:text-white transition-all border border-border-default shadow-sm"
                  title="Lihat di RemoteOK"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              <a 
                href={company.githubOrgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center hover:bg-white/10 text-text-secondary hover:text-white transition-all border border-border-default shadow-sm"
                title="Lihat Organisasi GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-border-default hover:border-border-hover transition-all">
            <p className="text-text-muted font-caption text-xs uppercase tracking-wider mb-1 font-semibold">Dampak</p>
            <p className="font-bold text-lg text-text-primary flex items-center gap-1.5 font-outfit">
              <Users className="w-4 h-4 text-brand-primary" />
              <span>{company.verifiedIndonesianCount} Anggota Terverifikasi</span>
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border-border-default hover:border-border-hover transition-all">
            <p className="text-text-muted font-caption text-xs uppercase tracking-wider mb-1 font-semibold">Status Jaringan</p>
            <p className="font-bold text-lg text-text-primary flex items-center gap-1.5 font-outfit">
              <span className="text-brand-secondary">⚡</span>
              <span>Level {company.label}</span>
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border-border-default hover:border-border-hover transition-all">
            <p className="text-text-muted font-caption text-xs uppercase tracking-wider mb-1 font-semibold">Terakhir Diperiksa</p>
            <p className="font-bold text-lg text-text-primary flex items-center gap-1.5 font-outfit">
              <span className="text-brand-accent">✓</span>
              <span>{formattedDate}</span>
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Indonesian Talent Network */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold font-outfit text-text-primary">Jaringan Talenta Indonesia</h2>
                <span className="text-xs text-text-muted font-semibold bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                  {company.verifiedMembers.length} developer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.verifiedMembers.map((member) => (
                  <a 
                    key={member.id}
                    href={member.githubProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-bg-surface border border-border-faint p-4 rounded-2xl flex items-center gap-4 hover:-translate-y-0.5 hover:border-white/10 transition-all group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border-faint flex items-center justify-center text-text-primary font-bold shadow-inner font-outfit group-hover:bg-brand-primary/10 transition-colors">
                      {memberInitials(member.githubLogin)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-text-primary font-semibold truncate group-hover:text-brand-primary transition-colors text-sm">{member.githubLogin}</h4>
                      <p className="text-text-muted font-body-sm text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span className="truncate">{member.locationRaw || "Indonesia"}</span>
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* Testimonials Section */}
            {company.testimonials && company.testimonials.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold font-outfit text-text-primary">Testimoni Karyawan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.testimonials.map((test, idx) => (
                    <div 
                      key={idx}
                      className="bg-bg-surface border border-border-faint p-6 rounded-2xl relative overflow-hidden group hover:border-brand-primary/30 transition-colors shadow-sm"
                    >
                      <Quote className="text-brand-primary opacity-10 absolute top-4 right-4 w-12 h-12" />
                      <p className="text-text-secondary text-xs sm:text-sm italic relative z-10 leading-relaxed mb-6 font-medium">
                        "{test.text}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-text-primary font-bold text-xs">
                          {test.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-text-primary font-bold text-xs">{test.name}</h4>
                          <p className="text-text-muted text-[10px] mt-0.5">{test.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Active Job Openings */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold font-outfit text-text-primary">Lowongan Kerja Aktif</h2>
                <span className="px-2.5 py-0.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full font-label-xs text-xs font-semibold">
                  {company.activeJobs ? company.activeJobs.length : 0} Lowongan
                </span>
              </div>

              <div className="space-y-3">
                {company.activeJobs && company.activeJobs.length > 0 ? (
                  company.activeJobs.map((job, idx) => (
                    <a 
                      key={idx}
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-bg-surface border border-border-faint p-5 rounded-2xl hover:border-brand-primary/30 hover:-translate-y-0.5 transition-all flex justify-between items-center group shadow-sm"
                    >
                      <div className="space-y-2">
                        <h4 className="text-text-primary font-bold text-sm sm:text-base group-hover:text-brand-primary transition-colors">{job.title}</h4>
                        <div className="flex flex-wrap gap-2.5 items-center">
                          <span className="flex items-center gap-1 text-text-muted text-[11px] font-semibold">
                            <MapPin className="w-3 h-3 text-brand-primary" /> Global Remote
                          </span>
                          <span className="text-white/20 select-none">•</span>
                          <span className="flex items-center gap-1 text-text-muted text-[11px] font-semibold">
                            <Briefcase className="w-3 h-3 text-brand-secondary" /> {job.tags.slice(0, 3).join(", ")}
                          </span>
                          {job.salary && (
                            <>
                              <span className="text-white/20 select-none">•</span>
                              <span className="text-brand-accent text-[11px] font-bold">{job.salary} / tahun</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-text-faint group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </a>
                  ))
                ) : (
                  <div className="bg-bg-surface border border-border-faint p-8 text-center rounded-2xl space-y-3 text-xs">
                    <Briefcase className="w-8 h-8 text-white/20 mx-auto" />
                    <p className="text-text-secondary font-semibold">Tidak ada lowongan aktif dari API</p>
                    <p className="text-text-muted">Saat ini tidak ada lowongan remote yang cocok dari feed otomatis kami.</p>
                    {company.jobSources?.careerPageUrl && (
                      <a
                        href={company.jobSources.careerPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 hover:border-brand-primary/40 rounded-xl font-semibold text-xs transition-all hover:-translate-y-0.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Lihat Halaman Karir {company.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column (Sidebar - 1/3) */}
          <div className="space-y-6">
            
            {/* Embed Badge */}
            <BadgeEmbed githubOrg={company.githubOrg} />

            {/* Company Metadata */}
            <div className="bg-bg-surface border border-border-faint p-6 rounded-2xl space-y-6 shadow-sm">
              <h3 className="font-title-md text-title-md text-text-primary font-bold font-outfit">Metadata Perusahaan</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10">
                    <Layers className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold">Industri</p>
                    <p className="text-text-primary font-body-base text-sm font-semibold mt-0.5">Ekosistem {company.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10">
                    <MapPin className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold">Kantor Pusat</p>
                    <p className="text-text-primary font-body-base text-sm font-semibold mt-0.5">{company.headquarters || "Global Remote"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10">
                    <Calendar className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold">Didirikan</p>
                    <p className="text-text-primary font-body-base text-sm font-semibold mt-0.5">{company.foundationYear || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-faint py-10 mt-20 relative z-10 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center items-center space-x-1.5 text-xs text-white/40">
            <span>Dibuat untuk Freelancer dan Pencari Kerja Indonesia</span>
          </div>
          <p className="text-[11px] text-white/30 max-w-md mx-auto leading-relaxed">
            Data diverifikasi secara dinamis dengan memindai riwayat aktivitas organisasi publik di GitHub. Dukung open-source. Kirimkan saran Anda dan bergabunglah dalam revolusi teknologi Indonesia.
          </p>
          <div className="text-[10px] text-white/20">
            © {new Date().getFullYear()} Remotika. Hak Cipta Dilindungi Undang-Undang.
          </div>
        </div>
      </footer>
    </div>
  );
}
