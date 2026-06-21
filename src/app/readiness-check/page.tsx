"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  Brain,
  MessageSquare,
  Activity,
  Award,
  BookOpen,
  Send
} from "lucide-react";
import { readinessQuestions, ReadinessQuestion } from "../../data/readiness-questions";

// Custom SVG GitHub Icon
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

// Custom SVG LinkedIn Icon
const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const LOCAL_STORAGE_KEY = "remotika:readiness-result";

// Mapped Insights based on average score
const getInsight = (score: number, category: "technical" | "communication" | "lifestyle", lang: "id" | "en") => {
  if (score >= 4.0) {
    return {
      text: lang === "id" 
        ? "Ini adalah kekuatan utama Anda. Tonjolkan aspek ini saat memposisikan diri Anda dalam lamaran atau wawancara kerja remote."
        : "This is a strength. Lean into it when positioning yourself in remote job applications and interviews.",
      badge: lang === "id" ? "Kekuatan Utama" : "Core Strength",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    };
  } else if (score >= 2.5) {
    return {
      text: lang === "id"
        ? "Pijakan yang kokoh dengan ruang untuk berkembang. Lebih baik bersikap jujur tentang aspek ini dalam wawancara dibanding melebih-lebihkannya."
        : "Solid footing, with room to grow. Worth being honest about this in interviews rather than overselling it.",
      badge: lang === "id" ? "Cukup Siap" : "Solid Footing",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    };
  } else {
    return {
      text: lang === "id"
        ? "Layak menginvestasikan waktu di sini sebelum menargetkan perusahaan remote penuh yang asinkron — bukan hambatan mutlak, melainkan area pertumbuhan berharga."
        : "Worth investing time here before targeting fully-remote, async-first companies — not a dealbreaker, just a valuable growth area.",
      badge: lang === "id" ? "Area Pertumbuhan" : "Growth Area",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    };
  }
};

