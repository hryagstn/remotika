"use client";

import React, { useState } from "react";
import { Link2, Check } from "lucide-react";

export default function ShareApiLink() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const shareUrl = `${window.location.origin}/berkontribusi#api-docs`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-white/70 hover:text-white transition-all text-xs font-semibold select-none cursor-pointer active:scale-95"
      title="Salin tautan langsung ke bagian dokumentasi API"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-brand-secondary animate-pulse" />
          <span className="text-brand-secondary">Tautan Tersalin!</span>
        </>
      ) : (
        <>
          <Link2 className="w-3.5 h-3.5 text-brand-primary" />
          <span>Salin Tautan API Docs</span>
        </>
      )}
    </button>
  );
}
