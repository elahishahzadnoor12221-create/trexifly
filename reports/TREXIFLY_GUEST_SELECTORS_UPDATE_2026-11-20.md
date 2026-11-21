# Trexifly Flights and Stays guest selector update — 20 November 2026

## Scope
- Updated Flights and Stays guest selectors only.
- Preserved the existing travel partner links, booking workflows, search destinations, vehicle inventory, theme, and TravelAssistant.

## Changes
- Stays: Adults 1–5, Children 0–5, Rooms 1–6.
- Stays: selecting children reveals one independent age selector per child (Under 1 through 17 years).
- Flights: Adults 1–5, Children 0–5, and a separate cabin-class selector (Economy, Premium Economy, Business, First).
- Search URLs carry separate `adults`, `children`, `rooms`, and `childAges` parameters while retaining the legacy `pax` summary.
- Results page restores the submitted counts, child ages, and flight cabin class in its compact search form.
- Playwright uses the production preview output directory so browser tests do not accidentally reuse an incompatible Vite dev/preview server.

## Files changed
- `src/components/SearchWidget.tsx`
- `src/lib/data.ts`
- `playwright.config.ts`
- `tests/e2e/homepage.spec.ts`
- `tests/e2e/guest-selectors.spec.ts` (new)

## Backup
- `E:\trexifly\backups\GUEST_SELECTORS_20261120_114637`
- Verified 3 original source files copied before edits.

## Verification
- `npm run typecheck`: PASS.
- `npm run build`: PASS; existing client bundle-size warning remains (approximately 564 kB minified).
- `npm run test:e2e -- --workers=1`: PASS, 4/4 Chromium tests (Stays max counts and child ages, Flights max counts and cabin, mobile Stays controls, homepage smoke test).
- `git diff --check`: PASS (only Git line-ending advisory warnings).
- `npx wrangler deploy --dry-run`: PASS; 98 assets read, no live deployment.
- No production deploy, Git push, or merge performed.

## Git state
- Working branch: `feat/flights-stays-guest-selectors`.
- Existing untracked `work.done` file preserved and not staged.
- Changes remain local and uncommitted.

## Deployment gate / next action
- Project operating rules require the exact user approval phrase `Approved for Deployment` before any push, merge, or production deployment.
- Existing project configuration contains both Vercel and Cloudflare deployment settings. The previously verified production site was `https://trexifly.com` on Vercel; confirm the intended production target when approving.
