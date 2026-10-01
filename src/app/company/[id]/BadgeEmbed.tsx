"use client";

import React, { useState } from "react";
import { Award, Check, Copy } from "lucide-react";

interface BadgeEmbedProps {
  githubOrg: string;
}

export default function BadgeEmbed({ githubOrg }: BadgeEmbedProps) {
  const [copiedType, setCopiedType] = useState<"markdown" | "html" | null>(null);

  const markdownCode = `[![Remotika Verified](https://remotika.my.id/api/badge?org=${githubOrg})](https://remotika.my.id)`;
  const htmlCode = `<a href="https://remotika.my.id"><img src="https://remotika.my.id/api/badge?org=${githubOrg}" alt="Remotika Verified" /></a>`;

  const copyToClipboard = (text: string, type: "markdown" | "html") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-tier-top-pick/20 space-y-6">
      <h3 className="font-title-md text-title-md text-text-primary flex items-center gap-2 font-bold font-outfit">
        <Award className="w-5 h-5 text-tier-top-pick" aria-hidden="true" />
        <span>Badge Verifikasi</span>
      </h3>

      <div className="flex items-center justify-center p-6 bg-black/40 rounded-lg border border-border-faint relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-tier-top-pick/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {/* Preview Badge SVG */}
        <div className="relative inline-flex rounded overflow-hidden shadow-md text-xs font-bold font-sans">
          <div className="bg-[#1f2937] text-white px-2.5 py-1.5 flex items-center space-x-1 border-r border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
            <span>Remotika</span>
          </div>
          <div className="bg-brand-primary text-white px-2.5 py-1.5">
            Talenta Terverifikasi
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-text-muted text-[15px] leading-7">
          Tampilkan badge ini di halaman karir atau README GitHub perusahaan Anda untuk menunjukkan jaringan developer asal Indonesia yang terverifikasi.
        </p>

        {/* Markdown Copy */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Kode Embed Markdown</label>
            <button
              onClick={() => copyToClipboard(markdownCode, "markdown")}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              {copiedType === "markdown" ? <Check className="w-3 h-3 text-brand-accent" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === "markdown" ? "Tersalin" : "Salin"}</span>
            </button>
          </div>
          <pre className="bg-[#080d24] border border-white/10 rounded-lg p-3 text-sm text-white/80 overflow-x-auto select-all max-w-full font-mono">
            {markdownCode}
          </pre>
        </div>

        {/* HTML Copy */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Kode Embed HTML</label>
            <button
              onClick={() => copyToClipboard(htmlCode, "html")}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              {copiedType === "html" ? <Check className="w-3 h-3 text-brand-accent" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === "html" ? "Tersalin" : "Salin"}</span>
            </button>
          </div>
          <pre className="bg-[#080d24] border border-white/10 rounded-lg p-3 text-sm text-white/80 overflow-x-auto select-all max-w-full font-mono">
            {htmlCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
