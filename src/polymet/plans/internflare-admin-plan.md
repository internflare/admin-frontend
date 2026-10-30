---
description: Full Internflare Admin frontend build
status: COMPLETED
created_at: "2026-10-29T14:47:58.791Z"
---
# Internflare Admin

## User Request
Enterprise admin console for internflareJobs + SquadCot + shared platform (PRD sections 1–25): role-aware nav, dashboards, directories, review workflows, commercial, integrations, AI, ops, audit, analytics, settings.

## Related Files
- src/index.css – brand palette (done)
- src/polymet/data/*.tsx – sample data (roles, nav, people, jobs, squadcot, commercial, integrations, operations, dashboard, settings)
- src/polymet/lib/format.ts, admin-service.ts, use-admin-query.ts, demo-actions.ts
- src/polymet/components/* – shared (status-badge, page-header, metric-card, data-table, filter-select, confirm-action-dialog, permission-*, masked-value, audit-timeline, detail-grid, section-card, charts, state-views, date-range-select)
- src/polymet/layouts/admin-layout.tsx (+ sidebar, topbar, global search)
- src/polymet/pages/* – ~30 pages
- src/polymet/prototypes/internflare-admin.tsx

## TODO List
- [x] Palette
- [x] Data + lib
- [x] Shared components
- [x] Layout
- [x] Overview pages (dashboard, health, action queue)
- [x] People pages (users, user detail, access, companies, company detail, verification, review, supervisors, mentors)
- [x] Jobs pages (listings, listing detail, applications, placements, talent-oversight)
- [x] SquadCot pages (workspaces, workspace detail, workspace-activity)
- [x] Commercial (plans, subscriptions, sub detail, transactions, reconciliation)
- [x] Integrations/AI (sources, source detail, sync & imports, AI usage)
- [x] Ops (notifications, support, ticket detail, disputes, audit logs, analytics)
- [x] System (settings)
- [x] Prototype: all routes wired

## Important Notes
- Role context default = super admin so render files need no provider
- All actions are demo-only: toast "not sent — backend not connected"
- Payouts/escrow/wallet must show Disabled; 10% fee only on eligible tx
