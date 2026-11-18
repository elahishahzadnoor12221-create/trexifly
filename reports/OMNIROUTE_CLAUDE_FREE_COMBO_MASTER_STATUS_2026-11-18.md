# OmniRoute + Claude Free Combo — Master Progress Record
Date: 2026-11-18
Record location: E:\\trexifly\\reports\\OMNIROUTE_CLAUDE_FREE_COMBO_MASTER_STATUS_2026-11-18.md

## User goal
Keep Claude as the preferred model when its own free quota is available. When Claude is rate-limited or unavailable, route requests to other legitimately available free-tier providers and finally local Ollama, without paid billing or disturbing MAYA/JARVIS.

## Verified current state
- OmniRoute install package version: 3.8.53 (not 3.8.52).
- Data directory: E:\\OmniRoute\\data.
- SQLite database: E:\\OmniRoute\\data\\storage.sqlite.
- Existing provider connections in the database: Codex OAuth (active), Gemini API-key connection named "Gemini Free" (active), and local Ollama connection named "Ollama-Local" (active). No Claude provider connection is currently stored in this database.
- Existing combo "free-unlimited" is present. Current database definition is: Gemini 3.8 Flash -> Gemini 3.1 Flash Lite -> local Ollama Qwen2.5:3B. It does NOT currently include Claude, UncloseAI, or AI Horde, despite an older report describing a different configuration.
- Existing "JARVIS-Free-Quota" combo is separate and must not be modified.
- Ollama local endpoint in connection metadata: http://127.0.0.1:11434; configured model qwen2.5:3b.
- Current OmniRoute server is listening on 127.0.0.1:20128. Verified HTTP 200 for / and /api/health. The /health path closed the connection and is not a valid health check for this install.
- No evidence of any newly added Groq, Cerebras, OpenRouter, Cloudflare Workers AI or Mistral connection in the current provider connection list.
- No API keys, OAuth tokens, or secrets were copied into this report.

## Important distinction
The user's normal browser login to claude.ai is not, by itself, an OmniRoute provider connection. Claude must be explicitly authorized through a supported OmniRoute connection flow. Claude's free quota cannot be transferred, replenished, or bypassed by other providers. The fallback combo can keep work moving using other models, but those fallback responses are not Claude responses.

## Safety and scope
- Do not alter or reuse MAYA or JARVIS credentials, files, quotas, or provider permissions.
- Do not change Trexifly website source, affiliate links, deployment, or credentials for this OmniRoute task. This file is only a progress record under Trexifly/reports.
- Preserve the current SQLite database and existing provider connections. Back up the database before any combo or API-key permission change.
- Do not activate paid billing. Do not create or expose secrets in chat.
- Do not claim the combo is unlimited; free-tier providers have their own quotas, throttles, queues and terms.

## Pending work
1. Inspect the installed OmniRoute 3.8.53 provider registry and confirm which legitimate Claude authentication methods are supported, especially whether a normal Claude Free web account can authorize.
2. If supported, add Claude OAuth as the first preferred step only after the user completes the provider's official authorization screen. If not supported for a Free account, leave Claude web login untouched and explain the limitation.
3. Reconcile the actual free-unlimited combo with available providers. Add only providers that have supported no-cost access and valid user-authorized credentials; do not assume Groq/Cerebras/Mistral/Cloudflare are keyless or unlimited.
4. Configure fallback-on-rate-limit / quota errors, not just generic connection errors, and verify actual routing with safe test prompts.
5. Create a dedicated OmniRoute API key or adjust a dedicated key's allowed-combo permissions only after inspecting the current key restrictions and backing up the database. Do not broaden the existing local-only test key without approval.
6. Verify requests via the OpenAI-compatible API, check the actual upstream provider/model for each fallback step, then update this report with exact completed/pending/error states.

## Next action
Read the OmniRoute 3.8.53 provider/auth implementation for Claude/Anthropic, inspect the current combo and API-key allowlists, and prepare a backup before any write. No Claude merge or fallback configuration change has been made yet.


## 2026-11-18 continuation update
- User confirmed the intended scope: automatic fallback for all projects that are configured to use OmniRoute. MAYA/JARVIS existing app files, credentials and dedicated settings remain protected and unchanged.
- Inspected installed 3.8.53 source: it has a `claude` OAuth provider entry named `Claude Code` with `subscriptionRisk: true`; this is not the same as the user's ordinary claude.ai Free web login. No supported direct Free-web-login connection was found in the inspected provider catalog/validation path. No Claude authorization was started.
- Confirmed API key restrictions: `OmniRoute-Test-Local` is local-Ollama-only; `JARVIS-Local` is restricted to JARVIS-Free-Quota and free-unlimited plus Gemini/Ollama; `MAYA-Independent` is separate; `Trexifly-Free-Combo-Key` currently allows `combo/*` and has no explicit connection allowlist. No existing dedicated all-projects key was found.
- Created a fresh SQLite backup before any potential configuration change: `E:\OmniRoute\backup\pre_all_projects_fallback_20261118.sqlite` (5,529,600 bytes; SQLite integrity_check = ok; 2 combos; 4 API keys).
- Verified real combo fallback from call logs: on 2026-11-16 Gemini 3.8 Flash returned HTTP 503, then the same `free-unlimited` combo succeeded with Gemini 3.1 Flash Lite (HTTP 200). This confirms fallback on a temporary upstream server error. It does not yet prove 429 quota-exhaustion behavior or universal project integration.
- Current `free-unlimited` chain remains Gemini 3.8 Flash -> Gemini 3.1 Flash Lite -> local Ollama Qwen2.5:3B. It has not been changed. `JARVIS-Free-Quota` has not been changed.
- Pending: create a new dedicated shared API key for non-MAYA/non-JARVIS projects (or confirm reuse scope), then configure each intended app/client to use `http://127.0.0.1:20128/v1` and that key; verify 429 quota fallback and record project-by-project status. Existing Trexifly key remains Trexifly-specific unless user explicitly approves reuse.


