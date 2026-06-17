# Remotika 🇮🇩 🚀

> **Find global companies that actively hire Indonesian remote developers — 100% verified via GitHub organization memberships, not self-reported.**

Remotika is a zero-cost, hyper-scalable developer directory tool built to solve a real information gap: helping Indonesian developers and freelancers identify foreign, high-budget companies that *already* have a proven track record of hiring Indonesian talent.

Instead of relying on self-reported and easily faked profile text, Remotika uses an **organization-first approach**: it verifies public GitHub organization memberships of target companies, matches member locations against targeted Indonesian keywords, and lists them with clear classification levels.

---

## 🛠️ Tech Stack & Architecture (Alternative 1)

This project is built using a modern, zero-maintenance **Git-as-a-Database (Stasis JSON)** architecture:
- **Frontend & Server Actions:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** Static JSON file at `src/data/companies.json` serving all filter/search states instantaneously with sub-millisecond response times. No PostgreSQL, no Supabase, completely free of inactive sleep cycles!
- **Data Pipeline:** Single Node/TypeScript script (`scripts/pipeline.ts`) that runs via **GitHub Actions** on a monthly cron schedule, fetches verified data, updates `companies.json`, and auto-commits the changes back to git.

---

## 📊 Verification Thresholds & Labeling

We classify companies based on the number of verified Indonesian public organization members found:

| Verified Indonesian Members | Label | Meaning |
| :--- | :--- | :--- |
| **1 developer** | 🔵 **Confirmed** | Proven precedent, remote infrastructure is established |
| **2–4 developers** | 🟢 **Indonesia-Friendly** | Demonstrable remote-hiring pattern in place |
| **5–9 developers** | 🟢 **Established** | Deeply comfortable hiring and working with Indonesian talent |
| **10+ developers** | ⭐ **Top Pick** | Indonesia is a core part of their global talent sourcing strategy |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **GitHub Personal Access Token (PAT):** Required for running the data pipeline script locally to avoid GitHub API rate-limiting.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone git@github.com:hryagstn/remotika.git
cd remotika
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
GITHUB_TOKEN=your_github_personal_access_token
```

### 4. Running the App Locally
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dark-glassmorphic dashboard.

---

## 📡 Running the Data Pipeline

To scan GitHub organizations and update the local database:
```bash
npm run pipeline
```

### How the Pipeline Works:
1. Loads the existing `src/data/companies.json` file.
2. Compiles a unique queue of organizations (existing list + seed list).
3. Connects securely to the GitHub API via your `GITHUB_TOKEN`.
4. Fetch organization details and lists up to 100 public members.
5. Scans member profiles for location markers matching Indonesia (`jakarta`, `bandung`, `surabaya`, etc.).
6. Updates coordinates, labels, and member list, preserving existing active jobs and remoteok custom configurations.
7. Saves the updated data structures back to `src/data/companies.json` with clean indentations.

---

## 🤖 Automated Updates (GitHub Actions)

We have configured a fully automated monthly pipeline in `.github/workflows/pipeline.yml`:
- **Schedule:** Triggers automatically on the **1st of every month** (`0 0 1 * *`) or can be triggered manually from the "Actions" tab.
- **Auto-Commit:** The action securely runs the pipeline, updates `src/data/companies.json`, and commits/pushes the changes back to `main`.
- **Zero-Config Redeploy:** If hosted on **Vercel** or **Netlify**, the push back to `main` automatically triggers a zero-downtime production redeployment.

---

## 💡 How to Suggest a Company

Community contributions drive this directory forward!
1. When a user fills out the **"Suggest a Company"** form on the dashboard, Remotika uses a Next.js Server Action to compile a pre-filled GitHub Issue URL template.
2. The user is redirected to the repository's **New Issue** page.
3. Once they click submit, a human review is triggered.
4. An admin can then add the organization to the pipeline seeds or merge it directly, fueling a viral community loop!

---

## 🤝 Contributing

We welcome community members to add new seed companies, improve location matching keywords, or enhance the dashboard UI!

1. Fork this repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'feat: add amazing feature'`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*Handcrafted with ❤️ for the Indonesian developer community by [hryagstn](https://github.com/hryagstn).*
