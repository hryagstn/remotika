import { NextRequest } from "next/server";
import { getCompanies } from "../../actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const org = searchParams.get("org")?.trim().toLowerCase() || "";

  let statusText = "Cek Perusahaan";
  let badgeColor = "#4f46e5"; // default Indigo

  if (org) {
    const companies = await getCompanies();
    const company = companies.find((c) => c.githubOrg.toLowerCase() === org);

    if (company) {
      if (company.label === "Top Pick") {
        statusText = "⭐ Pilihan Utama";
        badgeColor = "#f59e0b"; // Gold/Amber
      } else if (company.label === "Established") {
        statusText = "Terbukti";
        badgeColor = "#a855f7"; // Purple
      } else if (company.label === "Indonesia-Friendly") {
        statusText = "Ramah Indonesia";
        badgeColor = "#14b8a6"; // Teal
      } else {
        statusText = "Terverifikasi";
        badgeColor = "#3b82f6"; // Blue
      }
    }
  }

  // Generate a beautiful, clean, responsive SVG badge
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="24" viewBox="0 0 180 24">
    <linearGradient id="g" x2="0" y2="100%">
      <stop offset="0" stop-color="#fff" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="180" height="24" rx="6" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#r)">
      <rect width="75" height="24" fill="#1f2937"/>
      <rect x="75" width="105" height="24" fill="${badgeColor}"/>
      <rect width="180" height="24" fill="url(#g)"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="bold" font-size="11">
      <text x="37.5" y="16" fill="#010101" fill-opacity=".3">Remotika</text>
      <text x="37.5" y="15">Remotika</text>
      <text x="127.5" y="16" fill="#010101" fill-opacity=".3">${statusText}</text>
      <text x="127.5" y="15">${statusText}</text>
    </g>
  </svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
