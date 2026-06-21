import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and clamp scores between 0 and 5
    const tech = Math.min(5, Math.max(0, parseFloat(searchParams.get("technical") || "0")));
    const comm = Math.min(5, Math.max(0, parseFloat(searchParams.get("communication") || "0")));
    const life = Math.min(5, Math.max(0, parseFloat(searchParams.get("lifestyle") || "0")));

    // SVG parameters
    const Cx = 200;
    const Cy = 220;
    const R = 130;

    // Helper to calculate coordinates for triangles
    const getCoords = (radius: number) => {
      const tX = Cx;
      const tY = Cy - radius;

      const cX = Cx + radius * 0.866;
      const cY = Cy + radius * 0.5;

      const lX = Cx - radius * 0.866;
      const lY = Cy + radius * 0.5;

      return { tX, tY, cX, cY, lX, lY };
    };

    // Calculate level rings (Grid)
    const ring1 = getCoords(R * 0.2);
    const ring2 = getCoords(R * 0.4);
    const ring3 = getCoords(R * 0.6);
    const ring4 = getCoords(R * 0.8);
    const ring5 = getCoords(R);

    // Calculate user's score points
    const uTechR = (tech / 5) * R;
    const uCommR = (comm / 5) * R;
    const uLifeR = (life / 5) * R;

    const uTechX = Cx;
    const uTechY = Cy - uTechR;

    const uCommX = Cx + uCommR * 0.866;
    const uCommY = Cy + uCommR * 0.5;

    const uLifeX = Cx - uLifeR * 0.866;
    const uLifeY = Cy + uLifeR * 0.5;

    const scorePolygonPoints = `${uTechX},${uTechY} ${uCommX},${uCommY} ${uLifeX},${uLifeY}`;

    // Compile SVG to base64 string to bypass Satori's SVG element limitations
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="400" viewBox="0 0 400 440">
      <!-- Concentric rings grid -->
      <polygon
        points="${ring1.tX},${ring1.tY} ${ring1.cX},${ring1.cY} ${ring1.lX},${ring1.lY}"
        fill="none"
        stroke="#1e293b"
        stroke-width="1.5"
      />
      <polygon
        points="${ring2.tX},${ring2.tY} ${ring2.cX},${ring2.cY} ${ring2.lX},${ring2.lY}"
        fill="none"
        stroke="#1e293b"
        stroke-width="1.5"
      />
      <polygon
        points="${ring3.tX},${ring3.tY} ${ring3.cX},${ring3.cY} ${ring3.lX},${ring3.lY}"
        fill="none"
        stroke="#334155"
        stroke-width="1.5"
      />
      <polygon
        points="${ring4.tX},${ring4.tY} ${ring4.cX},${ring4.cY} ${ring4.lX},${ring4.lY}"
        fill="none"
        stroke="#334155"
        stroke-width="1.5"
      />
      <polygon
        points="${ring5.tX},${ring5.tY} ${ring5.cX},${ring5.cY} ${ring5.lX},${ring5.lY}"
        fill="none"
        stroke="#475569"
        stroke-width="2"
      />

      <!-- Axis lines from center to level 5 -->
      <line x1="${Cx}" y1="${Cy}" x2="${ring5.tX}" y2="${ring5.tY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3" />
      <line x1="${Cx}" y1="${Cy}" x2="${ring5.cX}" y2="${ring5.cY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3" />
      <line x1="${Cx}" y1="${Cy}" x2="${ring5.lX}" y2="${ring5.lY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3" />

      <!-- Score Area Polygon -->
      <polygon
        points="${scorePolygonPoints}"
        fill="rgba(20, 184, 166, 0.25)"
        stroke="#2dd4bf"
        stroke-width="3.5"
      />

      <!-- Dots at user scores -->
      ${uTechR > 5 ? `<circle cx="${uTechX}" cy="${uTechY}" r="6" fill="#2dd4bf" stroke="#ffffff" stroke-width="1.5" />` : ""}
      ${uCommR > 5 ? `<circle cx="${uCommX}" cy="${uCommY}" r="6" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5" />` : ""}
      ${uLifeR > 5 ? `<circle cx="${uLifeX}" cy="${uLifeY}" r="6" fill="#a855f7" stroke="#ffffff" stroke-width="1.5" />` : ""}

      <!-- Labels -->
      <text
        x="${Cx}"
        y="${ring5.tY - 18}"
        text-anchor="middle"
        fill="#ffffff"
        font-size="14"
        font-weight="800"
        letter-spacing="1"
        font-family="system-ui, -apple-system, sans-serif"
      >
        TECHNICAL
      </text>
      <text
        x="${ring5.cX + 12}"
        y="${ring5.cY + 12}"
        text-anchor="start"
        fill="#ffffff"
        font-size="14"
        font-weight="800"
        letter-spacing="1"
        font-family="system-ui, -apple-system, sans-serif"
      >
        COMMUNICATION
      </text>
      <text
        x="${ring5.lX - 12}"
        y="${ring5.lY + 12}"
        text-anchor="end"
        fill="#ffffff"
        font-size="14"
        font-weight="800"
        letter-spacing="1"
        font-family="system-ui, -apple-system, sans-serif"
      >
        LIFESTYLE
      </text>
    </svg>`;

    const base64Svg = typeof Buffer !== "undefined"
      ? Buffer.from(svgString).toString("base64")
      : btoa(unescape(encodeURIComponent(svgString)));

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            justifyContent: "space-between",
            background: "radial-gradient(circle at center, #0f172a, #030712)",
            color: "#f3f4f6",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "50px 60px",
            boxSizing: "border-box",
            border: "12px solid #1e293b",
          }}
        >
          {/* Left Column (Details) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "55%",
              height: "100%",
            }}
          >
            {/* Header / Branding */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <span
                  style={{
                    color: "#2dd4bf",
                    fontWeight: "bold",
                    fontSize: "20px",
                    letterSpacing: "2px",
                  }}
                >
                  REMOTIKA
                </span>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    marginLeft: "8px",
                    boxShadow: "0 0 10px #10b981",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.2,
                }}
              >
                My Remote Work Readiness
              </span>
            </div>

            {/* Score Progress Bars */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                margin: "24px 0",
              }}
            >
              {/* Technical */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "16px", color: "#cbd5e1", fontWeight: 600 }}>
                    Technical Readiness
                  </span>
                  <span style={{ fontSize: "18px", color: "#2dd4bf", fontWeight: "bold" }}>
                    {tech.toFixed(1)} <span style={{ color: "#64748b", fontSize: "14px" }}>/ 5.0</span>
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    backgroundColor: "#1e293b",
                    borderRadius: "5px",
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      width: `${(tech / 5) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #14b8a6, #06b6d4)",
                    }}
                  />
                </div>
              </div>

              {/* Communication */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "16px", color: "#cbd5e1", fontWeight: 600 }}>
                    Communication Readiness
                  </span>
                  <span style={{ fontSize: "18px", color: "#3b82f6", fontWeight: "bold" }}>
                    {comm.toFixed(1)} <span style={{ color: "#64748b", fontSize: "14px" }}>/ 5.0</span>
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    backgroundColor: "#1e293b",
                    borderRadius: "5px",
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      width: `${(comm / 5) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                    }}
                  />
                </div>
              </div>

              {/* Lifestyle */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "16px", color: "#cbd5e1", fontWeight: 600 }}>
                    Lifestyle & Mental Readiness
                  </span>
                  <span style={{ fontSize: "18px", color: "#a855f7", fontWeight: "bold" }}>
                    {life.toFixed(1)} <span style={{ color: "#64748b", fontSize: "14px" }}>/ 5.0</span>
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    backgroundColor: "#1e293b",
                    borderRadius: "5px",
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      width: `${(life / 5) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #a855f7, #ec4899)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer / Call to action */}
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              Check your own readiness at{" "}
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>remotika.vercel.app/readiness-check</span>
            </span>
          </div>

          {/* Right Column (Radar Chart SVG converted to Base64 Image) */}
          <div
            style={{
              width: "42%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <img
              src={`data:image/svg+xml;base64,${base64Svg}`}
              width="390"
              height="400"
              style={{ display: "block" }}
              alt="Radar Chart"
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 627,
      }
    );
  } catch (error: any) {
    console.error("Failed to generate OG image:", error);
    return new Response(`Failed to generate image: ${error.message}`, { status: 500 });
  }
}
