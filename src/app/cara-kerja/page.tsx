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
  Globe
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

const TelegramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 16 16" 
    fill="currentColor"
  >
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/>
  </svg>
);

export const metadata = {
  title: "Cara Kerja | Remotika",
  description: "Pelajari bagaimana Remotika melakukan verifikasi perusahaan remote menggunakan API GitHub, RemoteOK, dan Remotive secara transparan.",
  openGraph: {
    title: "Cara Kerja | Remotika",
    description: "Pelajari proses deteksi otomatis, saringan kontributor, dan validasi email komit kami untuk melacak perusahaan global yang ramah talenta Indonesia.",
    url: "/cara-kerja",
    type: "website",
    images: [
      {
        url: "/og-directory.png",
        width: 1200,
        height: 630,
        alt: "Remotika - Alur Verifikasi Otomatis"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Cara Kerja | Remotika",
    description: "Bagaimana alur verifikasi otomatis kami mengidentifikasi perusahaan ramah developer Indonesia.",
    images: ["/og-directory.png"]
  }
};

export default function CaraKerjaPage() {
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
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">v1.4</span>
              </div>
            </Link>
            <Link href="/" className="text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/5 transition-all">
              Direktori
            </Link>
            <Link href="/cara-kerja" className="text-xs font-semibold text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-all">
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
            {/* Telegram Channel Link */}
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
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10 space-y-16 pt-20">
        
        {/* Intro Hero */}
        <section className="text-center space-y-6 animate-fade-in max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Sistem Verifikasi Transparan & Bebas Klaim Palsu</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-outfit text-white">
            Bagaimana <span className="text-gradient">Remotika Bekerja?</span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 leading-relaxed font-inter">
            Berbeda dengan direktori lowongan kerja lainnya yang mengandalkan deskripsi buatan sendiri yang mudah dipalsukan, Remotika menggunakan pendekatan berbasis pembuktian teknis yang 100% dapat diaudit langsung ke data publik GitHub.
          </p>
        </section>

        {/* Tiga Saringan Utama */}
        <section className="space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-outfit text-white flex items-center justify-center md:justify-start space-x-2">
              <Layers className="w-5 h-5 text-brand-secondary" />
              <span>Tiga Lapis Saringan Data</span>
            </h2>
            <p className="text-sm text-white/50">
              Pipa data kami mengeksekusi tiga proses penyaringan otomatis untuk membuktikan keberadaan pengembang Indonesia di sebuah perusahaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Saringan A */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Saringan A: Public Members</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Pipa data mengambil keanggotaan organisasi publik dari perusahaan di GitHub. Profil anggota kemudian dicocokkan dengan kata kunci lokasi Indonesia (misal: <em>Jakarta, Bandung, Yogyakarta, Bali</em>).
                </p>
              </div>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 self-start mt-4">
                Verifikasi Profil Langsung
              </span>
            </div>

            {/* Saringan B */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Saringan B: PR Association</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Memindai riwayat kontribusi Pull Request terakhir pada repositori publik organisasi. Jika kontributor PR tersebut berlokasi di Indonesia dan memiliki peran resmi sebagai <strong>MEMBER</strong> atau <strong>OWNER</strong> pada organisasi itu, mereka ditandai sebagai anggota tim.
                </p>
              </div>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 self-start mt-4">
                Verifikasi Kontribusi Tim
              </span>
            </div>

            {/* Saringan C */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Saringan C: Commit Email</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Menganalisis domain email pada komit git terakhir (misal: <code>name@company.com</code>). Jika domain email cocok dengan domain situs resmi perusahaan dan profil pengirim komit berlokasi di Indonesia, hubungan kerja dianggap valid.
                </p>
              </div>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 self-start mt-4">
                Verifikasi Email Korporat
              </span>
            </div>
          </div>
        </section>

        {/* Sumber API Terintegrasi */}
        <section className="space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-outfit text-white flex items-center justify-center md:justify-start space-x-2">
              <Database className="w-5 h-5 text-brand-primary" />
              <span>Utilisasi API & Integrasi Data</span>
            </h2>
            <p className="text-sm text-white/50">
              Remotika mengintegrasikan data dari beberapa API publik tepercaya untuk menyajikan data yang kaya, akurat, dan selalu diperbarui.
            </p>
          </div>

          <div className="space-y-4">
            {/* GitHub API */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <GithubIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">GitHub API (Verifikasi & Validasi)</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Menjadi fondasi utama untuk memindai organisasi, mengambil informasi publik pengembang, dan memproses metadata komit/PR. Token API kami bekerja memproses data secara terjadwal untuk menjaga keaslian statistik anggota di Direktori.
                </p>
              </div>
            </div>

            {/* RemoteOK API */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">RemoteOK API (Lowongan Pekerjaan Aktif)</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Digunakan untuk mengunduh lowongan kerja remote aktif secara global. Data dari RemoteOK dicocokkan dengan organisasi GitHub yang terdaftar untuk menampilkan opsi lamaran pekerjaan yang aktif bagi para pencari kerja.
                </p>
              </div>
            </div>

            {/* Remotive API */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Remotive API (Perluasan Lowongan Software Dev)</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Menyediakan tambahan daftar lowongan pekerjaan terarah pada kategori pengembangan perangkat lunak (<em>software development</em>). Kami hanya mengambil pekerjaan dengan syarat lokasi "worldwide", "anywhere", "indonesia", atau wilayah Asia (APAC) untuk menjamin relevansi lamaran.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Keamanan & Kebijakan Data */}
        <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl" />
          
          <h2 className="text-xl font-bold font-outfit text-white flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-brand-accent animate-pulse" />
            <span>Etika & Transparansi Data</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-white/70 leading-relaxed">
            <p>
              <strong>Hanya Data Publik:</strong> Pipa data Remotika berjalan sepenuhnya menggunakan data publik yang disediakan secara resmi oleh API GitHub. Kami tidak pernah memindai repositori privat atau data yang disembunyikan oleh pengguna.
            </p>
            <p>
              <strong>Audit Terbuka:</strong> Setiap pengguna dapat memverifikasi klaim kami dengan mengklik langsung nama pengembang yang tertera di profil perusahaan. Ini mengarahkan Anda langsung ke akun GitHub resmi mereka untuk diaudit secara manual.
            </p>
            <p>
              <strong>Tanpa Penyimpanan Data Pribadi:</strong> Kami tidak menyimpan alamat email, nama lengkap, atau informasi sensitif lainnya. Kami hanya menyimpan username GitHub publik dan teks lokasi raw yang ditulis oleh pengembang tersebut.
            </p>
            <p>
              <strong>Saran Berbasis Komunitas:</strong> Siapa pun dapat menyarankan organisasi baru secara bebas. Hal ini membuat database Remotika terus bertumbuh secara organik berdasarkan penemuan pengembang di lapangan.
            </p>
          </div>
        </section>

        {/* CTA Back to Direktori */}
        <section className="text-center py-4">
          <Link 
            href="/"
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all inline-flex items-center space-x-2 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Direktori</span>
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
