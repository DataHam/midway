# External Integrations

**Analysis Date:** 2026-02-22

## APIs & External Services

**Security Verification:**
- **Cloudflare Turnstile:** Used for bot protection on security gates (`verify-danny.html`, `verify-helen.html`).
  - **SDK/Client:** Standard `https://challenges.cloudflare.com/turnstile/v0/api.js` (loaded in HTML).
  - **Validation:** Server-side verification via `https://challenges.cloudflare.com/turnstile/v0/siteverify` using standard `fetch`.
  - **Auth:** Uses `TURNSTILE_SECRET_KEY` (stored in Doppler/Environment) and `TAMTHAM_SITEKEY` (injected during CI/CD).

## Data Storage

**Databases:**
- **None Detected:** The current implementation appears stateless, relying on logic-based redirects.

**File Storage:**
- **Local Filesystem:** Static assets served from root `/` and `assets/` by Azure Static Web Apps.

**Caching:**
- **Azure Static Web Apps CDN:** Standard edge caching for static assets.
- **Cloudflare Edge Cache:** Standard for Workers and assets served through Cloudflare.

## Authentication & Identity

**Custom Security Gates:**
- **Mechanism:** Turnstile token validation via Cloudflare Workers.
  - **Implementation:** User must complete a Turnstile challenge before being redirected to protected subdomains or pages.
  - **Approach:** Backend Worker verifies token and returns a `302 Redirect` or `JSON` response with the destination URL.

## Monitoring & Observability

**Error Tracking:**
- **None Detected.**

**Logs:**
- **Custom Structured Logger:** `src/api/shared/logger.js`.
  - **Approach:** Anonymizes IP addresses and truncates user agents before logging JSON structured events.
  - **Target:** Azure Functions context logging (`context.info`) or Worker `console.log` (via `wrangler tail`).

## CI/CD & Deployment

**Hosting:**
- **Azure Static Web Apps:** Primary host for frontend files from the root directory.
- **Cloudflare Workers:** Host for serverless functions located in `src/api/`.

**CI Pipeline:**
- **GitHub Actions:** `.github/workflows/`.
  - **Azure CI/CD:** `Azure/static-web-apps-deploy@v1`.
  - **Cloudflare Workers CI/CD:** `cloudflare/wrangler-action@v3`.
  - **Secrets:** Fetched via `dopplerhq/secrets-fetch-action@v1.3.0`.

## Environment Configuration

**Required env vars:**
- `TURNSTILE_SECRET_KEY`: Used for server-side token validation.
- `TAMTHAM_TURNSTILE_SITEKEY`: Injected into HTML at build time for the client-side widget.
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Used for Azure deployment.
- `CLOUDFLARE_API_TOKEN`: Used for Worker deployment.
- `DOPPLER_TOKEN`: Used to fetch other secrets from Doppler.

**Secrets location:**
- **Doppler:** Central source for all secrets.
- **GitHub Secrets:** Used to store the `DOPPLER_TOKEN`.

## Webhooks & Callbacks

**Incoming:**
- **None Detected.**

**Outgoing:**
- **Cloudflare Siteverify:** `https://challenges.cloudflare.com/turnstile/v0/siteverify`.

## Connectivity

**Tunnels:**
- **Cloudflare Tunnel:** `cloudflared-config.yml`, `cloudflared-setup.sh`. Used for secure local development or exposing internal services safely.

---

*Integration audit: 2026-02-22*
