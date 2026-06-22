// scripts/pipeline.ts
import fs from "fs";
import path from "path";
import "dotenv/config";
import { EXCLUDED_INDONESIAN_COMPANIES } from "../src/data/excluded-indonesian-companies";

const EXCLUDED_SET = new Set(EXCLUDED_INDONESIAN_COMPANIES.map(c => c.toLowerCase().trim()));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DATA_FILE_PATH = path.join(process.cwd(), "src/data/companies.json");

import { isLocationIndonesian, INDONESIA_KEYWORDS } from "../src/lib/location";

const REMOTEOK_SLUG_OVERRIDES: Record<string, string> = {
  "nvidiagameworks": "nvidia",
  "krakend-contrib": "krakend",
  "gtilabs": "gojek",
};

// Organizations known to be defunct, shut down, or involved in legal issues.
// These will be automatically skipped during pipeline runs and removed from the database.
const BLOCKLISTED_ORGS: Set<string> = new Set([
  "efishery",    // Shut down, fraud scandal, website offline
]);

// Expanded seed list containing top global remote tech companies
const DEFAULT_SEED_ORGS = [
  "xendit",
  "projectdiscovery",
  "NVIDIAGameWorks",
  "krakend-contrib",
  "shopify",
  "gitlab",
  "hashicorp",
  "grafana",
  "vercel",
  "automattic",
  "canva",
  "grab",
  "supabase",
  "prisma",
  "posthog",
  "sentry",
  "auth0",
  "clerk",
  "upstash",
  "honojs",
  "calcom",
  "dub",
  "resend",
  "triggerdotdev",
  "inngest",
  "payloadcms",
  "astro",
  "tailwindlabs",
  "facebook",
  "google",
  "microsoft",
  "uber",
  "airbnb",
  "stripe",
  "netflix",
  "cloudflare",
  "digitalocean",
  "datadog",
  "mongodb",
  "redis",
  "docker",
  "gitpod",
  "coder",
  "railwayapp",
  "fly-apps",
  "render-oss",
  "koyeb",
  "retool",
  "sourcegraph",
  "tailscale",
  "1password",
  "fastly",
  "sendgrid",
  "mailgun",
  "postmark",
  "paypal",
  "wise",
  "revolut",
  "plaid",
  "coinbase",
  "binance",
  "kraken",
  "uniswap",
  "opensea",
  "metamask",
  "ledger",
  "solana-labs",
  "ethereum",
  "polygon-io",
  "near",
  "cardano",
  "algorand",
  "filecoin-project",
  "arweave",
  "graphprotocol",
  "livepeer",
  "substack",
  "medium",
  "ghost",
  "dev-to",
  "hashnode",
  "stackoverflow",
  "github",
  "bitbucket",
  "slackhq",
  "discord",
  "zoom",
  "teams",
  "canonical",
  "doist",
  "buffer",
  "toptal",
  "elastic",
  "polkadot",
  "paritytech",
  "stellar",
  "ripple",
  "chainlink",
  "zapier",
  "invisionapp",
  "mozilla",
  "basecamp",
  "duckduckgo",
  "hotjar",
  "lottiefiles",
  "revelo",
  "abstract",
  "algolia",
  "circleci",
  "cypress-io",
  "gatsbyjs",
  "netlify",
  "okta",
  "segmentio",
  "snyk",
  "twilio",
  "weaveworks",
  "crowdin",
  "frontapp",
  "intercom",
  "logrocket",
  "miroapp",
  "notion",
  "patreon",
  "sketch-hq",
  "webflow",
  "zeplin",
  "asana",
  "atlassian",
  "box",
  "dropbox",
  "figma",
  "pagerduty",
  "salesforce",
  "squarespace",
  "hubspot",
  "mailchimp",
  "optimizely",
  "sendinblue",
  "activecampaign",
  "drift",
  "g2",
  "gong",
  "mixpanel",
  "amplitude",
  "heap",
  "pendo",
  "fullstory",
  "vimeo",
  "wistia"
];

interface ActiveJob {
  title: string;
  url: string;
  tags: string[];
  salary?: string;
}

interface VerifiedMember {
  id: string;
  githubLogin: string;
  githubProfileUrl: string;
  locationRaw: string | null;
  provider?: "github" | "gitlab" | string;
}

interface JobSources {
  greenhouse?: string;       // Greenhouse board slug
  workday?: {                // Workday config
    subdomain: string;
    sitePath: string;
  };
  careerPageUrl?: string;    // Fallback career page link
}

interface CompanyData {
  id: string;
  name: string;
  githubOrg: string;
  githubOrgUrl: string;
  gitlabOrg?: string;
  gitlabOrgUrl?: string;
  remoteokSlug: string | null;
  industry: string;
  verifiedIndonesianCount: number;
  label: string;
  lastVerifiedAt: string | null;
  verifiedAt?: string;
  hasActiveJobs: boolean;
  activeJobs?: ActiveJob[];
  verifiedMembers: VerifiedMember[];
  headquarters?: string;
  foundationYear?: string;
  testimonials?: Array<{ name: string; role: string; text: string }>;
  jobSources?: JobSources;
  status?: "verified" | "watchlist";
  source?: "github-scan" | "remoteok" | "community";
  watchlistReason?: "no-org-found" | "org-found-zero-match";
  website?: string;
}

// User location search cache to save GitHub API quota
const userLocationCache = new Map<string, { isIndo: boolean; profile: any }>();

const USER_CACHE_FILE_PATH = path.join(process.cwd(), "src/data/user-location-cache.json");

function loadUserLocationCache() {
  try {
    if (fs.existsSync(USER_CACHE_FILE_PATH)) {
      const data = fs.readFileSync(USER_CACHE_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      for (const [key, val] of Object.entries(parsed)) {
        userLocationCache.set(key, val as any);
      }
      console.log(`Loaded ${userLocationCache.size} cached user profiles from disk.`);
    }
  } catch (err: any) {
    console.error(`⚠️ Failed to load user cache: ${err.message}`);
  }
}

function saveUserLocationCache() {
  try {
    const obj: Record<string, any> = {};
    for (const [key, val] of userLocationCache.entries()) {
      obj[key] = val;
    }
    fs.writeFileSync(USER_CACHE_FILE_PATH, JSON.stringify(obj, null, 2), "utf-8");
    console.log(`Saved ${userLocationCache.size} cached user profiles to disk.`);
  } catch (err: any) {
    console.error(`❌ Failed to save user cache: ${err.message}`);
  }
}

// Map to hold fetched remote jobs
const companyJobsMap = new Map<string, ActiveJob[]>();

async function fetchWithAuth(url: string) {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not configured in the environment.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000); // 12 second timeout
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
      const text = await res.text();
      throw new Error(`GitHub API Error (${res.status}): ${text}`);
    }
    return res.json();
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      console.warn(`    ⚠️ Request to ${url} timed out (12s). Skipping.`);
      return null;
    }
    throw err;
  }
}


