# Remotika 🇮🇩 🚀

> **Direktori perusahaan global yang terbukti mempekerjakan developer remote dari Indonesia — 100% terverifikasi melalui data keanggotaan GitHub secara real-time.**
>
> 🌐 **Website Resmi:** [remotika.vercel.app](https://remotika.vercel.app)

Remotika hadir untuk menjembatani kesenjangan informasi bagi developer dan freelancer lokal. Platform ini membantu Anda menemukan perusahaan teknologi luar negeri yang memiliki rekam jejak nyata dalam mempekerjakan talenta dari Indonesia.

Berbeda dari direktori lowongan kerja biasa yang mengandalkan klaim sepihak atau profil buatan, Remotika menggunakan **pendekatan berbasis organisasi (GitHub-first)**. Sistem kami memindai keanggotaan organisasi GitHub publik milik perusahaan target, memverifikasi lokasi pengembang berdasarkan kata kunci geografis Indonesia, lalu mengelompokkannya ke dalam tingkat kepercayaan (*verification tier*) yang jelas dan transparan.

---

## 🛠️ Stack Teknologi & Arsitektur

Proyek ini dibangun menggunakan arsitektur modern **Git-as-a-Database (Stasis JSON)** yang bebas perawatan:
- **Frontend & Server Actions:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** Berkas JSON statis di [companies.json](file:///c:/Laragon/www/remotika/src/data/companies.json) yang melayani seluruh pencarian dan filter secara instan dengan waktu respons sub-milidetik. Tanpa PostgreSQL, tanpa database eksternal yang lambat, sepenuhnya bebas biaya operasional!
- **Pipa Data (Data Pipeline):** Skrip Node/TypeScript tunggal di [pipeline.ts](file:///c:/Laragon/www/remotika/scripts/pipeline.ts) yang berjalan secara otomatis melalui **GitHub Actions** pada jadwal harian/bulanan untuk mengambil data terverifikasi, memperbarui `companies.json`, dan mengirimkan (*auto-commit*) perubahan tersebut kembali ke repositori Git.

---

## 📊 Klasifikasi & Label Verifikasi

Kami mengklasifikasikan tingkat keramahan perusahaan terhadap talenta Indonesia berdasarkan jumlah anggota publik terverifikasi yang kami temukan:

| Anggota Indonesia Terverifikasi | Label | Arti |
| :--- | :--- | :--- |
| **1 developer** | 🔵 **Confirmed** | Memiliki preseden yang terbukti; infrastruktur kerja remote telah terbentuk |
| **2–4 developer** | 🟢 **Indonesia-Friendly** | Pola perekrutan kerja remote yang mapan dan berulang |
| **5–9 developer** | 🟣 **Established** | Sangat nyaman mempekerjakan dan bekerja sama dengan talenta Indonesia |
| **10+ developer** | 👑 **Top Pick** | Indonesia merupakan bagian inti dari strategi perekrutan talenta global mereka |

---

## 🚀 Memulai (Panduan Lokal)

### 1. Prasyarat
- **Node.js** (versi 20 atau lebih baru direkomendasikan)
- **GitHub Personal Access Token (PAT):** Diperlukan untuk menjalankan skrip pipa data secara lokal guna menghindari batas laju panggilan (*rate-limiting*) API GitHub.

### 2. Instalasi
Salin repositori dan instal dependensi:
```bash
git clone git@github.com-hryagstn:hryagstn/remotika.git
cd remotika
npm install
```

### 3. Konfigurasi Lingkungan (Environment Setup)
Buat berkas `.env` di direktori akar:
```env
GITHUB_TOKEN=token_personal_access_github_anda
NEXT_PUBLIC_GITHUB_REPO=https://github.com/hryagstn/remotika
```

### 4. Menjalankan Aplikasi Secara Lokal
Jalankan server pengembangan Next.js:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) untuk melihat dasbor Remotika Anda.

---

## 📡 Menjalankan Pipa Data (Pipeline)

Untuk memindai organisasi GitHub dan memperbarui database lokal secara manual:
```bash
npm run pipeline
```

### Cara Kerja Pipeline:
1. Memuat basis data pengembang yang ada dari berkas [companies.json](file:///c:/Laragon/www/remotika/src/data/companies.json).
2. Menyusun daftar unik organisasi yang akan diperiksa (gabungan daftar saat ini, daftar seed bawaan, dan daftar komunitas).
3. Terhubung secara aman ke API GitHub menggunakan token `GITHUB_TOKEN` Anda.
4. **Saringan A (Anggota Publik):** Memindai lokasi profil publik anggota organisasi apakah mengandung kata kunci Indonesia (`jakarta`, `bandung`, `surabaya`, `indonesia`, dll.).
5. **Saringan B (Asosiasi PR):** Memeriksa kontributor utama yang memiliki asosiasi sebagai `MEMBER` atau `OWNER` pada pull request aktif.
6. **Saringan C (Domain Email Komit):** Memindai riwayat komit terbaru dan memverifikasi domain email penulis yang cocok dengan situs web resmi perusahaan.
7. Memperbarui jumlah anggota terverifikasi dan memperkaya data dengan lowongan kerja aktif dari **RemoteOK API**, **Remotive API**, serta integrasi langsung API Applicant Tracking System (ATS) perusahaan seperti **Greenhouse API** dan **Workday API**.
8. **Pembersihan Data Otomatis:** Melakukan penyembuhan Mojibake (*on-the-fly Mojibake healing*), decoding entitas HTML (seperti mengonversi `&amp;` menjadi `&`), serta deteksi otomatis dan penerjemahan tulisan non-latin (contoh: Mandarin, Arab) ke bahasa Inggris demi menjaga keseragaman format data di direktori.
9. Menyimpan hasil penyaringan kembali ke dalam [companies.json](file:///c:/Laragon/www/remotika/src/data/companies.json).

---

## 🤖 Pembaruan Otomatis (GitHub Actions)

Proyek ini dilengkapi dengan alur kerja otomatis di [.github/workflows/update-database.yml](file:///c:/Laragon/www/remotika/.github/workflows/update-database.yml):
- **Jadwal (Schedule):** Berjalan secara otomatis **setiap hari** pukul 17:00 UTC (00:00 WIB / Tengah Malam) untuk menjaga keakuratan lowongan kerja dan status verifikasi talenta.
- **Auto-Commit:** GitHub Actions akan menjalankan skrip pipeline secara mandiri, memperbarui berkas `companies.json`, dan melakukan komit/push otomatis ke cabang `main` jika ada perubahan data terverifikasi.
- **Auto-Deploy Vercel:** Jika Anda menghubungkan repositori GitHub Anda ke **Vercel**, setiap push otomatis ini akan memicu pembangunan ulang produksi (*production build*) secara instan tanpa mengganggu layanan.

> [!IMPORTANT]
> **Hak Akses Write:** Agar pembaruan database otomatis ini berjalan lancar di GitHub Actions, buka tab **Settings > Actions > General** di repositori GitHub Anda, gulir ke bagian **Workflow permissions**, lalu pilih opsi **"Read and write permissions"** dan klik **Save**.

---

## 💡 Cara Menyarankan Perusahaan

Remotika didorong sepenuhnya oleh kontribusi komunitas:
1. Saat pengguna mengisi formulir **"Sarankan Perusahaan"** di dasbor web, sistem akan mengarahkan mereka ke template pembuatan Issue Baru di GitHub Anda secara dinamis.
2. Setiap kali ada organisasi baru yang disarankan dan disetujui, skrip pipa data otomatis akan memprosesnya di siklus pemindaian berikutnya.

---

## 🤝 Kontribusi

Kami sangat menyambut kontribusi dari komunitas Indonesia! Anda dapat menambahkan nama organisasi GitHub perusahaan, memperbarui filter kata kunci lokasi, atau meningkatkan desain antarmuka.

1. Lakukan Fork pada repositori ini.
2. Buat cabang fitur baru: `git checkout -b fitur/fitur-keren`.
3. Komit perubahan Anda: `git commit -m 'feat: menambahkan fitur keren'`.
4. Push ke cabang tersebut: `git push origin fitur/fitur-keren`.
5. Buka Pull Request.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat berkas [LICENSE](file:///c:/Laragon/www/remotika/LICENSE) untuk detail selengkapnya.

*Dibuat dengan ❤️ untuk komunitas teknologi Indonesia oleh [hryagstn](https://github.com/hryagstn).*
