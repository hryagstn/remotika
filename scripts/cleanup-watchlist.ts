// scripts/cleanup-watchlist.ts
import fs from "fs";
import path from "path";
import "dotenv/config";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DATA_FILE_PATH = path.join(process.cwd(), "src/data/companies.json");



async function fetchWithAuth(url: string) {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not configured in the environment.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Remotika-Pipeline/1.0"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`GitHub API Error (${res.status})`);
    }
    return res.json();
  } catch (err: any) {
    clearTimeout(timeout);
    console.error(`Error fetching ${url}:`, err.message);
    return null;
  }
}

function isSignificantMatch(companyName: string, orgName: string | null, orgLogin: string): boolean {
  const normalize = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, " ")
      .trim();
  };

  const normCompany = normalize(companyName);
  const normLogin = normalize(orgLogin);
  const normName = orgName ? normalize(orgName) : "";

  const suffixes = ["ltd", "inc", "llc", "corp", "co", "gmbh", "software", "tech", "technologies", "solutions"];
  const stripSuffixes = (str: string): string => {
    let parts = str.split(" ");
    return parts.filter(p => !suffixes.includes(p)).join(" ");
  };

  const strippedCompany = stripSuffixes(normCompany);
  const strippedName = normName ? stripSuffixes(normName) : "";
  const strippedLogin = stripSuffixes(normLogin);

  if (!strippedCompany) return false;

  if (strippedCompany === strippedName || strippedCompany === strippedLogin) {
    return true;
  }

  if (strippedName && (strippedName.includes(strippedCompany) || strippedCompany.includes(strippedName))) {
    return true;
  }

  if (strippedLogin.includes(strippedCompany) || strippedCompany.includes(strippedLogin)) {
    return true;
  }

  return false;
}

async function resolveGithubOrg(companyName: string): Promise<string | null> {
  const slug = companyName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  if (!slug) return null;

  try {
    const orgData = await fetchWithAuth(`https://api.github.com/orgs/${slug}`);
    if (orgData && orgData.login) {
      if (isSignificantMatch(companyName, orgData.name, orgData.login)) {
        return orgData.login;
      }
    }
  } catch (err) {
    // ignore
  }

  return null;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'");
}

function fixMojibake(str: string): string {
  if (!str) return str;
  str = decodeHtmlEntities(str);
  const hasMojibakePattern = /[\u00c0-\u00ff]/.test(str);
  if (!hasMojibakePattern) return str;
  try {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code > 255) return str;
      bytes[i] = code;
    }
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return decodeHtmlEntities(decoded);
  } catch (e) {
    return str;
  }
}

async function translateText(text: string, targetLanguage: string = "en"): Promise<string> {
  if (!text) return text;
  const FOREIGN_WORD_REGEX = /\b(de|en|para|del|el|la|los|las|con|por|un|una|desarrollador|programador|analista|gerente|director|sênior|diseñador|desenvolvedor|für|und|mit|von|im|das|der|die|du|et|pour|dans|avec|sur|un|une)\b/i;
  const needsTranslation = /[^\u0000-\u007F]/.test(text) || FOREIGN_WORD_REGEX.test(text);
  if (!needsTranslation) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Remotika-Pipeline/1.0" } });
    if (!res.ok) return text;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translatedParts = data[0].map((item: any) => item[0]).filter(Boolean);
      const result = translatedParts.join("").trim();
      if (result) {
        return result;
      }
    }
  } catch (err: any) {
    console.warn(`    ⚠️ Translation failed for "${text}": ${err.message}`);
  }
  return text;
}