## Shared all-projects key created and tested (2026-11-18)
- Created API key name: `OmniRoute-AllProjects-Free-Fallback`.
- API key row ID: `ada87148-c9cd-4d88-b113-d713155cfe22`; prefix `sk-390310d9f` (full secret intentionally not written to this report).
- Permissions are least-privilege: only combo `free-unlimited`; only active Gemini connection `0b79f660-8481-40c5-ba2d-1e3d1abf08ef` and local Ollama connection `ab7d5643-bab1-468c-9b2a-73280de13134`; catalog scope `combos`; usage scope `self:usage`; auto combos enabled.
- No access to Codex, MAYA-Independent key, JARVIS-Local key, or JARVIS-Free-Quota combo was granted. Existing keys and app configs were not modified.
- Key secret is stored encrypted at rest using the configured STORAGE_ENCRYPTION_KEY. Full secret was shown to the user in this chat for setup; it is not stored in this progress report.
- Live test through `http://127.0.0.1:20128/v1/chat/completions` with model alias `free-unlimited` succeeded: HTTP 200, upstream `gemini-3.1-flash-lite`, response `SHARED` (the model did not echo the full exact test phrase, but the request was successful).
- Endpoint is loopback-only (`127.0.0.1`): only apps running on the same PC can use it as-is. Cloud-hosted Trexifly/Vercel or other remote services cannot reach this localhost endpoint; do not expose it publicly without a secure, authenticated deployment/tunnel plan.
- Remaining: configure intended non-MAYA/non-JARVIS local apps one by one to use base URL `http://127.0.0.1:20128/v1`, this API key, and model `free-unlimited`; verify each app. Cloud-hosted apps need a separate secure connectivity design first.


## 18 Nov 2026 — non-MAYA/JARVIS project integration audit (read-only)
- IMMIQORA active workspace `E:\AI Visa Assistant`: inspected backend imports, frontend package manifest, source tree, README and API release-gate report. No OpenAI/Anthropic/Gemini SDK or chat-completions/responses integration was found in the inspected active backend/frontend source. Project remains privacy-sensitive and not production-approved; no OmniRoute key was injected and no source/config was changed.
- Global CV active AI-capable candidate identified at `E:\Global-CV-Career-MVP\global-cv-career-services` (distinct from the older `E:\Global-CV-Career` folder). Its existing `ai_service.py` already supports OpenAI-compatible `/chat/completions`, with per-request cloud-consent checkbox in the UI. Existing `scripts\run.ps1` currently does not load cloud credentials. Git working tree already contained modified/untracked files before any work; no source edits were made. Next safe step is to configure the shared OmniRoute endpoint/key using a Windows CurrentUser DPAPI-protected secret file, backup the launcher first, then run a synthetic-only request through the existing consent gate. No CV/client data should be used for the connection test.
- Trexifly repository `E:\Trexifly-Data\Trexifly-YellowRed-Live`: source search found no current OpenAI/Anthropic/Gemini integration. It is Vercel/cloud deployed, so it cannot call the local OmniRoute loopback URL `127.0.0.1:20128`; no key or frontend secret should be added. Any future cloud connection needs a separate authenticated, TLS-protected remote gateway and server-side secret storage design.
- MAYA and JARVIS were not inspected or changed.
- No project integration was completed in this audit pass; no new credentials were written, no services restarted, and no production deployments made.


## 18 Nov 2026 — Global CV integration preparation
- Correct active project path confirmed: `E:\Global-CV-Career-MVP\global-cv-career-services` (not the older `C:\Global-CV-Career` folder).
- Backup created at `backups\pre_omniroute_20261118_055140` with copies of `scripts\run.ps1`, `ai_service.py`, and `app.py`.
- Baseline suite rerun from the correct project working directory: **100 passed**. The first attempt had 1 fixture-path failure solely because pytest was launched from the wrong working directory; rerun from project root passed all 100.
- Existing `ai_service.py` already implements OpenAI-compatible `/chat/completions` and explicit per-request cloud-consent gating. Existing UI labels cloud calls as sending CV text/job description to the provider and requires explicit client consent.
- A DPAPI-backed secret-storage helper was prepared. Because the shared API key must not be injected into remote command arguments, a visible local PowerShell prompt was opened for the user to enter the already-created shared key securely. Awaiting local secure-input completion; no key was stored by this automation pass, no launcher/source configuration changed, and no API request was sent yet.
- After the user completes the hidden prompt, next steps: verify the DPAPI file exists and can be decrypted by the same Windows user; update the backed-up launcher to load `GCV_CLOUD_API_KEY`, `GCV_CLOUD_BASE_URL=http://127.0.0.1:20128/v1`, and `GCV_CLOUD_MODEL=free-unlimited`; run a synthetic prompt through the existing cloud-consent gate; then run the 100-test suite again. Do not send real client CVs as test data.
