export interface ReadinessQuestion {
  id: string;
  category: "technical" | "communication" | "lifestyle";
  text: string;
}

export const readinessQuestions: ReadinessQuestion[] = [
  // --- Technical Readiness (8 questions) ---
  {
    id: "tech-1",
    category: "technical",
    text: "Saya memiliki pemahaman mendalam pada stack utama saya sekaligus fleksibilitas untuk beradaptasi dengan stack atau teknologi baru."
  },
  {
    id: "tech-2",
    category: "technical",
    text: "Saya merasa nyaman untuk berpartisipasi aktif atau memimpin diskusi perancangan sistem (System Design) dan arsitektur."
  },
  {
    id: "tech-3",
    category: "technical",
    text: "Saya terbiasa dengan budaya tinjauan kode (Code Review) yang ketat dan asinkron, baik memberikan maupun menerima umpan balik kritis."
  },
  {
    id: "tech-4",
    category: "technical",
    text: "Saya memahami praktik CI/CD, penulisan pengujian (testing), serta cara mendeploy kode ke lingkungan produksi dengan aman."
  },
  {
    id: "tech-5",
    category: "technical",
    text: "Saya mampu menelusuri bug (debug) dan memecahkan kendala teknis pada codebase yang kompleks dan asing secara mandiri."
  },
  {
    id: "tech-6",
    category: "technical",
    text: "Saya percaya diri dalam mengestimasi linimasa pengerjaan tugas dan menjabarkan spesifikasi kebutuhan fitur tanpa pengawasan ketat."
  },
  {
    id: "tech-7",
    category: "technical",
    text: "Saya terbiasa menulis kode yang bersih, terdokumentasi dengan baik, dan mudah dipahami oleh anggota tim lainnya."
  },
  {
    id: "tech-8",
    category: "technical",
    text: "Saya menikmati pemecahan masalah teknis yang ambigu, di mana solusinya tidak langsung jelas atau belum ada panduan bakunya."
  },

  // --- Communication Readiness (8 questions) ---
  {
    id: "comm-1",
    category: "communication",
    text: "Saya merasa nyaman menulis dokumentasi teknis, deskripsi Pull Request, serta pembaruan kerja (updates) dalam bahasa Inggris."
  },
  {
    id: "comm-2",
    category: "communication",
    text: "Saya lebih menyukai komunikasi asinkron tertulis (seperti Slack, Notion) dibanding rapat langsung (live meetings) yang terlalu sering."
  },
  {
    id: "comm-3",
    category: "communication",
    text: "Saya dapat menjelaskan trade-off teknis yang rumit secara jelas kepada pemangku kepentingan non-teknis (Product Manager, Desainer, dll)."
  },
  {
    id: "comm-4",
    category: "communication",
    text: "Saya merasa nyaman memberikan serta menerima kritik dan umpan balik yang jujur serta langsung secara asinkron."
  },
  {
    id: "comm-5",
    category: "communication",
    text: "Saya memiliki pengalaman atau merasa nyaman mengelola jadwal kerja mandiri ketika berkolaborasi di zona waktu yang berbeda."
  },
  {
    id: "comm-6",
    category: "communication",
    text: "Saya secara proaktif membagikan kemajuan kerja, hambatan, serta keputusan tanpa harus ditanya atau dipicu terlebih dahulu."
  },
  {
    id: "comm-7",
    category: "communication",
    text: "Saya merasa nyaman membangun hubungan kerja profesional dan berkolaborasi erat dengan rekan tim yang belum pernah saya temui secara fisik."
  },
  {
    id: "comm-8",
    category: "communication",
    text: "Saya dapat menyelesaikan kesalahpahaman atau perbedaan pendapat melalui tulisan secara kepala dingin tanpa harus selalu melakukan panggilan suara/video."
  },

  // --- Lifestyle & Mental Readiness (8 questions) ---
  {
    id: "life-1",
    category: "lifestyle",
    text: "Saya tidak keberatan bekerja di jam kerja yang tidak sepenuhnya beririsan dengan waktu sosial atau jam kerja lokal di sekitar saya."
  },
  {
    id: "life-2",
    category: "lifestyle",
    text: "Saya merasa nyaman bekerja sendirian dalam jangka waktu lama tanpa atmosfer fisik kantor atau kehadiran fisik rekan kerja."
  },
  {
    id: "life-3",
    category: "lifestyle",
    text: "Saya memiliki simpanan dana darurat yang cukup (misal 3-6 bulan) untuk mengantisipasi jeda kontrak kerja atau volatilitas pendapatan."
  },
  {
    id: "life-4",
    category: "lifestyle",
    text: "Saya memiliki ruang kerja atau setup rumah yang tenang, bebas gangguan, dan kondusif untuk fokus bekerja setiap hari."
  },
  {
    id: "life-5",
    category: "lifestyle",
    text: "Saya memiliki motivasi diri yang kuat untuk tetap produktif tanpa perlu diawasi langsung atau berada dalam struktur kedisiplinan kantor fisik."
  },
  {
    id: "life-6",
    category: "lifestyle",
    text: "Saya mampu menetapkan batasan tegas kapan harus mulai dan berhenti bekerja agar tidak mengalami kejenuhan (*burnout*)."
  },
  {
    id: "life-7",
    category: "lifestyle",
    text: "Saya mandiri dan proaktif dalam mempelajari keahlian baru serta mengikuti tren teknologi terkini tanpa harus diarahkan oleh perusahaan."
  },
  {
    id: "life-8",
    category: "lifestyle",
    text: "Saya memiliki sistem pendukung pribadi (keluarga, teman, hobi) yang sehat untuk mengatasi potensi rasa sepi akibat isolasi kerja jarak jauh."
  }
];