const isIndonesian = isLocationIndonesian;

const newlyFlaggedOrgs: Array<{ org: string; reason: string }> = [];
const KNOWN_COMMUNITY_SLUGS = new Set(["projectdiscovery", "krakend-contrib"]);

function isCommunityOrOSSOrg(
  orgLogin: string,
  orgName: string,
  description: string | null | undefined,
  blog: string | null | undefined
): { isCommunity: boolean; reason: string } | null {
  const loginLower = orgLogin.toLowerCase().trim();
  const nameLower = (orgName || "").toLowerCase().trim();
  const descLower = (description || "").toLowerCase().trim();

  // Explicitly check known community/OSS slugs
  if (KNOWN_COMMUNITY_SLUGS.has(loginLower)) {
    return {
      isCommunity: true,
      reason: `Explicitly blocklisted/known community/OSS organization: ${orgLogin}`
    };
  }

  // 1. Check slug or name for keywords (case-insensitive substring match)
  const keywords = ["contrib", "contributors", "community", "oss", "open-source", "foundation"];
  for (const kw of keywords) {
    if (loginLower.includes(kw)) {
      return {
        isCommunity: true,
        reason: `Organization slug contains keyword "${kw}"`
      };
    }
    if (nameLower.includes(kw)) {
      return {
        isCommunity: true,
        reason: `Organization name contains keyword "${kw}"`
      };
    }
  }

  // 2. Secondary signal: description phrasing
  const descPhrases = ["contributors to", "community of"];
  for (const phrase of descPhrases) {
    if (descLower.includes(phrase)) {
      return {
        isCommunity: true,
        reason: `Organization description contains phrasing "${phrase}"`
      };
    }
  }

  // Secondary signal: empty blog/website
  const hasWebsite = blog && blog.trim().length > 0;
  if (!hasWebsite) {
    return {
      isCommunity: true,
      reason: `Organization has no associated company website/blog URL in GitHub profile`
    };
  }

  return null;
}

function getEmployeeLabel(count: number): string {
  if (count >= 10) return "Top Pick";
  if (count >= 5) return "Established";
  if (count >= 2) return "Indonesia-Friendly";
  return "Confirmed";
}

function parseDomain(url: string | null): string | null {
  if (!url) return null;
  let clean = url.trim().toLowerCase();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  try {
    const parsed = new URL(clean);
    let host = parsed.hostname;
    if (host.startsWith("www.")) {
      host = host.substring(4);
    }
    return host;
  } catch {
    return null;
  }
}

async function checkUserIndonesian(username: string): Promise<{ isIndo: boolean; profile: any } | null> {
  const usernameLower = username.toLowerCase();
  if (userLocationCache.has(usernameLower)) {
    return userLocationCache.get(usernameLower)!;
  }
  try {
    const profile = await fetchWithAuth(`https://api.github.com/users/${username}`);
    if (profile) {
      const isIndo = isIndonesian(profile.location);
      const result = { isIndo, profile };
      userLocationCache.set(usernameLower, result);
      return result;
    }
  } catch (err: any) {
    console.error(`    ❌ Error fetching profile for user ${username}:`, err.message);
  }
  return null;
}

// Liveness check: verify that a company's website is still accessible
async function checkWebsiteLiveness(url: string | null, orgLogin: string): Promise<boolean> {
  if (!url) return true; // No website to check — skip validation
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(fullUrl, {
      method: "HEAD",
      headers: { "User-Agent": "Remotika-Pipeline/1.0" },
      redirect: "follow",
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.ok || res.status === 403 || res.status === 405) {
      // 403/405 = site is alive but blocks HEAD — still counts as "live"
      return true;
    }
    console.log(`  ⚠️  Website ${fullUrl} returned HTTP ${res.status} for ${orgLogin}`);
    return false;
  } catch (err: any) {
    console.log(`  ⚠️  Website unreachable for ${orgLogin}: ${err.message}`);
    return false;
  }
}

function extractWebsiteFromDescription(companyName: string, description: string): string {
  const cleanName = companyName.toLowerCase().trim();
  
  // Try to find URLs in the description
  const urlRegex = /https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*/gi;
  let match;
  const foundDomains = new Set<string>();
  
  const ignoredDomains = new Set([
    "remoteok.com", "remoteok.io", "github.com", "twitter.com", "linkedin.com",
    "facebook.com", "instagram.com", "youtube.com", "medium.com", "google.com",
    "apple.com", "microsoft.com", "slack.com", "zoom.us", "job-applicant-privacy",
    "privacy-policy", "terms-of-service", "remotive.com", "remotive.io"
  ]);

  while ((match = urlRegex.exec(description)) !== null) {
    const domain = match[1].toLowerCase().trim();
    if (!ignoredDomains.has(domain) && !domain.includes("remoteok") && !domain.includes("github") && domain.includes(".")) {
      foundDomains.add(domain);
    }
  }

  if (foundDomains.size > 0) {
    return Array.from(foundDomains)[0];
  }

  // Fallback: guess from company name
  const slug = cleanName
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "")
    .trim();
  return `${slug}.com`;
}

async function resolveGithubOrg(companyName: string, website: string | null): Promise<string | null> {
  const slug = companyName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  if (!slug) return null;

  console.log(`  [resolveGithubOrg] Trying direct slug: "${slug}"`);
  try {
    const orgData = await fetchWithAuth(`https://api.github.com/orgs/${slug}`);
    if (orgData && orgData.login) {
      console.log(`    ✅ Direct slug resolved: ${orgData.login}`);
      return orgData.login;
    }
  } catch (err: any) {
    console.log(`    ℹ️ Direct slug "${slug}" failed: ${err.message}`);
  }

  // Fallback: search orgs
  console.log(`  [resolveGithubOrg] Falling back to search for "${companyName}"`);
  try {
    const searchResults = await fetchWithAuth(`https://api.github.com/search/users?q=type:org+${encodeURIComponent(companyName)}`);
    if (searchResults && Array.isArray(searchResults.items) && searchResults.items.length > 0) {
      const topMatch = searchResults.items[0].login;
      console.log(`    ✅ GitHub Search resolved: ${topMatch}`);
      return topMatch;
    }
  } catch (err: any) {
    console.error(`    ❌ Search failed for "${companyName}":`, err.message);
  }

  return null;
}

interface RemoteOkCandidate {
  name: string;
  website: string;
  remoteokSlug: string;
  jobs: ActiveJob[];
}

