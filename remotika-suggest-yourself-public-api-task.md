# Task Brief: "Suggest Yourself" Verification + Public Read-Only API

## Context

Two more additions to Remotika, consistent with the existing Git-as-a-Database (static JSON) architecture and the "verified, not self-reported" principle that's core to the product.

---

## Part 1 — "Suggest Yourself" Real-Time Verification

### Goal
Let an Indonesian engineer self-submit their GitHub username + the company they work for, and get an immediate, real-time decision on whether they're verified — rather than waiting for the next scheduled pipeline run. This speeds up dataset growth without compromising the "verified, not self-claimed" principle, since the decision is still based on actual GitHub org membership + location, not on trusting the user's claim.

### Implementation

1. **New form/page**: `/suggest-yourself` (or a modal/section on an existing relevant page — agent's judgment on placement, but a dedicated route is preferred for clarity and shareability).

   Form fields:
   - GitHub username (required)
   - Company name they're claiming (required) — this is just a label for display; the actual verification doesn't trust this field, it's there so the user tells us what GitHub org to check against
   - GitHub organization slug they believe applies (required) — e.g. if claiming "I work at Automattic", they'd enter `automattic` as the org slug to check

2. **New API route**: `POST /api/verify-self`

   Request body: `{ githubUsername: string, orgSlug: string }`

   Server-side logic (runs as a Next.js API route / Edge function, NOT in the GitHub Actions pipeline — this needs to respond synchronously to the user):
   
   a. Call GitHub API to check if `githubUsername` is a public member of `orgSlug`'s organization (`GET /orgs/{orgSlug}/members/{githubUsername}` — returns 204 if public member, 404 if not a member or not public)
   
   b. If confirmed a member, fetch the user's profile (`GET /users/{githubUsername}`) and check the `location` field against the same Indonesia-location matching logic already used in the existing pipeline (reuse that logic/function, don't duplicate it — extract it into a shared utility if it's currently only living inside `scripts/pipeline.ts`, so both the pipeline and this new API route can import it)
   
   c. Return one of three outcomes:
      - **Verified**: org membership confirmed + Indonesia location confirmed → return success, and queue this for inclusion in the dataset (see step 3 below)
      - **Not eligible**: org membership confirmed but location doesn't match Indonesia, OR org doesn't exist / org slug invalid → return a clear rejection reason, do NOT add to any queue
      - **Not a public member**: GitHub returned 404 for membership check → return a message explaining that GitHub org membership must be set to public on their GitHub profile for verification to work, with a link to GitHub's instructions for making org membership public

3. **On successful verification**: 
   - If the company (by org slug) already exists in `companies.json`, increment its verified member count and add this member to the company's member list (matching however the existing pipeline structures this data)
   - If the company does NOT already exist in `companies.json`, create a new entry following the existing schema, with this as the first verified member, and set `verifiedAt` to now
   - Write this change immediately to `companies.json` — since this is a real-time user-facing flow, the change needs to either commit directly to the repo (if the existing deployment setup allows server-side git commits, check how the pipeline currently commits its changes and reuse that mechanism) or queue it for the next pipeline run to pick up and commit (agent's judgment based on what's actually feasible in the current Vercel + GitHub Actions setup — document which approach was taken)

4. **Rate limiting / throttling on this endpoint** to prevent abuse (e.g. someone spamming submissions):
   - Use a simple in-memory or edge-based rate limit (e.g. Vercel's built-in rate limiting if available, or a simple IP-based throttle of something like 5 requests per hour per IP) — no new database needed, an in-memory/edge KV approach is fine for this scale
   - Return a clear 429 response with a friendly message if rate-limited

5. **UI feedback**: show the real-time result clearly — success state ("You're verified! [Company] now shows you as a confirmed team member"), rejection state with the specific reason, or the "make your org membership public" instructional state.

---

## Part 2 — Public Read-Only API

### Goal
Expose the company dataset as a clean, filterable, rate-limited public API for third parties (headhunters, other developers, researchers) to consume — without exposing internal/irrelevant fields.

### Implementation

1. **New API route**: `GET /api/v1/companies`

   Optional query parameters (all optional, combinable):
   - `hasActiveJobs` (boolean: `true`/`false`) — filter by active job status
   - `label` (string: e.g. `top-pick`, `established`, `indonesia-friendly`, `confirmed`) — filter by verification tier label
   - `minVerifiedCount` (number) — filter companies with at least this many verified members
   - `industry` (string) — filter by industry if that field exists in the schema
   - `limit` (number, default 50, max 200) — pagination size
   - `offset` (number, default 0) — pagination offset

2. **Response shape** — reshape the internal `companies.json` structure into a clean external-facing format. Exclude any internal-only fields (e.g. raw GitHub API response fragments, internal flags not meant for public consumption — agent should review the current schema and use judgment on what's "internal" vs "public-safe", but at minimum exclude any field that isn't already visibly used in the existing public-facing UI).

   Example response shape:
   ```json
   {
     "data": [
       {
         "name": "Automattic",
         "githubOrg": "automattic",
         "githubOrgUrl": "https://github.com/automattic",
         "label": "confirmed",
         "verifiedIndonesianCount": 1,
         "hasActiveJobs": false,
         "verifiedAt": "2026-06-15T00:00:00Z",
         "profileUrl": "https://remotika.vercel.app/company/automattic"
       }
     ],
     "meta": {
       "total": 5,
       "limit": 50,
       "offset": 0
     }
   }
   ```

3. **Rate limiting**: apply a sensible public API rate limit — e.g. 60 requests per minute per IP — using the same lightweight in-memory/edge approach as Part 1 (no new database). Return standard `429 Too Many Requests` with a `Retry-After` header when exceeded.

4. **CORS**: enable CORS for this endpoint (`Access-Control-Allow-Origin: *`) since it's meant for third-party consumption from any origin.

5. **Basic API documentation**: add a simple `/api/v1/docs` page or a section in the README documenting the endpoint, available query params, response shape, and rate limits — so third parties don't need to reverse-engineer it.

6. **No authentication required** for this version (public, read-only, rate-limited is sufficient protection for this dataset's sensitivity level) — do not add API keys or auth in this pass.

---

## Acceptance Criteria

- [ ] `/suggest-yourself` page exists with a working form (GitHub username + org slug)
- [ ] `POST /api/verify-self` performs real-time GitHub org membership + location check, reusing the existing pipeline's location-matching logic (extracted to a shared utility, not duplicated)
- [ ] Three clear outcomes handled: verified, not eligible, not a public member (with guidance)
- [ ] Successful verification results in an immediate or queued update to `companies.json` (document which mechanism was used)
- [ ] Rate limiting in place on `/api/verify-self` (~5 req/hour/IP, in-memory/edge, no new database)
- [ ] `GET /api/v1/companies` returns filtered, paginated, reshaped company data per the response shape above
- [ ] All listed optional query params work and are combinable
- [ ] Rate limiting in place on the public API (~60 req/min/IP)
- [ ] CORS enabled on the public API route
- [ ] Basic API documentation exists (page or README section)
- [ ] No new database introduced anywhere in this task
- [ ] No changes to the core `companies.json` schema beyond what's already established (this task only adds read/write logic, not new persistent fields beyond what Part 1 naturally requires for a new entry)

---

## Out of scope for this task

- API authentication / API keys (public + rate-limited is sufficient for now)
- Allowing suggest-yourself submissions for companies not yet in any seed list (i.e., this only verifies against orgs the user names directly — it does not also need to validate whether that org should even be a "company" per the existing non-company-org filter; if the org fails that filter, agent should apply the same filter logic here too, reusing Part 2's filter from the earlier "exclude non-company orgs" task if that logic already exists in a shared location)
- Write-access or mutation endpoints on the public API (Part 2 is read-only only)
