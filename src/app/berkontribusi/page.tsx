import React from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  CheckCircle,
  Users,
  Code,
  Mail,
  ShieldCheck,
  Database,
  Layers,
  Globe,
  Terminal,
  Heart,
  Cpu,
  GitPullRequest,
  FileText,
  ExternalLink,
  AlertCircle,
  Settings,
  Plus
} from "lucide-react";

// Inline Custom SVG for GitHub logo
const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
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

// Inline Custom SVG for Git Fork Icon
const ForkIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 15V9a4 4 0 0 0-4-4H9" />
    <line x1="6" y1="9" x2="6" y2="15" />
  </svg>
);

export const metadata = {
  title: "Panduan Kontribusi | Remotika",
  description: "Pelajari bagaimana Anda dapat berkontribusi dalam mengembangkan Remotika dan memperkuat ekosistem kerja remote pengembang Indonesia.",
};

export default function BerkontribusiPage() {
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
            <Link href="/berkontribusi" className="text-xs font-semibold text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-all">
              Berkontribusi
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <a 
              href="https://github.com/hryagstn/remotika" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all animate-pulse"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10 space-y-16 pt-20">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 animate-fade-in max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium">
            <Heart className="w-3.5 h-3.5 text-brand-secondary animate-pulse" />
            <span>Membangun Bersama Komunitas Pengembang Indonesia</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-outfit text-white">
            Panduan <span className="text-gradient">Kontribusi Remotika</span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 leading-relaxed font-inter">
            Terima kasih atas ketertarikan Anda untuk berkontribusi! Proyek ini dibangun secara open-source untuk membantu pengembang dan freelancer Indonesia memetakan perusahaan global yang terbukti mempekerjakan talenta lokal secara remote.
          </p>
        </section>

        {/* Cara Kontribusi */}
        <section className="space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-outfit text-white flex items-center justify-center md:justify-start space-x-2">
              <Layers className="w-5 h-5 text-brand-secondary" />
              <span>Cara Ikut Berkontribusi</span>
            </h2>
            <p className="text-sm text-white/50">
              Anda tidak harus menjadi ahli coding untuk berkontribusi. Kami menyambut segala bentuk partisipasi dari komunitas:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cara 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Saran Perusahaan</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Sampaikan informasi perusahaan remote asing baru yang mempekerjakan developer lokal via fitur <strong>"Sarankan Perusahaan"</strong> di Beranda. Pipa data kami akan langsung mendeteksi dan memverifikasi profil mereka.
                </p>
              </div>
              <Link 
                href="/"
                className="text-xs text-brand-primary hover:text-brand-secondary transition-all font-semibold flex items-center space-x-1 mt-4"
              >
                <span>Coba Fitur Saran</span>
                <span>→</span>
              </Link>
            </div>

            {/* Cara 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Laporkan Masalah</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Menemukan bug di UI, kejanggalan dalam pipeline data, atau kesalahan deteksi wilayah? Laporkan langsung dengan membuat Issue baru pada repositori GitHub kami.
                </p>
              </div>
              <a 
                href="https://github.com/hryagstn/remotika/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-400 hover:text-teal-300 transition-all font-semibold flex items-center space-x-1 mt-4"
              >
                <span>Buka GitHub Issue</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Cara 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Pull Request</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Suka memodifikasi kode? Bantu kami memperbaiki bug, meningkatkan performa pipeline data, memoles tampilan UI/UX, atau mengoptimalkan SEO melalui pengiriman Pull Request.
                </p>
              </div>
              <a 
                href="https://github.com/hryagstn/remotika/pulls"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 transition-all font-semibold flex items-center space-x-1 mt-4"
              >
                <span>Lihat Pull Requests</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* Memulai Pengembangan Lokal */}
        <section className="space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-outfit text-white flex items-center justify-center md:justify-start space-x-2">
              <Terminal className="w-5 h-5 text-brand-primary" />
              <span>Memulai Pengembangan Lokal</span>
            </h2>
            <p className="text-sm text-white/50">
              Jalankan Remotika secara lokal di komputer Anda untuk mulai melakukan modifikasi:
            </p>
          </div>

          <div className="space-y-6">
            {/* Prasyarat & Kloning */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 font-outfit">
                <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-brand-secondary font-mono">1</span>
                <span>Prasyarat & Kloning Repositori</span>
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-inter">
                Pastikan komputer Anda sudah terpasang <strong>Node.js (v18 ke atas)</strong> dan paket manager seperti <strong>NPM</strong> atau <strong>Yarn</strong>. Kemudian klon repositori dan masuk ke direktori proyek:
              </p>
              <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 font-mono text-xs text-brand-accent space-y-1">
                <p className="text-white/40"># Kloning via SSH atau HTTPS</p>
                <p><span className="text-brand-secondary">$</span> git clone git@github.com:hryagstn/remotika.git</p>
                <p><span className="text-brand-secondary">$</span> cd remotika</p>
              </div>
            </div>

            {/* Konfigurasi Environment */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 font-outfit">
                <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-brand-secondary font-mono">2</span>
                <span>Konfigurasi Environment Variable</span>
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-inter">
                Buat berkas bernama <code className="text-brand-secondary bg-white/5 px-1 py-0.5 rounded text-[11px]">.env</code> di direktori utama proyek. Masukkan konfigurasi berikut:
              </p>
              <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 font-mono text-xs text-white/70 space-y-2">
                <div>
                  <p className="text-white/40"># Personal Access Token klasik untuk memindai organisasi GitHub tanpa kena rate limit</p>
                  <p><span className="text-teal-400">GITHUB_TOKEN</span>=<span className="text-brand-accent">isi_dengan_token_github_pat_anda</span></p>
                </div>
                <div>
                  <p className="text-white/40"># URL Repositori Utama</p>
                  <p><span className="text-teal-400">NEXT_PUBLIC_GITHUB_REPO</span>=<span className="text-brand-accent">https://github.com/hryagstn/remotika</span></p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-400 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Anda dapat membuat GitHub Personal Access Token klasik dengan hak akses minimal (tanpa mencentang scope apapun untuk akses data publik saja) di akun GitHub Anda.</span>
              </div>
            </div>

            {/* Instalasi & Menjalankan */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 font-outfit">
                <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-brand-secondary font-mono">3</span>
                <span>Instalasi & Jalankan Server Lokal</span>
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-inter">
                Lakukan instalasi seluruh dependensi proyek, kemudian aktifkan development server lokal:
              </p>
              <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 font-mono text-xs text-brand-accent space-y-3">
                <div>
                  <p className="text-white/40"># Mengunduh paket-paket dependensi</p>
                  <p><span className="text-brand-secondary">$</span> npm install</p>
                </div>
                <div>
                  <p className="text-white/40"># Menjalankan Next.js development server</p>
                  <p><span className="text-brand-secondary">$</span> npm run dev</p>
                </div>
              </div>
              <p className="text-xs text-white/50 font-inter">
                Buka tautan <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">http://localhost:3000</a> di browser Anda untuk melihat aplikasi berjalan.
              </p>
            </div>
          </div>
        </section>

        {/* Pipeline Data & Verifikasi */}
        <section className="space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-outfit text-white flex items-center justify-center md:justify-start space-x-2">
              <Cpu className="w-5 h-5 text-brand-secondary" />
              <span>Menguji Pipa Data Lokal</span>
            </h2>
            <p className="text-sm text-white/50">
              Untuk menguji bagaimana pipa data kami mengumpulkan data lowongan kerja global serta memverifikasi pengembang Indonesia secara otomatis:
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <p className="text-xs text-white/60 leading-relaxed font-inter">
              Pipa data (*data pipeline*) kami dapat dijalankan secara terpisah dari server web dengan mengeksekusi script mandiri menggunakan perintah:
            </p>
            
            <div className="bg-[#090d16] p-4 rounded-xl border border-white/5 font-mono text-xs text-brand-accent">
              <p className="text-white/40"># Menjalankan integrasi lowongan kerja & deteksi talenta GitHub</p>
              <p><span className="text-brand-secondary">$</span> npm run pipeline</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">3 Tahapan Saringan yang Berjalan di Pipeline:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">Saringan A</span>
                  <p className="text-[11px] font-bold text-white">Public Members</p>
                  <p className="text-[10px] text-white/50 leading-relaxed font-inter">Memeriksa lokasi profil GitHub member organisasi publik terhadap kata kunci wilayah Indonesia.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">Saringan B</span>
                  <p className="text-[11px] font-bold text-white">PR Association</p>
                  <p className="text-[10px] text-white/50 leading-relaxed font-inter">Mendeteksi aktivitas pengiriman Pull Request ke repositori organisasi oleh kontributor resmi asal Indonesia.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">Saringan C</span>
                  <p className="text-[11px] font-bold text-white">Commit Email</p>
                  <p className="text-[10px] text-white/50 leading-relaxed font-inter">Mencocokkan domain email komit git dengan domain perusahaan untuk mengonfirmasi relasi kerja internal.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alur Kerja Pull Request */}
        <section className="space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-outfit text-white flex items-center justify-center md:justify-start space-x-2">
              <ForkIcon className="w-5 h-5 text-brand-primary" />
              <span>Siklus Kerja Pengiriman Pull Request</span>
            </h2>
            <p className="text-sm text-white/50">
              Ikuti langkah terstruktur ini untuk memastikan Pull Request Anda dapat langsung diterima dan di-merge:
            </p>
          </div>

          {/* Timeline */}
          <div className="relative border-l border-white/10 pl-6 ml-4 space-y-10 py-2">
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-[#030712] border border-brand-primary flex items-center justify-center text-xs text-brand-primary font-bold">1</span>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit">Lakukan Fork & Buat Branch Baru</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Lakukan Fork pada repositori Remotika di GitHub, kemudian buat branch baru di repositori lokal Anda untuk menampung perubahan:
                </p>
                <div className="bg-[#090d16] p-3 rounded-xl border border-white/5 font-mono text-xs text-brand-accent">
                  <p><span className="text-brand-secondary">$</span> git checkout -b fitur/fitur-keren-anda</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-[#030712] border border-teal-400 flex items-center justify-center text-xs text-teal-400 font-bold">2</span>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit">Lakukan Perubahan & Verifikasi Build</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Tulis kode atau perbaikan Anda. Sebelum melakukan commit, selalu pastikan seluruh kode berhasil dikompilasi dengan sukses tanpa ada error TypeScript atau Next.js:
                </p>
                <div className="bg-[#090d16] p-3 rounded-xl border border-white/5 font-mono text-xs text-brand-accent">
                  <p><span className="text-brand-secondary">$</span> npm run build</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-[#030712] border border-blue-400 flex items-center justify-center text-xs text-blue-400 font-bold">3</span>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit">Commit Perubahan dengan Pesan Jelas</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Tulis commit Anda menggunakan format pesan commit yang jelas dan deskriptif agar mudah dipahami saat proses review:
                </p>
                <div className="bg-[#090d16] p-3 rounded-xl border border-white/5 font-mono text-xs text-brand-accent">
                  <p><span className="text-brand-secondary">$</span> git commit -m "feat: menambah filter pencarian dinamis"</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-[#030712] border border-purple-400 flex items-center justify-center text-xs text-purple-400 font-bold">4</span>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit">Push & Kirim Pull Request</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Kirim perubahan Anda ke branch fork Anda di GitHub, lalu ajukan Pull Request ke repositori utama kami:
                </p>
                <div className="bg-[#090d16] p-3 rounded-xl border border-white/5 font-mono text-xs text-brand-accent">
                  <p><span className="text-brand-secondary">$</span> git push origin fitur/fitur-keren-anda</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lisensi Proyek */}
        <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl" />
          
          <h2 className="text-xl font-bold font-outfit text-white flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-brand-accent animate-pulse" />
            <span>Lisensi Kontribusi</span>
          </h2>
          
          <p className="text-xs text-white/70 leading-relaxed font-inter">
            Dengan ikut mengirimkan kontribusi ke repositori <strong className="text-white font-semibold">Remotika</strong>, Anda menyetujui bahwa seluruh kode, teks, maupun dokumentasi yang Anda sumbangkan akan dilisensikan secara resmi di bawah <strong className="text-white font-semibold">Lisensi MIT</strong> yang melekat pada proyek ini.
          </p>
        </section>

        {/* CTA Back to Beranda */}
        <section className="text-center py-4">
          <Link 
            href="/"
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all inline-flex items-center space-x-2 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Beranda</span>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border-faint py-6 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} Remotika. Dibuat dengan transparansi untuk pengembang Indonesia.</p>
      </footer>
    </div>
  );
}