async function harvestRemoteOkCandidates(existingCompanies: CompanyData[]): Promise<RemoteOkCandidate[]> {
  console.log("\n[Pipeline] Harvesting candidate companies from RemoteOK API...");
  const candidatesMap = new Map<string, RemoteOkCandidate>();

  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "Remotika-Pipeline/1.0" }
    });
    if (!res.ok) {
      console.log("  ⚠️ Failed to fetch RemoteOK API for candidate harvesting.");
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const jobs = data.slice(1); // skip legal header
    
    // Build set of existing domains for deduping
    const existingDomains = new Set<string>();
    existingCompanies.forEach(c => {
      if (c.website) {
        existingDomains.add(c.website.toLowerCase().trim());
      }
      const parsedDom = parseDomain(c.githubOrgUrl) || parseDomain(c.jobSources?.careerPageUrl || null);
      if (parsedDom) {
        existingDomains.add(parsedDom.toLowerCase().trim());
      }
    });

    for (const job of jobs) {
      if (!job.company || !job.url) continue;

      const companyName = job.company.trim();
      const companyKey = companyName.toLowerCase();

      // Check exclude list
      if (EXCLUDED_SET.has(companyKey)) {
        continue;
      }

      // Extract website
      const website = extractWebsiteFromDescription(companyName, job.description || "");
      const domain = parseDomain(website);

      // Dedup against existing domains
      if (domain && existingDomains.has(domain)) {
        continue;
      }

      const activeJob: ActiveJob = {
        title: job.position,
        url: job.url,
        tags: Array.isArray(job.tags) ? job.tags : [],
        salary: job.salary || undefined
      };

      // Populate companyJobsMap for job enrichment of existing/verified companies
      if (!companyJobsMap.has(companyKey)) {
        companyJobsMap.set(companyKey, []);
      }
      companyJobsMap.get(companyKey)!.push(activeJob);

      const existingCandidate = candidatesMap.get(companyKey);
      if (existingCandidate) {
        existingCandidate.jobs.push(activeJob);
      } else {
        candidatesMap.set(companyKey, {
          name: companyName,
          website: website,
          remoteokSlug: job.slug ? job.slug.split("-").slice(1).join("-") : companyKey,
          jobs: [activeJob]
        });
      }
    }
  } catch (err: any) {
    console.error("  ❌ Error harvesting RemoteOK candidates:", err.message);
  }

  console.log(`  Harvested ${candidatesMap.size} unique candidate companies from RemoteOK.`);
  return Array.from(candidatesMap.values());
}

const createWatchlistEntry = (
  name: string,
  githubOrg: string | null,
  website: string,
  remoteokSlug: string,
  reason: "no-org-found" | "org-found-zero-match",
  jobs: ActiveJob[],
  existingCompanies: CompanyData[]
): CompanyData => {
  const numericIds = existingCompanies
    .map(c => parseInt(c.id.replace("co-", "")))
    .filter(id => !isNaN(id));
  const nextNumericId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
  const companyId = `co-${nextNumericId}`;

  return {
    id: companyId,
    name: name,
    githubOrg: githubOrg || "",
    githubOrgUrl: githubOrg ? `https://github.com/${githubOrg}` : "",
    remoteokSlug: remoteokSlug,
    industry: "Tech & Development Services",
    verifiedIndonesianCount: 0,
    label: "Watchlist",
    lastVerifiedAt: new Date().toISOString(),
    verifiedAt: undefined,
    hasActiveJobs: jobs.length > 0,
    activeJobs: jobs,
    verifiedMembers: [],
    headquarters: "Global Remote",
    status: "watchlist",
    source: "remoteok",
    watchlistReason: reason,
    website: website
  };
};


async function fetchRemotiveJobs() {
  console.log("\n[Pipeline] Fetching active remote jobs from Remotive API...");
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev", {
      headers: { "User-Agent": "Remotika-Pipeline/1.0" }
    });
    if (!res.ok) {
      console.log("  ⚠️  Failed to fetch from Remotive API. Skipping job enrichment.");
      return;
    }
    const data = await res.json();
    if (data && Array.isArray(data.jobs)) {
      console.log(`  Fetched ${data.jobs.length} jobs from Remotive API. Filtering...`);
      let count = 0;
      for (const job of data.jobs) {
        if (!job.company_name || !job.title || !job.url) continue;
        
        // Filter jobs by location: must contain worldwide, indonesia, anywhere, apac, or asia
        const location = (job.candidate_required_location || "").toLowerCase();
        const isTargetLocation = ["worldwide", "indonesia", "anywhere", "apac", "asia"].some(loc => location.includes(loc));
        if (!isTargetLocation) continue;

        const companyKey = job.company_name.toLowerCase().trim();
        const activeJob: ActiveJob = {
          title: job.title,
          url: job.url,
          tags: Array.isArray(job.tags) ? job.tags : [],
          salary: job.salary || undefined
        };
        if (!companyJobsMap.has(companyKey)) {
          companyJobsMap.set(companyKey, []);
        }
        companyJobsMap.get(companyKey)!.push(activeJob);
        count++;
      }
      console.log(`  Processed ${count} location-matched jobs from Remotive.`);
    }
  } catch (err: any) {
    console.error("  ❌ Error fetching from Remotive API:", err.message);
  }
}

// ─── Per-Company ATS Sources Configuration ───────────────────────────────────
const COMPANY_JOB_SOURCES: Record<string, JobSources> = {
  "xendit": {
    greenhouse: "xendit",
    careerPageUrl: "https://www.xendit.co/en/careers"
  },
  "gitlab": {
    greenhouse: "gitlab",
    careerPageUrl: "https://about.gitlab.com/jobs/all-jobs/"
  },
  "nvidiagameworks": {
    careerPageUrl: "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite"
  },
  "automattic": {
    careerPageUrl: "https://automattic.com/work-with-us/"
  },
  "grab": {
    careerPageUrl: "https://grab.careers/"
  },
  "gojek": {
    careerPageUrl: "https://www.gotocompany.com/careers"
  },
  "gtilabs": {
    careerPageUrl: "https://www.gotocompany.com/careers"
  },
  "traveloka": {
    careerPageUrl: "https://www.traveloka.com/en-id/careers"
  },
  "projectdiscovery": {
    careerPageUrl: "https://projectdiscovery.io/about#careers"
  },
  "krakend-contrib": {
    careerPageUrl: "https://www.krakend.io/careers/"
  },

  "bukalapak": {
    careerPageUrl: "https://careers.bukalapak.com/"
  },
  "kumparan": {
    careerPageUrl: "https://kumparan.com/"
  },
};

