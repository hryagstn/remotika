import { NextRequest, NextResponse } from "next/server";
import { isLocationIndonesian } from "@/lib/location";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // standard nodejs runtime for fs and in-memory Map persistence

// Lightweight IP-based rate limiting in memory
// Key: IP, Value: Array of timestamps (in milliseconds)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Keep only timestamps within the last hour
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";
               
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Terlalu Banyak Permintaan",
          message: "Anda telah mencapai batas maksimum pengajuan verifikasi mandiri (5 permintaan per jam). Silakan coba lagi nanti." 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": "3600"
          }
        }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { githubUsername, orgSlug, companyName } = body;

    if (!githubUsername || !orgSlug || !companyName) {
      return NextResponse.json(
        { success: false, message: "GitHub username, organization slug, dan nama perusahaan wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = githubUsername.trim().replace(/^@/, "");
    const cleanOrgSlug = orgSlug.trim().toLowerCase().replace(/^@/, "");
    const cleanCompanyName = companyName.trim();

    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Remotika-Verification-App"
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // 3. Step A: Check GitHub organization membership
    const memberUrl = `https://api.github.com/orgs/${cleanOrgSlug}/members/${cleanUsername}`;
    const memberRes = await fetch(memberUrl, { headers });

    if (memberRes.status === 404) {
      return NextResponse.json({
        success: false,
        outcome: "not_public_member",
        message: `@${cleanUsername} tidak terdeteksi sebagai anggota publik dari organisasi GitHub @${cleanOrgSlug}.\n\nJika Anda adalah anggota organisasi tersebut, Anda wajib mengubah visibilitas keanggotaan Anda di profil GitHub menjadi 'Public'.`,
        helpUrl: "https://docs.github.com/en/organizations/managing-membership-in-your-organization/publicizing-or-hiding-organization-membership"
      }, { status: 400 });
    }

    if (memberRes.status !== 204) {
      const errorText = await memberRes.text();
      return NextResponse.json(
        { success: false, message: `Gagal memverifikasi keanggotaan organisasi GitHub: ${memberRes.statusText} (${errorText})` },
        { status: memberRes.status }
      );
    }

    // 4. Step B: Fetch user profile and verify location
    const userUrl = `https://api.github.com/users/${cleanUsername}`;
    const userRes = await fetch(userUrl, { headers });

    if (!userRes.ok) {
      const errorText = await userRes.text();
      return NextResponse.json(
        { success: false, message: `Gagal memverifikasi profil pengguna GitHub: ${userRes.statusText} (${errorText})` },
        { status: userRes.status }
      );
    }

    const userData = await userRes.json();
    const userLocation = userData.location;

    if (!isLocationIndonesian(userLocation)) {
      return NextResponse.json({
        success: false,
        outcome: "not_eligible",
        message: `Keanggotaan organisasi GitHub terkonfirmasi, namun lokasi di profil GitHub Anda (${userLocation || "tidak diset"}) tidak terdeteksi berlokasi di Indonesia.\n\nPastikan lokasi di profil publik GitHub Anda mengandung kata kunci Indonesia atau nama kota di Indonesia.`
      }, { status: 400 });
    }

    // 5. Step C: Success! Update dataset (Immediate GitHub Commit or File Write)
    // Fetch official Org Info to enrich company card
    const orgUrl = `https://api.github.com/orgs/${cleanOrgSlug}`;
    const orgRes = await fetch(orgUrl, { headers });
    let orgData: any = {};
    if (orgRes.ok) {
      orgData = await orgRes.json();
    }

    let companies: any[] = [];
    let fileSha = "";
    let committedViaGithub = false;

    const isDev = process.env.NODE_ENV === "development";
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || "https://github.com/hryagstn/remotika";
    const repoMatch = repo.match(/github\.com\/([^/]+\/[^/]+)/);
    const repoPath = repoMatch ? repoMatch[1].replace(/\.git$/, "") : "hryagstn/remotika";

    // A. Attempt GitHub Contents API write if in production & Token is available
    if (!isDev && GITHUB_TOKEN) {
      try {
        const githubGetUrl = `https://api.github.com/repos/${repoPath}/contents/src/data/companies.json`;
        const getRes = await fetch(githubGetUrl, {
          headers: {
            ...headers,
            "Authorization": `token ${GITHUB_TOKEN}`
          }
        });

        if (getRes.ok) {
          const getJson = await getRes.json();
          fileSha = getJson.sha;
          const decodedContent = Buffer.from(getJson.content, "base64").toString("utf-8");
          companies = JSON.parse(decodedContent);
          
          const { updatedCompanies, alreadyVerified } = updateCompaniesArray(
            companies, 
            cleanUsername, 
            cleanOrgSlug, 
            cleanCompanyName, 
            userData, 
            orgData
          );

          if (alreadyVerified) {
            return NextResponse.json({
              success: true,
              outcome: "already_verified",
              message: `@${cleanUsername} sudah terverifikasi sebelumnya sebagai bagian dari ${cleanCompanyName}. Terima kasih atas kontribusi Anda!`
            });
          }

          const base64Content = Buffer.from(JSON.stringify(updatedCompanies, null, 2)).toString("base64");
          
          const putRes = await fetch(githubGetUrl, {
            method: "PUT",
            headers: {
              ...headers,
              "Authorization": `token ${GITHUB_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: `feat: verified team member @${cleanUsername} for ${cleanCompanyName} via suggest-yourself`,
              content: base64Content,
              sha: fileSha
            })
          });

          if (putRes.ok) {
            committedViaGithub = true;
          } else {
            console.error("Failed to commit back to GitHub API:", await putRes.text());
          }
        }
      } catch (err) {
        console.error("Error during GitHub Contents API commit:", err);
      }
    }

    // B. Fallback to Local Filesystem write (ideal for Local Dev, or failsafe)
    if (!committedViaGithub) {
      try {
        const localPath = path.join(process.cwd(), "src/data/companies.json");
        const fileContent = fs.readFileSync(localPath, "utf8");
        companies = JSON.parse(fileContent);

        const { updatedCompanies, alreadyVerified } = updateCompaniesArray(
          companies, 
          cleanUsername, 
          cleanOrgSlug, 
          cleanCompanyName, 
          userData, 
          orgData
        );

        if (alreadyVerified) {
          return NextResponse.json({
            success: true,
            outcome: "already_verified",
            message: `@${cleanUsername} sudah terverifikasi sebelumnya sebagai bagian dari ${cleanCompanyName}. Terima kasih atas kontribusi Anda!`
          });
        }

        fs.writeFileSync(localPath, JSON.stringify(updatedCompanies, null, 2), "utf8");
      } catch (err: any) {
        console.error("Local filesystem write failed:", err.message);
        return NextResponse.json(
          { success: false, message: `Gagal memperbarui database lokal: ${err.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      outcome: "verified",
      message: `Selamat, Anda berhasil terverifikasi! @${cleanUsername} sekarang tercatat sebagai anggota tim terverifikasi untuk ${cleanCompanyName} di Remotika.`,
      committedViaGithub
    });

  } catch (error: any) {
    console.error("Fatal error in verify-self api:", error);
    return NextResponse.json(
      { success: false, message: `Terjadi kesalahan internal: ${error.message}` },
      { status: 500 }
    );
  }
}

function updateCompaniesArray(
  companies: any[],
  username: string,
  orgSlug: string,
  companyName: string,
  userData: any,
  orgData: any
): { updatedCompanies: any[]; alreadyVerified: boolean } {
  
  const existingCompanyIndex = companies.findIndex(
    c => c.githubOrg.toLowerCase().trim() === orgSlug.toLowerCase().trim()
  );

  const newUserPayload = {
    id: String(userData.id),
    githubLogin: userData.login,
    githubProfileUrl: userData.html_url,
    locationRaw: userData.location
  };

  if (existingCompanyIndex > -1) {
    const targetCompany = { ...companies[existingCompanyIndex] };
    const members = targetCompany.verifiedMembers || [];
    
    // Prevent duplicate entries for the same user in the same company
    const alreadyExists = members.some(
      (m: any) => m.githubLogin.toLowerCase().trim() === username.toLowerCase().trim()
    );

    if (alreadyExists) {
      return { updatedCompanies: companies, alreadyVerified: true };
    }

    // Append member and increment counts
    targetCompany.verifiedMembers = [...members, newUserPayload];
    targetCompany.verifiedIndonesianCount = targetCompany.verifiedMembers.length;
    targetCompany.lastVerifiedAt = new Date().toISOString();
    if (!targetCompany.verifiedAt) {
      targetCompany.verifiedAt = new Date().toISOString();
    }

    const updated = [...companies];
    updated[existingCompanyIndex] = targetCompany;
    return { updatedCompanies: updated, alreadyVerified: false };
  } else {
    // Determine unique id (e.g. co-N or similar sequential)
    const numericIds = companies
      .map(c => parseInt(c.id.replace("co-", "")))
      .filter(id => !isNaN(id));
    const nextNumericId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    const newCompanyId = `co-${nextNumericId}`;

    const newCompany = {
      id: newCompanyId,
      name: orgData.name || companyName,
      githubOrg: orgSlug,
      githubOrgUrl: `https://github.com/${orgSlug}`,
      remoteokSlug: null,
      industry: orgData.description || "Technology",
      verifiedIndonesianCount: 1,
      label: "Confirmed",
      lastVerifiedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      hasActiveJobs: false,
      activeJobs: [],
      verifiedMembers: [newUserPayload],
      headquarters: orgData.location || "Global Remote"
    };

    return { updatedCompanies: [newCompany, ...companies], alreadyVerified: false };
  }
}
