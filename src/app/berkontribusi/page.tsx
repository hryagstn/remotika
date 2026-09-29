import Link from "next/link";
import { GuideLayout } from "../components/ResearchLayout";
import ShareApiLink from "./ShareApiLink";

export const metadata = { title: "Kontribusi | Remotika", description: "Tambahkan bukti publik, koreksi data perusahaan, atau ikut mengembangkan Remotika." };

export default function BerkontribusiPage() {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || "https://github.com/hryagstn/remotika";
  return <GuideLayout title="Bantu memperbaiki direktori" description="Satu sumber yang jelas lebih berguna daripada banyak klaim. Pilih bentuk kontribusi yang sesuai dengan informasi yang Anda punya." sections={[{id:"data",label:"Tambahkan atau koreksi data"},{id:"kode",label:"Kontribusi kode"},{id:"api-docs",label:"Gunakan API"}]}>
    <section id="data"><h2>Mulai dari data yang Anda kenal</h2><div className="contribution-options">
      <div><h3>Anda anggota perusahaan yang belum tercatat</h3><p>Periksa keanggotaan publik GitHub atau GitLab Anda untuk menambahkan bukti ke direktori.</p><Link href="/suggest-yourself">Periksa keanggotaan saya →</Link></div>
      <div><h3>Anda tahu perusahaan yang perlu diperiksa</h3><p>Kirim nama perusahaan, tautan organisasi, dan sumber yang mendukung. Saran ditinjau melalui issue di GitHub.</p><a href={repo + "/issues/new?title=Saran%20perusahaan"} target="_blank" rel="noopener noreferrer">Sarankan perusahaan →</a></div>
      <div><h3>Ada data atau tautan yang keliru</h3><p>Sebutkan halaman terkait, bagian yang perlu diubah, dan sumber koreksinya. Lowongan yang sudah ditutup juga bisa dilaporkan.</p><a href={repo + "/issues/new?title=Koreksi%20data"} target="_blank" rel="noopener noreferrer">Laporkan koreksi →</a></div>
    </div></section>
    <section id="kode"><h2>Ikut mengembangkan Remotika</h2><p>Perbaikan antarmuka, pemindaian sumber, aksesibilitas, dan dokumentasi dapat dikirim melalui pull request.</p>
      <details className="disclosure"><summary>Menjalankan proyek di komputer Anda</summary><div><p>Gunakan Node.js yang didukung Next.js 16 (20.9 atau lebih baru), lalu jalankan:</p><pre>{`git clone ${repo}.git\ncd remotika\nnpm install\nnpm run dev`}</pre><p>Buka <a href="http://localhost:3000">localhost:3000</a>. Untuk menjalankan pemindaian, tambahkan <code>GITHUB_TOKEN</code> ke berkas <code>.env</code>, kemudian jalankan <code>npm run pipeline</code>. Jangan sertakan token dalam commit.</p></div></details>
      <details className="disclosure"><summary>Mengirim perubahan</summary><div><ol className="prose-list"><li>Fork repositori dan buat branch untuk perubahan Anda.</li><li>Jelaskan masalah yang diperbaiki. Sertakan tangkapan layar untuk perubahan tampilan.</li><li>Jalankan <code>npm run build</code> dan <code>npm run lint</code>.</li><li>Kirim pull request dengan ringkasan perubahan dan hasil pemeriksaannya.</li></ol><a href={repo} target="_blank" rel="noopener noreferrer">Buka repositori →</a></div></details>
    </section>
    <section id="api-docs"><div className="section-heading"><h2>Gunakan data melalui API</h2><ShareApiLink /></div><p>Endpoint publik hanya untuk membaca data. Tidak membutuhkan akun atau token.</p><pre>GET /api/v1/companies</pre>
      <div className="table-scroll"><table className="reference-table"><caption>Parameter opsional</caption><thead><tr><th>Parameter</th><th>Penggunaan</th></tr></thead><tbody>
        <tr><td><code>hasActiveJobs</code></td><td><code>true</code> atau <code>false</code></td></tr>
        <tr><td><code>label</code></td><td>top-pick, established, indonesia-friendly, confirmed</td></tr>
        <tr><td><code>minVerifiedCount</code></td><td>Jumlah minimum talenta yang ditemukan</td></tr>
        <tr><td><code>industry</code></td><td>Pencarian sebagian teks industri</td></tr>
        <tr><td><code>limit</code></td><td>Default 50, maksimum 200</td></tr>
        <tr><td><code>offset</code></td><td>Mulai dari urutan tertentu, default 0</td></tr>
      </tbody></table></div>
      <details className="disclosure"><summary>Contoh permintaan dan respons</summary><div><a href="/api/v1/companies?minVerifiedCount=1&limit=1" target="_blank" rel="noopener noreferrer">Buka contoh respons →</a><pre>{`fetch('/api/v1/companies?minVerifiedCount=1&limit=10')\n  .then(response => response.json())\n  .then(({ data, meta }) => console.log(data, meta));`}</pre><p>Respons berisi <code>data</code> dan <code>meta</code> untuk paginasi. CORS diaktifkan. Batas permintaan adalah 60 per menit per IP; respons 429 meminta Anda mencoba lagi nanti.</p></div></details>
    </section>
  </GuideLayout>;
}