export default function ReadinessCheckPage() {
  const [step, setStep] = useState<"welcome" | "questions" | "results">("welcome");
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showErrors, setShowShowErrors] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [captionLang, setCaptionLang] = useState<"id" | "en">("id");
  const [hasSavedResult, setHasSavedResult] = useState(false);
  const [savedResultData, setSavedResultData] = useState<{
    scores: { technical: number; communication: number; lifestyle: number };
    timestamp: string;
  } | null>(null);

  // Group questions by category
  const categories = [
    { id: "technical", label: "Kesiapan Teknis", icon: <Brain className="w-5 h-5 text-teal-400" />, themeColor: "teal" },
    { id: "communication", label: "Kesiapan Komunikasi", icon: <MessageSquare className="w-5 h-5 text-blue-400" />, themeColor: "blue" },
    { id: "lifestyle", label: "Gaya Hidup & Mental", icon: <Activity className="w-5 h-5 text-purple-400" />, themeColor: "purple" }
  ];

  const currentCategory = categories[currentCatIndex];
  const currentQuestions = readinessQuestions.filter(q => q.category === currentCategory.id);

  // Check for existing result in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.scores && parsed.timestamp) {
          setHasSavedResult(true);
          setSavedResultData(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved readiness check results:", e);
      }
    }
  }, []);

  // Handle Likert scale option select
  const handleSelect = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Validate current category answers
  const isCategoryComplete = () => {
    return currentQuestions.every(q => answers[q.id] !== undefined);
  };

  const handleNext = () => {
    if (!isCategoryComplete()) {
      setShowShowErrors(true);
      return;
    }
    setShowShowErrors(false);
    if (currentCatIndex < categories.length - 1) {
      setCurrentCatIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Calculate scores and transition to results
      calculateAndSaveResults();
    }
  };

  const handleBack = () => {
    setShowShowErrors(false);
    if (currentCatIndex > 0) {
      setCurrentCatIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStep("welcome");
    }
  };

  const calculateAndSaveResults = () => {
    const scores = { technical: 0, communication: 0, lifestyle: 0 };
    const counts = { technical: 0, communication: 0, lifestyle: 0 };

    readinessQuestions.forEach(q => {
      const score = answers[q.id] || 0;
      scores[q.category] += score;
      counts[q.category] += 1;
    });

    const calculatedScores = {
      technical: parseFloat((scores.technical / counts.technical).toFixed(2)),
      communication: parseFloat((scores.communication / counts.communication).toFixed(2)),
      lifestyle: parseFloat((scores.lifestyle / counts.lifestyle).toFixed(2))
    };

    const timestamp = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const result = {
      scores: calculatedScores,
      timestamp
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
    setSavedResultData(result);
    setHasSavedResult(true);
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartNew = () => {
    setAnswers({});
    setCurrentCatIndex(0);
    setShowShowErrors(false);
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadSaved = () => {
    if (savedResultData) {
      // Re-populate mock answers (average) or just go to results
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const downloadOgImage = async () => {
    if (!savedResultData) return;
    setIsDownloading(true);
    try {
      const { technical, communication, lifestyle } = savedResultData.scores;
      const url = `/api/readiness-og?technical=${technical}&communication=${communication}&lifestyle=${lifestyle}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not OK");
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `remotika-readiness-check.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading image:", err);
      alert("Gagal mengunduh gambar. Silakan coba kembali beberapa saat lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Pre-filled LinkedIn Captions
  const linkedinCaptionId = `Saya baru saja melakukan refleksi kesiapan kerja remote internasional menggunakan Remotika Readiness Check.

Bukan tes kelulusan teknis, melainkan evaluasi mandiri yang jujur tentang kesiapan teknis mandiri, pola komunikasi asinkron, dan aspek gaya hidup remote yang jarang dibahas.

Sangat direkomendasikan bagi developer Indonesia yang berencana melamar ke luar negeri untuk memetakan kekuatan dan area pertumbuhan pribadi sebelum melamar.

Coba cek kesiapan Anda di: https://remotika.vercel.app/readiness-check`;

  const linkedinCaptionEn = `I just evaluated my own readiness for remote, international work using Remotika's Readiness Check.

It's not a pass/fail technical quiz — just an honest, structured reflection on technical depth, async communication culture, and the lifestyle adjustments of cross-border remote work that nobody prepares you for.

A highly reflective tool worth taking before you submit your next application, not after.

Assess your own readiness: https://remotika.vercel.app/readiness-check`;

  const handleCopyCaption = () => {
    const textToCopy = captionLang === "id" ? linkedinCaptionId : linkedinCaptionEn;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Category Progress Header
  const renderWizardHeader = () => (
    <div className="mb-10 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Langkah {currentCatIndex + 1} dari 3</span>
        <span className="text-xs text-text-muted">Progres: {Math.round((Object.keys(answers).length / readinessQuestions.length) * 100)}% Selesai</span>
      </div>
      
      {/* Visual Step Tabs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {categories.map((cat, idx) => {
          const isActive = idx === currentCatIndex;
          const isDone = idx < currentCatIndex;
          return (
            <div key={cat.id} className="relative flex flex-col">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? "bg-brand-primary shadow-sm shadow-brand-primary/50" 
                    : isDone 
                      ? "bg-emerald-500" 
                      : "bg-white/10"
                }`}
              />
              <span className={`text-[11px] font-bold mt-2 hidden md:inline-block transition-colors ${
                isActive ? "text-white" : isDone ? "text-emerald-400" : "text-text-muted"
              }`}>
                {cat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

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
            <Link href="/readiness-check" className="text-xs font-semibold text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-all">
              Cek Kesiapan
            </Link>
            <Link href="/berkontribusi" className="text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/5 transition-all">
              Berkontribusi
            </Link>
          </div>
          <div className="flex items-center space-x-3">
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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 pt-20">
        
        {/* ================= STEP 1: WELCOME SCREEN ================= */}
        {step === "welcome" && (
          <div className="space-y-10 animate-fade-in py-6">
            
            {/* Hero Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                <span>Eksklusif: Uji Kesiapan Kerja Global Anda</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-outfit text-white">
                Apakah Anda Siap untuk <span className="text-gradient">Kerja Remote Global?</span>
              </h1>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed font-inter">
                Sebelum melamar ke berbagai perusahaan internasional, ambil waktu sejenak untuk berefleksi secara jujur. Evaluasi mandiri ini membantu Anda memetakan kekuatan serta area pertumbuhan di tiga pilar krusial: Teknis, Komunikasi, dan Gaya Hidup.
              </p>
            </div>

            {/* Quick Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="font-bold text-white text-sm font-outfit">Reflektif, Bukan Ujian</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Bukan tes coding kaku dengan jawaban benar/salah. Ini adalah evaluasi jujur untuk introspeksi kesiapan Anda menghadapi tantangan asinkron internasional.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-white text-sm font-outfit">100% Client-Side & Privat</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Semua data dan skor diproses seutuhnya di browser Anda. Tidak ada penyimpanan server, tidak ada pendaftaran akun, privasi Anda aman total.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <LinkedinIcon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-bold text-white text-sm font-outfit">Siap Bagikan di LinkedIn</h3>
                <p className="text-xs text-white/60 leading-relaxed font-inter">
                  Unduh ringkasan hasil bermutu tinggi berupa kartu infografis modern dan salin template caption dwi-bahasa siap posting untuk menginspirasi jejaring Anda.
                </p>
              </div>
            </div>

            {/* Actions & Local Storage Hook */}
            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
              <button
                onClick={handleStartNew}
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 active:scale-98 transition-all shadow-lg shadow-brand-primary/25 text-center cursor-pointer"
              >
                Mulai Penilaian Baru (24 Pertanyaan)
              </button>

              {hasSavedResult && savedResultData && (
                <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 max-w-md w-full text-center space-y-4 animate-fade-in">
                  <div className="flex items-center justify-center space-x-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold font-outfit uppercase tracking-wider">Tersedia Hasil Sebelumnya</span>
                  </div>
                  
                  <div className="text-xs text-white/70">
                    <p className="font-semibold text-white">Terakhir diperiksa pada {savedResultData.timestamp}</p>
                    <div className="flex justify-center gap-4 mt-2 font-mono font-bold text-text-primary text-[11px]">
                      <span className="text-teal-400">Teknis: {savedResultData.scores.technical.toFixed(1)}</span>
                      <span className="text-blue-400">Komunikasi: {savedResultData.scores.communication.toFixed(1)}</span>
                      <span className="text-purple-400">Gaya Hidup: {savedResultData.scores.lifestyle.toFixed(1)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLoadSaved}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Lihat Hasil Terakhir Anda
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= STEP 2: QUESTIONS WALKTHROUGH ================= */}
        {step === "questions" && (
          <div className="animate-fade-in space-y-6">
            
            {/* Header & Progres */}
            {renderWizardHeader()}

            {/* Category Title Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-start space-x-4">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10`}>
                {currentCategory.icon}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold font-outfit text-white">{currentCategory.label}</h2>
                <p className="text-xs text-white/50">
                  {currentCategory.id === "technical" && "Mengevaluasi kesiapan menghadapi tantangan rekayasa, tinjauan kode yang kritis, dan pengerjaan tugas tanpa bimbingan."}
                  {currentCategory.id === "communication" && "Mengevaluasi kenyamanan Anda dalam menulis, mendokumentasikan, dan berkomunikasi secara asinkron di lintas zona waktu."}
                  {currentCategory.id === "lifestyle" && "Mengevaluasi kesiapan mental, isolasi sosial, dana darurat, dan kedisiplinan kerja mandiri dari rumah."}
                </p>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6 mt-6">
              {currentQuestions.map((q, qIdx) => {
                const answerValue = answers[q.id];
                const isError = showErrors && answerValue === undefined;

                return (
                  <div 
                    key={q.id} 
                    className={`glass-panel p-6 rounded-2xl border transition-all duration-300 ${
                      isError 
                        ? "border-red-500/40 bg-red-500/5 shadow-md shadow-red-500/5" 
                        : answerValue !== undefined 
                          ? "border-emerald-500/20 bg-emerald-500/2" 
                          : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Question Text */}
                      <div className="flex items-start space-x-3">
                        <span className="text-xs font-bold text-text-muted mt-1 w-6 shrink-0">{(currentCatIndex * 8) + qIdx + 1}.</span>
                        <p className="text-sm sm:text-base text-text-primary leading-relaxed">{q.text}</p>
                      </div>

                      {/* Likert Scale UI (1-5 Radio Buttons) */}
                      <div className="pt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <span className="text-xs text-white/40 hidden md:block">Sangat Tidak Setuju</span>
                          
                          <div className="flex items-center justify-between md:justify-center gap-1.5 sm:gap-3 flex-1 md:flex-initial">
                            <span className="text-[10px] font-bold text-white/30 md:hidden">Sangat Tidak Setuju</span>
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isSelected = answerValue === val;
                              
                              // Base styling
                              let btnClasses = "w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-xs font-semibold border transition-all active:scale-90 cursor-pointer flex items-center justify-center ";

                              if (isSelected) {
                                if (currentCategory.id === "technical") {
                                  btnClasses += "bg-teal-500 border-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/20";
                                } else if (currentCategory.id === "communication") {
                                  btnClasses += "bg-blue-500 border-blue-500 text-white font-black shadow-lg shadow-blue-500/20";
                                } else if (currentCategory.id === "lifestyle") {
                                  btnClasses += "bg-purple-500 border-purple-500 text-white font-black shadow-lg shadow-purple-500/20";
                                } else {
                                  btnClasses += "bg-brand-primary border-brand-primary text-white font-black shadow-lg shadow-brand-primary/20";
                                }
                              } else {
                                let hoverColor = "hover:bg-brand-primary/10 hover:text-brand-primary border-white/10";
                                if (currentCategory.id === "technical") {
                                  hoverColor = "hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/30 border-white/10";
                                } else if (currentCategory.id === "communication") {
                                  hoverColor = "hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 border-white/10";
                                } else if (currentCategory.id === "lifestyle") {
                                  hoverColor = "hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30 border-white/10";
                                }
                                btnClasses += `bg-white/5 text-white/60 ${hoverColor}`;
                              }

                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleSelect(q.id, val)}
                                  className={btnClasses}
                                >
                                  {val}
                                </button>
                              );
                            })}
                            <span className="text-[10px] font-bold text-white/30 md:hidden">Sangat Setuju</span>
                          </div>

                          <span className="text-xs text-white/40 hidden md:block">Sangat Setuju</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error Message */}
            {showErrors && !isCategoryComplete() && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold flex items-center space-x-2 animate-bounce">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Harap jawab semua pertanyaan di halaman ini sebelum melanjutkan ke langkah berikutnya.</span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                onClick={handleBack}
                className="px-5 py-2.5 text-xs font-bold rounded-lg border border-white/10 text-white/70 hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                onClick={handleNext}
                className={`px-6 py-2.5 text-xs font-bold rounded-lg active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5 ${
                  currentCategory.id === "technical" ? "bg-teal-600 hover:bg-teal-500 text-slate-950" :
                  currentCategory.id === "communication" ? "bg-blue-600 hover:bg-blue-500 text-white" :
                  "bg-purple-600 hover:bg-purple-500 text-white"
                }`}
              >
                <span>{currentCatIndex === categories.length - 1 ? "Lihat Hasil Evaluasi" : "Langkah Berikutnya"}</span>
                {currentCatIndex !== categories.length - 1 && <span className="font-mono">→</span>}
              </button>
            </div>

          </div>
        )}

        {/* ================= STEP 3: RESULTS SCREEN ================= */}
        {step === "results" && savedResultData && (
          <div className="animate-fade-in space-y-12">
            
            {/* Header */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">Ringkasan Kesiapan Kerja Remote Anda</h1>
              <p className="text-xs sm:text-sm text-text-muted">Hasil evaluasi mandiri yang dihitung lokal pada browser Anda.</p>
              <div className="inline-flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-white/50 font-mono">
                <Clock className="w-3 h-3 text-brand-accent" />
                <span>Diperiksa: {savedResultData.timestamp}</span>
              </div>
            </div>

            {/* Visual Charts Container (Radar Chart & Dynamic Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Custom SVG Radar Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[340px]">
                <h3 className="text-xs font-bold font-outfit text-text-muted uppercase tracking-wider mb-4">Grafik Kesiapan 3 Pilar</h3>
                
                <div className="w-full max-w-[280px]">
                  <svg 
                    viewBox="0 0 300 300" 
                    className="w-full h-auto"
                    style={{ overflow: "visible" }}
                  >
                    {/* Define gradients */}
                    <defs>
                      <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#030712" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Chart Center */}
                    {(() => {
                      const Cx = 150;
                      const Cy = 160;
                      const R = 100;

                      // Coords function
                      const getCoords = (radius: number) => {
                        return {
                          tX: Cx,
                          tY: Cy - radius,
                          cX: Cx + radius * 0.866,
                          cY: Cy + radius * 0.5,
                          lX: Cx - radius * 0.866,
                          lY: Cy + radius * 0.5
                        };
                      };

                      const rings = [0.2, 0.4, 0.6, 0.8, 1.0].map(p => getCoords(R * p));
                      const user = {
                        t: getCoords((savedResultData.scores.technical / 5) * R),
                        c: getCoords((savedResultData.scores.communication / 5) * R),
                        l: getCoords((savedResultData.scores.lifestyle / 5) * R)
                      };

                      return (
                        <g>
                          {/* Radial Background Glow */}
                          <circle cx={Cx} cy={Cy} r={R} fill="url(#radarGlow)" />

                          {/* Grid Rings */}
                          {rings.map((ring, i) => (
                            <polygon
                              key={i}
                              points={`${ring.tX},${ring.tY} ${ring.cX},${ring.cY} ${ring.lX},${ring.lY}`}
                              fill="none"
                              stroke={i === 4 ? "#475569" : "#1e293b"}
                              strokeWidth={i === 4 ? "1.5" : "1"}
                            />
                          ))}

                          {/* Spoke Axis Lines */}
                          <line x1={Cx} y1={Cy} x2={rings[4].tX} y2={rings[4].tY} stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                          <line x1={Cx} y1={Cy} x2={rings[4].cX} y2={rings[4].cY} stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                          <line x1={Cx} y1={Cy} x2={rings[4].lX} y2={rings[4].lY} stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

                          {/* User Score Area Polygon */}
                          <polygon
                            points={`${user.t.tX},${user.t.tY} ${user.c.cX},${user.c.cY} ${user.l.lX},${user.l.lY}`}
                            fill="rgba(20, 184, 166, 0.2)"
                            stroke="#2dd4bf"
                            strokeWidth="2.5"
                          />

                          {/* Dots at corners */}
                          <circle cx={user.t.tX} cy={user.t.tY} r="4" fill="#2dd4bf" stroke="#0f172a" strokeWidth="1.5" />
                          <circle cx={user.c.cX} cy={user.c.cY} r="4" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
                          <circle cx={user.l.lX} cy={user.l.lY} r="4" fill="#a855f7" stroke="#0f172a" strokeWidth="1.5" />

                          {/* Axis Labels */}
                          <text x={Cx} y={Cy - R - 12} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="1">TEKNIS</text>
                          <text x={Cx + R * 0.866 + 10} y={Cy + R * 0.5 + 10} textAnchor="start" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="1">KOMUNIKASI</text>
                          <text x={Cx - R * 0.866 - 10} y={Cy + R * 0.5 + 10} textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="1">LIFESTYLE</text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Share Card & Action Box */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-full space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-brand-primary">
                    <Award className="w-5 h-5 text-brand-accent animate-pulse" />
                    <h3 className="font-bold text-white font-outfit">Sertifikasi Refleksi Anda Siap</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-inter">
                    Unduh kartu infografis modern yang dirancang khusus untuk feed LinkedIn Anda. Gunakan template caption di bawah untuk menceritakan proses introspeksi diri Anda tanpa kesan menyombongkan skor numerik.
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    onClick={downloadOgImage}
                    disabled={isDownloading}
                    className="w-full px-5 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-teal-500/10 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Mempersiapkan Gambar...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Unduh Infografis LinkedIn</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleStartNew}
                    className="w-full px-5 py-3 text-xs font-bold rounded-xl border border-white/10 text-white/80 hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-white/50" />
                    <span>Ulangi Evaluasi Mandiri</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Per-Category Insights Grid */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold font-outfit text-white border-b border-white/10 pb-2 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-brand-primary" />
                <span>Analisis Hasil 3 Pilar</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const score = savedResultData.scores[cat.id as "technical" | "communication" | "lifestyle"];
                  const insight = getInsight(score, cat.id as any, "id");
                  
                  let themeBorder = "border-teal-500/10";
                  if (cat.id === "communication") themeBorder = "border-blue-500/10";
                  if (cat.id === "lifestyle") themeBorder = "border-purple-500/10";

                  return (
                    <div key={cat.id} className={`glass-panel p-5 rounded-2xl border ${themeBorder} flex flex-col justify-between space-y-4`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">{cat.label}</span>
                          <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border rounded-md font-bold ${insight.color}`}>
                            {insight.badge}
                          </span>
                        </div>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-3xl font-black text-white font-outfit">{score.toFixed(1)}</span>
                          <span className="text-xs text-white/40 font-semibold">/ 5.0</span>
                        </div>
                      </div>

                      <p className="text-xs text-white/60 leading-relaxed font-inter pt-2 border-t border-white/5">
                        {insight.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LinkedIn Copy-Paste Caption Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white font-outfit flex items-center space-x-2 text-sm sm:text-base">
                    <Send className="w-4 h-4 text-brand-secondary" />
                    <span>Rekomendasi Caption Post LinkedIn</span>
                  </h3>
                  <p className="text-xs text-white/50">Posting infografis yang diunduh di atas bersama draf teks berikut.</p>
                </div>

                {/* Language Toggle */}
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setCaptionLang("id")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      captionLang === "id" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    Bahasa Indonesia
                  </button>
                  <button
                    onClick={() => setCaptionLang("en")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      captionLang === "en" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Caption Textarea (Editable) */}
              <div className="relative">
                <textarea
                  value={captionLang === "id" ? linkedinCaptionId : linkedinCaptionEn}
                  readOnly
                  rows={8}
                  className="w-full bg-[#05081a] border border-white/10 rounded-xl p-4 text-xs leading-relaxed text-white/80 focus:border-brand-primary outline-none font-mono"
                />
                
                {/* Floating Copy Button */}
                <button
                  onClick={handleCopyCaption}
                  className="absolute right-3 bottom-3 px-3.5 py-2 text-[11px] font-bold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white active:scale-95 transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Teks</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span className="text-[10px] text-white/50 leading-relaxed font-inter">
                  <strong>Tips Privasi:</strong> Data skor Anda tidak dipublikasikan ke database manapun. Tautan pada caption di atas murni merujuk ke halaman landing penilaian agar rekan kerja atau jejaring Anda juga dapat mengevaluasi kesiapan mereka secara privat.
                </span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border-faint glass-panel py-6 text-center text-xs text-white/40">
        <p>© 2026 Remotika Team. All rights reserved. Made with 🤍 for Indonesian tech developers.</p>
      </footer>

    </div>
  );
}
