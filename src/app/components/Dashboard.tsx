"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";

import { Check, ChevronDown, Code2, Mail, Search, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatExternalUrl } from "@/lib/utils";
import { CompanyData, submitSuggestion } from "../actions";

const TELEGRAM_CHANNEL_URL = "https://t.me/remotika_updates";

interface DashboardProps { initialCompanies: CompanyData[] }
type SortKey = "members" | "verified" | "name" | "jobs";
type TabFilter = "all" | "global" | "local" | "watchlist";

const labels = ["All", "Top Pick", "Established", "Indonesia-Friendly", "Confirmed"];
const categories = ["All Roles", "Engineering", "Design", "Product", "Marketing", "Data", "Operations"];
const categoryLabels: Record<string, string> = { "All Roles": "Semua peran", Engineering: "Engineering", Design: "Desain", Product: "Produk", Marketing: "Pemasaran", Data: "Data", Operations: "Operasional" };
const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function matchesCategory(company: CompanyData, category: string) {
  if (category === "All Roles") return true;
  const value = category.toLowerCase();
  const synonyms: Record<string, string[]> = {
    engineering: ["tech", "development", "software", "systems", "infrastructure", "devsecops", "developer"],
    design: ["design", "graphics", "creative", "ux", "ui"], product: ["product", "saas", "platform"],
    marketing: ["marketing", "growth", "sales", "seo"], data: ["data", "ai", "analytics", "database", "machine learning"],
    operations: ["operations", "security", "devops", "cloud", "logistics"],
  };
  const terms = [value, ...(synonyms[value] || [])];
  if (terms.some((term) => (company.industry || "").toLowerCase().includes(term))) return true;
  return Boolean(company.activeJobs?.some((job) => terms.some((term) => `${job.title} ${job.tags.join(" ")}`.toLowerCase().includes(term))));
}

