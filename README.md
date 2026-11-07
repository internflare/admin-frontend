# Welcome to your Polymet AI project

## Browser security

The deployed `_headers` Content Security Policy permits same-origin scripts only
and blocks inline/eval scripts, executable objects, iframes, base tags and
cross-origin form submissions. Keep record content as escaped React text.
Document links accept HTTP(S) only, and chart style blocks do not inject HTML.
Cloudflare hosting must serve these headers; Vite development/preview does not
apply `_headers`. This security hardening does not add PWA support to the admin.

## Loading states

Session checks, page details, table fetches, dashboard totals and search
results use skeleton placeholders. Reuse `SessionSkeleton`, `PageSkeleton`
and `TableSkeleton` in `src/polymet/components/state-views.tsx`, backed by the
shared UI skeleton primitive. Loading regions expose a status and `aria-busy`;
decorative placeholders are hidden from assistive technology and respect
reduced-motion preferences. Button submissions retain their progress spinners.
Error and empty states remain distinct from loading.

## Live admin data

The admin console does not contain operational fixtures or local-only success
actions. Configure `VITE_API_URL` as the **gateway admin base URL**, for example
`http://localhost:3000/api/v1/admin` (the development default). Do not point the
frontend at individual microservices. Requests use the shared API client,
HTTP-only session cookies and correlation IDs. The gateway must permit the
frontend origin and credentialed requests.
Invalid OTP/request-code responses keep their backend error and do not claim
that a signed-in session expired. A silent unauthenticated `/auth/me` probe is
normal; protected-request 401s invalidate the session.

### Endpoint coverage

Paths below are relative to that gateway base:

| Surface | Backend endpoints |
|---------|-------------------|
| Current dashboard totals | Paginated directory queries for talent, verified companies, published listings, applications, recorded hires, active workspaces and unresolved reconciliations; only authorised modules are requested |
| Dashboard & analytics charts | `GET /dashboard?range=30d`, `GET /analytics?range=7d/30d/90d/1y`, `POST /analytics/export` (CSV, `analytics.export`) |
| Users | `GET /users`, `GET /users/:id`, `POST /users/:id/status`, `POST /users/:id/reveal-pii` |
| Companies & verification | `GET /companies`, `GET /verification`, `GET /verification/:id`, `POST /verification/:id/checklist`, `POST /verification/:id/decision` |
| Listings & recruitment | `GET /listings`, `GET /listings/:id`, `POST /listings/:id/moderate`, `GET /applications`, `GET /placements` |
| Workspaces & coordinators | `GET /workspaces`, `POST /workspaces/:id/re-provision`, `GET /mentors`, `GET /supervisors` |
| Bug reports & ideas | `GET /feedback`, `GET /feedback/:id`, `POST /feedback/:id/status` (`support.view` to read, `support.manage` to triage) |
| Commercial | `GET /plans`, `GET /finance/transactions`, `GET /finance/reconciliation`, `POST /finance/reconciliation/:id/settle` |
| Audit & settings | `GET /audit-logs`, `GET /settings/admins`, `POST /settings/admins/invite`, `GET /settings/features`, `PATCH /settings/features/:key` |
| Health | `GET /health` (admin-service dependency checks only) |

Collections validate the backend's named envelope (`users`, `companies`,
`queue`, `listings`, `applications`, `placements`, `workspaces`, `feedback`, `mentors`,
`supervisors`, `plans`, `transactions`, `reconciliations`, `logs`, `admins`,
`flags`) and, where supported, `pagination.page/total/totalPages`. An empty
successful collection, unavailable capability, malformed response and failed
request have distinct states. Missing values say “Not supplied”; missing
metrics never become zero. Server-provided zero values are retained.

Search and filters run on the server and pagination is server-driven.
Global search queries only authorised searchable directories, showing up to
five results per directory and a link to its full server search. It is not a
universal ID lookup. Companies and workspaces have no detail endpoint, so
their detail views locate the requested record in the paginated directory.
Related application/listing queries require valid backend-supported ObjectIds,
rather than risking an ignored filter and showing unrelated records.

