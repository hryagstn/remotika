import { NextRequest, NextResponse } from "next/server";
import { isLocationIndonesian } from "@/lib/location";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Lightweight IP-based rate limiting in memory
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
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
    const { gitlabUsername, groupSlug, companyName } = body;

    if (!gitlabUsername || !groupSlug || !companyName) {
      return NextResponse.json(
        { success: false, message: "GitLab username, group slug, dan nama perusahaan wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = gitlabUsername.trim().replace(/^@/, "");
    const cleanGroupSlug = groupSlug.trim().toLowerCase().replace(/^@/, "");
    const cleanCompanyName = companyName.trim();

    const headers: HeadersInit = {
      "User-Agent": "Remotika-Verification-App"
    };

    if (process.env.GITLAB_ACCESS_TOKEN) {
      headers["PRIVATE-TOKEN"] = process.env.GITLAB_ACCESS_TOKEN;
    }

    // 3. Step A: Check GitLab group membership
    const membersUrl = `https://gitlab.com/api/v4/groups/${cleanGroupSlug}/members/all?query=${cleanUsername}`;
    const membersRes = await fetch(membersUrl, { headers });

    if (!membersRes.ok) {
      const errorText = await membersRes.text();
      return NextResponse.json(
        { success: false, message: `Gagal memverifikasi keanggotaan grup GitLab. Pastikan slug grup publik Anda benar: ${membersRes.statusText} (${errorText})` },
        { status: membersRes.status }
      );
    }

    const members = await membersRes.json();
    const member = members.find((m: any) => m.username.toLowerCase() === cleanUsername.toLowerCase());

    if (!member) {
      return NextResponse.json({
        success: false,
        outcome: "not_public_member",
        message: `@${cleanUsername} tidak terdeteksi sebagai anggota publik dari grup GitLab @${cleanGroupSlug}.\n\nJika Anda adalah anggota grup tersebut, pastikan keanggotaan Anda bersifat publik di GitLab agar dapat dibaca oleh sistem.`,
        helpUrl: "https://docs.gitlab.com/ee/user/group/subgroups.html"
      }, { status: 400 });
    }

    // 4. Step B: Fetch user profile and verify location
    const userUrl = `https://gitlab.com/api/v4/users/${member.id}`;
    const userRes = await fetch(userUrl, { headers });

    if (!userRes.ok) {
      const errorText = await userRes.text();
      
      // Handle insufficient granular scope gracefully (common for GitLab fine-grained tokens)
      if (userRes.status === 403 || errorText.includes("insufficient_granular_scope")) {
        return NextResponse.json({
          success: false,
          outcome: "not_eligible",
          message: `Keanggotaan grup GitLab terkonfirmasi! Namun, sistem mendeteksi Personal Access Token Anda memiliki hak akses terbatas (insufficient granular scope).\n\nUntuk menyelesaikan verifikasi otomatis, pastikan token GitLab Anda dikonfigurasi dengan scope 'read_user' (Classic Token) atau 'User: Read' (Fine-Grained Token) agar kami dapat memverifikasi lokasi profil Anda.`
        }, { status: 400 });
      }

      return NextResponse.json(
        { success: false, message: `Gagal memverifikasi profil pengguna GitLab: ${userRes.statusText} (${errorText})` },
        { status: userRes.status }
      );
    }

    const userData = await userRes.json();
    const userLocation = userData.location;

    if (!isLocationIndonesian(userLocation)) {
      return NextResponse.json({
        success: false,
        outcome: "not_eligible",
        message: `Keanggotaan grup GitLab terkonfirmasi, namun lokasi di profil GitLab Anda (${userLocation || "tidak diset"}) tidak terdeteksi berlokasi di Indonesia.\n\nPastikan lokasi di profil publik GitLab Anda mengandung kata kunci Indonesia atau nama kota di Indonesia.`
      }, { status: 400 });
    }

    // 5. Step C: Success! Update dataset
    const groupUrl = `https://gitlab.com/api/v4/groups/${cleanGroupSlug}`;
    const groupRes = await fetch(groupUrl, { headers });
    let groupData: any = {};
    if (groupRes.ok) {
      groupData = await groupRes.json();
    }

    let companies: any[] = [];
    let fileSha = "";
    let committedViaGithub = false;

    const isDev = process.env.NODE_ENV === "development";
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || "https://github.com/hryagstn/remotika";
    const repoMatch = repo.match(/github\.com\/([^/]+\/[^/]+)/);
    const repoPath = repoMatch ? repoMatch[1].replace(/\.git$/, "") : "hryagstn/remotika";

    // Prepare update payload
    const updateLocalData = () => {
      const localPath = path.join(process.cwd(), "src/data/companies.json");
      const fileContent = fs.readFileSync(localPath, "utf8");
      companies = JSON.parse(fileContent);

      const { updatedCompanies, alreadyVerified } = updateCompaniesArray(
        companies, 
        cleanUsername, 
        cleanGroupSlug, 
        cleanCompanyName, 
        userData, 
        groupData
      );

      if (alreadyVerified) {
        return { alreadyVerified: true };
      }

      fs.writeFileSync(localPath, JSON.stringify(updatedCompanies, null, 2), "utf8");
      return { alreadyVerified: false, updatedCompanies };
    };

    // A. Attempt GitHub Contents API write if in production & Token is available
    if (!isDev && GITHUB_TOKEN) {
      try {
        const githubGetUrl = `https://api.github.com/repos/${repoPath}/contents/src/data/companies.json`;
        const getRes = await fetch(githubGetUrl, {
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Remotika-Verification-App",
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
            cleanGroupSlug, 
            cleanCompanyName, 
            userData, 
            groupData
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
              "Accept": "application/vnd.github.v3+json",
              "User-Agent": "Remotika-Verification-App",
              "Authorization": `token ${GITHUB_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: `feat: verified GitLab team member @${cleanUsername} for ${cleanCompanyName} via suggest-yourself`,
              content: base64Content,
              sha: fileSha
            })
          });

          if (putRes.ok) {
            committedViaGithub = true;
          } else {
            console.error("Failed to commit back to GitHub API, falling back to local:", await putRes.text());
          }
        }
      } catch (err) {
        console.error("Error during GitHub Contents API commit, falling back to local:", err);
      }
    }

    // B. Fallback to Local Filesystem write
    if (!committedViaGithub) {
      const resLocal = updateLocalData();
      if (resLocal.alreadyVerified) {
        return NextResponse.json({
          success: true,
          outcome: "already_verified",
          message: `@${cleanUsername} (GitLab) sudah terverifikasi sebelumnya sebagai bagian dari ${cleanCompanyName}. Terima kasih atas kontribusi Anda!`
        });
      }
    }

    return NextResponse.json({
      success: true,
      outcome: "verified",
      message: `Selamat, Anda berhasil terverifikasi! @${cleanUsername} sekarang tercatat sebagai anggota tim terverifikasi (GitLab) untuk ${cleanCompanyName} di Remotika.`,
      committedViaGithub
    });

  } catch (error: any) {
    console.error("Fatal error in verify-self-gitlab api:", error);
    return NextResponse.json(
      { success: false, message: `Terjadi kesalahan internal: ${error.message}` },
      { status: 500 }
    );
  }
}

function updateCompaniesArray(
  companies: any[],
  username: string,
  groupSlug: string,
  companyName: string,
  userData: any,
  groupData: any
): { updatedCompanies: any[]; alreadyVerified: boolean } {
  
  // Find company by gitlabOrg OR githubOrg (since they share slug in compatibility fields)
  const existingCompanyIndex = companies.findIndex(
    c => (c.gitlabOrg && c.gitlabOrg.toLowerCase().trim() === groupSlug.toLowerCase().trim()) || 
         (c.githubOrg && c.githubOrg.toLowerCase().trim() === groupSlug.toLowerCase().trim())
  );

  const newUserPayload = {
    id: `gl-${userData.id}`,
    githubLogin: userData.username, // Compatibility: map GitLab username to githubLogin
    githubProfileUrl: userData.web_url, // Compatibility: map GitLab URL to githubProfileUrl
    locationRaw: userData.location,
    provider: "gitlab" // Explicit provider tag
  };

  if (existingCompanyIndex > -1) {
    const targetCompany = { ...companies[existingCompanyIndex] };
    const members = targetCompany.verifiedMembers || [];
    
    // Check if member already verified under this company
    const alreadyExists = members.some(
      (m: any) => m.githubLogin.toLowerCase().trim() === username.toLowerCase().trim()
    );

    if (alreadyExists) {
      return { updatedCompanies: companies, alreadyVerified: true };
    }

    // Append and save
    targetCompany.verifiedMembers = [...members, newUserPayload];
    targetCompany.verifiedIndonesianCount = targetCompany.verifiedMembers.length;
    targetCompany.lastVerifiedAt = new Date().toISOString();
    
    // Preserve gitlab attributes
    targetCompany.gitlabOrg = groupSlug;
    targetCompany.gitlabOrgUrl = `https://gitlab.com/${groupSlug}`;

    const updated = [...companies];
    updated[existingCompanyIndex] = targetCompany;
    return { updatedCompanies: updated, alreadyVerified: false };
  } else {
    // Generate sequential unique ID
    const numericIds = companies
      .map(c => parseInt(c.id.replace("co-", "")))
      .filter(id => !isNaN(id));
    const nextNumericId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    const newCompanyId = `co-${nextNumericId}`;

    const newCompany = {
      id: newCompanyId,
      name: groupData.name || companyName,
      githubOrg: groupSlug, // Fallback compatibility
      githubOrgUrl: `https://gitlab.com/${groupSlug}`, // Fallback compatibility
      gitlabOrg: groupSlug,
      gitlabOrgUrl: `https://gitlab.com/${groupSlug}`,
      remoteokSlug: null,
      industry: groupData.description || "Technology",
      verifiedIndonesianCount: 1,
      label: "Confirmed",
      lastVerifiedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      hasActiveJobs: false,
      activeJobs: [],
      verifiedMembers: [newUserPayload],
      headquarters: "Global Remote"
    };

    return { updatedCompanies: [newCompany, ...companies], alreadyVerified: false };
  }
}
