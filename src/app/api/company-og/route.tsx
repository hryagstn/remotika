import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import companies from "@/data/companies.json";

export const runtime = "edge";

interface Company {
  id: string;
  name: string;
  githubOrg: string;
  githubOrgUrl: string;
  remoteokSlug: string | null;
  industry: string;
  verifiedIndonesianCount: number;
  label: string;
  lastVerifiedAt: string | null;
  hasActiveJobs: boolean;
  headquarters?: string;
}

const getTierColor = (label: string): string => {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "";

    // Find the company by ID or GitHub Org Slug
    const company = (companies as Company[]).find(
      (c) => c.id.toLowerCase() === slug.toLowerCase() || c.githubOrg.toLowerCase() === slug.toLowerCase()
    );

    if (!company) {
      return new Response("Company not found", { status: 404 });
    }

    const companyName = company.name;
    const initial = companyName.substring(0, 1).toUpperCase();
    const tierColor = getTierColor(company.label);
    const verifiedCount = company.verifiedIndonesianCount;
    const headquarters = company.headquarters || "Global Remote";
    const industry = company.industry || "Technology";

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
            background: "radial-gradient(circle at 10% 10%, #080d24, #020410)",
            color: "#f3f4f6",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "60px 80px",
            boxSizing: "border-box",
            border: "12px solid #1e293b",
            position: "relative",
          }}
        >
          {/* Subtle grid/ambient lights */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.05,
              backgroundImage: "radial-gradient(circle, #2dd4bf 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Header (Branding & Status) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  color: "#2dd4bf",
                  fontWeight: "bold",
                  fontSize: "22px",
                  letterSpacing: "2.5px",
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
                  marginLeft: "10px",
                  boxShadow: "0 0 12px #10b981",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                padding: "8px 16px",
                borderRadius: "99px",
              }}
            >
              <span
                style={{
                  color: "#10b981",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                ✓ VERIFIED REMOTE HIRING
              </span>
            </div>
          </div>

          {/* Main Body (Company Details & Card) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "48px",
              width: "100%",
              margin: "40px 0",
              zIndex: 10,
            }}
          >
            {/* Left: Huge Initial Circle (Mock Logo) */}
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "40px",
                backgroundColor: tierColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 20px 40px -15px ${tierColor}`,
                border: "4px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "76px",
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {initial}
              </span>
            </div>

            {/* Right: Company Name & Headline */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: 900,
                    color: "#ffffff",
                    lineHeight: 1.1,
                  }}
                >
                  {companyName}
                </span>
              </div>
              
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 500,
                  color: "#cbd5e1",
                  lineHeight: 1.4,
                }}
              >
                {verifiedCount > 0 ? (
                  <>
                    Is remote hiring — and they have{" "}
                    <span style={{ color: "#2dd4bf", fontWeight: 700 }}>
                      {verifiedCount} verified Indonesian
                    </span>{" "}
                    team member{verifiedCount > 1 ? "s" : ""}!
                  </>
                ) : (
                  <>
                    Is remote hiring — want to be their{" "}
                    <span style={{ color: "#2dd4bf", fontWeight: 700 }}>
                      first verified Indonesian
                    </span>{" "}
                    team member?
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Footer (Metadata & CTA) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "24px",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Headquarters
                </span>
                <span style={{ fontSize: "15px", color: "#cbd5e1", fontWeight: 600, marginTop: "4px" }}>
                  {headquarters}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Industry
                </span>
                <span style={{ fontSize: "15px", color: "#cbd5e1", fontWeight: 600, marginTop: "4px" }}>
                  {industry}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                See open roles and proof of verification at:
              </span>
              <span style={{ fontSize: "18px", color: "#2dd4bf", fontWeight: 700, marginTop: "4px" }}>
                remotika.vercel.app/company/{company.githubOrg.toLowerCase() || company.id}
              </span>
            </div>
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