export default function Dashboard({ initialCompanies }: DashboardProps) {
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Roles");
  const [tabFilter, setTabFilter] = useState<TabFilter>("all");
  const [hasJobsOnly, setHasJobsOnly] = useState(false);
  const [hideWatchlist, setHideWatchlist] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("members");
  
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [badgeOrg, setBadgeOrg] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [suggestOrg, setSuggestOrg] = useState("");
  const [suggestEmail, setSuggestEmail] = useState("");
  const [suggestStatus, setSuggestStatus] = useState<{ success?: boolean; message?: string; redirectUrl?: string } | null>(null);
  const [suggestPending, startSuggestTransition] = useTransition();
  const hasModal = suggestOpen || Boolean(badgeOrg);

  useEffect(() => {
    if (!hasModal) return;
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href], select, textarea, [tabindex="0"]') || []);
    focusable()[0]?.focus();
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSuggestOpen(false); setBadgeOrg(null); setSuggestStatus(null); }
      if (event.key === "Tab") {
        const elements = focusable(); const first = elements[0]; const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", closeOnEscape); previousFocus?.focus(); };
  }, [hasModal]);

  const stats = useMemo(() => {
    const total = initialCompanies.length;
    const verified = initialCompanies.filter((company) => company.status !== "watchlist");
    const globalVerifiedCount = verified.filter(c => c.scope !== "local").length;
    const localVerifiedCount = verified.filter(c => c.scope === "local").length;
    const watchlistCount = initialCompanies.filter(c => c.status === "watchlist").length;
    return {
      total,
      verifiedCount: verified.length,
      globalVerifiedCount,
      localVerifiedCount,
      watchlistCount,
      members: verified.reduce((sum, company) => sum + company.verifiedIndonesianCount, 0),
      jobs: initialCompanies.reduce((sum, company) => sum + (company.activeJobs?.length || 0), 0)
    };
  }, [initialCompanies]);

  const lastUpdated = useMemo(() => {
    const dates = initialCompanies.map((company) => company.lastVerifiedAt ? new Date(company.lastVerifiedAt).getTime() : 0).filter(Boolean);
    return dates.length ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(Math.max(...dates))) : "Baru-baru ini";
  }, [initialCompanies]);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return initialCompanies.filter((company) => {
      const inSearch = !query || company.name.toLowerCase().includes(query) || company.githubOrg.toLowerCase().includes(query) || Boolean(company.industry?.toLowerCase().includes(query));
      
      const inTab = (() => {
        if (tabFilter === "global") return company.status !== "watchlist" && company.scope !== "local";
        if (tabFilter === "local") return company.status !== "watchlist" && company.scope === "local";
        if (tabFilter === "watchlist") return company.status === "watchlist";
        return !hideWatchlist || company.status !== "watchlist";
      })();

      return inSearch && inTab && (labelFilter === "All" || company.label === labelFilter) && (!hasJobsOnly || company.hasActiveJobs) && matchesCategory(company, categoryFilter);
    }).sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name, "id", { sensitivity: "base" });
      if (sortBy === "verified") return new Date(b.verifiedAt || b.lastVerifiedAt || 0).getTime() - new Date(a.verifiedAt || a.lastVerifiedAt || 0).getTime();
      if (sortBy === "jobs") return (b.activeJobs?.length || 0) - (a.activeJobs?.length || 0);
      return b.verifiedIndonesianCount - a.verifiedIndonesianCount;
    });
  }, [categoryFilter, hasJobsOnly, hideWatchlist, initialCompanies, labelFilter, tabFilter, search, sortBy]);

  const resetFilters = () => { setSearch(""); setLabelFilter("All"); setCategoryFilter("All Roles"); setTabFilter("all"); setHasJobsOnly(false); setHideWatchlist(false); };
  const exportCsv = () => {
    const headers = ["Company Name", "Status", "Scope", "GitHub Org", "GitHub URL", "Verified Members", "Label", "Industry", "Last Verified"];
    const rows = filteredCompanies.map((company) => [
      `"${company.name.replace(/"/g, '""')}"`,
      company.status === "watchlist" ? "Watchlist" : "Verified",
      company.scope === "local" ? "Local" : "Global",
      company.githubOrg,
      company.githubOrgUrl,
      company.verifiedIndonesianCount,
      company.label,
      `"${(company.industry || "").replace(/"/g, '""')}"`,
      company.lastVerifiedAt ? new Date(company.lastVerifiedAt).toLocaleDateString("id-ID") : "N/A"
    ]);
    const blob = new Blob([[headers.join(","), ...rows.map((row) => row.join(","))].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "remotika-verified-companies.csv"; anchor.click(); URL.revokeObjectURL(url);
  };
  const sendSuggestion = (event: React.FormEvent) => {
    event.preventDefault(); if (!suggestOrg.trim()) return; setSuggestStatus(null);
    startSuggestTransition(async () => { const result = await submitSuggestion(suggestOrg, suggestEmail); setSuggestStatus(result); if (result.success) { setSuggestOrg(""); setSuggestEmail(""); if (result.redirectUrl) window.setTimeout(() => window.open(result.redirectUrl, "_blank", "noopener,noreferrer"), 900); } });
  };
  const copyBadge = async () => {
    if (!badgeOrg) return; await navigator.clipboard.writeText(`[![Remotika Verified](https://remotika.my.id/api/badge?org=${badgeOrg})](https://remotika.my.id)`); setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="directory-root">
      <a href="#direktori" className="skip-link">Lewati ke direktori</a>

      <main className="research-page directory-page">
        <header className="directory-intro">
          <div><p className="eyebrow">Direktori perusahaan</p><h1>Temukan perusahaan global &amp; lokal yang ramah remote.</h1><p>Bandingkan bukti publik keanggotaan GitHub dan lowongan remote aktif.</p></div>
          <div className="directory-context">
            <span><strong>{stats.total}</strong> perusahaan ({stats.globalVerifiedCount} global terverifikasi, {stats.localVerifiedCount} lokal terverifikasi, {stats.watchlistCount} watchlist)</span>
            <span><strong>{stats.jobs}</strong> lowongan tercatat</span>
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:text-sky-800 dark:text-sky-400 transition-colors"
            >
              <Send size={12} aria-hidden="true" />
              <span>Update harian di Telegram ↗</span>
            </a>
            <Link href="/cara-kerja">Tentang sumber data →</Link>
          </div>
        </header>
        <section id="direktori" aria-label="Cari perusahaan" className="directory-workspace">
          <div className="mb-6 rounded-2xl border border-border/80 bg-white/70 dark:bg-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="size-10 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Send className="size-5 -translate-x-0.5 translate-y-0.5" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-foreground">Pantau lowongan remote baru setiap hari</h2>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                    Telegram Channel
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Rangkuman posisi baru dan perusahaan terverifikasi langsung via <span className="font-medium text-foreground">@remotika_updates</span>.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg text-xs font-semibold shrink-0 w-full sm:w-auto h-8 px-3.5"
              render={
                <a
                  href={TELEGRAM_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Gabung Channel ↗
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-card border border-border/80 w-fit mb-5">
            <button
              type="button"
              onClick={() => setTabFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === "all"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setTabFilter("global")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === "global"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🌐 Global Terverifikasi ({stats.globalVerifiedCount})
            </button>
            <button
              type="button"
              onClick={() => setTabFilter("local")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === "local"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇮🇩 Lokal Terverifikasi ({stats.localVerifiedCount})
            </button>
            <button
              type="button"
              onClick={() => setTabFilter("watchlist")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === "watchlist"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📋 Watchlist ({stats.watchlistCount})
            </button>
          </div>

          <div className="search-toolbar">
            <label className="directory-search"><span className="sr-only">Cari perusahaan, organisasi GitHub, atau industri</span><Search size={20} aria-hidden="true"/><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Cari nama perusahaan atau industri"/>{search && <button type="button" onClick={()=>setSearch("")} aria-label="Hapus pencarian"><X size={18}/></button>}</label>
            <label className="sort-control"><span>Urutkan</span><select value={sortBy} onChange={event=>setSortBy(event.target.value as SortKey)}><option value="members">Anggota terbanyak</option><option value="jobs">Lowongan terbanyak</option><option value="verified">Terakhir diperiksa</option><option value="name">Nama A–Z</option></select></label>
          </div>
          <div className="filter-toolbar"><label><input type="checkbox" checked={hasJobsOnly} onChange={event=>setHasJobsOnly(event.target.checked)}/> Ada lowongan</label>{tabFilter === "all" && (<label><input type="checkbox" checked={hideWatchlist} onChange={event=>setHideWatchlist(event.target.checked)}/> Hanya dengan bukti publik</label>)}<details className="filter-details"><summary>Filter lainnya{labelFilter!=="All" || categoryFilter!=="All Roles" ? " · aktif" : ""}</summary><div><FilterGroup label="Jumlah bukti publik" values={labels} active={labelFilter} onChange={setLabelFilter} format={value=>value==="All"?"Semua tingkat":value}/><FilterGroup label="Bidang" values={categories} active={categoryFilter} onChange={setCategoryFilter} format={value=>categoryLabels[value]}/><button type="button" className="quiet-link" onClick={resetFilters}>Reset filter</button></div></details></div>
          <div className="results-summary"><p aria-live="polite">{filteredCompanies.length} perusahaan · diperiksa {lastUpdated}</p><button type="button" onClick={exportCsv}>Unduh CSV</button></div>
          <div className="company-list-head" aria-hidden="true"><span>Perusahaan</span><span>Bukti publik</span><span>Lowongan</span><span>Diperiksa</span></div>
          <div className="company-list">{filteredCompanies.map(company=><CompanyRow key={company.id} company={company} expanded={expandedCard===company.id} onToggleMembers={()=>setExpandedCard(expandedCard===company.id?null:company.id)} onBadge={()=>{setCopied(false);setBadgeOrg(company.githubOrg);}} onSuggest={name=>{setSuggestOrg(name);setSuggestOpen(true);}}/>)}</div>
          {!filteredCompanies.length && <div className="directory-empty"><h2>Tidak ada perusahaan yang cocok</h2><p>Coba nama lain atau kurangi filter yang dipilih.</p><button type="button" onClick={resetFilters} className="button-secondary">Reset pencarian</button></div>}
          <div className="directory-bottom"><p>Jumlah anggota mengacu pada profil publik, bukan jumlah seluruh karyawan.</p><button type="button" onClick={()=>setSuggestOpen(true)} className="quiet-link">Sarankan perusahaan →</button></div>
        </section>
      </main>


      {suggestOpen && <Modal onClose={() => { setSuggestOpen(false); setSuggestStatus(null); }} title="Sarankan perusahaan" description="Tambahkan organisasi GitHub ke antrean pemeriksaan komunitas."><form onSubmit={sendSuggestion} className="space-y-5"><label className="form-field"><span>Organisasi GitHub</span><div className="input-prefix"><span>github.com/</span><input autoFocus required value={suggestOrg} onChange={(event) => setSuggestOrg(event.target.value)} placeholder="shopify" disabled={suggestPending} /></div></label><label className="form-field"><span>Email (opsional)</span><div className="input-icon"><Mail className="h-4 w-4" /><input type="email" value={suggestEmail} onChange={(event) => setSuggestEmail(event.target.value)} placeholder="nama@contoh.com" disabled={suggestPending} /></div></label>{suggestStatus?.message && <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${suggestStatus.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{suggestStatus.message}</p>}<button type="submit" disabled={suggestPending} className="button-primary w-full justify-center py-3 disabled:cursor-wait disabled:opacity-60">{suggestPending ? "Menyiapkan saran…" : "Lanjutkan ke GitHub"}</button><p className="text-[15px] leading-7 text-slate-500">Anda akan diarahkan ke GitHub untuk meninjau dan mengirim issue. Tidak ada data yang dikirim sebelum Anda menyetujuinya di sana.</p></form></Modal>}
      {badgeOrg && <Modal onClose={() => setBadgeOrg(null)} title="Badge Remotika" description="Tampilkan sinyal verifikasi Remotika di README organisasi Anda."><div className="space-y-5"><div className="flex min-h-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50"><div className="inline-flex overflow-hidden rounded-md text-xs font-bold shadow-sm"><span className="bg-slate-900 px-3 py-1.5 text-white">Remotika</span><span className="bg-indigo-600 px-3 py-1.5 text-white">Verified talent</span></div></div><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Markdown</p><pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-[15px] leading-7 text-slate-200">{`[![Remotika Verified](https://remotika.my.id/api/badge?org=${badgeOrg})](https://remotika.my.id)`}</pre></div><button type="button" onClick={copyBadge} className="button-primary w-full justify-center py-3" aria-live="polite">{copied ? <><Check className="h-4 w-4" />Tersalin</> : <><Code2 className="h-4 w-4" />Salin kode Markdown</>}</button></div></Modal>}
    </div>
  );
}

function FilterGroup({ label, values, active, onChange, format }: { label: string; values: string[]; active: string; onChange: (value: string) => void; format: (value: string) => string }) {
  return <label className="filter-select"><span>{label}</span><select value={active} onChange={event=>onChange(event.target.value)}>{values.map(value=><option key={value} value={value}>{format(value)}</option>)}</select></label>;
}

function CompanyRow({ company, expanded, onToggleMembers, onBadge, onSuggest }: { company: CompanyData; expanded: boolean; onToggleMembers: () => void; onBadge: () => void; onSuggest: (name: string) => void }) {
  const watchlist=company.status==="watchlist";
  const href=`/company/${company.githubOrg?.toLowerCase() || slugify(company.name) || company.id}`;
  const date=company.lastVerifiedAt?new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"short",year:"numeric"}).format(new Date(company.lastVerifiedAt)):"Belum diperiksa";
  const isLocal = company.scope === "local" || (company.headquarters && company.headquarters.toLowerCase().includes("indonesia"));
  return <article className="company-row">
    <div className="company-row__main">
      <div className="company-identity"><Link href={href} className="company-monogram" aria-label={`Profil ${company.name}`}>{company.name.slice(0,2).toUpperCase()}</Link><div><div className="flex items-center gap-1.5 flex-wrap"><h2><Link href={href}>{company.name}</Link></h2><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isLocal ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20" : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20"}`}>{isLocal ? "🇮🇩 Lokal" : "🌐 Global"}</span>{watchlist && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Watchlist</span>}</div><p>{company.industry || (company.githubOrg?`github.com/${company.githubOrg}`:"Organisasi belum ditemukan")}</p></div></div>
      <div className="company-evidence">{watchlist?<><span className="unconfirmed">Belum ditemukan</span><button type="button" onClick={()=>onSuggest(company.name)}>Kirim sumber</button></>:<><button type="button" aria-expanded={expanded} onClick={onToggleMembers}>{company.verifiedMembers.length} anggota <ChevronDown size={14} aria-hidden="true"/></button><span>{company.label}</span></>}</div>
      <div className="company-jobs">{company.activeJobs?.length?<><Link href={href+"#lowongan"}>{company.activeJobs.length} lowongan →</Link><span>Lihat posisi dan lokasi</span></>:company.jobSources?.careerPageUrl?<><a href={formatExternalUrl(company.jobSources.careerPageUrl)} target="_blank" rel="noopener noreferrer">Halaman karier ↗</a><span>Belum ada posisi tercatat</span></>:<><span>Belum ada lowongan</span><Link href={href}>Lihat profil →</Link></>}</div>
      <p className="company-date">{date}</p>
    </div>
    {expanded && <div className="inline-evidence"><div className="section-heading"><h3>Anggota dengan lokasi Indonesia</h3><button type="button" className="quiet-link" onClick={onBadge}>Salin badge</button></div><ul>{company.verifiedMembers.map(member=><li key={member.id}><a href={formatExternalUrl(member.githubProfileUrl)} target="_blank" rel="noopener noreferrer">{member.githubLogin} ↗</a><span>{member.locationRaw || "Indonesia"}</span></li>)}</ul><p>Lokasi berasal dari profil pengguna. <Link href="/cara-kerja#batasan">Baca batasan data</Link>.</p></div>}
  </article>;
}

function Modal({ onClose, title, description, children }: { onClose: () => void; title: string; description: string; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description" className="modal-enter w-full max-w-lg rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><h2 id="modal-title" className="font-outfit text-2xl font-bold tracking-tight text-slate-950">{title}</h2><p id="modal-description" className="mt-2 text-[15px] leading-7 text-slate-600">{description}</p></div><button type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-950" aria-label="Tutup dialog"><X className="h-5 w-5" /></button></div><div className="mt-6">{children}</div></section></div>;
}