Mutations require explicit confirmation and use backend outcomes; failed
changes stay open with an error. Reconciliation records an outcome, not a
refund/payment. Feature changes edit recorded configuration, not verified
end-to-end availability; locked flags cannot be edited in the UI and backend
locks remain authoritative. Admin invitations confirm the invitation record,
not email delivery. PII inspection displays the actual audited endpoint
response; directory contact masking remains server-controlled.

### Explicitly unavailable

The existing navigation remains, but unsupported surfaces explain their limits:
aggregated alerts/action queues, unread counts, user invitation/access-case
queues, portfolio/readiness oversight, workspace projects/reports/onboarding,
subscriptions and subscription details, external-source configuration and
sync/import monitoring, AI usage/matching oversight, notification delivery and
templates, support/escalations/disputes, and general platform/security policy
editing. Mentor/supervisor assignment counts and availability are not inferred
from account status. Placement records are recorded hires, not completed
engagements or verified employment outcomes.

Charts (bar, area and donut, in `components/admin-charts.tsx` and
components/analytics-panels.tsx`) are drawn only from the recorded analytics
snapshot: sign-ups by account type, companies, listings, recruitment activity
and current stages, payments/subscriptions and feedback. Periods with no records
show an empty state; there are no growth deltas or inferred conversion rates.
`Revenue analytics` (`/analytics/commercial`) shows only the finance section. Financial records use their actual currency and gross/fee/net
fields. There are no fabricated sidebar badges, alert indicators or role-preview
controls. Detail `.render.tsx` entry points use the authenticated application
router and the current URL, not hard-coded record IDs; open a real detail URL
after signing in to inspect a record.

### Validation

Run 
pm run type-check`, 
pm run lint`, and 
pm run build`.
End-to-end live-data validation additionally requires the gateway,
admin-service dependencies and an authorised administrator session. A backend
or session failure is an error state, not permission to substitute data.

## Project info

**Created with**: [Polymet AI](https://polymet.ai) - AI product designer

## How can I edit this code?

There are several ways of editing your application.

**Use Polymet AI**

Simply visit [Polymet AI](https://polymet.ai) and start designing or prompting.

Changes made via Polymet AI will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Polymet AI.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

The admin app is hosted on Cloudflare Workers static assets at `admin.internflare.net`, configured in `wrangler.toml`. Unknown paths fall back to `index.html` for React Router, and `public/_headers` sets asset caching, security headers and 
oindex`.

Production builds read the committed `.env.production`, which sets `VITE_API_URL=https://api.internflare.net/api/v1/admin`. `VITE_` values are public, so never store secrets in them.

The repository is connected to Cloudflare Workers Builds, so each push to the production branch redeploys automatically. Build settings:

| Setting | Value |
|---------|-------|
| Build command | 
pm run build` |
| Deploy command | 
px wrangler deploy` |
| Root directory | `/` |

The Worker name in the dashboard must match 
ame` in `wrangler.toml`. To deploy manually instead, run 
px wrangler login` once and then 
pm run deploy`.

The custom-domain route sets `zone_name = "internflare.net"` (the parent zone, not `admin.internflare.net`). That zone must be active in the Worker's Cloudflare account and accessible to the build's deployment token. If error 10082 reports that Cloudflare cannot infer the zone, check account ownership and token access. Review only conflicting `admin.internflare.net` DNS records; leave API, mail and unrelated records intact. A dry run does not validate account permissions or custom-domain attachment.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | 
pm run dev` | Start the development server with hot reload |
| **Build** | 
pm run build` | Create an optimized production build |
| **Preview** | 
pm run preview` | Serve the production build locally |
| **Cloudflare Dev** | 
pm run cf:dev` | Build and serve `dist/` through the local Cloudflare runtime |
| **Deploy** | 
pm run deploy` | Build and deploy manually to Cloudflare Workers |
| **Type Check** | 
pm run type-check` | Verify TypeScript types without emitting |
| **Lint** | 
pm run lint` | Check code for linting errors |
| **Lint Fix** | 
pm run lint:fix` | Automatically fix linting errors |
| **Format** | 
pm run format` | Format code with Prettier |

## Library Versions

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 6.2.0 | Build tool & dev server |
| TypeScript | 5.7.2 | Type safety |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| React Router DOM | 6.26.2 | Client-side routing |
| Recharts | 2.12.7 | Data visualization |
| Zod | 3.23.8 | Schema validation |
