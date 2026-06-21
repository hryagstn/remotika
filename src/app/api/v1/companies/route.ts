import { NextRequest, NextResponse } from "next/server";
import { CompanyData } from "@/app/actions";
import companiesDataRaw from "@/data/companies.json";

const companiesData = companiesDataRaw as unknown as CompanyData[];

export const runtime = "nodejs";

// Lightweight IP-based rate limiting in memory
// Key: IP, Value: Array of timestamps (in milliseconds)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Keep only timestamps within the last 1 minute
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

// Enable CORS helper
function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}

export async function GET(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";
               
    if (isRateLimited(ip)) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: "Too Many Requests", 
          message: "API rate limit exceeded. Please limit requests to 60 per minute." 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": "60"
          }
        }
      );
      return addCorsHeaders(response);
    }

    // 2. Parse Query Parameters
    const { searchParams } = new URL(request.url);
    const hasActiveJobsParam = searchParams.get("hasActiveJobs");
    const labelParam = searchParams.get("label")?.toLowerCase().trim();
    const minVerifiedCountParam = searchParams.get("minVerifiedCount");
    const industryParam = searchParams.get("industry")?.toLowerCase().trim();
    
    // Pagination parameters
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    let filteredCompanies = [...companiesData];

    // 3. Apply Filters
    // A. Filter by hasActiveJobs
    if (hasActiveJobsParam !== null) {
      const targetHasActiveJobs = hasActiveJobsParam === "true";
      filteredCompanies = filteredCompanies.filter(c => c.hasActiveJobs === targetHasActiveJobs);
    }

    // B. Filter by label (case-insensitive and converts spaces to dash)
    if (labelParam) {
      filteredCompanies = filteredCompanies.filter(c => {
        const cleanLabel = c.label.toLowerCase().replace(/\s+/g, "-");
        return cleanLabel === labelParam || c.label.toLowerCase() === labelParam;
      });
    }

    // C. Filter by minVerifiedCount
    if (minVerifiedCountParam !== null) {
      const minCount = parseInt(minVerifiedCountParam, 10);
      if (!isNaN(minCount)) {
        filteredCompanies = filteredCompanies.filter(c => c.verifiedIndonesianCount >= minCount);
      }
    }

    // D. Filter by industry
    if (industryParam) {
      filteredCompanies = filteredCompanies.filter(c => 
        c.industry && c.industry.toLowerCase().includes(industryParam)
      );
    }

    const total = filteredCompanies.length;

    // 4. Apply Pagination
    const paginatedCompanies = filteredCompanies.slice(offset, offset + limit);

    // 5. Reshape / Clean Internal Schema
    const reshapedData = paginatedCompanies.map(c => ({
      name: c.name,
      githubOrg: c.githubOrg,
      githubOrgUrl: c.githubOrgUrl || `https://github.com/${c.githubOrg}`,
      label: c.label.toLowerCase(),
      verifiedIndonesianCount: c.verifiedIndonesianCount,
      hasActiveJobs: c.hasActiveJobs,
      verifiedAt: c.verifiedAt || c.lastVerifiedAt || new Date().toISOString(),
      profileUrl: `https://remotika.vercel.app/company/${c.id}`
    }));

    const response = NextResponse.json({
      data: reshapedData,
      meta: {
        total,
        limit,
        offset
      }
    });

    return addCorsHeaders(response);

  } catch (error: any) {
    console.error("Error in public companies api:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