// ─── Greenhouse Jobs API ─────────────────────────────────────────────────────
const LOCATION_KEYWORDS_REMOTE = ["remote", "anywhere", "worldwide", "global"];
const LOCATION_KEYWORDS_APAC = ["indonesia", "jakarta", "apac", "asia", "singapore", "southeast asia"];

function isRelevantLocation(locationName: string): boolean {
  const loc = locationName.toLowerCase();
  return [...LOCATION_KEYWORDS_REMOTE, ...LOCATION_KEYWORDS_APAC].some(k => loc.includes(k));
}

async function fetchGreenhouseJobs(boardSlug: string): Promise<ActiveJob[]> {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${boardSlug}/jobs`, {
      headers: { "User-Agent": "Remotika-Pipeline/1.0" }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: ActiveJob[] = [];
    if (data && Array.isArray(data.jobs)) {
      for (const job of data.jobs) {
        if (!job.title || !job.absolute_url) continue;
        const location = job.location?.name || "";
        // Include if location is relevant OR if no location info (assume remote-friendly)
        if (location && !isRelevantLocation(location)) continue;
        jobs.push({
          title: job.title,
          url: job.absolute_url,
          tags: job.departments?.map((d: any) => d.name).filter(Boolean) || [],
          salary: undefined
        });
      }
    }
    return jobs;
  } catch (err: any) {
    console.error(`    ❌ Greenhouse API error for ${boardSlug}:`, err.message);
    return [];
  }
}

// ─── Workday Jobs API ────────────────────────────────────────────────────────
async function fetchWorkdayJobs(config: { subdomain: string; sitePath: string }): Promise<ActiveJob[]> {
  try {
    const url = `https://${config.subdomain}.wd5.myworkdayjobs.com/wday/cxs/${config.subdomain}/${config.sitePath}/jobs`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Remotika-Pipeline/1.0"
      },
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        appliedFacets: {},
        searchText: "remote indonesia"
      })
    });
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: ActiveJob[] = [];
    if (data && Array.isArray(data.jobPostings)) {
      for (const job of data.jobPostings) {
        if (!job.title) continue;
        const jobUrl = `https://${config.subdomain}.wd5.myworkdayjobs.com/en-US/${config.sitePath}${job.externalPath || ""}`;
        jobs.push({
          title: job.title,
          url: jobUrl,
          tags: job.locationsText ? [job.locationsText] : [],
          salary: undefined
        });
      }
    }
    return jobs;
  } catch (err: any) {
    console.error(`    ❌ Workday API error for ${config.subdomain}:`, err.message);
    return [];
  }
}

function guessGithubOrgs(companyName: string): string[] {
  const cleanName = companyName.toLowerCase().trim();
  
  // 1. Remove anything inside parentheses
  let baseName = cleanName.replace(/\([^)]*\)/g, "").trim();
  
  // 2. Remove common legal suffixes
  const suffixes = [
    /\binc\.?\b/g,
    /\bltd\.?\b/g,
    /\bllc\.?\b/g,
    /\bcorp\.?\b/g,
    /\bco\.?\b/g,
    /\bgmbh\b/g,
    /\bs\.?a\.?\b/g,
    /\bs\.?r\.?o\.?\b/g,
    /\bsoftware\b/g,
    /\btechnologies\b/g,
    /\btech\b/g,
    /\bsolutions\b/g
  ];
  for (const suffix of suffixes) {
    baseName = baseName.replace(suffix, "").trim();
  }

  // Remove multiple spaces and keep only alphanumeric, spaces, and hyphens
  baseName = baseName.replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, " ");

  if (!baseName) return [];

  const candidates: string[] = [];
  
  // Variant 1: space removed
  const spaceRemoved = baseName.replace(/\s+/g, "");
  if (spaceRemoved && spaceRemoved.length > 2) {
    candidates.push(spaceRemoved);
  }

  // Variant 2: hyphenated
  const hyphenated = baseName.replace(/\s+/g, "-");
  if (hyphenated && hyphenated !== spaceRemoved && hyphenated.length > 2) {
    candidates.push(hyphenated);
  }

  return candidates;
}

async function fetchCommunitySeeds(): Promise<string[]> {
  console.log("\n[Pipeline] Ingesting community seeds from raw Markdown lists...");
  const urls = [
    "https://raw.githubusercontent.com/madeindra/developer-job-indonesia/main/README.md",
    "https://raw.githubusercontent.com/jackyef/id-wfa/main/README.md"
  ];
  const seedOrgs = new Set<string>();

  for (const url of urls) {
    try {
      console.log(`  Fetching seeds from ${url}...`);
      const res = await fetch(url, {
        headers: { "User-Agent": "Remotika-Pipeline/1.0" }
      });
      if (!res.ok) {
        console.log(`  ⚠️  Failed to fetch from ${url}: ${res.statusText}`);
        continue;
      }
      const text = await res.text();
      // Match github.com/org-name or github.com/org-name/repo-name
      const regex = /github\.com\/([a-zA-Z0-9-_]+)/gi;
      let match;
      const ignore = [
        "features", "security", "enterprise", "customer-stories", "pricing", 
        "readme", "madeindra", "jackyef", "antonybudianto", "trending", 
        "topics", "collections", "events", "sponsor", "marketplace"
      ];
      while ((match = regex.exec(text)) !== null) {
        const org = match[1].trim().toLowerCase();
        if (org && !ignore.includes(org) && org.length > 2) {
          seedOrgs.add(org);
        }
      }
    } catch (err: any) {
      console.error(`  ❌ Error fetching community seeds from ${url}:`, err.message);
    }
  }

  console.log(`  Ingested ${seedOrgs.size} unique organizations from community lists.`);
  return Array.from(seedOrgs);
}

function loadCompanies(): CompanyData[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      return JSON.parse(data) as CompanyData[];
    }
  } catch (error: any) {
    console.error(`⚠️ Failed to read or parse companies.json: ${error.message}`);
  }
  return [];
}

function saveCompanies(companies: CompanyData[]) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(companies, null, 2), "utf-8");
    console.log(`💾 Successfully updated and saved ${companies.length} companies to ${DATA_FILE_PATH}`);
  } catch (error: any) {
    console.error(`❌ Failed to write companies.json: ${error.message}`);
  }
}

const FLAGGED_FILE_PATH = path.join(process.cwd(), "src/data/flagged-for-review.json");

