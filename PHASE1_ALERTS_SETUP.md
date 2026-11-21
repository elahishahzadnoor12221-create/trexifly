# Trexifly Phase 1 Alerts — setup notes

## Runtime and safety
- Vercel serverless API routes live under `api/alerts`; the Vite dev server alone does not execute them.
- For local integration testing, configure the variables below in an ignored local Vercel environment file (never commit secrets), then run `npx vercel dev`.
- Do not deploy to production until explicitly approved.
- Existing `api/ai-chat.ts`, TravelAssistant, vehicle inventory and airport transfer data are outside this feature.

## Required server-side environment variables
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (preferred current Supabase server key; server only; never expose in browser code). `SUPABASE_SERVICE_ROLE_KEY` is accepted only as a legacy fallback.
- `GEMINI_API_KEY` (existing working key)
- `RESEND_API_KEY`
- `ADMIN_ALERT_PASSWORD`
- `ADMIN_ALERT_SESSION_SECRET` (generate a separate random secret, at least 32 bytes)
- `ADMIN_ALERT_EMAIL` (your own verified inbox for test sends)
- `APP_BASE_URL` (local: http://localhost:3000; production: https://trexifly.com)

## Supabase setup
1. Create a Supabase project.
2. Open SQL Editor.
3. Run all of `supabase/phase1_alerts.sql`.
4. Copy the Project URL and service_role key into local server environment variables.
5. Prefer the new `sb_secret_...` key. Supabase is deprecating legacy `service_role` keys by the end of 2026; this code accepts the old key only as a compatibility fallback. Never put either secret key in `VITE_*` variables or client-side code.
6. Tables have RLS enabled and no public/anon policies. Only the server uses the service role.

## Resend and domain authentication
1. Create a Resend account and add `trexifly.com` under Domains.
2. Copy the exact DNS records Resend shows for the domain (do not substitute example values).
3. At the domain DNS host, add the displayed DKIM record(s), SPF sending record, and return-path/bounce record if supplied.
4. Ensure there is only one SPF TXT record for the root domain; merge authorized senders if one already exists rather than publishing a second SPF record.
5. Add a DMARC TXT record at `_dmarc.trexifly.com`. Start with `v=DMARC1; p=none; rua=mailto:dmarc@trexifly.com; adkim=r; aspf=r` after creating/confirming that reporting mailbox or using a supported report destination. Move to quarantine/reject only after reviewing reports.
6. Wait for DNS propagation and verify the domain in Resend.
7. Use sender `Trexifly <info@trexifly.com>` and Reply-To `info@trexifly.com`. Resend API key remains server-side.
8. Send a test only to `ADMIN_ALERT_EMAIL`; confirm SPF, DKIM and DMARC pass in the received message headers.

## Local commands
- Frontend: `npm run dev`
- Full local Vercel runtime (frontend + serverless APIs): `npx vercel dev`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- API typecheck (manual): `npx tsc --noEmit --target ES2022 --lib ES2023,DOM --module ESNext --moduleResolution bundler --strict --skipLibCheck api/alerts/*.ts src/lib/alertsServer.ts`

## Consent and outreach rules
- CSV rows without explicit `email_consent=true` and/or `whatsapp_consent=true` are stored but not eligible for that channel.
- Do not infer consent from possession of an address or phone number.
- WhatsApp links open an individual conversation with a prefilled message; an admin must press Send in WhatsApp.
- Do not use the admin dashboard to send unsolicited bulk messages. Follow applicable marketing/privacy rules and provider policies.

## Free-tier limits to plan around (checked 21 Nov 2026)
- Resend Free currently includes 3,000 emails/month and a 100-email/day limit. A larger daily B2B campaign would require batching across days or upgrading; this implementation sends at most 100 recipients per campaign request.
- Supabase Free currently allows two active free projects and 500 MB database storage per project. Free projects can pause after about one week of low activity; monitor the dashboard and resume if needed.
- These provider quotas can change. Check the linked pricing pages before launch.
