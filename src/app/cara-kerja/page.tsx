import Link from "next/link";
import { GuideLayout } from "../components/ResearchLayout";

export const metadata = { title: "Sumber Data | Remotika", description: "Apa yang diperiksa Remotika, dari mana datanya berasal, dan batasannya." };

export default function CaraKerjaPage() {
  return <GuideLayout title="Apa yang kami periksa" description="Remotika menghubungkan perusahaan dengan jejak publik talenta Indonesia. Berikut cara membaca data yang ada di direktori." sections={[{id:"bukti",label:"Bukti publik"},{id:"label",label:"Arti label"},{id:"lowongan",label:"Sumber lowongan"},{id:"batasan",label:"Batasan data"},{id:"teknis",label:"Detail teknis"}]}>
    <section id="bukti"><h2>Berawal dari jejak publik</h2><p>Kami memeriksa organisasi GitHub, kontribusi, dan lokasi yang ditulis pada profil pengguna. Hasilnya membantu Anda menemukan perusahaan yang memiliki hubungan publik dengan talenta di Indonesia.</p>
      <ol className="evidence-steps">
        <li><h3>Keanggotaan organisasi</h3><p>Anggota publik organisasi dicocokkan dengan lokasi di Indonesia pada profil GitHub mereka.</p></li>
        <li><h3>Kontribusi tim</h3><p>Riwayat pull request diperiksa untuk menemukan kontributor berlokasi di Indonesia dengan peran MEMBER atau OWNER.</p></li>
        <li><h3>Email komit</h3><p>Domain email komit dicocokkan dengan situs perusahaan dan lokasi profil pengirimnya.</p></li>
      </ol>
      <p>Anda dapat membuka profil setiap anggota dari halaman perusahaan untuk memeriksa sumbernya sendiri.</p>
    </section>
    <section id="label"><h2>Label menunjukkan jumlah yang ditemukan</h2><p>Label ini merangkum jumlah talenta Indonesia yang terdeteksi melalui data publik. Label tidak menilai kualitas tempat kerja atau peluang Anda diterima.</p>
      <dl className="definition-list"><div><dt>Confirmed</dt><dd>1 talenta</dd></div><div><dt>Indonesia-Friendly</dt><dd>2–4 talenta</dd></div><div><dt>Established</dt><dd>5–9 talenta</dd></div><div><dt>Top Pick</dt><dd>10 atau lebih</dd></div><div><dt>Watchlist</dt><dd>Hubungan dengan talenta Indonesia belum ditemukan.</dd></div></dl>
    </section>
    <section id="lowongan"><h2>Lowongan berasal dari beberapa sumber</h2><p>Data diambil dari RemoteOK, Remotive, serta halaman perekrutan perusahaan melalui Greenhouse dan Workday. Kami menyaring lokasi yang relevan dengan Indonesia atau kerja remote global.</p><p>Buka tautan lowongan untuk memastikan posisi masih tersedia, lokasi yang diperbolehkan, dan syarat melamarnya. Tanggal pemeriksaan di direktori menunjukkan usia data yang tersimpan.</p></section>
    <section id="batasan"><h2>Ada hal yang tidak bisa dipastikan</h2><ul className="prose-list"><li>Keanggotaan GitHub tidak membuktikan status kontrak, gaji, atau pola kerja remote seseorang.</li><li>Lokasi profil ditulis oleh pengguna dan bisa berubah atau tidak lengkap.</li><li>Keanggotaan privat tidak terlihat. Jumlah di direktori bukan jumlah seluruh karyawan Indonesia.</li><li>Perusahaan yang pernah bekerja dengan talenta Indonesia belum tentu sedang merekrut dari Indonesia.</li></ul><div className="margin-note"><p>Menemukan data yang keliru?</p><Link href="/berkontribusi">Laporkan koreksi beserta sumbernya →</Link></div></section>
    <section id="teknis"><h2>Untuk yang ingin melihat lebih jauh</h2>
      <details className="disclosure"><summary>Penyimpanan dan pembaruan data</summary><div><p>Direktori menggunakan berkas JSON dalam repositori. Pipeline dijalankan lewat GitHub Actions; hasilnya disimpan melalui commit dan digunakan saat aplikasi dibangun ulang.</p><p>Antarmuka dibangun dengan Next.js, React, dan Tailwind CSS. Filter direktori berjalan di browser.</p></div></details>
      <details className="disclosure"><summary>Normalisasi teks</summary><div><p>Pipeline menangani kerusakan encoding dan menerjemahkan tulisan non-Latin agar deskripsi dari berbagai sumber lebih mudah dibaca.</p></div></details>
      <details className="disclosure"><summary>Privasi dan akses sumber</summary><div><p>Pemindaian menggunakan API publik. Keanggotaan dan repositori privat tidak diakses. Verifikasi mandiri menggunakan informasi profil publik GitHub atau GitLab.</p><Link href="/berkontribusi#api-docs">Lihat dokumentasi API →</Link></div></details>
    </section>
  </GuideLayout>;
}
