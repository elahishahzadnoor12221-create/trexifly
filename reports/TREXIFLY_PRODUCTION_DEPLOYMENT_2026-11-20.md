# Trexifly production deployment report — 20 November 2026

## Approval and target
- User supplied the exact approval phrase: Approved for Deployment.
- Deployed to the existing Vercel project `shahzad-8732/trexifly-upload-1`.
- Production alias: https://trexifly.com
- Deployment inspection URL: https://vercel.com/shahzad-8732/trexifly-upload-1/AVz9uEhQBBjhbFLZSqSD7kzrpfdi
- Deployment URL: https://trexifly-upload-1-lyzqng3bp-shahzad-8732.vercel.app
- Vercel CLI reported: Ready; production alias applied.
- Deployment process exited with code 0.

## Published changes
- Stays: Adults 1–5, Children 0–5, Rooms 1–6, independent child ages.
- Flights: Adults 1–5, Children 0–5, separate cabin class.
- Search query carries distinct guest counts and child ages/cabin.
- Results page restores selected values.
- Added `.vercelignore` to keep local dependencies, backups, reports, scratch files, tests, and local environment/credential files out of deployment uploads.

## Verification
- Pre-deployment: typecheck PASS; production build PASS; Playwright Chromium 4/4 PASS; Wrangler dry-run PASS.
- Live homepage: HTTP 200.
- Live homepage title: Trexifly | Compare Flights, Hotels, Car Rentals & Airport Transfers.
- Live Stays browser flow: 5 adults, 5 children, 6 rooms, child ages 4/5/6/7/8; submitted URL contains adults=5, children=5, rooms=6, childAges=4,5,6,7,8.
- Live Flights browser flow: 5 adults, 5 children, Business cabin; submitted URL contains adults=5, children=5, cabin=Business.
- Live Playwright script exited with code 0.
- Production alias was applied by Vercel to https://trexifly.com.

## Git and safety
- Deployment was made directly from the approved local working tree; no Git push or merge was performed.
- Existing untracked `work.done` was preserved and not staged.
- Local environment files remain excluded from deployment and Git.
- Working branch remains `feat/flights-stays-guest-selectors`; source changes remain local and uncommitted.
- No unrelated projects or services were modified.

## Remaining note
- The Vercel build emitted npm configuration and install-script advisory warnings; deployment still completed successfully.
- Existing bundle-size warning from local build remains.
