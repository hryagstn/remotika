export interface MockMember {
  id: string;
  githubLogin: string;
  githubProfileUrl: string;
  locationRaw: string;
}

export interface MockCompany {
  id: string;
  name: string;
  githubOrg: string;
  githubOrgUrl: string;
  remoteokSlug: string | null;
  industry: string;
  verifiedIndonesianCount: number;
  label: "Confirmed" | "Indonesia-Friendly" | "Established" | "Top Pick";
  lastVerifiedAt: string;
  hasActiveJobs: boolean;
  activeJobs?: Array<{
    title: string;
    url: string;
    tags: string[];
    salary?: string;
  }>;
  verifiedMembers: MockMember[];
}

export const MOCK_COMPANIES: MockCompany[] = [
  {
    id: "co-1",
    name: "ProjectDiscovery",
    githubOrg: "projectdiscovery",
    githubOrgUrl: "https://github.com/projectdiscovery",
    remoteokSlug: "projectdiscovery",
    industry: "Cloud Security & Open-Source Tooling",
    verifiedIndonesianCount: 1,
    label: "Confirmed",
    lastVerifiedAt: "2026-06-15T12:00:00Z",
    hasActiveJobs: true,
    activeJobs: [
      {
        title: "Senior Security Engineer (Remote)",
        url: "https://remoteok.com/companies/projectdiscovery",
        tags: ["Security", "Go", "Kubernetes"],
        salary: "$130k - $160k"
      },
      {
        title: "Fullstack Engineer - React/Go (Remote)",
        url: "https://remoteok.com/companies/projectdiscovery",
        tags: ["React", "Go", "TypeScript"],
        salary: "$110k - $140k"
      }
    ],
    verifiedMembers: [
      {
        id: "m-1",
        githubLogin: "dwisiswant0",
        githubProfileUrl: "https://github.com/dwisiswant0",
        locationRaw: "Jakarta, Indonesia"
      }
    ]
  },
  {
    id: "co-2",
    name: "NVIDIA GameWorks",
    githubOrg: "nvidiagameworks",
    githubOrgUrl: "https://github.com/NVIDIAGameWorks",
    remoteokSlug: "nvidia",
    industry: "Computer Graphics, AI, and Gaming Engine Tech",
    verifiedIndonesianCount: 2,
    label: "Indonesia-Friendly",
    lastVerifiedAt: "2026-06-14T08:30:00Z",
    hasActiveJobs: false,
    verifiedMembers: [
      {
        id: "m-2",
        githubLogin: "angeloanan",
        githubProfileUrl: "https://github.com/angeloanan",
        locationRaw: "Indonesia"
      },
      {
        id: "m-3",
        githubLogin: "anggape",
        githubProfileUrl: "https://github.com/anggape",
        locationRaw: "Jawa Tengah, Indonesia"
      }
    ]
  },
  {
    id: "co-3",
    name: "KrakenD API Gateway",
    githubOrg: "krakend-contrib",
    githubOrgUrl: "https://github.com/krakend-contrib",
    remoteokSlug: "krakend",
    industry: "Enterprise API Gateways & High-Performance Middleware",
    verifiedIndonesianCount: 1,
    label: "Confirmed",
    lastVerifiedAt: "2026-06-15T10:15:00Z",
    hasActiveJobs: true,
    activeJobs: [
      {
        title: "Backend Engineer - Go/Systems (Remote)",
        url: "https://remoteok.com/companies/krakend",
        tags: ["Go", "Systems", "Docker"],
        salary: "€80k - €110k"
      }
    ],
    verifiedMembers: [
      {
        id: "m-4",
        githubLogin: "novalagung",
        githubProfileUrl: "https://github.com/novalagung",
        locationRaw: "Malang, Indonesia"
      }
    ]
  },
  {
    id: "co-4",
    name: "Gojek Tech Labs (GTI)",
    githubOrg: "gtilabs",
    githubOrgUrl: "https://github.com/GTILabs",
    remoteokSlug: "gojek",
    industry: "FinTech, Digital Ride-Hailing & Logistics",
    verifiedIndonesianCount: 3,
    label: "Indonesia-Friendly",
    lastVerifiedAt: "2026-06-16T01:00:00Z",
    hasActiveJobs: false,
    verifiedMembers: [
      {
        id: "m-5",
        githubLogin: "hendisantika",
        githubProfileUrl: "https://github.com/hendisantika",
        locationRaw: "Bandung Jawa Barat - Indonesia"
      },
      {
        id: "m-6",
        githubLogin: "hilman-firdd",
        githubProfileUrl: "https://github.com/hilman-firdd",
        locationRaw: "Bandung"
      },
      {
        id: "m-7",
        githubLogin: "khannedy",
        githubProfileUrl: "https://github.com/khannedy",
        locationRaw: "Jakarta, Indonesia"
      }
    ]
  },
  {
    id: "co-5",
    name: "Canva",
    githubOrg: "canva",
    githubOrgUrl: "https://github.com/canva",
    remoteokSlug: "canva",
    industry: "Visual Collaboration, Cloud Graphic Design SaaS",
    verifiedIndonesianCount: 8,
    label: "Established",
    lastVerifiedAt: "2026-06-10T14:45:00Z",
    hasActiveJobs: true,
    activeJobs: [
      {
        title: "Senior frontend Developer (Remote APAC)",
        url: "https://remoteok.com/companies/canva",
        tags: ["React", "TypeScript", "CSS"],
        salary: "$120k - $150k"
      },
      {
        title: "Product Designer - Growth (Remote)",
        url: "https://remoteok.com/companies/canva",
        tags: ["Figma", "Design", "UX"],
        salary: "$100k - $130k"
      }
    ],
    verifiedMembers: [
      { id: "m-8", githubLogin: "canva-talent-1", githubProfileUrl: "https://github.com/canva", locationRaw: "Jakarta, Indonesia" },
      { id: "m-9", githubLogin: "canva-talent-2", githubProfileUrl: "https://github.com/canva", locationRaw: "Bandung, Indonesia" },
      { id: "m-10", githubLogin: "canva-talent-3", githubProfileUrl: "https://github.com/canva", locationRaw: "Surabaya, Indonesia" },
      { id: "m-11", githubLogin: "canva-talent-4", githubProfileUrl: "https://github.com/canva", locationRaw: "Yogyakarta, Indonesia" },
      { id: "m-12", githubLogin: "canva-talent-5", githubProfileUrl: "https://github.com/canva", locationRaw: "Bali, Indonesia" }
    ]
  },
  {
    id: "co-6",
    name: "GitLab",
    githubOrg: "gitlab",
    githubOrgUrl: "https://github.com/gitlab",
    remoteokSlug: "gitlab",
    industry: "DevSecOps Platform, Open Source Git Collaboration",
    verifiedIndonesianCount: 12,
    label: "Top Pick",
    lastVerifiedAt: "2026-06-11T09:20:00Z",
    hasActiveJobs: true,
    activeJobs: [
      {
        title: "Staff Systems Engineer - Distribution (Remote)",
        url: "https://remoteok.com/companies/gitlab",
        tags: ["Go", "Ruby", "Kubernetes"],
        salary: "$150k - $190k"
      }
    ],
    verifiedMembers: [
      { id: "m-13", githubLogin: "gitlab-talent-1", githubProfileUrl: "https://github.com/gitlab", locationRaw: "Yogyakarta, Indonesia" },
      { id: "m-14", githubLogin: "gitlab-talent-2", githubProfileUrl: "https://github.com/gitlab", locationRaw: "Jakarta" },
      { id: "m-15", githubLogin: "gitlab-talent-3", githubProfileUrl: "https://github.com/gitlab", locationRaw: "Bandung" },
      { id: "m-16", githubLogin: "gitlab-talent-4", githubProfileUrl: "https://github.com/gitlab", locationRaw: "Surabaya" },
      { id: "m-17", githubLogin: "gitlab-talent-5", githubProfileUrl: "https://github.com/gitlab", locationRaw: "Indonesia" }
    ]
  },
  {
    id: "co-7",
    name: "Xendit",
    githubOrg: "xendit",
    githubOrgUrl: "https://github.com/xendit",
    remoteokSlug: "xendit",
    industry: "Digital Payment Gateway & Financial Infrastructure",
    verifiedIndonesianCount: 14,
    label: "Top Pick",
    lastVerifiedAt: "2026-06-15T18:40:00Z",
    hasActiveJobs: true,
    activeJobs: [
      {
        title: "Senior Software Engineer - NodeJS (Remote)",
        url: "https://remoteok.com/companies/xendit",
        tags: ["NodeJS", "TypeScript", "AWS"],
        salary: "$80k - $110k"
      }
    ],
    verifiedMembers: [
      { id: "m-18", githubLogin: "xendit-dev-1", githubProfileUrl: "https://github.com/xendit", locationRaw: "Jakarta, Indonesia" },
      { id: "m-19", githubLogin: "xendit-dev-2", githubProfileUrl: "https://github.com/xendit", locationRaw: "Tangerang, Indonesia" },
      { id: "m-20", githubLogin: "xendit-dev-3", githubProfileUrl: "https://github.com/xendit", locationRaw: "Bandung" }
    ]
  }
];
