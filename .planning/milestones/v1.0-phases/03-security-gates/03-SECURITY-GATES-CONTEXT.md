# Phase 03: Security Gates - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement Cloudflare Turnstile CAPTCHA gates with server-side validation to protect subdomain access. This phase delivers:
- Client-side gate pages (`verify-danny.html`, `verify-helen.html`) with Turnstile widget integration
- Server-side API endpoints (`/api/verify-danny`, `/api/verify-helen`) for token validation
- Rate limiting, error handling, and logging infrastructure
- Doppler-integrated secrets management for Turnstile sitekeys

Creating posts, interactions, or new capabilities are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Error Handling
- **Error messages:** Display all error types with error codes for user feedback
  - `INVALID_CODE` — "The verification code was incorrect. Please try again."
  - `EXPIRED_TOKEN` — "The verification code has expired. Please start over."
  - `RATE_LIMITED` — "Too many failed attempts. Please wait before trying again."
  - `SERVICE_UNAVAILABLE` — "The security service is temporarily unavailable. Please try again later."
- **Retry logic:** Rate limit after 3 failed attempts per session
- **Display:** Modal dialog with error details (not inline or toast)
- **Tracking:** Per session using cookie-based tracking (not IP-based)

### API Response Format
- **Success response:** Hybrid approach
  - Browser receives 302 redirect to subdomain
  - API calls receive JSON: `{ "success": true, "redirectUrl": "https://danny.tamtham.com" }`
- **Failure response:** JSON with error code and human-readable message
  - Example: `{ "success": false, "error": "INVALID_CODE", "message": "The verification code was incorrect." }`
- **Redirect URL:** Configurable via query parameter in gate page URL (`?redirect=https://danny.tamtham.com`)
- **Token submission:** POST request with token in JSON body (most efficient for Azure Functions)

### Turnstile Configuration
- **Sitekey injection:** Build-time injection via `<script>` variable
  - Build script replaces placeholders with Doppler-injected values
  - Example: `window.TAMTHAM_SITEKEY = "BUILD_TIME_SITEKEY";`
- **Environments:** Same sitekey across dev/staging/production (simpler, sitekeys are public)
- **Storage:** `<script>` variable declared at page load, before widget initialization
- **Validation:** API validates sitekey matches expected one (prevents misconfiguration)

### Logging & Monitoring
- **Events logged:** All events for complete audit trail
  - Successful verification + redirect
  - Failed verification + error code
  - Rate limit triggered
  - API errors (e.g., Cloudflare Siteverify API unavailable)
- **Detail level:** Detailed entries with:
  - Timestamp (UTC)
  - Event type (success, failure, rate_limit, api_error)
  - User ID (danny/helen)
  - Error code (if failed)
  - IP address (anonymized — last octet removed)
  - User agent (truncated to 100 chars)
- **Storage:** Azure Functions built-in logs (accessible via Azure portal)
- **Monitoring:** Start with Azure logs only, add dashboard later if needed

### Claude's Discretion
- Exact modal styling and animation
- Cookie name and expiration duration
- IP anonymization method (last octet vs. last two octets)
- Error code naming convention (snake_case vs. uppercase)
- Log retention policy (Azure default vs. custom)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- **verify-danny.html, verify-helen.html:** Placeholder gate pages already created in Phase 2 with basic Turnstile widget structure
- **Tailwind CSS config:** Brand colors and font family already defined in `tailwind.config.js` (from Phase 1)
- **Montserrat fonts:** Self-hosted WOFF2 files available in `assets/fonts/Montserrat/` (from Phase 1)
- **Hero background gradient:** Reusable gradient pattern from `index.html` (`linear-gradient(135deg, #103248 0%, #385C8F 100%)`)

### Established Patterns
- **HTML + Tailwind (no framework):** All pages are static HTML with Tailwind CDN — API will follow same lightweight pattern
- **Build-time asset injection:** Build pipeline already compiles Tailwind and optimizes images — can extend for Doppler variable injection
- **Azure SWA Functions:** Functions directory structure follows Azure SWA conventions (`api/function-name/index.js`, `function.json`)

### Integration Points
- **Gate pages → API:** `submitVerification()` function in verify pages calls `/api/verify-danny` or `/api/verify-helen`
- **API → Subdomains:** Successful validation redirects to `danny.tamtham.com` or `helen.tamtham.com`
- **Build script → HTML:** Build pipeline injects Doppler sitekeys into gate pages before deployment
- **Azure Functions → Doppler:** API functions retrieve Turnstile secret from Doppler environment variable

</code_context>

<specifics>
## Specific Ideas

- "Modal dialog for errors — not inline, not toast"
- "Rate limit at 3 attempts per session"
- "Build-time injection of sitekeys via Doppler"
- "POST with JSON body for token submission (most efficient)"
- "Hybrid response: 302 for browser, JSON for API"
- "Anonymize IP addresses in logs (remove last octet)"
- "Error codes for programmatic handling + human-readable messages"

</specifics>

<deferred>
## Deferred Ideas

- **External logging service** — Start with Azure Functions logs, add Datadog/Logtail later
- **Monitoring dashboard** — Set up alerts for unusual patterns later
- **Different sitekeys per environment** — Same sitekey across dev/staging/prod for simplicity
- **IP-based rate limiting** — Using session-based tracking instead
- **User agent full logging** — Truncating to 100 chars for privacy

</deferred>

---

*Phase: 03-security-gates*
*Context gathered: 2026-03-13*
