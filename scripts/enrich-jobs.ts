// scripts/enrich-jobs.ts — Quick job enrichment without full pipeline scan
import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "src/data/companies.json");

interface ActiveJob {
  title: string;
  url: string;
  tags: string[];
  salary?: string;
}

interface JobSources {
  greenhouse?: string;
  workday?: { subdomain: string; sitePath: string };
  careerPageUrl?: string;
}

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

const LOCATION_KEYWORDS_REMOTE = ["remote", "anywhere", "worldwide", "global"];
const LOCATION_KEYWORDS_APAC = ["indonesia", "jakarta", "apac", "asia", "singapore", "southeast asia"];

function isRelevantLocation(locationName: string): boolean {
  const loc = locationName.toLowerCase();
  return [...LOCATION_KEYWORDS_REMOTE, ...LOCATION_KEYWORDS_APAC].some(k => loc.includes(k));
}

async function fetchGreenhouseJobs(boardSlug: string): Promise<ActiveJob[]> {
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
}

async function main() {
  console.log("=== Remotika Quick Job Enrichment ===\n");
  
  const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
  const companies = JSON.parse(raw);
  
  let totalEnriched = 0;
  
  for (const company of companies) {
    const orgKey = company.githubOrg.toLowerCase();
    const config = COMPANY_JOB_SOURCES[orgKey];
    
    if (!config) {
      console.log(`⏭️  ${company.name} — no job source config, skipping`);
      continue;
    }
    
    // Attach jobSources config
    company.jobSources = config;
    
    let jobs: ActiveJob[] = [];
    
    // Fetch from Greenhouse if configured
    if (config.greenhouse) {
      console.log(`🌿 ${company.name} — fetching Greenhouse (${config.greenhouse})...`);
      const ghJobs = await fetchGreenhouseJobs(config.greenhouse);
      jobs.push(...ghJobs);
      console.log(`   Found ${ghJobs.length} relevant jobs`);
    }
    
    if (jobs.length > 0) {
      company.activeJobs = jobs;
      company.hasActiveJobs = true;
      totalEnriched++;
      console.log(`   ✅ Enriched with ${jobs.length} jobs`);
    } else {
      company.activeJobs = [];
      company.hasActiveJobs = false;
      if (config.careerPageUrl) {
        console.log(`   📄 No API jobs, career page link set: ${config.careerPageUrl}`);
      }
    }
  }
  
  // Save
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(companies, null, 2) + "\n");
  console.log(`\n✅ Done! Enriched ${totalEnriched} companies with real job data.`);
  console.log(`📁 Updated: ${DATA_FILE_PATH}`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
