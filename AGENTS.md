# TREXIFLY Agent Operating Rules

## Project identity
- Project root: E:\trexifly
- Keep this project separate from all other user projects.
- Follow the approved mission sequence: Mission 1 automation setup -> Mission 2 vehicle visual/UTF-8 repair -> Mission 3 full audit -> Mission 4 approved fixes -> Mission 5 final testing and deployment.

## Approval and deployment gates
- Never run `git push origin main`, merge to main, publish, release, or deploy without the user's explicit final phrase: `Approved for Deployment`.
- During Missions 1-4, work only on the isolated working branch. Do not switch to main.
- Do not run `wrangler deploy`, `vercel --prod`, or any production deployment command without final approval.
- Do not create or modify live services, DNS, payment settings, API accounts, or production data without explicit approval.
- Ask before any destructive, irreversible, external, or production-impacting action.

## Protected website features
Do not modify, overwrite, remove, or redesign these without explicit approval:
- Existing Stitch design
- Global Light/Dark theme
- Flights and flight search
- Hotels catalogue and hotel search
- Travelpayouts integration and its script in index.html
- TravelAssistant and its existing workflows

## File and secret safety
- Never display, copy into prompts, commit, upload, or expose values from .env, .dev.vars, credentials, API keys, access tokens, private customer data, or payment data.
- You may verify whether secret files exist and whether required variable names are present, but report values only as SET / NOT SET.
- Do not delete or overwrite existing backups, untracked files, temporary inspection files, or user data.
- Before every approved code-change stage, create a timestamped backup and verify it.
- Do not stage or commit unrelated untracked files.

## Testing and reporting
- Use Playwright Chromium only. Do not install or run Firefox or WebKit.
- Run relevant typecheck, build, and browser tests after approved changes.
- Fix and retest failures where safe; otherwise report blockers.
- Report each stage with: exact files changed, issue, action, test evidence, remaining risks, and next step.
- Never claim a fix or deployment is complete unless the relevant verification passed.
- Keep changes small and reviewable. Stop and request approval when a change affects protected features or exceeds the approved scope.

## Cost and privacy
- Use Kilo Auto Free as the default model; do not select paid models or enable paid services without approval.
- Free models may have rate limits and may log prompts/outputs. Never send confidential data to Auto Free.
- Keep Kilo autocomplete auto-trigger disabled unless the user explicitly asks to enable it.
