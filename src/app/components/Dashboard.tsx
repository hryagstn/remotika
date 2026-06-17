"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  ExternalLink, 
  Download, 
  Code, 
  Briefcase, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  ChevronDown,
  ChevronUp,
  X,
  Mail,
  Building,
  Plus
} from "lucide-react";

// Inline Custom SVG for GitHub logo (resolves missing brand icons in some lucide-react versions)
const Github = ({ className = "w-4 h-4" }: { className?: string }) => (
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
import { CompanyData, submitSuggestion } from "../actions";

interface DashboardProps {
  initialCompanies: CompanyData[];
}

export default function Dashboard({ initialCompanies }: DashboardProps) {
  const [companies, setCompanies] = useState<CompanyData[]>(initialCompanies);
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Roles");
  const [hasJobsOnly, setHasJobsOnly] = useState(false);
  
  // Modal states
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestOrg, setSuggestOrg] = useState("");
  const [suggestEmail, setSuggestByEmail] = useState("");
  const [suggestStatus, setSuggestStatus] = useState<{ success?: boolean; message?: string; redirectUrl?: string } | null>(null);
  const [isSuggestPending, startSuggestTransition] = useTransition();

  const [activeBadgeOrg, setActiveBadgeOrg] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Find the latest verification date to show database fresh status
  const lastUpdated = React.useMemo(() => {
    const dates = companies
      .map(c => c.lastVerifiedAt ? new Date(c.lastVerifiedAt).getTime() : 0)
      .filter(t => t > 0);
    if (dates.length === 0) return "Recently";
    const maxTime = Math.max(...dates);
    return new Date(maxTime).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, [companies]);

  // Filter list on client-side dynamically for immediate feedback!
  const filteredCompanies = companies.filter((c) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || 
      c.name.toLowerCase().includes(query) ||
      c.githubOrg.toLowerCase().includes(query) ||
      c.industry.toLowerCase().includes(query);
    
    const matchesLabel = labelFilter === "All" || c.label === labelFilter;
    const matchesJobs = !hasJobsOnly || c.hasActiveJobs;

    const matchesCategory = categoryFilter === "All Roles" || (() => {
      const cat = categoryFilter.toLowerCase();
      // Check if industry contains category keyword or synonyms
      const indLower = c.industry.toLowerCase();
      const industryMatches = indLower.includes(cat) || 
        (cat === "engineering" && (indLower.includes("tech") || indLower.includes("development") || indLower.includes("software") || indLower.includes("systems") || indLower.includes("infrastructure") || indLower.includes("devsecops"))) ||
        (cat === "design" && (indLower.includes("design") || indLower.includes("graphics") || indLower.includes("collaboration") || indLower.includes("creative"))) ||
        (cat === "product" && (indLower.includes("product") || indLower.includes("saas") || indLower.includes("platform"))) ||
        (cat === "data" && (indLower.includes("data") || indLower.includes("ai") || indLower.includes("analytics") || indLower.includes("database") || indLower.includes("machine learning"))) ||
        (cat === "operations" && (indLower.includes("operations") || indLower.includes("security") || indLower.includes("devsecops") || indLower.includes("cloud") || indLower.includes("logistics"))) ||
        (cat === "marketing" && (indLower.includes("marketing") || indLower.includes("growth") || indLower.includes("sales") || indLower.includes("seo")));

      // Check if any active job tags/titles match the category
      const jobsMatch = c.activeJobs?.some(job => {
        const jobTitle = job.title.toLowerCase();
        const jobTags = job.tags.map(t => t.toLowerCase());
        if (cat === "engineering") {
          return jobTitle.includes("engineer") || jobTitle.includes("developer") || jobTitle.includes("frontend") || jobTitle.includes("backend") || jobTitle.includes("systems") || jobTags.some(t => ["go", "react", "typescript", "systems", "docker", "nodejs", "backend", "frontend", "engineering", "php"].includes(t));
        }
        if (cat === "design") {
          return jobTitle.includes("design") || jobTitle.includes("ux") || jobTitle.includes("ui") || jobTags.some(t => ["figma", "design", "ux", "ui"].includes(t));
        }
        if (cat === "product") {
          return jobTitle.includes("product") || jobTitle.includes("pm") || jobTitle.includes("manager") || jobTags.some(t => ["product", "pm"].includes(t));
        }
        if (cat === "marketing") {
          return jobTitle.includes("marketing") || jobTitle.includes("growth") || jobTitle.includes("seo") || jobTags.some(t => ["marketing", "growth"].includes(t));
        }
        if (cat === "data") {
          return jobTitle.includes("data") || jobTitle.includes("ai") || jobTitle.includes("analytics") || jobTitle.includes("database") || jobTags.some(t => ["data", "ai", "analytics"].includes(t));
        }
        if (cat === "operations") {
          return jobTitle.includes("operations") || jobTitle.includes("security") || jobTitle.includes("devops") || jobTags.some(t => ["operations", "security", "devops", "aws", "kubernetes"].includes(t));
        }
        return false;
      });

      return industryMatches || jobsMatch;
    })();

    return matchesSearch && matchesLabel && matchesJobs && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = ["Company Name", "GitHub Org", "GitHub Org URL", "Verified Indonesian Members", "Label", "Industry", "Last Verified At"];
    const rows = filteredCompanies.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.githubOrg,
      c.githubOrgUrl,
      c.verifiedIndonesianCount,
      c.label,
      `"${c.industry.replace(/"/g, '""')}"`,
      c.lastVerifiedAt ? new Date(c.lastVerifiedAt).toLocaleDateString() : 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "remotika-verified-companies.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestStatus(null);
    if (!suggestOrg) return;

    startSuggestTransition(async () => {
      const res = await submitSuggestion(suggestOrg, suggestEmail);
      setSuggestStatus(res);
      if (res.success) {
        setSuggestOrg("");
        setSuggestByEmail("");
        if (res.redirectUrl) {
          setTimeout(() => {
            window.open(res.redirectUrl, "_blank");
          }, 1500);
        }
      }
    });
  };

  const labels = ["All", "Top Pick", "Established", "Indonesia-Friendly", "Confirmed"];
  const categories = ["All Roles", "Engineering", "Design", "Product", "Marketing", "Data", "Operations"];

  const getLabelStyles = (label: string) => {
    switch (label) {
      case "Top Pick":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Established":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "Indonesia-Friendly":
        return "bg-teal-500/10 text-teal-400 border-teal-500/30";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  const getTierFlatColor = (label: string) => {
    switch (label) {
      case "Top Pick":
        return "bg-amber-600";
      case "Established":
        return "bg-purple-600";
      case "Indonesia-Friendly":
        return "bg-teal-600";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-base overflow-hidden flex flex-col grid-pattern">
      {/* Navigation Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-border-faint backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/logo.svg" alt="Remotika Logo" className="w-9 h-9 object-contain rounded-xl shadow-lg shadow-brand-primary/20" />
              <div>
                <span className="text-lg font-bold tracking-tight text-white font-outfit">Remotika</span>
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">v1.2</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSuggestOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 active:scale-95 transition-all shadow-md shadow-brand-primary/25 flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sarankan Perusahaan</span>
            </button>
            <a 
              href={process.env.NEXT_PUBLIC_GITHUB_REPO || "https://github.com/hryagstn/remotika"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 space-y-12 pt-20">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 animate-fade-in max-w-3xl mx-auto py-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium">
            <span className="flex h-2 w-2 rounded-full bg-brand-accent animate-ping" />
            <span>Verifikasi Berbasis Organisasi via API GitHub</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-outfit">
            Temukan perusahaan global yang <span className="text-gradient">memercayai talenta Indonesia</span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 leading-relaxed font-inter">
            Bukan sekadar klaim sepihak. Remotika memindai keanggotaan GitHub publik dari perusahaan internasional untuk memverifikasi tempat insinyur Indonesia benar-benar bekerja.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-6 text-xs text-white/50">
            <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle className="w-3.5 h-3.5 text-brand-accent" />
              <span>100% Terverifikasi Kriptografis</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <Users className="w-3.5 h-3.5 text-brand-primary" />
              <span>Saran Komunitas Aktif</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <TrendingUp className="w-3.5 h-3.5 text-brand-secondary" />
              <span>Pengayaan Lowongan Kerja Aktif</span>
            </div>
          </div>
        </section>

        {/* Filter & Controls Panel */}
        <section className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl shadow-black/40">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan perusahaan, username GitHub, atau industri..."
                className="w-full bg-[#080d24] border border-white/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl pl-10 pr-10 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none transition-all"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle & CSV Button */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <label className="flex items-center space-x-2 text-xs font-semibold text-white/70 cursor-pointer select-none border border-white/10 px-3 py-2.5 rounded-xl bg-[#080d24] hover:bg-white/5 transition-all">
                <input
                  type="checkbox"
                  checked={hasJobsOnly}
                  onChange={(e) => setHasJobsOnly(e.target.checked)}
                  className="rounded border-white/10 text-brand-primary focus:ring-brand-primary bg-[#080d24] h-4 w-4 transition-all"
                />
                <span className="flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-brand-secondary" />
                  <span>Memiliki Lowongan Aktif</span>
                </span>
              </label>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-[#080d24] hover:bg-white/5 text-white/80 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>

          {/* Level Filter Pills */}
          <div className="border-t border-white/5 pt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-white/50 mr-2">Level Verifikasi:</span>
            {labels.map((lbl) => (
              <button
                key={lbl}
                onClick={() => setLabelFilter(lbl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  labelFilter === lbl
                    ? "bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20"
                    : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {lbl === "All" ? "Semua" : lbl}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="border-t border-white/5 pt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-white/50 mr-2">Kategori Peran:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  categoryFilter === cat
                    ? "bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20"
                    : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat === "All Roles" ? "Semua Peran" :
                 cat === "Engineering" ? "Engineering" :
                 cat === "Design" ? "Desain" :
                 cat === "Product" ? "Produk" :
                 cat === "Marketing" ? "Pemasaran" :
                 cat === "Data" ? "Data" :
                 cat === "Operations" ? "Operasional" : cat}
              </button>
            ))}
          </div>
        </section>

        {/* Listing Stats */}
        <div className="flex justify-between items-center text-xs text-white/50 px-2">
          <div>
            Menampilkan <span className="text-white font-semibold">{filteredCompanies.length}</span> dari <span className="text-white font-semibold">{companies.length}</span> perusahaan terverifikasi
          </div>
          <div>
            Database Terakhir Diperbarui: <span className="text-white font-semibold" suppressHydrationWarning>{lastUpdated}</span>
          </div>
        </div>

        {/* Company Card Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((c) => {
              const isExpanded = expandedCard === c.id;
              
              return (
                <div 
                  key={c.id} 
                  className={`relative bg-bg-surface border rounded-2xl hover:scale-[1.01] hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl ${
                    c.label === "Top Pick" ? "border-amber-500/20 hover:border-amber-500/40" : "border-border-faint"
                  }`}
                >
                  <div className="p-6 space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3.5">
                        {/* Company Logo Initials fallback (Flat tier color as per Stitch spec) */}
                        <Link href={`/company/${c.id}`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-inner ${getTierFlatColor(c.label)}`}>
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                        </Link>
                        <div>
                          <Link href={`/company/${c.id}`} className="group/title">
                            <h3 className="font-bold text-white text-base font-outfit flex items-center gap-1.5 hover:text-brand-primary transition-colors">
                              {c.name}
                            </h3>
                          </Link>
                          <span className="text-xs text-white/40">@{c.githubOrg}</span>
                        </div>
                      </div>

                      {/* GitHub Link */}
                      <a 
                        href={c.githubOrgUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Verified Level Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${getLabelStyles(c.label)}`}>
                        {c.label}
                      </span>
                      <span className="bg-white/5 border border-white/5 text-white/70 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Users className="w-3 h-3 text-brand-primary" />
                        <span>{c.verifiedIndonesianCount} Anggota Terverifikasi</span>
                      </span>
                    </div>

                    {/* Industry */}
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {c.industry}
                    </p>

                    {/* Active Jobs Section */}
                    {c.hasActiveJobs && c.activeJobs && c.activeJobs.length > 0 && (
                      <div className="border-t border-white/5 pt-3.5 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>Lowongan Kerja Remote Aktif ({c.activeJobs.length})</span>
                        </span>
                        <div className="space-y-1.5">
                          {c.activeJobs.slice(0, 2).map((job, idx) => (
                            <a 
                              key={idx} 
                              href={job.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="text-xs font-semibold text-white/90 group-hover:text-brand-primary transition-colors line-clamp-1">{job.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-white/30 group-hover:text-white/70 transition-all shrink-0" />
                              </div>
                              <div className="flex justify-between items-center mt-1 text-[9px] text-white/40">
                                <span className="line-clamp-1">{job.tags.join(", ")}</span>
                                {job.salary && <span className="text-white/60 font-semibold">{job.salary}</span>}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-6 pb-5 pt-2 border-t border-white/5 bg-black/10 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : c.id)}
                      className="text-white/50 hover:text-white flex items-center space-x-1 font-semibold transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Sembunyikan Anggota</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Lihat {c.verifiedMembers.length} Anggota</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveBadgeOrg(c.githubOrg)}
                      className="text-white/40 hover:text-white flex items-center space-x-1 transition-colors"
                      title="Ambil kode badge embed"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Ambil Badge</span>
                    </button>
                  </div>

                  {/* Expandable member list drawer as absolute overlay to prevent changing card height */}
                  {isExpanded && (
                    <div className="absolute inset-0 bg-[#0a0f1e]/98 p-6 flex flex-col justify-between z-20 animate-fade-in border border-brand-primary/30 rounded-2xl">
                      <div className="space-y-4 flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center shrink-0">
                          <span className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5 font-outfit">
                            <Users className="w-4 h-4 text-brand-accent" />
                            <span>Anggota Terverifikasi ({c.verifiedMembers.length})</span>
                          </span>
                          <button 
                            onClick={() => setExpandedCard(null)}
                            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
                            title="Tutup daftar anggota"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-1 flex-1 min-h-0">
                          {c.verifiedMembers.map((m) => (
                            <a 
                              key={m.id}
                              href={m.githubProfileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
                            >
                              <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors flex items-center gap-1.5 font-inter">
                                <Github className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
                                <span>{m.githubLogin}</span>
                              </span>
                              <span className="text-[10px] text-white/40 flex items-center gap-1 max-w-[130px] truncate font-inter">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-brand-primary" />
                                <span className="truncate">{m.locationRaw || "Indonesia"}</span>
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setExpandedCard(null)}
                        className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all text-center shrink-0 font-inter"
                      >
                        Kembali ke Info Perusahaan
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full glass-panel py-16 px-6 text-center rounded-2xl border border-white/10 space-y-4">
              <Building className="w-12 h-12 text-white/30 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-white font-outfit">Tidak ada perusahaan yang cocok dengan filter Anda</h3>
                <p className="text-sm text-white/50 max-w-sm mx-auto">Coba hapus kueri pencarian Anda atau pilih tingkat verifikasi yang berbeda.</p>
              </div>
              <button 
                onClick={() => { setSearch(""); setLabelFilter("All"); setCategoryFilter("All Roles"); setHasJobsOnly(false); }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/15 text-white transition-all border border-white/10"
              >
                Atur Ulang Filter
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-faint py-10 mt-20 relative z-10 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center items-center space-x-1.5 text-xs text-white/40">
            <span>Dibuat untuk Freelancer dan Pencari Kerja Indonesia</span>
          </div>
          <p className="text-[11px] text-white/30 max-w-md mx-auto leading-relaxed">
            Data diverifikasi secara dinamis dengan memindai riwayat aktivitas organisasi publik di GitHub. Dukung open-source. Kirimkan saran Anda dan bergabunglah dalam revolusi teknologi Indonesia.
          </p>
          <div className="text-[10px] text-white/20">
            © {new Date().getFullYear()} Remotika. Hak Cipta Dilindungi Undang-Undang.
          </div>
        </div>
      </footer>

      {/* Suggest a Company Modal */}
      {isSuggestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 relative space-y-5">
            <button 
              onClick={() => { setIsSuggestOpen(false); setSuggestStatus(null); }}
              className="absolute right-4 top-4 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                <span>Sarankan Perusahaan</span>
              </h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Tambahkan perusahaan internasional/global ke dalam antrean kami. Kami akan menjalankan pipeline verifikasi pada organisasi GitHub mereka untuk menemukan anggota dari Indonesia.
              </p>
            </div>

            <form onSubmit={handleSuggestSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">Username Org GitHub</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold select-none">github.com/</span>
                  <input
                    type="text"
                    required
                    value={suggestOrg}
                    onChange={(e) => setSuggestOrg(e.target.value)}
                    placeholder="shopify"
                    disabled={isSuggestPending}
                    className="w-full bg-[#080d24] border border-white/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl pl-[100px] pr-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">Email Anda (Opsional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={suggestEmail}
                    onChange={(e) => setSuggestByEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isSuggestPending}
                    className="w-full bg-[#080d24] border border-white/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              {suggestStatus && (
                <div className={`p-3.5 rounded-xl text-xs border ${
                  suggestStatus.success 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}>
                  {suggestStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSuggestPending}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
              >
                {isSuggestPending ? (
                  <span className="border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin" />
                ) : (
                  <span>Kirim Saran</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Embed Badge Generator Modal */}
      {activeBadgeOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6 relative space-y-5">
            <button 
              onClick={() => setActiveBadgeOrg(null)}
              className="absolute right-4 top-4 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-primary" />
                <span>Badge Embed README</span>
              </h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Sebarkan kabar baik ini! Pasang badge terverifikasi ini di README repositori perusahaan Anda untuk menunjukkan bahwa tim engineering Anda memercayai talenta remote dari Indonesia.
              </p>
            </div>

            <div className="space-y-4">
              {/* Badge Preview */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-col items-center justify-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Pratinjau Badge</span>
                {/* Embedded SVG preview */}
                <div className="inline-flex rounded overflow-hidden shadow-md text-[11px] font-bold font-sans">
                  <div className="bg-[#1f2937] text-white px-2.5 py-1 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                    <span>Remotika</span>
                  </div>
                  <div className="bg-brand-primary text-white px-2.5 py-1">
                    Verified Talent
                  </div>
                </div>
              </div>

              {/* Embed markdown code block */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">Kode Embed Markdown</label>
                <div className="relative">
                  <pre className="bg-[#080d24] border border-white/10 rounded-xl p-3 text-xs text-white/90 overflow-x-auto select-all max-w-full font-mono">
{`[![Remotika Verified](https://remotika.vercel.app/api/badge?org=${activeBadgeOrg})](https://remotika.vercel.app)`}
                  </pre>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">Kode Embed HTML</label>
                <div className="relative">
                  <pre className="bg-[#080d24] border border-white/10 rounded-xl p-3 text-xs text-white/90 overflow-x-auto select-all max-w-full font-mono">
{`<a href="https://remotika.vercel.app"><img src="https://remotika.vercel.app/api/badge?org=${activeBadgeOrg}" alt="Remotika Verified" /></a>`}
                  </pre>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`[![Remotika Verified](https://remotika.vercel.app/api/badge?org=${activeBadgeOrg})](https://remotika.vercel.app)`);
                  alert("Kode Markdown berhasil disalin!");
                }}
                className="w-full py-2.5 rounded-xl border border-white/10 bg-[#080d24] hover:bg-white/5 text-sm font-semibold text-white transition-all"
              >
                Salin Kode Markdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