function loadFlaggedForReview(): Record<string, any> {
  try {
    if (fs.existsSync(FLAGGED_FILE_PATH)) {
      const data = fs.readFileSync(FLAGGED_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error: any) {
    console.error(`⚠️ Failed to read or parse flagged-for-review.json: ${error.message}`);
  }
  return {};
}

function saveFlaggedForReview(flagged: Record<string, any>) {
  try {
    fs.writeFileSync(FLAGGED_FILE_PATH, JSON.stringify(flagged, null, 2), "utf-8");
    console.log(`💾 Successfully updated and saved flagged-for-review.json`);
  } catch (error: any) {
    console.error(`❌ Failed to write flagged-for-review.json: ${error.message}`);
  }
}


async function processOrg(orgLogin: string, existingCompanies: CompanyData[]): Promise<CompanyData | null> {
  const orgLoginLower = orgLogin.toLowerCase().trim();

  // Blocklist check — skip known defunct organizations
  if (BLOCKLISTED_ORGS.has(orgLoginLower)) {
    console.log(`\n[Pipeline] ⛔ Skipping blocklisted organization: ${orgLogin}`);
    return null;
  }

  // Static manual exclude list check (Part 1 acceptance criteria)
  if (EXCLUDED_SET.has(orgLoginLower)) {
    console.log(`\n[Pipeline] ⛔ Skipping manual exclude-listed Indonesian organization: ${orgLogin}`);
    return null;
  }

  console.log(`\n[Pipeline] Processing GitHub Organization: ${orgLogin}`);

  try {
    // 1. Fetch organization details
    const orgData = await fetchWithAuth(`https://api.github.com/orgs/${orgLogin}`);
    if (!orgData) {
      console.log(`  ⚠️  Organization '${orgLogin}' not found on GitHub. Skipping.`);
      return null;
    }

    const orgName = orgData.name || orgData.login;
    const orgUrl = orgData.html_url;
    const description = orgData.description || "Tech & Development Services";
    
    // Parse official company website domain for Saringan C
    const companyDomain = parseDomain(orgData.blog);
    if (companyDomain) {
      console.log(`  Parsed company domain: @${companyDomain}`);
    }

    // Community / OSS organization check - mass optimization to skip checking members/repos
    const communityFlag = isCommunityOrOSSOrg(orgLogin, orgName, description, orgData.blog);
    if (communityFlag) {
      console.log(`  ⚠️ FLAGGED FOR MANUAL REVIEW (Early Filter): ${orgLogin} is identified as community/OSS (${communityFlag.reason}).`);

      const flagged = loadFlaggedForReview();
      flagged[orgLoginLower] = {
        githubOrg: orgLoginLower,
        name: orgName,
        location: orgData.location || null,
        reason: communityFlag.reason,
        flaggedAt: new Date().toISOString(),
        verifiedIndonesianCount: 0 // No member scan was run
      };
      saveFlaggedForReview(flagged);

      newlyFlaggedOrgs.push({ org: orgLogin, reason: communityFlag.reason + " (Early Filter - member scan skipped)" });
      return null;
    }

    const foundIndonesianMembers: VerifiedMember[] = [];
    const verifiedLogins = new Set<string>();

    // Map to preserve existing member IDs if any
    const existingCompany = existingCompanies.find(
      c => c.githubOrg.toLowerCase() === orgLogin.toLowerCase()
    );
    const existingMembersMap = new Map<string, string>(); // login -> id
    if (existingCompany) {
      existingCompany.verifiedMembers.forEach(m => {
        existingMembersMap.set(m.githubLogin.toLowerCase(), m.id);
      });
    }

    const addVerifiedMember = (login: string, profileUrl: string, location: string | null) => {
      const loginLower = login.toLowerCase();
      if (verifiedLogins.has(loginLower)) return;
      verifiedLogins.add(loginLower);

      const existingId = existingMembersMap.get(loginLower);
      const memberId = existingId || `m-${login}`;

      foundIndonesianMembers.push({
        id: memberId,
        githubLogin: login,
        githubProfileUrl: profileUrl,
        locationRaw: location
      });
      console.log(`    ✅ Match: ${login} is verified in "${location || "Indonesia"}"`);
    };

    // --- SARINGAN A: Public Members ---
    console.log(`  [Saringan A] Fetching public members for ${orgLogin}...`);
    const members = await fetchWithAuth(`https://api.github.com/orgs/${orgLogin}/members?per_page=100`);
    if (Array.isArray(members)) {
      console.log(`    Found ${members.length} public members. Checking profile locations...`);
      for (const member of members) {
        const check = await checkUserIndonesian(member.login);
        if (check && check.isIndo) {
          addVerifiedMember(member.login, check.profile.html_url, check.profile.location);
        }
        await new Promise(r => setTimeout(r, 100)); // Polite delay
      }
    }

    // --- FETCH ACTIVE REPOS FOR SARINGAN B & C ---
    console.log(`  Fetching active repositories for ${orgLogin}...`);
    const repos = await fetchWithAuth(`https://api.github.com/orgs/${orgLogin}/repos?sort=pushed&per_page=3`);
    
    if (Array.isArray(repos)) {
      for (const repo of repos) {
        const repoName = repo.name;

        // --- SARINGAN B: PR Author Association ---
        console.log(`    [Saringan B] Fetching recent PRs for ${repoName}...`);
        const pulls = await fetchWithAuth(`https://api.github.com/repos/${orgLogin}/${repoName}/pulls?state=all&per_page=20`);
        if (Array.isArray(pulls)) {
          for (const pull of pulls) {
            if (!pull.user) continue;
            const author = pull.user.login;
            const assoc = pull.author_association;

            // Only check if they are verified official MEMBER or OWNER of the org
            if (assoc === "MEMBER" || assoc === "OWNER") {
              const check = await checkUserIndonesian(author);
              if (check && check.isIndo) {
                console.log(`      [PR Match] Found official member PR author: ${author} (Association: ${assoc})`);
                addVerifiedMember(author, check.profile.html_url, check.profile.location);
              }
            }
          }
        }
        await new Promise(r => setTimeout(r, 200));

        // --- SARINGAN C: Commit Email Domain Match ---
        if (companyDomain) {
          console.log(`    [Saringan C] Fetching recent commits for ${repoName}...`);
          const commits = await fetchWithAuth(`https://api.github.com/repos/${orgLogin}/${repoName}/commits?per_page=20`);
          if (Array.isArray(commits)) {
            for (const item of commits) {
              if (!item.author || !item.commit || !item.commit.author) continue;
              const authorLogin = item.author.login;
              const authorEmail = item.commit.author.email || "";

              const emailDomain = authorEmail.split("@")[1]?.toLowerCase();
              // Verify domain host matches company website host name
              if (emailDomain === companyDomain || emailDomain?.endsWith("." + companyDomain)) {
                const check = await checkUserIndonesian(authorLogin);
                if (check && check.isIndo) {
                  console.log(`      [Commit Email Match] Found commit matching email domain: ${authorLogin} (${authorEmail})`);
                  addVerifiedMember(authorLogin, check.profile.html_url, check.profile.location);
                }
              }
            }
          }
        }
        await new Promise(r => setTimeout(r, 200));
      }
    }

    console.log(`  Completed scan for ${orgLogin}. Total Indonesian members verified: ${foundIndonesianMembers.length}`);

    if (foundIndonesianMembers.length > 0) {
      // Heuristic location check (Part 1 acceptance criteria)
      const orgLocation = orgData.location;
      if (orgLocation && isLocationIndonesian(orgLocation)) {
        console.log(`  ⚠️ FLAGGED FOR MANUAL REVIEW: ${orgLogin} GitHub location suggests Indonesia (${orgLocation}).`);
        
        const flagged = loadFlaggedForReview();
        flagged[orgLoginLower] = {
          githubOrg: orgLoginLower,
          name: orgName,
          location: orgLocation,
          reason: "GitHub location suggests Indonesia",
          flaggedAt: new Date().toISOString(),
          verifiedIndonesianCount: foundIndonesianMembers.length
        };
        saveFlaggedForReview(flagged);
        
        newlyFlaggedOrgs.push({ org: orgLogin, reason: `GitHub location suggests Indonesia (${orgLocation})` });
        return null;
      }

      // Community / OSS organization check
      const communityFlag = isCommunityOrOSSOrg(orgLogin, orgName, description, orgData.blog);
      if (communityFlag) {
        console.log(`  ⚠️ FLAGGED FOR MANUAL REVIEW: ${orgLogin} is identified as community/OSS (${communityFlag.reason}).`);

        const flagged = loadFlaggedForReview();
        flagged[orgLoginLower] = {
          githubOrg: orgLoginLower,
          name: orgName,
          location: orgLocation || null,
          reason: communityFlag.reason,
          flaggedAt: new Date().toISOString(),
          verifiedIndonesianCount: foundIndonesianMembers.length
        };
        saveFlaggedForReview(flagged);

        newlyFlaggedOrgs.push({ org: orgLogin, reason: communityFlag.reason });
        return null;
      }

      const label = getEmployeeLabel(foundIndonesianMembers.length);
      const lastVerifiedAt = new Date().toISOString();

      if (existingCompany) {
        const updated: CompanyData = {
          ...existingCompany,
          name: orgName,
          githubOrgUrl: orgUrl,
          remoteokSlug: REMOTEOK_SLUG_OVERRIDES[orgLogin.toLowerCase()] || existingCompany.remoteokSlug || orgLogin.toLowerCase(),
          industry: description.substring(0, 255),
          verifiedIndonesianCount: foundIndonesianMembers.length,
          label: label,
          lastVerifiedAt: lastVerifiedAt,
          verifiedAt: existingCompany.verifiedAt || existingCompany.lastVerifiedAt || lastVerifiedAt,
          verifiedMembers: foundIndonesianMembers
        };
        console.log(`  🔄 Updated existing entry for ${orgName}.`);
        return updated;
      } else {
        const numericalIds = existingCompanies
          .map(c => parseInt(c.id.replace("co-", ""), 10))
          .filter(num => !isNaN(num));
        const maxId = numericalIds.length > 0 ? Math.max(...numericalIds) : 0;
        const newId = `co-${maxId + 1}`;

        const brandNew: CompanyData = {
          id: newId,
          name: orgName,
          githubOrg: orgLogin.toLowerCase(),
          githubOrgUrl: orgUrl,
          remoteokSlug: REMOTEOK_SLUG_OVERRIDES[orgLogin.toLowerCase()] || orgLogin.toLowerCase(),
          industry: description.substring(0, 255),
          verifiedIndonesianCount: foundIndonesianMembers.length,
          label: label,
          lastVerifiedAt: lastVerifiedAt,
          verifiedAt: lastVerifiedAt,
          hasActiveJobs: false,
          activeJobs: [],
          verifiedMembers: foundIndonesianMembers
        };
        console.log(`  ✨ Candidate new entry for ${orgName} (ID ${newId}). Running liveness check...`);
        
        // Liveness check: verify website is still accessible before adding
        const websiteUrl = orgData.blog || orgData.html_url;
        const isAlive = await checkWebsiteLiveness(websiteUrl, orgLogin);
        if (!isAlive) {
          console.log(`  ⛔ REJECTED: ${orgName} — website is unreachable. Company may be defunct.`);
          return null;
        }
        
        console.log(`  ✅ Liveness check passed for ${orgName}.`);
        return brandNew;
      }
    } else {
      console.log(`  Info: No Indonesian members found for ${orgLogin}. Skipping update/addition.`);
      if (existingCompany) {
        const updated: CompanyData = {
          ...existingCompany,
          verifiedIndonesianCount: 0,
          label: "Confirmed",
          lastVerifiedAt: new Date().toISOString(),
          verifiedAt: existingCompany.verifiedAt || existingCompany.lastVerifiedAt || undefined,
          verifiedMembers: []
        };
        return updated;
      }
      return null;
    }
  } catch (err: any) {
    console.error(`  ❌ Error processing organization ${orgLogin}:`, err.message);
    return null;
  }
}

async function main() {
  if (!GITHUB_TOKEN) {
    console.error("❌ ERROR: GITHUB_TOKEN environment variable is not defined!");
    process.exit(1);
  }

  console.log("=== STARTING REMOTIKA MULTI-LAYERED PIPELINE ===");

  // Load user location profile cache from disk
  loadUserLocationCache();

  // 1. Load current companies.json database
  const companies = loadCompanies();
  console.log(`Loaded ${companies.length} existing companies from JSON database.`);

  // 2. Fetch remote jobs from RemoteOK and Remotive APIs
  const remoteokCandidates = await harvestRemoteOkCandidates(companies);
  await fetchRemotiveJobs();

  // 3. Collate all known organizations (existing + seeds + community seeds)
  const knownOrgs = new Set<string>();
  companies.forEach(c => {
    if (c.githubOrg) {
      knownOrgs.add(c.githubOrg.toLowerCase().trim());
    }
  });

  DEFAULT_SEED_ORGS.forEach(org => {
    knownOrgs.add(org.toLowerCase().trim());
  });

  let communitySeeds: string[] = [];
  try {
    communitySeeds = await fetchCommunitySeeds();
    communitySeeds.forEach(org => {
      knownOrgs.add(org.toLowerCase().trim());
    });
  } catch (err: any) {
    console.error("  ❌ Error combining community seeds:", err.message);
  }

  // 4. Guess new organizations from active job listings
  const newCandidates = new Set<string>();
  for (const companyKey of companyJobsMap.keys()) {
    const guesses = guessGithubOrgs(companyKey);
    for (const guess of guesses) {
      if (!knownOrgs.has(guess) && !newCandidates.has(guess)) {
        newCandidates.add(guess);
      }
    }
  }

  console.log(`\n[Pipeline] Guessed ${newCandidates.size} new potential GitHub organization names from jobs.`);
  
  // Limit new guesses to a safe maximum to avoid GitHub API rate limiting
  const MAX_NEW_GUESSES = 15;
  const selectedNewGuesses = Array.from(newCandidates).slice(0, MAX_NEW_GUESSES);
  console.log(`  Selected top ${selectedNewGuesses.length} new guesses to inspect:`, selectedNewGuesses);

  // 5. Combine everything into the processing queue
  const queueMap = new Map<string, { type: "github"; slug: string }>();
  
  // Load flagged-for-review set to avoid re-inspecting flagged organizations
  const flagged = loadFlaggedForReview();
  const FLAGGED_SET = new Set(Object.keys(flagged).map(k => k.toLowerCase().trim()));

  const shouldInspect = (org: string): boolean => {
    const clean = org.toLowerCase().trim();
    return !EXCLUDED_SET.has(clean) && !FLAGGED_SET.has(clean);
  };

  // Always process existing companies to update their jobs/members, unless excluded or flagged
  companies.forEach(c => {
    if (c.githubOrg) {
      const cleanSlug = c.githubOrg.toLowerCase().trim();
      if (shouldInspect(cleanSlug)) {
        queueMap.set(`github:${cleanSlug}`, { type: "github", slug: cleanSlug });
      }
    }
  });

  // Add default seeds, community seeds, and our new guesses, unless excluded or flagged
  DEFAULT_SEED_ORGS.forEach(org => {
    const cleanOrg = org.toLowerCase().trim();
    if (shouldInspect(cleanOrg)) {
      queueMap.set(`github:${cleanOrg}`, { type: "github", slug: cleanOrg });
    }
  });
  communitySeeds.forEach(org => {
    const cleanOrg = org.toLowerCase().trim();
    if (shouldInspect(cleanOrg)) {
      queueMap.set(`github:${cleanOrg}`, { type: "github", slug: cleanOrg });
    }
  });
  selectedNewGuesses.forEach(org => {
    const cleanOrg = org.toLowerCase().trim();
    if (shouldInspect(cleanOrg)) {
      queueMap.set(`github:${cleanOrg}`, { type: "github", slug: cleanOrg });
    }
  });

  const queueList = Array.from(queueMap.values());
  console.log(`Queue loaded with ${queueList.length} unique platform groups/organizations to inspect.`);

  const updatedCompaniesMap = new Map<string, CompanyData>();
  
  // Populate map with existing companies
  companies.forEach(c => {
    updatedCompaniesMap.set(c.githubOrg.toLowerCase(), c);
  });

  // 4. Process each organization in the queue
  for (const item of queueList) {
    const updatedCompany = await processOrg(item.slug, Array.from(updatedCompaniesMap.values()));
    
    if (updatedCompany) {
      // ── Job Enrichment: multi-source strategy ──
      const cleanNameKey = updatedCompany.name.toLowerCase().trim();
      const cleanSlugKey = updatedCompany.githubOrg.toLowerCase().trim();
      const remoteokKey = updatedCompany.remoteokSlug?.toLowerCase().trim();
      const orgKey = item.slug.toLowerCase().trim();

      // Determine jobSources config for this org
      const jobSourcesConfig = COMPANY_JOB_SOURCES[orgKey] || COMPANY_JOB_SOURCES[cleanSlugKey];
      
      // Attach jobSources config to company data
      if (jobSourcesConfig) {
        updatedCompany.jobSources = jobSourcesConfig;
      }

      let allJobs: ActiveJob[] = [];

      // Source 1: RemoteOK/Remotive global feed match
      let feedJobs = companyJobsMap.get(cleanNameKey) 
        || companyJobsMap.get(cleanSlugKey)
        || (remoteokKey ? companyJobsMap.get(remoteokKey) : undefined);
      
      if (!feedJobs) {
        for (const [apiCompanyName, jobs] of companyJobsMap.entries()) {
          if (
            cleanNameKey.includes(apiCompanyName) || apiCompanyName.includes(cleanNameKey) ||
            cleanSlugKey.includes(apiCompanyName) || apiCompanyName.includes(cleanSlugKey) ||
            (remoteokKey && (remoteokKey.includes(apiCompanyName) || apiCompanyName.includes(remoteokKey)))
          ) {
            feedJobs = jobs;
            console.log(`  🔗 Feed partial match: "${apiCompanyName}" → ${updatedCompany.name}`);
            break;
          }
        }
      }
      if (feedJobs) allJobs.push(...feedJobs);

      // Source 2: Greenhouse API (per-company)
      if (jobSourcesConfig?.greenhouse) {
        console.log(`  🌿 Fetching Greenhouse jobs for ${updatedCompany.name} (${jobSourcesConfig.greenhouse})...`);
        const ghJobs = await fetchGreenhouseJobs(jobSourcesConfig.greenhouse);
        if (ghJobs.length > 0) {
          console.log(`    Found ${ghJobs.length} relevant jobs from Greenhouse.`);
          allJobs.push(...ghJobs);
        }
      }

      // Source 3: Workday API (per-company)
      if (jobSourcesConfig?.workday) {
        console.log(`  🏢 Fetching Workday jobs for ${updatedCompany.name} (${jobSourcesConfig.workday.subdomain})...`);
        const wdJobs = await fetchWorkdayJobs(jobSourcesConfig.workday);
        if (wdJobs.length > 0) {
          console.log(`    Found ${wdJobs.length} relevant jobs from Workday.`);
          allJobs.push(...wdJobs);
        }
      }

      // Deduplicate by title (case-insensitive)
      const seenTitles = new Set<string>();
      const deduped = allJobs.filter(j => {
        const key = j.title.toLowerCase().trim();
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      });

      if (deduped.length > 0) {
        updatedCompany.activeJobs = deduped;
        updatedCompany.hasActiveJobs = true;
        console.log(`  💼 Enriched ${updatedCompany.name} with ${deduped.length} active jobs (deduplicated).`);
      } else {
        updatedCompany.activeJobs = [];
        updatedCompany.hasActiveJobs = false;
      }
      
      updatedCompaniesMap.set(item.slug.toLowerCase(), updatedCompany);
    }
    // Polite delay between organizations
    await new Promise(r => setTimeout(r, 1000));
  }

  // 4.5 Process RemoteOK Candidate discovery and watchlist sorting
  console.log("\n[Pipeline] Processing harvested RemoteOK candidates...");
  for (const candidate of remoteokCandidates) {
    const candidateDomain = parseDomain(candidate.website);
    
    // Check if domain is already in updatedCompaniesMap values
    const currentCompanies = Array.from(updatedCompaniesMap.values());
    const domainExists = currentCompanies.some(c => {
      if (c.website && parseDomain(c.website) === candidateDomain) return true;
      const parsedDom = parseDomain(c.githubOrgUrl) || parseDomain(c.jobSources?.careerPageUrl || null);
      return parsedDom === candidateDomain;
    });

    if (domainExists) {
      console.log(`  ⏭️ Candidate "${candidate.name}" domain (${candidateDomain}) already exists. Skipping.`);
      continue;
    }

    // Try to resolve organization on GitHub
    const resolvedOrg = await resolveGithubOrg(candidate.name, candidate.website);
    
    if (resolvedOrg) {
      const resolvedOrgKey = resolvedOrg.toLowerCase().trim();
      if (updatedCompaniesMap.has(resolvedOrgKey)) {
        console.log(`  ⏭️ Resolved GitHub org "${resolvedOrg}" is already in processed map. Skipping.`);
        continue;
      }

      // Run verification scan (Saringan A/B/C) on the resolved GitHub org
      console.log(`  🔍 Scanning resolved org "${resolvedOrg}" for "${candidate.name}"...`);
      const scannedCompany = await processOrg(resolvedOrg, currentCompanies);
      
      if (scannedCompany) {
        // Passed Saringan A/B/C!
        scannedCompany.status = "verified";
        scannedCompany.source = "remoteok";
        scannedCompany.website = candidate.website;
        
        // Enrich with candidate jobs from RemoteOK
        scannedCompany.activeJobs = candidate.jobs;
        scannedCompany.hasActiveJobs = candidate.jobs.length > 0;
        
        updatedCompaniesMap.set(resolvedOrgKey, scannedCompany);
        console.log(`    ✅ Candidate "${candidate.name}" successfully verified as "${scannedCompany.name}"!`);
      } else {
        // 0 matches (or early filter, or blocked). Add as watchlist entry
        console.log(`    ℹ️ Candidate "${candidate.name}" resolved to org "${resolvedOrg}" but failed verification scan (0 Indonesian members). Placing on watchlist.`);
        const watchlistEntry = createWatchlistEntry(
          candidate.name,
          resolvedOrg,
          candidate.website,
          candidate.remoteokSlug,
          "org-found-zero-match",
          candidate.jobs,
          currentCompanies
        );
        updatedCompaniesMap.set(resolvedOrgKey, watchlistEntry);
      }
    } else {
      // Org not found on GitHub. Add as watchlist entry
      console.log(`    ℹ️ Candidate "${candidate.name}" could not be resolved to a GitHub org. Placing on watchlist.`);
      const watchlistEntry = createWatchlistEntry(
        candidate.name,
        null,
        candidate.website,
        candidate.remoteokSlug,
        "no-org-found",
        candidate.jobs,
        currentCompanies
      );
      // Use remoteokSlug/companyKey as key in map
      const dummyKey = `wl-${candidate.remoteokSlug.toLowerCase()}`;
      updatedCompaniesMap.set(dummyKey, watchlistEntry);
    }

    // Delay between calls to be polite
    await new Promise(r => setTimeout(r, 1000));
  }

  // 5. Save updated list back to JSON (filter defunct + zero-member companies + excluded companies)
  const finalCompaniesList = Array.from(updatedCompaniesMap.values())
    .filter(c => c.status === "watchlist" || c.verifiedIndonesianCount > 0)
    .filter(c => !c.githubOrg || !BLOCKLISTED_ORGS.has(c.githubOrg.toLowerCase()))
    .filter(c => !c.githubOrg || !EXCLUDED_SET.has(c.githubOrg.toLowerCase()))
    .filter(c => !c.githubOrg || c.githubOrg.toLowerCase() === "xendit" || !isLocationIndonesian(c.headquarters));

  // Sort by verified count descending
  finalCompaniesList.sort((a, b) => b.verifiedIndonesianCount - a.verifiedIndonesianCount);

  saveCompanies(finalCompaniesList);

  // Notify Telegram channel for any new active-job companies
  await notifyNewVerifiedCompanies(companies, finalCompaniesList);

  // Save updated user location cache to disk
  saveUserLocationCache();

  if (newlyFlaggedOrgs.length > 0) {
    console.log("\n⚠️  SUMMARY OF ORGANIZATIONS FLAGGED FOR MANUAL REVIEW DURING THIS RUN:");
    newlyFlaggedOrgs.forEach(({ org, reason }, idx) => {
      console.log(`  ${idx + 1}. [${org}] - Reason: ${reason}`);
    });
    console.log(`  Total flagged organizations this run: ${newlyFlaggedOrgs.length}`);
  } else {
    console.log("\n✨ No organizations were newly flagged for manual review during this run.");
  }

  console.log("\n=== PIPELINE RUN COMPLETE ===");
}

async function notifyNewVerifiedCompanies(initialCompanies: CompanyData[], finalCompanies: CompanyData[]) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.log("\n[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID environment variables are not set. Skipping notifications.");
    return;
  }

  const initialOrgSet = new Set(initialCompanies.map(c => c.githubOrg.toLowerCase().trim()));
  const newActiveJobCompanies = finalCompanies.filter(c => {
    return !initialOrgSet.has(c.githubOrg.toLowerCase().trim()) && c.hasActiveJobs;
  });

  if (newActiveJobCompanies.length === 0) {
    console.log("\n[Telegram] No new verified companies with active jobs found in this run. No notifications to send.");
    return;
  }

  console.log(`\n[Telegram] Found ${newActiveJobCompanies.length} new verified company/companies with active jobs. Sending notifications...`);

  for (const company of newActiveJobCompanies) {
    const messageText = `🆕 *New verified company on Remotika*\n\n*${company.name}* just got verified — ${company.verifiedIndonesianCount} Indonesian team member${company.verifiedIndonesianCount > 1 ? "s" : ""} confirmed via GitHub, and they're actively hiring remote.\n\nCheck it out: https://remotika.vercel.app/company/${company.id}`;
    
    try {
      console.log(`  [Telegram] Sending notification for ${company.name} (ID: ${company.id})...`);
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          text: messageText,
          parse_mode: "Markdown"
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`  ❌ [Telegram] Failed to send notification for ${company.name}: ${res.statusText} - ${errorText}`);
      } else {
        console.log(`  ✅ [Telegram] Notification sent successfully for ${company.name}.`);
      }
    } catch (err: any) {
      console.error(`  ❌ [Telegram] Error sending message for ${company.name}:`, err.message);
    }
  }
}

main().catch(err => {
  console.error("Pipeline Fatal Error:", err);
  process.exit(1);
});
