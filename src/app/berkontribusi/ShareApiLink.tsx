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
      className="quiet-link inline-flex min-h-11 items-center gap-2 text-sm"
      title="Salin tautan langsung ke bagian dokumentasi API"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-brand-secondary animate-pulse" />
          <span>Tautan disalin</span>
        </>
      ) : (
        <>
          <Link2 className="w-3.5 h-3.5 text-brand-primary" />
          <span>Salin tautan</span>
        </>
      )}
    </button>
  );
}
