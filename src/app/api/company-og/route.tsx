import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import companies from "@/data/companies.json";

export const runtime = "edge";

interface ActiveJob {
  title: string;
  url: string;
  tags?: string[];
  salary?: string;
  location?: string;
}

interface Company {
  id: string;
  name: string;
  githubOrg: string;
  githubOrgUrl: string;
  remoteokSlug: string | null;
  industry: string | null;
  verifiedIndonesianCount: number;
  label: string;
  lastVerifiedAt: string | null;
  hasActiveJobs: boolean;
  activeJobs?: ActiveJob[];
  headquarters?: string;
  status?: string;
}

const getTierColor = (label: string, isVerified: boolean): string => {
  if (!isVerified) return "#0284c7"; // Sky 600
  switch (label) {
    case "Top Pick":
      return "#d97706"; // Amber 600
    case "Established":
      return "#9333ea"; // Purple 600
    case "Indonesia-Friendly":
      return "#0d9488"; // Teal 600
    default:
      return "#2563eb"; // Blue 600
  }
};

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "";
    const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();

    // Find the company by ID, GitHub Org Slug, or slugified name
    const company = (companies as Company[]).find(
      (c) =>
        c.id.toLowerCase() === decodedSlug ||
        (c.githubOrg && c.githubOrg.toLowerCase() === decodedSlug) ||
        slugify(c.name) === decodedSlug
    );

    // Fallback to query params if company was just discovered by pipeline before redeploy
    const fallbackName = searchParams.get("name")?.trim();
    if (!company && !fallbackName) {
      return new Response("Company not found", { status: 404 });
    }

    const companyName = company?.name || fallbackName || "Remote Company";
    const initial = companyName.substring(0, 1).toUpperCase();
    const verifiedCount = company
      ? company.verifiedIndonesianCount
      : parseInt(searchParams.get("count") || "0", 10) || 0;
    const isVerified = company
      ? company.verifiedIndonesianCount > 0 && company.status !== "watchlist"
      : verifiedCount > 0;
    const tierColor = getTierColor(company?.label || "", isVerified);
    const headquarters = company?.headquarters || searchParams.get("hq") || "Global Remote";
    const industry = company?.industry || searchParams.get("industry") || "Remote Work";

    // Resolve primary job title & additional jobs count
    const activeJobs = company?.activeJobs || [];
    const queryJobTitle = searchParams.get("job")?.trim();
    const primaryJobTitle = queryJobTitle || activeJobs[0]?.title || "Lowongan Kerja Remote Terbuka";
    const totalJobsCount = parseInt(searchParams.get("jobsCount") || "", 10) || activeJobs.length || 1;
    const extraJobsCount = Math.max(0, totalJobsCount - 1);

    // Resolve tags (up to 3 clean tags)
    const queryTags = searchParams.get("tags")
      ? searchParams.get("tags")!.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const rawTags = queryTags.length > 0 ? queryTags : activeJobs[0]?.tags || [];
    const cleanTags = rawTags
      .filter((t) => !["remote", "full time", "full-time", "worldwide", "global"].includes(t.toLowerCase().trim()))
      .slice(0, 3);

    const resolvedSlug =
      company?.githubOrg?.toLowerCase() || slugify(companyName) || company?.id || decodedSlug;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "space-between",
            background: "radial-gradient(circle at 15% 15%, #0f172a, #020617)",
            color: "#f8fafc",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "52px 72px",
            boxSizing: "border-box",
            border: "10px solid #1e293b",
            position: "relative",
          }}
        >
          {/* Header (Branding & Status Badge) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  color: "#2dd4bf",
                  fontWeight: 800,
                  fontSize: "24px",
                  letterSpacing: "2px",
                }}
              >
                REMOTIKA
              </span>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  marginLeft: "12px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: isVerified ? "rgba(16, 185, 129, 0.14)" : "rgba(56, 189, 248, 0.14)",
                border: isVerified
                  ? "1px solid rgba(16, 185, 129, 0.35)"
                  : "1px solid rgba(56, 189, 248, 0.35)",
                padding: "10px 20px",
                borderRadius: "99px",
              }}
            >
              <span
                style={{
                  color: isVerified ? "#34d399" : "#38bdf8",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {isVerified
                  ? `✓ ${verifiedCount} ANGGOTA TIM INDONESIA TERVERIFIKASI`
                  : "🌏 LOWONGAN REMOTE GLOBAL AKTIF"}
              </span>
            </div>
          </div>

          {/* Company Identity Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              width: "100%",
              marginTop: "12px",
            }}
          >
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "24px",
                backgroundColor: tierColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "44px",
                  fontWeight: 800,
                }}
              >
                {initial}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "40px",
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1.1,
                }}
              >
                {companyName}
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#94a3b8",
                  marginTop: "6px",
                }}
              >
                { `${headquarters}  •  ${industry}` }
              </span>
            </div>
          </div>

          {/* Featured Job Card Box */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              backgroundColor: "rgba(30, 41, 59, 0.65)",
              border: "1px solid rgba(148, 163, 184, 0.22)",
              borderRadius: "24px",
              padding: "28px 36px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#2dd4bf",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                }}
              >
                POSISI REMOTE TERBUKA
              </span>
              {extraJobsCount > 0 && (
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#f8fafc",
                    backgroundColor: "rgba(45, 212, 191, 0.18)",
                    padding: "4px 12px",
                    borderRadius: "99px",
                  }}
                >
                  {`+${extraJobsCount} posisi lainnya`}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: primaryJobTitle.length > 42 ? "30px" : "36px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.2,
              }}
            >
              {primaryJobTitle.length > 65 ? `${primaryJobTitle.slice(0, 62)}...` : primaryJobTitle}
            </span>

            {cleanTags.length > 0 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                {cleanTags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#cbd5e1",
                      backgroundColor: "rgba(15, 23, 42, 0.75)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      padding: "6px 14px",
                      borderRadius: "8px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer (CTA & URL) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "20px",
            }}
          >
            <span style={{ fontSize: "15px", color: "#94a3b8", fontWeight: 500 }}>
              {isVerified
                ? "Terverifikasi melalui jejak organisasi publik GitHub/GitLab"
                : "Direktori lowongan kerja remote global untuk talenta Indonesia"}
            </span>

            <span style={{ fontSize: "20px", color: "#2dd4bf", fontWeight: 700 }}>
              {`remotika.my.id/company/${resolvedSlug}`}
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 627,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to generate company OG image:", error);
    return new Response(`Failed to generate image: ${errorMessage}`, { status: 500 });
  }
}
