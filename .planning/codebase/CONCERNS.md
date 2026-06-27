# Key Concerns & Legacy Artifacts

### 1. Shadowed/Duplicate Directories
- **Issue:** Triple redundancy for the main site entry point. Root `index.html`, `pages/index.html`, and `static/index.html` all exist. `pages/` and `static/` are identical, while the root `index.html` (26KB) differs from `pages/index.html` (9KB).
- **Files:** `index.html`, `pages/`, `static/`
- **Impact:** High risk of editing the wrong file; confusion for maintenance and deployment.
- **Recommendation:** Consolidate to a single source (e.g., `static/`) and update `package.json` and CI/CD.

### 2. API Code Duplication & Shared Logic Gaps
- **Issue:** Cloudflare Workers `src/api/verify-danny/index.js` and `src/api/verify-helen/index.js` use hardcoded logic for Turnstile validation and do not utilize the shared utilities in `src/api/shared/`.
- **Files:** `src/api/verify-danny/index.js`, `src/api/verify-helen/index.js`, `src/api/shared/turnstile-utils.js`
- **Impact:** DRY violation; harder to maintain or update security logic across all gates.
- **Recommendation:** Refactor workers to import and use `turnstile-utils.js`.

### 3. Mixed/Legacy Infrastructure Artifacts
- **Issue:** Verification directories contain both `wrangler.toml` (Cloudflare) and `function.json` (Azure Functions), and the root contains a large `Downloads/` folder with handoff artifacts.
- **Files:** `src/api/verify-danny/function.json`, `Downloads/`
- **Impact:** Technical debt; confusion over active deployment targets.
- **Recommendation:** Remove unused Azure config and archive/remove the `Downloads/` folder.

### 4. Fragile Sitekey Injection
- **Issue:** Turnstile sitekeys are injected via `sed` replacement of `BUILD_TIME_SITEKEY` in CI.
- **Files:** `.github/workflows/azure-static-web-apps.yml`, `static/verify-danny.html`
- **Impact:** Brittle deployment process; breaks local development without manual replacement.
- **Recommendation:** Use a more robust build-time configuration generation script.

### 5. Security Gate Gaps
- **Issue:** `staticwebapp.config.json` uses `unsafe-inline` for scripts/styles in its CSP, and the shared `rate-limiter.js` is not utilized by the verification workers.
- **Files:** `staticwebapp.config.json`, `src/api/shared/rate-limiter.js`
- **Impact:** Increased XSS surface and vulnerability to brute-force/DoS on verification endpoints.
- **Recommendation:** Tighten CSP and implement rate limiting in the worker handlers.
