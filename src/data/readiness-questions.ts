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
    text: "Saya menguasai teknologi utama yang saya gunakan dan bisa mempelajari teknologi baru."
  },
  {
    id: "tech-2",
    category: "technical",
    text: "Saya nyaman berdiskusi tentang rancangan sistem dan arsitektur."
  },
  {
    id: "tech-3",
    category: "technical",
    text: "Saya terbiasa memberi dan menerima masukan melalui code review tertulis."
  },
  {
    id: "tech-4",
    category: "technical",
    text: "Saya memahami pengujian, CI/CD, dan cara merilis kode ke produksi."
  },
  {
    id: "tech-5",
    category: "technical",
    text: "Saya bisa menelusuri bug pada proyek yang belum saya kenal secara mandiri."
  },
  {
    id: "tech-6",
    category: "technical",
    text: "Saya bisa memperkirakan waktu pengerjaan dan menjelaskan kebutuhan tugas tanpa pengawasan terus-menerus."
  },
  {
    id: "tech-7",
    category: "technical",
    text: "Saya menulis kode dan dokumentasi yang mudah dipahami rekan satu tim."
  },
  {
    id: "tech-8",
    category: "technical",
    text: "Saya nyaman mengerjakan masalah yang belum memiliki solusi atau panduan yang jelas."
  },

  // --- Communication Readiness (8 questions) ---
  {
    id: "comm-1",
    category: "communication",
    text: "Saya nyaman menulis dokumentasi, pull request, dan pembaruan kerja dalam bahasa Inggris."
  },
  {
    id: "comm-2",
    category: "communication",
    text: "Saya nyaman membahas pekerjaan lewat tulisan tanpa selalu mengadakan rapat."
  },
  {
    id: "comm-3",
    category: "communication",
    text: "Saya bisa menjelaskan pilihan dan konsekuensi teknis kepada rekan nonteknis."
  },
  {
    id: "comm-4",
    category: "communication",
    text: "Saya nyaman memberi dan menerima kritik melalui komunikasi tertulis."
  },
  {
    id: "comm-5",
    category: "communication",
    text: "Saya bisa mengatur jadwal saat bekerja dengan rekan di zona waktu berbeda."
  },
  {
    id: "comm-6",
    category: "communication",
    text: "Saya membagikan kemajuan, kendala, dan keputusan tanpa harus ditanya."
  },
  {
    id: "comm-7",
    category: "communication",
    text: "Saya nyaman bekerja dengan rekan yang belum pernah saya temui langsung."
  },
  {
    id: "comm-8",
    category: "communication",
    text: "Saya bisa menyelesaikan perbedaan pendapat melalui tulisan dengan tenang."
  },

  // --- Lifestyle & Mental Readiness (8 questions) ---
  {
    id: "life-1",
    category: "lifestyle",
    text: "Saya bisa menyesuaikan jam kerja saat jadwal tim berbeda dari jam kerja lokal."
  },
  {
    id: "life-2",
    category: "lifestyle",
    text: "Saya nyaman bekerja sendiri tanpa kehadiran rekan kantor setiap hari."
  },
  {
    id: "life-3",
    category: "lifestyle",
    text: "Saya memiliki dana darurat untuk menghadapi jeda kontrak atau perubahan pendapatan."
  },
  {
    id: "life-4",
    category: "lifestyle",
    text: "Saya memiliki tempat kerja yang mendukung konsentrasi dan minim gangguan."
  },
  {
    id: "life-5",
    category: "lifestyle",
    text: "Saya bisa menjaga rutinitas kerja tanpa pengawasan langsung."
  },
  {
    id: "life-6",
    category: "lifestyle",
    text: "Saya menetapkan waktu mulai dan berhenti bekerja untuk menjaga waktu istirahat."
  },
  {
    id: "life-7",
    category: "lifestyle",
    text: "Saya mempelajari keterampilan baru tanpa selalu menunggu arahan perusahaan."
  },
  {
    id: "life-8",
    category: "lifestyle",
    text: "Saya punya dukungan keluarga, teman, atau kegiatan di luar pekerjaan."
  }
];