async function main() {
  if (!GITHUB_TOKEN) {
    console.error("❌ ERROR: GITHUB_TOKEN environment variable is not defined!");
    process.exit(1);
  }

  if (!fs.existsSync(DATA_FILE_PATH)) {
    console.error("companies.json not found!");
    process.exit(1);
  }

  const companies = JSON.parse(fs.readFileSync(DATA_FILE_PATH, "utf-8"));
  console.log(`Original companies count: ${companies.length}`);

  const cleanedCompanies = [];

  for (const c of companies) {
    // Only target watchlist and remoteok source
    if (c.status === "watchlist" && c.source === "remoteok") {
      const companyNameLower = c.name.toLowerCase();

      // 1. Exclude if company name contains "test"
      if (companyNameLower.includes("test")) {
        console.log(`❌ Removing "${c.name}" because company name contains "test"`);
        continue;
      }

      // 2. Exclude if any job title contains "test"
      const hasTestJob = c.activeJobs && c.activeJobs.some((job: any) => job.title.toLowerCase().includes("test"));
      if (hasTestJob) {
        console.log(`❌ Removing "${c.name}" because job title contains "test"`);
        continue;
      }

      // 2.5 Exclude if company matches eligibility blocklist (government/military/etc)
      const ELIGIBILITY_BLOCKLIST = [
        "government", "military", "army", "navy", "defense", "national guard", 
        "police", "senate", "parliament", "embassy", "consulate", "municipal", 
        "city of", "department of", "ministry of"
      ];
      const containsBlockedWord = ELIGIBILITY_BLOCKLIST.some(word => companyNameLower.includes(word));
      if (containsBlockedWord) {
        console.log(`❌ Removing "${c.name}" because it matches the government/military blocklist`);
        continue;
      }

      // 2.6 Exclude if any job location is specified but is not worldwide/global/anywhere
      const hasNonWorldwideJob = c.activeJobs && c.activeJobs.some((job: any) => {
        const jobLocation = (job.location || "").toLowerCase().trim();
        return jobLocation !== "" && !["worldwide", "global", "anywhere"].some(loc => jobLocation.includes(loc));
      });
      if (hasNonWorldwideJob) {
        console.log(`❌ Removing "${c.name}" because it has non-worldwide job locations`);
        continue;
      }



      // 4. Check GitHub Org fuzzy/exact match
      if (c.githubOrg) {
        console.log(`Checking GitHub Org for watchlist company "${c.name}" (Current Org: ${c.githubOrg})...`);
        const resolved = await resolveGithubOrg(c.name);
        if (!resolved || resolved.toLowerCase() !== c.githubOrg.toLowerCase()) {
          console.log(`⚠️ False match detected for "${c.name}" (${c.githubOrg} -> ${resolved || "null"}). Resetting org to null/empty.`);
          c.githubOrg = "";
          c.githubOrgUrl = "";
          c.watchlistReason = "no-org-found";
        } else {
          console.log(`✅ GitHub Org verified for "${c.name}" (${c.githubOrg})`);
        }
      }

      // 5. Clean up placeholder industry/description
      if (c.industry === "Tech & Development Services") {
        c.industry = null;
      }

      // 6. Translate active jobs if needed
      if (c.activeJobs && c.activeJobs.length > 0) {
        for (const job of c.activeJobs) {
          const originalTitle = job.title;
          const cleanedTitle = fixMojibake(originalTitle);
          const translatedTitle = await translateText(cleanedTitle);
          if (translatedTitle !== originalTitle) {
            console.log(`🌐 Translated job title for "${c.name}": "${originalTitle}" -> "${translatedTitle}"`);
            job.title = translatedTitle;
          }
          if (job.tags && job.tags.length > 0) {
            job.tags = await Promise.all(job.tags.map(async (t: string) => {
              const cleanedTag = fixMojibake(t);
              return await translateText(cleanedTag);
            }));
          }
        }
      }

      cleanedCompanies.push(c);
    } else {
      // Keep verified companies or community companies untouched
      cleanedCompanies.push(c);
    }
  }

  console.log(`Cleaned companies count: ${cleanedCompanies.length}`);
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(cleanedCompanies, null, 2), "utf-8");
  console.log("Cleanup complete!");
}

main().catch(err => {
  console.error("Cleanup Fatal Error:", err);
  process.exit(1);
});
