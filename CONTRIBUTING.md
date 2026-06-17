# Panduan Kontribusi Remotika

Terima kasih atas ketertarikan Anda untuk berkontribusi pada **Remotika**! Proyek ini dibangun untuk membantu pengembang dan freelancer Indonesia menemukan perusahaan asing terverifikasi yang mempekerjakan talenta lokal secara remote.

Dengan ikut berkontribusi, Anda membantu memperkuat komunitas tech di Indonesia. Berikut adalah panduan langkah demi langkah untuk berkontribusi pada repositori ini.

---

## 🛠️ Cara Kontribusi

Anda dapat berkontribusi melalui beberapa cara:

1. **Menyarankan Perusahaan Baru:**
   - Anda tidak perlu memodifikasi kode untuk menambahkan perusahaan baru. Anda dapat menyarankannya langsung melalui fitur **"Saran Perusahaan"** di dashboard Remotika, yang akan mengarahkan Anda untuk membuat Issue template di GitHub.
   - Pipa data (*data pipeline*) kami yang berjalan secara otomatis akan memindai organisasi GitHub yang Anda sarankan.

2. **Melaporkan Masalah (*Bug Reporting*):**
   - Jika Anda menemukan bug pada antarmuka (UI), performa, atau pipeline data, silakan buka [GitHub Issue](https://github.com/hryagstn/remotika/issues) baru dengan menyertakan deskripsi dan langkah reproduksi masalah.

3. **Mengirimkan Pull Request (PR):**
   - Perbaikan bug, peningkatan fitur antarmuka, penulisan optimasi SEO, atau peningkatan performa pipeline sangat diterima melalui Pull Request.

---

## 💻 Memulai Pengembangan Lokal

Ikuti langkah-langkah berikut untuk menjalankan Remotika di komputer lokal Anda:

### 1. Prasyarat
Pastikan Anda telah menginstal:
- **Node.js** (v18 ke atas direkomendasikan)
- **NPM** atau **Yarn**

### 2. Kloning Repositori
```bash
git clone git@github.com:hryagstn/remotika.git
cd remotika
```

### 3. Konfigurasi Environment
Buat berkas `.env` di direktori utama proyek dengan menyalin isi dari `.env.example` (jika ada) atau buat baru dengan isi:
```env
# GitHub Personal Access Token (Diperlukan untuk memindai organisasi)
# Buat token klasik dengan hak akses minimal di https://github.com/settings/tokens
GITHUB_TOKEN=isi_dengan_github_pat_anda

# URL Repositori Utama
NEXT_PUBLIC_GITHUB_REPO=https://github.com/hryagstn/remotika
```

### 4. Instalasi Dependensi
```bash
npm install
```

### 5. Jalankan Dev Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi berjalan secara langsung.

---

## 🔄 Menguji Data Pipeline Secara Lokal

Untuk menguji bagaimana pipa data mengambil lowongan kerja aktif (dari RemoteOK & Remotive) dan menebak serta memverifikasi organisasi GitHub baru:

```bash
npm run pipeline
```

### Mekanisme Verifikasi Pipa Data
Pipeline menggunakan tiga lapis penyaringan (*multi-layered verification*):
- **Saringan A (Public Members):** Memindai lokasi keanggotaan publik organisasi GitHub untuk mencocokkan kata kunci Indonesia (misal: "Jakarta", "Bandung", "Indonesia").
- **Saringan B (PR Associations):** Memeriksa kontribusi Pull Request terakhir pada repositori publik organisasi yang dilakukan oleh akun dengan status `MEMBER` atau `OWNER` yang berlokasi di Indonesia.
- **Saringan C (Commit Emails):** Mencocokkan domain email pada komit git terakhir dengan domain resmi website perusahaan untuk mengidentifikasi kontributor internal dari Indonesia.

---

## ⚖️ Alur Kerja Pull Request

1. Lakukan **Fork** pada repositori ini.
2. Buat branch baru dari branch `main`:
   ```bash
   git checkout -b fitur/fitur-keren-anda
   ```
3. Lakukan perubahan kode. Pastikan untuk selalu mempertahankan kerapian kode dan kompatibilitas tipe data (TypeScript).
4. Verifikasi bahwa build proyek Next.js berjalan sukses tanpa kendala:
   ```bash
   npm run build
   ```
5. Commit perubahan Anda dengan pesan yang jelas dan informatif:
   ```bash
   git commit -m "feat: menambah fitur filter pencarian dinamis"
   ```
6. Push ke branch Anda di GitHub:
   ```bash
   git push origin fitur/fitur-keren-anda
   ```
7. Buka Pull Request ke branch `main` repositori **hryagstn/remotika** dan jelaskan perubahan yang Anda lakukan.

---

## 📜 Lisensi
Dengan berkontribusi pada proyek Remotika, Anda menyetujui bahwa kontribusi Anda akan dilisensikan di bawah lisensi MIT yang digunakan oleh proyek ini.
