"use server";

import companiesDataRaw from "@/data/companies.json";

export interface CompanyData {
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
  activeJobs?: Array<{
    title: string;
    url: string;
    tags: string[];
    salary?: string;
  }>;
  verifiedMembers: Array<{
    id: string;
    githubLogin: string;
    githubProfileUrl: string;
    locationRaw: string | null;
  }>;
  headquarters?: string;
  foundationYear?: string;
  testimonials?: Array<{
    name: string;
    role: string;
    text: string;
  }>;
  jobSources?: {
    greenhouse?: string;
    workday?: { subdomain: string; sitePath: string };
    careerPageUrl?: string;
  };
}

// Read and cast static companies JSON database
const companiesData: CompanyData[] = companiesDataRaw as CompanyData[];

export async function getCompanies(
  search: string = "",
  label: string = "All",
  hasJobsOnly: boolean = false
): Promise<CompanyData[]> {
  const searchClean = search.trim().toLowerCase();
  let filtered = [...companiesData];

  if (searchClean) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(searchClean) ||
        c.githubOrg.toLowerCase().includes(searchClean) ||
        c.industry.toLowerCase().includes(searchClean)
    );
  }

  if (label !== "All") {
    filtered = filtered.filter((c) => c.label === label);
  }

  if (hasJobsOnly) {
    filtered = filtered.filter((c) => c.hasActiveJobs);
  }

  // Sort by count descending
  filtered.sort((a, b) => b.verifiedIndonesianCount - a.verifiedIndonesianCount);

  return filtered;
}

export async function submitSuggestion(
  githubOrg: string,
  email?: string
): Promise<{ success: boolean; message: string; redirectUrl?: string }> {
  const orgClean = githubOrg.trim().toLowerCase();
  if (!orgClean) {
    return { success: false, message: "Nama organisasi GitHub wajib diisi" };
  }

  // Build a pre-filled GitHub issue template URL for suggesting companies
  const title = encodeURIComponent(`Suggest Organization: @${orgClean}`);
  const body = encodeURIComponent(
    `### Organization Suggestion\n\n- **GitHub Organization Name:** @${orgClean}\n- **Suggested By:** ${email || "Anonymous Community Member"}\n\n*This issue has been pre-filled automatically by Remotika. Our GitHub Actions pipeline will inspect this organization membership in the next run.*`
  );
  
  const repoUrl = process.env.NEXT_PUBLIC_GITHUB_REPO || "https://github.com/hryagstn/remotika";
  const issueUrl = `${repoUrl}/issues/new?title=${title}&body=${body}`;

  return {
    success: true,
    message: `Mengarahkan Anda ke GitHub untuk mengirimkan saran resmi untuk @${orgClean}...`,
    redirectUrl: issueUrl,
  };
}
