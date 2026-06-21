"use client";

import React, { useState } from "react";
import { Download, Check, Copy, Share2, ExternalLink } from "lucide-react";

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

interface ShareCompanyProps {
  companyName: string;
  companyId: string;
  verifiedCount: number;
  hasActiveJobs: boolean;
}

export default function ShareCompany({ companyName, companyId, verifiedCount, hasActiveJobs }: ShareCompanyProps) {
  const [caption, setCaption] = useState(
    `${companyName} has verified Indonesian engineers on their team — and they're actively hiring remote talent right now.\n\nNot a guess. Verified via public GitHub organization membership.\n\nCheck the role and the verification: https://remotika.vercel.app/company/${companyId}`
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!hasActiveJobs) return null;

  const downloadOgImage = async () => {
    setIsDownloading(true);
    try {
      const url = `/api/company-og?slug=${companyId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `remotika-share-${companyId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading company OG image:", err);
      alert("Gagal mengunduh gambar. Silakan coba kembali beberapa saat lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOneClickShare = async () => {
    setIsSharing(true);
    try {
      // 1. Copy caption to clipboard
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);

      // 2. Trigger image download
      await downloadOgImage();

      // 3. Inform user or offer quick redirection
      alert("Caption berhasil disalin ke clipboard dan infografis sharing sedang diunduh!\n\nAnda akan diarahkan ke LinkedIn untuk memposting lowongan kerja remote ini.");
      window.open("https://www.linkedin.com/feed/", "_blank");
    } catch (err) {
      console.error("Error in one-click share:", err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-brand-secondary/20 space-y-4">
      <h3 className="font-title-md text-title-md text-text-primary flex items-center gap-2 font-bold font-outfit">
        <span className="text-brand-secondary">⚡</span>
        <span>Bagikan Peluang Ini</span>
      </h3>

      <p className="text-text-muted text-xs leading-relaxed">
        Bantu talenta Indonesia lainnya mengetahui bahwa <strong>{companyName}</strong> memiliki tim Indonesia terverifikasi dan sedang membuka lowongan remote aktif!
      </p>

      {/* Editable Textarea for LinkedIn Caption */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Caption LinkedIn</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={6}
          className="w-full bg-[#080d24] border border-white/10 rounded-lg p-3 text-xs text-white/80 outline-none focus:border-brand-secondary transition-all font-sans resize-none leading-relaxed"
        />
      </div>

      <div className="space-y-2.5 pt-1">
        {/* Main One-Click Share Button */}
        <button
          onClick={handleOneClickShare}
          disabled={isSharing || isDownloading}
          className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#0077b5] to-[#00a0dc] text-white hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[#0077b5]/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {isSharing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menyalin & Mengunduh...</span>
            </>
          ) : (
            <>
              <LinkedinIcon className="w-4 h-4" />
              <span>Salin Caption & Unduh Gambar</span>
            </>
          )}
        </button>

        {/* Supplementary download only button */}
        <button
          onClick={downloadOgImage}
          disabled={isDownloading || isSharing}
          className="w-full px-4 py-2 text-xs font-semibold rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/10 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Unduh Gambar Saja</span>
        </button>
      </div>
    </div>
  );
}
