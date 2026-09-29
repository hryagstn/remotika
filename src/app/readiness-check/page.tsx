"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import { 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Clock, 
  ShieldAlert,
  Brain,
  MessageSquare,
  Activity,
  Award,
  Send,
  X
} from "lucide-react";
import { readinessQuestions } from "../../data/readiness-questions";

// Custom SVG GitHub Icon
// Custom SVG LinkedIn Icon (Official Solid design matching web)
const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const LOCAL_STORAGE_KEY = "remotika:readiness-result";
type SavedResult = { scores: { technical: number; communication: number; lifestyle: number }; timestamp: string };
function subscribeToSavedResult(callback: () => void) { window.addEventListener("storage", callback); return () => window.removeEventListener("storage", callback); }
function getSavedSnapshot() { try { return localStorage.getItem(LOCAL_STORAGE_KEY); } catch { return null; } }
function getServerSnapshot() { return null; }
function parseSavedResult(raw: string | null): SavedResult | null {
  try { const result = raw ? JSON.parse(raw) : null; return result && typeof result.timestamp === "string" && ["technical", "communication", "lifestyle"].every(key => typeof result.scores?.[key] === "number" && result.scores[key] >= 1 && result.scores[key] <= 5) ? result : null; } catch { return null; }
}

// Mapped Insights based on average score
const getInsight = (score: number, category: "technical" | "communication" | "lifestyle", lang: "id" | "en") => {
  if (score >= 4.0) {
    return {
      text: lang === "id" 
        ? "Anda menilai diri cukup nyaman di area ini. Siapkan contoh pengalaman yang mendukung penilaian Anda."
        : "This is a strength. Lean into it when positioning yourself in remote job applications and interviews.",
      badge: lang === "id" ? "Kekuatan Utama" : "Core Strength",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    };
  } else if (score >= 2.5) {
    return {
      text: lang === "id"
        ? "Ada kebiasaan yang sudah terbentuk. Pilih satu bagian yang masih sulit untuk dilatih secara rutin."
        : "Solid footing, with room to grow. Worth being honest about this in interviews rather than overselling it.",
      badge: lang === "id" ? "Cukup Siap" : "Solid Footing",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    };
  } else {
    return {
      text: lang === "id"
        ? "Mulai dari latihan kecil di area ini, lalu ulangi evaluasi setelah Anda punya pengalaman baru."
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
  const [isSharing, setIsSharing] = useState(false);
  const [isShareGuideOpen, setIsShareGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [captionLang, setCaptionLang] = useState<"id" | "en">("id");
  const snapshot = useSyncExternalStore(subscribeToSavedResult, getSavedSnapshot, getServerSnapshot);
  const storedResult = useMemo(() => parseSavedResult(snapshot), [snapshot]);
  const [currentResult, setSavedResultData] = useState<SavedResult | null>(null);
  const savedResultData = currentResult ?? storedResult;
  const hasSavedResult = Boolean(savedResultData);

  // Group questions by category
  const categories = [
    { id: "technical", label: "Kesiapan Teknis", icon: <Brain className="w-5 h-5 text-teal-400" />, themeColor: "teal" },
    { id: "communication", label: "Kesiapan Komunikasi", icon: <MessageSquare className="w-5 h-5 text-blue-400" />, themeColor: "blue" },
    { id: "lifestyle", label: "Gaya Hidup & Mental", icon: <Activity className="w-5 h-5 text-purple-400" />, themeColor: "purple" }
  ];

  const currentCategory = categories[currentCatIndex];
  const currentQuestions = readinessQuestions.filter(q => q.category === currentCategory.id);

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

    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result)); } catch { /* Results remain available for this session when storage is disabled. */ }
    setSavedResultData(result);
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

  const handleOneClickShare = async () => {
    if (!savedResultData) return;
    setIsSharing(true);
    
    // 1. Copy prefilled caption
    const textToCopy = captionLang === "id" ? linkedinCaptionId : linkedinCaptionEn;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Gagal menyalin teks ke clipboard:", err);
    }

    // 2. Download image
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
      console.error("Gagal mengunduh gambar:", err);
    }

    // 3. Show share guide modal
    setIsShareGuideOpen(true);
    setIsSharing(false);
  };

  const handleProceedToLinkedin = () => {
    window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");
    setIsShareGuideOpen(false);
  };

  // Pre-filled LinkedIn Captions
  const linkedinCaptionId = `Saya menggunakan evaluasi mandiri Remotika untuk meninjau kebiasaan teknis, komunikasi, dan keseharian saat bekerja remote. Hasilnya membantu saya memilih hal yang ingin dilatih berikutnya.\n\nhttps://remotika.vercel.app/readiness-check`;

  const linkedinCaptionEn = `I used Remotika's self-assessment to reflect on my technical habits, communication, and daily routine for remote work. It helped me choose what to practice next.\n\nhttps://remotika.vercel.app/readiness-check`;

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
    <div className="apple-page relative min-h-screen bg-bg-base overflow-hidden flex flex-col grid-pattern">
      
      {/* Navigation Header */}

      {/* Main Container */}
      <main className="research-page readiness-page">
        
        {/* ================= STEP 1: WELCOME SCREEN ================= */}
        {step === "welcome" && (
          <div className="space-y-10 animate-fade-in py-6">
            
            <div className="readiness-intro"><header className="page-intro"><p className="eyebrow">Evaluasi mandiri</p><h1>Persiapkan cara kerja remote Anda.</h1><p className="page-intro__copy">Kenali kebiasaan yang sudah membantu Anda bekerja mandiri dan bagian yang masih perlu dilatih.</p><p className="source-note">24 pernyataan · sekitar 5–10 menit</p></header><aside><h2>Yang akan Anda tinjau</h2><dl className="definition-list"><div><dt>Teknis</dt><dd>Menyelesaikan tugas dan menerima tinjauan kode.</dd></div><div><dt>Komunikasi</dt><dd>Menulis pembaruan dan bekerja lintas zona waktu.</dd></div><div><dt>Keseharian</dt><dd>Rutinitas, lingkungan kerja, dan batas waktu.</dd></div></dl></aside></div>

            <p className="readiness-privacy">Jawaban diproses di browser ini. Hasil tersimpan pada perangkat Anda. Evaluasi ini bukan penilaian kemampuan atau jaminan kesiapan kerja.</p>
            {/* Actions & Local Storage Hook */}
            <div className="readiness-actions">
              <button
                onClick={handleStartNew}
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 active:scale-98 transition-all shadow-lg shadow-brand-primary/25 text-center cursor-pointer"
              >
                Mulai evaluasi
              </button>

              {hasSavedResult && savedResultData && (
                <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 max-w-md w-full text-center space-y-4 animate-fade-in">
                  <div className="flex items-center justify-center space-x-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold font-outfit uppercase tracking-wider">Hasil tersimpan</span>
                  </div>
                  
                  <div className="text-xs text-white/70">
                    <p className="font-semibold text-white">Terakhir diperiksa pada {savedResultData.timestamp}</p>
                    <div className="flex justify-center gap-4 mt-2 font-mono font-bold text-text-primary text-xs">
                      <span className="text-teal-400">Teknis: {savedResultData.scores.technical.toFixed(1)}</span>
                      <span className="text-blue-400">Komunikasi: {savedResultData.scores.communication.toFixed(1)}</span>
                      <span className="text-purple-400">Gaya Hidup: {savedResultData.scores.lifestyle.toFixed(1)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLoadSaved}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Buka hasil sebelumnya
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
            <div className="question-category">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10`}>
                {currentCategory.icon}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold font-outfit text-white">{currentCategory.label}</h2>
                <p className="text-[15px] text-white/50">
                  {currentCategory.id === "technical" && "Mengevaluasi kesiapan menghadapi tantangan rekayasa, tinjauan kode yang kritis, dan pengerjaan tugas tanpa bimbingan."}
                  {currentCategory.id === "communication" && "Mengevaluasi kenyamanan Anda dalam menulis, mendokumentasikan, dan berkomunikasi secara asinkron di lintas zona waktu."}
                  {currentCategory.id === "lifestyle" && "Mengevaluasi kesiapan mental, isolasi sosial, dana darurat, dan kedisiplinan kerja mandiri dari rumah."}
                </p>
              </div>
            </div>

            <p className="scale-instructions">1 = sangat tidak setuju · 5 = sangat setuju</p>
            {/* Questions List */}
            <div className="question-list">
              {currentQuestions.map((q, qIdx) => {
                const answerValue = answers[q.id];
                const isError = showErrors && answerValue === undefined;

                return (
                  <div 
                    key={q.id} 
                    className={`question-item ${
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
                        <p className="text-[15px] sm:text-base text-text-primary leading-7">{q.text}</p>
                      </div>

                      {/* Likert Scale UI (1-5 Radio Buttons) */}
                      <div className="pt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <span className="text-xs text-white/40 hidden md:block">Sangat Tidak Setuju</span>
                          
                          <div className="answer-scale">
                            <span className="scale-endpoint">Sangat Tidak Setuju</span>
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isSelected = answerValue === val;
                              
                              // Base styling
                              let btnClasses = "w-11 h-11 rounded-lg text-xs font-semibold border transition-all active:scale-90 cursor-pointer flex items-center justify-center ";

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
                                  aria-pressed={isSelected}
                                  aria-label={`${val} dari 5: ${q.text}`}
                                  onClick={() => handleSelect(q.id, val)}
                                  className={btnClasses}
                                >
                                  {val}
                                </button>
                              );
                            })}
                            <span className="scale-endpoint">Sangat Setuju</span>
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
              <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">Hasil evaluasi Anda</h1>
              <p className="text-[15px] sm:text-[15px] text-text-muted">Gunakan hasil ini untuk memilih kebiasaan yang ingin Anda latih berikutnya.</p>
              <div className="inline-flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-white/50 font-mono">
                <Clock className="w-3 h-3 text-brand-accent" />
                <span>Diperiksa: {savedResultData.timestamp}</span>
              </div>
            </div>

            <section className="readiness-insights"><h2>Tiga area yang Anda nilai</h2>{categories.map(cat => { const score=savedResultData.scores[cat.id as "technical" | "communication" | "lifestyle"]; const insight=getInsight(score,cat.id as "technical" | "communication" | "lifestyle","id"); return <div key={cat.id} className="readiness-score-row"><div><h3>{cat.label}</h3><p><strong>{score.toFixed(1)}</strong> / 5</p><span>{insight.badge}</span></div><p>{insight.text}</p></div>; })}</section>

            <details className="disclosure"><summary>Simpan atau bagikan hasil</summary><div>
            {/* Visual Charts Container (Radar Chart & Dynamic Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Custom SVG Radar Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[340px]">
                <h3 className="text-xs font-bold font-outfit text-text-muted uppercase tracking-wider mb-4">Perbandingan skor</h3>
                
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
                    <h3 className="font-bold text-white font-outfit">Simpan ringkasan hasil</h3>
                  </div>
                  <p className="text-[15px] sm:text-[15px] text-white/70 leading-7 font-inter">
                    Unduh ringkasan skor atau salin teks untuk dibagikan. Anda menentukan sendiri kapan dan kepada siapa hasil ini dibagikan.
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    onClick={handleOneClickShare}
                    disabled={isSharing || isDownloading}
                    className="w-full px-5 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-[#0077b5] to-[#00a0dc] text-white hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[#0077b5]/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSharing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyiapkan hasil…</span>
                      </>
                    ) : (
                      <>
                        <LinkedinIcon className="w-4 h-4" />
                        <span>Bagikan ke LinkedIn</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={downloadOgImage}
                      disabled={isDownloading || isSharing}
                      className="px-4 py-2.5 text-xs font-bold rounded-xl border border-white/10 text-white/80 hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-white/50" />
                      )}
                      <span>Unduh Gambar</span>
                    </button>

                    <button
                      onClick={handleStartNew}
                      className="px-4 py-2.5 text-xs font-bold rounded-xl border border-white/10 text-white/80 hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-white/50" />
                      <span>Ulangi evaluasi</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* LinkedIn Copy-Paste Caption Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white font-outfit flex items-center space-x-2 text-sm sm:text-base">
                    <Send className="w-4 h-4 text-brand-secondary" />
                    <span>Teks untuk dibagikan</span>
                  </h3>
                  <p className="text-[15px] text-white/50">Posting infografis yang diunduh di atas bersama draf teks berikut.</p>
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
                  className="absolute right-3 bottom-3 px-3.5 py-2 text-xs font-bold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white active:scale-95 transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
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
                <span className="text-xs text-white/50 leading-relaxed font-inter">
                  <strong>Tips Privasi:</strong> Data skor Anda tidak dipublikasikan ke database manapun. Tautan pada caption di atas murni merujuk ke halaman landing penilaian agar rekan kerja atau jejaring Anda juga dapat mengevaluasi kesiapan mereka secara privat.
                </span>
              </div>
            </div>

            </div></details>

          </div>
        )}

      </main>

      {/* LinkedIn Share Guide Modal */}
      {isShareGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 relative space-y-5">
            <button 
              onClick={() => setIsShareGuideOpen(false)}
              aria-label="Tutup panduan berbagi"
              className="absolute right-4 top-4 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center pt-2">
              <div className="w-12 h-12 rounded-full bg-[#0077b5]/10 border border-[#0077b5]/20 flex items-center justify-center text-[#0077b5] mx-auto animate-pulse">
                <LinkedinIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold font-outfit text-white">Panduan Berbagi ke LinkedIn</h2>
              <p className="text-[15px] text-white/50 leading-7">
                Ikuti langkah mudah berikut agar postingan Anda tampil sempurna dengan infografis hasil tes:
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Step 1 */}
              <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">1</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Gambar Infografis Terunduh</h4>
                  <p className="text-[15px] text-white/60 leading-7">
                    Kartu skor infografis otomatis terunduh di folder download Anda (bernama <code className="text-teal-400 font-mono text-xs bg-white/5 px-1 py-0.5 rounded">remotika-readiness-check.png</code>).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">2</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Caption Otomatis Tersalin</h4>
                  <p className="text-[15px] text-white/60 leading-7">
                    Teks deskripsi kustom dwi-bahasa (Bahasa Indonesia/Inggris) sudah disalin ke clipboard Anda.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">3</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Tempel & Posting</h4>
                  <p className="text-[15px] text-white/60 leading-7">
                    Di halaman LinkedIn, klik kolom postingan, lalu tekan <strong className="font-bold text-white">Paste (Ctrl/Cmd + V)</strong> untuk menempel teks dan <strong className="font-bold text-white">unggah</strong> gambar infografis yang tadi terunduh.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToLinkedin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0077b5] to-[#00a0dc] text-sm font-semibold text-white shadow-lg shadow-[#0077b5]/20 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LinkedinIcon className="w-4 h-4" />
              <span>Buka LinkedIn & Buat Postingan</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}

    </div>
  );
}
