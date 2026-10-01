"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  ShieldAlert, 
  Loader2,
  Lock,
} from "lucide-react";

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 3.513 1.305 4.37 1.002.109-.775.52-1.305.865-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const GitlabIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M23.355 10.584l-2.31-7.11a.76.76 0 0 0-.27-.37.78.76 0 0 0-.46-.14.77.77 0 0 0-.46.14.75.75 0 0 0-.27.37l-2.31 7.11H6.735l-2.31-7.11a.76.76 0 0 0-.27-.37.78.76 0 0 0-.46-.14.77.77 0 0 0-.46.14.75.75 0 0 0-.27.37L.645 10.584a1.05 1.05 0 0 0 .38 1.17l10.97 7.98 10.98-7.98a1.05 1.05 0 0 0 .38-1.17z"/>
  </svg>
);


type Outcome = "idle" | "verifying" | "verified" | "already_verified" | "not_eligible" | "not_public_member" | "error";

export default function SuggestYourselfPage() {
  return (
    <Suspense fallback={
      <div className="apple-page relative min-h-screen bg-bg-base overflow-hidden flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    }>
      <SuggestYourselfForm />
    </Suspense>
  );
}

function SuggestYourselfForm() {
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get("company") || "";
  const initialOrg = searchParams.get("org") || "";

  const [provider, setProvider] = useState<"github" | "gitlab">("github");
  const [githubUsername, setGithubUsername] = useState("");
  const [companyName, setCompanyName] = useState(initialCompany);
  const [orgSlug, setOrgSlug] = useState(initialOrg);
  
  const [outcome, setOutcome] = useState<Outcome>("idle");
  const [message, setMessage] = useState("");
  const [helpUrl, setHelpUrl] = useState("");
  const [errorDetails, setErrorDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername || !companyName || !orgSlug) return;

    setOutcome("verifying");
    setMessage("Memeriksa profil dan keanggotaan publik…");
    setErrorDetails("");

    try {
      const endpoint = provider === "github" ? "/api/verify-self" : "/api/verify-self-gitlab";

      const payload = provider === "github" 
        ? { githubUsername, companyName, orgSlug }
        : { gitlabUsername: githubUsername, groupSlug: orgSlug, companyName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        if (data.outcome === "already_verified") {
          setOutcome("already_verified");
        } else {
          setOutcome("verified");
        }
        setMessage(data.message);
      } else {
        if (data.outcome === "not_public_member") {
          setOutcome("not_public_member");
          setHelpUrl(data.helpUrl || "");
        } else if (data.outcome === "not_eligible") {
          setOutcome("not_eligible");
        } else {
          setOutcome("error");
        }
        setMessage(data.message || "Gagal memproses verifikasi mandiri.");
        if (data.error) {
          setErrorDetails(data.error);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setOutcome("error");
      setMessage("Terjadi gangguan koneksi jaringan.");
      setErrorDetails(errorMessage);
    }
  };

  const resetForm = () => {
    setOutcome("idle");
    setMessage("");
    setHelpUrl("");
    setErrorDetails("");
  };

  return (
    <div className="apple-page relative min-h-screen bg-bg-base overflow-hidden flex flex-col grid-pattern">
      {/* Background radial effects */}

      {/* Navigation Header */}

      {/* Main Content */}
      <main className="research-page verification-page">
        
        <header className="page-intro"><p className="eyebrow">Kontribusi data</p><h1>Tambahkan keanggotaan Anda</h1><p className="page-intro__copy">Bekerja di perusahaan global atau lokal ramah-remote yang belum tercatat? Periksa profil publik Anda untuk menambahkan bukti ke direktori.</p></header>
        <div className="verification-layout"><div className="verification-primary">
        {/* Verification Card / Result Box */}
        <div className="verification-form" aria-live="polite">
    
          {outcome === "idle" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Provider Selector Tabs */}
              <div className="flex p-1 rounded-2xl bg-white/5 border border-white/5 space-x-1">
                <button
                  type="button"
                  aria-pressed={provider === "github"}
                  onClick={() => { setProvider("github"); resetForm(); }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    provider === "github"
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </button>
                <button
                  type="button"
                  aria-pressed={provider === "gitlab"}
                  onClick={() => { setProvider("gitlab"); resetForm(); }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    provider === "gitlab"
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <GitlabIcon className="w-4 h-4" />
                  <span>GitLab</span>
                </button>
              </div>
              


              <div className="grid grid-cols-1 gap-6">
                
                {/* Platform Username */}
                <div className="space-y-2">
                  <label htmlFor="username" className="field-label">
                    {provider === "github" ? "Nama pengguna GitHub" : "Nama pengguna GitLab"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="contoh: hryagstn"
                      id="username"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full bg-[#080d24] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-all font-sans"
                    />
                  </div>
                  <p className="text-[15px] text-white/40 leading-7 font-sans">
                    {provider === "github" ? "Nama pada URL github.com/nama-anda, tanpa @." : "Nama pada URL gitlab.com/nama-anda, tanpa @."}
                  </p>
                </div>

                {/* Organization/Group Slug */}
                <div className="space-y-2">
                  <label htmlFor="organization" className="field-label">
                    {provider === "github" ? "Organisasi GitHub" : "Grup GitLab"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={provider === "github" ? "contoh: automattic" : "contoh: gitlab-org"}
                      id="organization"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      className="w-full bg-[#080d24] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-all font-sans"
                    />
                  </div>
                  <p className="text-[15px] text-white/40 leading-7 font-sans">
                    {provider === "github" 
                      ? "Nama pada URL github.com/organisasi." 
                      : "Nama atau path pada URL gitlab.com/grup."}
                  </p>
                </div>
              </div>

              {/* Company Name Label */}
              <div className="space-y-2">
                <label htmlFor="company" className="field-label">
                  Nama perusahaan
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="contoh: Automattic"
                    id="company"
                      value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#080d24] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-all font-sans"
                  />
                </div>
                <p className="text-[15px] text-white/40 leading-7 font-sans">
                  Nama yang akan ditampilkan di direktori.
                </p>
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
                  type="submit"
                  className="w-full py-3 px-6 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Periksa keanggotaan</span>
                </button>
              </div>
            </form>
          )}

          {/* Verification Progress Loading State */}
          {outcome === "verifying" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-outfit text-white">Memeriksa sumber publik</h3>
                <p className="text-[15px] text-white/70 leading-7 max-w-sm font-inter">
                  {message}
                </p>
              </div>
            </div>
          )}

          {/* Success Outcome: Verified */}
          {(outcome === "verified" || outcome === "already_verified") && (
            <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl font-bold font-outfit text-white">Keanggotaan ditemukan</h3>
                <p className="text-[15px] text-white/70 leading-7 font-inter">
                  {message}
                </p>
                <p className="text-[15px] text-emerald-400/80 leading-7 font-sans pt-2 bg-emerald-500/5 px-4 py-2 rounded-xl inline-block border border-emerald-500/10">
                  Perubahan telah disimpan ke dalam database statis Remotika. Selamat datang!
                </p>
              </div>
              <div className="pt-4 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Verifikasi Akun Lain
                </button>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold transition-all shadow-md shadow-brand-primary/25 hover:opacity-95 active:scale-95"
                >
                  Lihat Daftar Direktori
                </Link>
              </div>
            </div>
          )}

          {/* Error Outcome: Not Eligible (Indonesia Location Mismatch) */}
          {outcome === "not_eligible" && (
            <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl font-bold font-outfit text-white">Bukti belum memenuhi kriteria</h3>
                <p className="text-[15px] text-white/70 leading-7 font-inter">
                  {message}
                </p>
                <p className="text-[15px] text-amber-400/80 leading-7 font-sans pt-2 bg-amber-500/5 px-4 py-2 rounded-xl inline-block border border-amber-500/10">
                  Tips: Edit profil publik {provider === "github" ? "GitHub" : "GitLab"} Anda, tambahkan kota seperti &apos;Jakarta&apos;, &apos;Bandung&apos;, atau kata kunci &apos;Indonesia&apos;, simpan, lalu coba ajukan kembali.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          )}

          {/* Error Outcome: Not Public Member (Private Membership) */}
          {outcome === "not_public_member" && (
            <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 animate-pulse">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl font-bold font-outfit text-white">Keanggotaan belum terlihat publik</h3>
                <p className="text-[15px] text-white/70 leading-7 font-inter">
                  {message}
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
                {helpUrl && (
                  <a
                    href={helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-sky-600/20"
                  >
                    <span>Cara Ubah ke Publik</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Coba Verifikasi Lagi
                </button>
              </div>
            </div>
          )}

          {/* Error Outcome: Network/System Failures */}
          {outcome === "error" && (
            <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl font-bold font-outfit text-white">Terjadi Kesalahan</h3>
                <p className="text-[15px] text-white/70 leading-7 font-inter">
                  {message}
                </p>
                {errorDetails && (
                  <pre className="text-sm text-red-400 bg-red-500/5 p-3 rounded-lg border border-red-500/10 overflow-x-auto max-w-sm mx-auto font-mono text-left">
                    {errorDetails}
                  </pre>
                )}
              </div>
              <div className="pt-4">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          )}
        </div>

        </div><aside className="verification-help"><h2>Sebelum memeriksa</h2><ol className="prose-list"><li>Pastikan profil Anda mencantumkan lokasi di Indonesia.</li><li>Keanggotaan organisasi atau grup harus terlihat publik.</li><li>Masukkan nama pengguna dan organisasi sesuai URL profil.</li></ol><h3>Data yang digunakan</h3><p>Kami membaca profil dan keanggotaan publik melalui API {provider === "github" ? "GitHub" : "GitLab"}. Password dan token akun tidak diperlukan.</p><Link href="/cara-kerja#batasan">Pelajari batasan pemeriksaan →</Link><Link href="/">Kembali ke direktori →</Link></aside></div>

      </main>

      {/* Footer */}
    </div>
  );
}
