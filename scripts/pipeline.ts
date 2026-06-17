// scripts/pipeline.ts
import fs from "fs";
import path from "path";
import "dotenv/config";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DATA_FILE_PATH = path.join(process.cwd(), "src/data/companies.json");

const INDONESIA_KEYWORDS = [
  "indonesia", "jakarta", "bandung", "surabaya", "medan",
  "yogyakarta", "semarang", "bali", "depok", "tangerang",
  "malang", "bekasi", "bogor", "banten", "solok", "padang"
];

// Expanded seed list containing top global remote tech companies
const DEFAULT_SEED_ORGS = [
  "projectdiscovery",
  "NVIDIAGameWorks",
  "krakend-contrib",
  "GTILabs",
  "shopify",
  "gitlab",
  "hashicorp",
  "grafana",
  "vercel",
  "automattic",
  "canva",
  "grab",
  "xendit",
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
  "gojek",
  "traveloka",
  "tokopedia",
  "bukalapak",
  "midtrans",
  "fazz",
  "finantier",
  "ayoconnect",
  "halodoc",
  "efishery",
  "vidio",
  "kumparan",
  "canonical",
  "doist",
  "buffer",
  "toptal",
  "elastic",
  "polkadot",
  "paritytech",
  "stellar",
  "ripple",
  "chainlink"
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
}

interface CompanyData {
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
  activeJobs?: ActiveJob[];
  verifiedMembers: VerifiedMember[];
  headquarters?: string;
  foundationYear?: string;
  testimonials?: Array<{ name: string; role: string; text: string }>;
}

// User location search cache to save GitHub API quota
const userLocationCache = new Map<string, { isIndo: boolean; profile: any }>();

// Map to hold fetched remote jobs
const companyJobsMap = new Map<string, ActiveJob[]>();

async function fetchWithAuth(url: string) {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not configured in the environment.");
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Remotika-Pipeline/1.0"
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API Error (${res.status}): ${text}`);
  }
  return res.json();
}

function isIndonesian(location: string | null): boolean {
  if (!location) return false;
  const lowercaseLocation = location.toLowerCase();
  return INDONESIA_KEYWORDS.some(k => lowercaseLocation.includes(k));
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

async function fetchRemoteJobs() {
  console.log("\n[Pipeline] Fetching active remote jobs from RemoteOK API...");
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "Remotika-Pipeline/1.0" }
    });
    if (!res.ok) {
      console.log("  ⚠️  Failed to fetch from RemoteOK API. Skipping job enrichment.");
      return;
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      // Skip the first item as it is the legal info block
      const jobs = data.slice(1);
      console.log(`  Fetched ${jobs.length} remote jobs. Parsing and matching...`);
      for (const job of jobs) {
        if (!job.company || !job.position || !job.url) continue;
        const companyKey = job.company.toLowerCase().trim();
        const activeJob: ActiveJob = {
          title: job.position,
          url: job.url,
          tags: Array.isArray(job.tags) ? job.tags : [],
          salary: job.salary || undefined
        };
        if (!companyJobsMap.has(companyKey)) {
          companyJobsMap.set(companyKey, []);
        }
        companyJobsMap.get(companyKey)!.push(activeJob);
      }
      console.log(`  Jobs mapped to ${companyJobsMap.size} unique companies.`);
    }
  } catch (err: any) {
    console.error("  ❌ Error fetching remote jobs:", err.message);
  }
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

async function processOrg(orgLogin: string, existingCompanies: CompanyData[]): Promise<CompanyData | null> {
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
      const label = getEmployeeLabel(foundIndonesianMembers.length);
      const lastVerifiedAt = new Date().toISOString();

      if (existingCompany) {
        const updated: CompanyData = {
          ...existingCompany,
          name: orgName,
          githubOrgUrl: orgUrl,
          industry: description.substring(0, 255),
          verifiedIndonesianCount: foundIndonesianMembers.length,
          label: label,
          lastVerifiedAt: lastVerifiedAt,
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
          remoteokSlug: orgLogin.toLowerCase(),
          industry: description.substring(0, 255),
          verifiedIndonesianCount: foundIndonesianMembers.length,
          label: label,
          lastVerifiedAt: lastVerifiedAt,
          hasActiveJobs: false,
          activeJobs: [],
          verifiedMembers: foundIndonesianMembers
        };
        console.log(`  ✨ Created brand new entry for ${orgName} with ID ${newId}.`);
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

  // 1. Fetch remote jobs from RemoteOK API first
  await fetchRemoteJobs();

  // 2. Load current companies.json database
  const companies = loadCompanies();
  console.log(`Loaded ${companies.length} existing companies from JSON database.`);

  // 3. Collate orgs to process (existing + seeds + community seeds)
  const orgsToProcess = new Set<string>();
  companies.forEach(c => {
    if (c.githubOrg) {
      orgsToProcess.add(c.githubOrg.toLowerCase().trim());
    }
  });

  DEFAULT_SEED_ORGS.forEach(org => {
    orgsToProcess.add(org.toLowerCase().trim());
  });

  try {
    const communitySeeds = await fetchCommunitySeeds();
    communitySeeds.forEach(org => {
      orgsToProcess.add(org.toLowerCase().trim());
    });
  } catch (err: any) {
    console.error("  ❌ Error combining community seeds:", err.message);
  }

  const orgList = Array.from(orgsToProcess);
  console.log(`Queue loaded with ${orgList.length} unique organizations to inspect.`);

  const updatedCompaniesMap = new Map<string, CompanyData>();
  
  // Populate map with existing companies
  companies.forEach(c => {
    updatedCompaniesMap.set(c.githubOrg.toLowerCase(), c);
  });

  // 4. Process each organization in the queue
  for (const org of orgList) {
    const updatedCompany = await processOrg(org, Array.from(updatedCompaniesMap.values()));
    if (updatedCompany) {
      // Enrich with active jobs if matches RemoteOK fetched list
      const cleanNameKey = updatedCompany.name.toLowerCase().trim();
      const cleanSlugKey = updatedCompany.githubOrg.toLowerCase().trim();
      
      const matchedJobs = companyJobsMap.get(cleanNameKey) || companyJobsMap.get(cleanSlugKey);
      if (matchedJobs && matchedJobs.length > 0) {
        updatedCompany.activeJobs = matchedJobs;
        updatedCompany.hasActiveJobs = true;
        console.log(`  💼 Enriched ${updatedCompany.name} with ${matchedJobs.length} active jobs.`);
      } else {
        // Retain existing mock/custom jobs if RemoteOK didn't return anything to prevent deleting data
        if (!updatedCompany.activeJobs || updatedCompany.activeJobs.length === 0) {
          updatedCompany.activeJobs = [];
          updatedCompany.hasActiveJobs = false;
        }
      }
      
      updatedCompaniesMap.set(org.toLowerCase(), updatedCompany);
    }
    // Polite delay between organizations
    await new Promise(r => setTimeout(r, 1000));
  }

  // 5. Save updated list back to JSON
  const finalCompaniesList = Array.from(updatedCompaniesMap.values())
    .filter(c => c.verifiedIndonesianCount > 0);

  // Sort by verified count descending
  finalCompaniesList.sort((a, b) => b.verifiedIndonesianCount - a.verifiedIndonesianCount);

  saveCompanies(finalCompaniesList);

  console.log("\n=== PIPELINE RUN COMPLETE ===");
}

main().catch(err => {
  console.error("Pipeline Fatal Error:", err);
  process.exit(1);
});
