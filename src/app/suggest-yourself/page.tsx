"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  User, 
  Building, 
  Sparkles, 
  ShieldAlert, 
  Loader2,
  Lock,
  ShieldCheck
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


const TelegramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 16 16" 
    fill="currentColor"
  >
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/>
  </svg>
);

type Outcome = "idle" | "verifying" | "verified" | "already_verified" | "not_eligible" | "not_public_member" | "error";

export default function SuggestYourselfPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-bg-base overflow-hidden flex flex-col items-center justify-center">
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
    setMessage("Sedang memproses verifikasi instan...");
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
    <div className="relative min-h-screen bg-bg-base overflow-hidden flex flex-col grid-pattern">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-border-faint backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="Remotika Logo" className="w-9 h-9 object-contain rounded-xl shadow-lg shadow-brand-primary/20" />
              <div>
                <span className="text-lg font-bold tracking-tight text-white font-outfit">Remotika</span>
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">v1.4</span>
              </div>
            </Link>
            <Link href="/" className="text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/5 transition-all">
              Direktori
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
              href="https://t.me/remotika_updates" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] hover:text-[#0088cc]/90 border border-[#0088cc]/20 hover:border-[#0088cc]/35 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <TelegramIcon className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>
            <a 
              href="https://github.com/hryagstn/remotika" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all cursor-pointer"
              title="GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow space-y-10">
        
        {/* Intro Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold font-inter tracking-wide animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VERIFIKASI REAL-TIME</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-outfit tracking-tight leading-none bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Verifikasi Mandiri Instan
          </h1>
          <p className="text-sm text-text-muted leading-relaxed max-w-xl mx-auto font-inter">
            Apakah Anda talenta Indonesia yang bekerja secara remote di perusahaan asing? Daftarkan diri Anda sekarang untuk membuktikan keaslian verifikasi serta mempercepat pertumbuhan data direktori Remotika secara real-time!
          </p>
        </section>

        {/* Verification Card / Result Box */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-brand-primary to-brand-secondary" />

          {outcome === "idle" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Provider Selector Tabs */}
              <div className="flex p-1 rounded-2xl bg-white/5 border border-white/5 space-x-1">
                <button
                  type="button"
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
              


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Platform Username */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
                    {provider === "github" ? "GitHub Username Anda" : "GitLab Username Anda"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. hryagstn"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full bg-[#080d24] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all font-sans"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                    {provider === "github" ? "Username GitHub pribadi Anda (misal: @john_doe)." : "Username GitLab pribadi Anda (misal: @john_doe)."}
                  </p>
                </div>

                {/* Organization/Group Slug */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
                    {provider === "github" ? "GitHub Org Slug Perusahaan" : "GitLab Group Slug Perusahaan"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={provider === "github" ? "e.g. automattic" : "e.g. gitlab-org"}
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      className="w-full bg-[#080d24] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all font-sans"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <Building className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                    {provider === "github" 
                      ? "Slug dari organisasi GitHub tempat Anda bekerja (e.g. `automattic`)." 
                      : "Slug dari group GitLab tempat Anda bekerja (e.g. `gitlab-org`)."}
                  </p>
                </div>
              </div>

              {/* Company Name Label */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
                  Nama Perusahaan (Tampilan Label)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Automattic"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#080d24] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all font-sans"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                  Bagaimana nama perusahaan ini harus ditampilkan dalam daftar Remotika.
                </p>
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
                  type="submit"
                  className="w-full py-3 px-6 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ajukan Verifikasi Sekarang</span>
                </button>
              </div>
            </form>
          )}

          {/* Verification Progress Loading State */}
          {outcome === "verifying" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-outfit text-white">Memproses Permintaan Anda</h3>
                <p className="text-xs text-white/70 leading-relaxed max-w-sm font-inter">
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
                <h3 className="text-xl font-bold font-outfit text-white">Verifikasi Anda Berhasil!</h3>
                <p className="text-sm text-white/70 leading-relaxed font-inter">
                  {message}
                </p>
                <p className="text-[11px] text-emerald-400/80 leading-relaxed font-sans pt-2 bg-emerald-500/5 px-4 py-2 rounded-xl inline-block border border-emerald-500/10">
                  🎉 Perubahan telah disimpan ke dalam database statis Remotika. Selamat datang!
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
                <h3 className="text-xl font-bold font-outfit text-white">Tidak Memenuhi Syarat</h3>
                <p className="text-sm text-white/70 leading-relaxed font-inter">
                  {message}
                </p>
                <p className="text-[10px] text-amber-400/80 leading-relaxed font-sans pt-2 bg-amber-500/5 px-4 py-2 rounded-xl inline-block border border-amber-500/10">
                  💡 Tips: Edit profil publik GitHub Anda, tambahkan kota seperti &apos;Jakarta&apos;, &apos;Bandung&apos;, atau kata kunci &apos;Indonesia&apos;, simpan, lalu coba ajukan kembali.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Ulangi Proses
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
                <h3 className="text-xl font-bold font-outfit text-white">Keanggotaan Tersembunyi (Private)</h3>
                <p className="text-sm text-white/70 leading-relaxed font-inter">
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
                <p className="text-sm text-white/70 leading-relaxed font-inter">
                  {message}
                </p>
                {errorDetails && (
                  <pre className="text-[10px] text-red-400 bg-red-500/5 p-3 rounded-lg border border-red-500/10 overflow-x-auto max-w-sm mx-auto font-mono text-left">
                    {errorDetails}
                  </pre>
                )}
              </div>
              <div className="pt-4">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Ulangi Proses
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Informational Guidance Alert */}
        <section className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl" />
          
          <h2 className="text-sm font-bold font-outfit text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Bagaimana Proses Keamanan Berjalan?</span>
          </h2>
          
          <p className="text-xs text-white/70 leading-relaxed font-inter">
            Proses ini murni dijalankan langsung ke API publik GitHub secara real-time. Remotika <strong className="font-bold text-white">tidak pernah menyimpan</strong> password atau menanyakan kredensial apa pun dari akun Anda. Kami hanya mengecek status visibilitas keanggotaan publik organisasi Anda beserta isian kota pada akun publik Anda secara transparan.
          </p>
        </section>

        {/* Back to Home CTA */}
        <div className="text-center">
          <Link 
            href="/"
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all inline-flex items-center space-x-2 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Direktori</span>
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border-faint py-6 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} Remotika. Dibuat dengan transparansi untuk pengembang Indonesia.</p>
      </footer>
    </div>
  );
}
