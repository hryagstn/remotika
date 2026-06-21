# Task Brief: Recently Verified Sorting + Share Company + Telegram Channel Notifications

## Context

Three features to add to Remotika, building on the existing Git-as-a-Database (static JSON) architecture. No database, no new backend services beyond what's listed below.

---

## Part 1 — "Recently Verified" Sorting

### Goal
Let users sort the directory by most recently verified companies, to show the dataset is actively growing.

### Implementation

1. **Add a `verifiedAt` field** (ISO 8601 timestamp) to each company entry in the existing `companies.json` schema, if not already present. This should be set by the pipeline script (`scripts/pipeline.ts`) at the moment a company is first verified and added — NOT updated on every re-run, only set once at first verification.
   - If a `verifiedAt`-equivalent field already exists under a different name, reuse it instead of adding a duplicate field.

2. **Add a sort control to the directory/listing page UI** — a dropdown or toggle alongside any existing sort/filter controls, with at least these options:
   - "Recently Verified" (default to existing default if there is one, don't change current default behavior unless asked)
   - Existing sort options should remain available

3. **Sorting logic is purely client-side** — since all company data is already loaded for rendering the directory, sort the in-memory array by `verifiedAt` descending. No new data fetching required.

---

## Part 2 — "Share This Company" Button (Active Jobs Only)

### Goal
Let users generate and share a card for a specific company — but ONLY for companies with `hasActiveJobs: true` (or equivalent existing field). This isn't a generic "share" button; it's specifically framed as: "this company has verified Indonesian talent AND is actively hiring remote" — combining social proof with a call to action, differentiating it from a plain job repost.

### Implementation

1. **Show the "Share" button only on company cards/detail pages where active jobs exist.** Companies without active jobs should not show this button (or show a disabled/different state — agent's judgment, but the share flow only applies to active-job companies).

2. **Reuse the existing `@vercel/og` pattern** already implemented for the Readiness Check feature (`/api/readiness-og`) — create a parallel route: `/api/company-og?slug={companySlug}` that generates a shareable image (1200×627px) containing:
   - Remotika logo/wordmark
   - Company name + logo/initial (matching existing card styling)
   - Headline framing, e.g.: "[Company Name] has verified Indonesian talent — and they're hiring remotely"
   - The verified member count (e.g. "3 verified Indonesian team members")
   - A short CTA line: "See open roles at remotika.vercel.app/company/{slug}"
   - Do NOT include specific job titles/salary in the image itself (keep it evergreen so the image stays valid even if the specific job listing changes) — job details stay on the linked page, not hardcoded into the shareable image

3. **Add a "Download image to share" button** on the company detail page (only when active jobs exist), following the same UX pattern as the Readiness Check share flow:
   - Triggers download of the OG image
   - Shows an editable, pre-filled caption textarea for LinkedIn, e.g.:
     ```
     [Company Name] has verified Indonesian engineers on their team — and they're actively hiring remote talent right now.

     Not a guess. Verified via public GitHub organization membership.

     Check the role and the verification: remotika.vercel.app/company/{slug}
     ```
   - Keep the caption editable, not just static copy-paste text

4. Data needed (company name, slug, member count, hasActiveJobs) all already exists in `companies.json` — no new data fields required beyond what Part 1 may add.

---

## Part 3 — Telegram Channel Notifications for New Active-Job Companies

### Goal
Notify a Telegram channel automatically whenever a NEW company is added to the dataset AND has active jobs — giving users an actionable reason to subscribe (not noise for every pipeline run, only genuinely new + actionable entries).

### Implementation

1. **New pipeline step**: after the existing pipeline run completes and `companies.json` is updated, compare the new company list against the previous run's snapshot to detect:
   - Companies that are NEW (weren't in the dataset before this run) AND have `hasActiveJobs: true`
   - Do NOT notify for companies that already existed and just got a job update — only brand-new verified companies with active jobs at time of first verification

2. **Maintain a simple diff mechanism**: before overwriting `companies.json`, read the previous version (from git history via `git show HEAD:path/to/companies.json` in the GitHub Actions step, or keep a `data/companies.previous.json` snapshot copy) to compute the diff. Use whichever approach is simpler given the existing pipeline script structure.

3. **Send Telegram message via Bot API** for each newly-qualifying company:
   - Use `https://api.telegram.org/bot{BOT_TOKEN}/sendMessage` with `chat_id` set to the channel ID (channel, not a personal chat — bot must be added as admin to the channel, which Harry will configure manually)
   - `BOT_TOKEN` and `TELEGRAM_CHANNEL_ID` should be read from environment variables / GitHub Actions secrets — do NOT hardcode these, do NOT commit them to the repo. Add placeholder entries to `.env.example` (e.g. `TELEGRAM_BOT_TOKEN=`, `TELEGRAM_CHANNEL_ID=`) so Harry knows what to configure.
   - Message format (use Markdown or HTML parse mode, whichever the existing codebase conventions favor, default to Markdown if no precedent):
     ```
     🆕 New verified company on Remotika

     [Company Name] just got verified — [X] Indonesian team members confirmed via GitHub, and they're actively hiring remote.

     Check it out: remotika.vercel.app/company/{slug}
     ```
   - If multiple new qualifying companies are found in a single pipeline run, send one message per company (not batched into one giant message), so each gets visibility in the channel.

4. **Add this as a final step in the existing GitHub Actions pipeline workflow** (whichever YAML file already runs `scripts/pipeline.ts`) — run after the main pipeline script completes successfully, only if there's something to notify (skip the step entirely if no new qualifying companies, don't send empty/null messages).

5. **Add a "Subscribe on Telegram" link/button** somewhere visible on the site (header, footer, or a dedicated small banner on the directory page) linking to the public Telegram channel URL. Harry will provide the channel's public `t.me/...` link — for now, use a placeholder `https://t.me/REPLACE_ME` and leave a comment in the code marking it as needing Harry's actual channel link.

---

## Environment Variables Needed (Harry will provide values, just wire up the code)

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
```

---

## Acceptance Criteria

- [ ] Each company has a `verifiedAt` (or equivalent) timestamp field, set once at first verification
- [ ] Directory page has a working "Recently Verified" sort option, client-side, no new data fetching
- [ ] "Share" button appears ONLY on companies with active jobs
- [ ] `/api/company-og` generates a clean shareable image per company, following existing DESIGN.md visual conventions
- [ ] Company detail page has a "Download image to share" button + editable LinkedIn caption textarea, mirroring the Readiness Check share UX
- [ ] Pipeline detects newly-added companies with active jobs (not just any update) by diffing against the previous run
- [ ] Telegram message sent per new qualifying company, via Bot API, using env vars for credentials
- [ ] No message sent if there are no new qualifying companies in a given run
- [ ] `.env.example` updated with the two new Telegram variables
- [ ] A "Subscribe on Telegram" link is visible on the site with a placeholder URL clearly marked for Harry to update
- [ ] No database introduced — diffing uses git history or a simple snapshot file, consistent with existing Git-as-a-Database architecture
- [ ] No changes to existing `companies.json` schema beyond adding `verifiedAt` if missing

---

## Out of scope for this task

- Email notifications (explicitly not wanted — Telegram channel only)
- Personal Telegram DM-based subscriptions (using a public channel instead, simpler, no per-user state to manage)
- Historical backfill of `verifiedAt` for companies already in the dataset before this change (leave existing entries without the field, or set a reasonable fallback like the file's last git commit date — agent's judgment, not critical)
