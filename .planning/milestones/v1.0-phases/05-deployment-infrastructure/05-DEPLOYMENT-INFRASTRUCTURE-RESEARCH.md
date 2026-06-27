# Phase 5: Deployment & Infrastructure - Research

**Researched:** 2026-03-13  
**Domain:** CI/CD, Cloud Infrastructure, Deployment Automation  
**Confidence:** MEDIUM (Cloudflare docs URL structure changed, verified Azure SWA and Doppler)

## Summary

This phase establishes the production deployment pipeline for the Tam-Tham website using Azure Static Web Apps as the hosting platform, Cloudflare for DNS and tunneling, Doppler for secrets management, and GitHub Actions for CI/CD. The infrastructure is designed to securely expose the home server subdomains (danny.tamtham.com, helen.tamtham.com) through Cloudflare Tunnels while routing the main website (tamtham.com) through Azure SWA with Cloudflare proxying.

**Primary recommendation:** Use Azure Static Web Apps for the main website with GitHub Actions workflow, Doppler CLI for secrets injection during build, Cloudflare DNS for tamtham.com pointing to Azure SWA CNAME, and cloudflared daemon on home servers for subdomain tunnels.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Azure Static Web Apps hosting
- Cloudflare as DNS provider with Tunnel for subdomains
- Doppler for secrets management
- GitHub Actions for CI/CD
- Cloudflare Turnstile (not reCAPTCHA)
- Self-hosted Montserrat fonts
- Doppler for secrets

### Claude's Discretion
- Cloudflare DNS record configuration method (dashboard vs. Terraform vs. API)
- Cloudflare Tunnel deployment approach (docker vs. binary on home server)
- Doppler workplace/project structure
- Specific action version pinning strategy

### Deferred Ideas (OUT OF SCOPE)
- Google Analytics
- Meeting booking integration
- Mobile app
- Multi-language support
- User authentication (deferred to v2)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEPLOY-01 | GitHub Actions workflow for Azure SWA deployment | Azure SWA workflow configuration from Microsoft docs |
| DEPLOY-02 | Integrate Doppler for secrets management | Doppler CLI GitHub Actions integration patterns |
| DEPLOY-03 | Pin action versions in workflow | Security hardening best practices |
| DEPLOY-04 | Deploy on push to main branch | GitHub Actions trigger configuration |
| DEPLOY-05 | Build pipeline compiles Tailwind and optimizes images | Custom build command configuration |
| CLOUD-01 | Cloudflare DNS for tamtham.com → Azure SWA | Cloudflare DNS record types and CNAME configuration |
| CLOUD-02 | Cloudflare Tunnel for danny.tamtham.com | cloudflared daemon setup and configuration |
| CLOUD-03 | Cloudflare Tunnel for helen.tamtham.com | Same as CLOUD-02 |
| CLOUD-04 | Enable Cloudflare Bot Fight Mode | Cloudflare security settings |
| CLOUD-05 | Configure modern Cache Rules | Cloudflare Cache Rules vs. legacy Page Rules |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Azure Static Web Apps | Latest | Hosting platform | Microsoft's managed static hosting with built-in CI/CD, custom domains, SSL |
| GitHub Actions | Latest | CI/CD orchestration | Native GitHub integration, free for public repos, extensive marketplace |
| cloudflared | Latest | Tunnel daemon | Official Cloudflare tool for secure outbound connections |
| Doppler CLI | Latest | Secrets management | Enterprise-grade secrets management, supports GitHub Actions |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @actions/core | 1.10.0+ | GitHub Actions toolkit | For custom action development if needed |
| @actions/http-client | 1.8.x+ | HTTP client for actions | Used by Azure SWA action for OIDC token exchange |
| Docker | Latest | Containerization | Alternative deployment method for cloudflared |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Azure SWA | Vercel, Netlify | Azure SWA integrates better with Azure ecosystem, included in existing Azure subscription |
| GitHub Actions | Azure DevOps, GitLab CI | GitHub Actions already native to repository, no additional setup |
| cloudflared binary | Docker container | Binary is simpler for home server deployment, Docker adds overhead |
| Doppler | Azure Key Vault, AWS Secrets Manager | Doppler has simpler CLI interface, better developer experience |

**Installation:**

```bash
# Doppler CLI
curl https://assets.getdoppler.com/install.sh | sh

# cloudflared (Linux example)
curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Azure CLI (for initial setup)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

## Architecture Patterns

### Recommended Project Structure

```
.
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # CI/CD workflow
├── .doppler/                          # Doppler configuration (gitignored)
│   └── doppler.yaml
├── api/
│   ├── verify-danny/
│   │   ├── function.json
│   │   └── index.js
│   └── verify-helen/
│       ├── function.json
│       └── index.js
├── pages/
│   ├── index.html
│   ├── danny.html
│   ├── helen.html
│   ├── verify-danny.html
│   └── verify-helen.html
├── staticwebapp.config.json           # Security headers, routing
├── sitemap.xml
├── robots.txt
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

### Pattern 1: Azure Static Web Apps CI/CD Workflow

**What:** GitHub Actions workflow that builds and deploys to Azure SWA on push to main branch.

**When to use:** For all static web app deployments to Azure.

**Example:**

```yaml
# Source: Microsoft Learn - Azure Static Web Apps build configuration
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          lfs: false
      
      # Doppler login and secrets injection
      - name: Doppler Setup
        uses: dopplerhq/action@v2
        with:
          project: "tamtham-website"
          config: "production"
          token: ${{ secrets.DOPPLER_TOKEN }}
          output: env
      
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: "."
          app_build_command: "npm install && npm run build"
          api_build_command: "cd api && npm install && npm run build"
```

### Pattern 2: Doppler Secrets Injection

**What:** Inject secrets from Doppler into GitHub Actions environment before deployment.

**When to use:** For any CI/CD workflow that requires secrets (API keys, tokens, credentials).

**Example:**

```yaml
# Doppler CLI in GitHub Actions
- name: Doppler Setup
  uses: dopplerhq/action@v2
  with:
    project: "tamtham-website"
    config: "production"
    token: ${{ secrets.DOPPLER_TOKEN }}
    # Outputs secrets as environment variables
```

Alternatively, using Doppler CLI directly:

```yaml
- name: Install Doppler CLI
  run: curl https://assets.getdoppler.com/install.sh | sh

- name: Download Secrets
  run: doppler secrets download --project tamtham-website --config production --format env > .env.tmp

- name: Export Secrets
  run: set -a && source .env.tmp && set +a

- name: Use Secrets
  run: echo "Turnstile Secret: $TURNSTILE_SECRET"
```

### Pattern 3: Cloudflare Tunnel Configuration

**What:** cloudflared daemon configuration for exposing home server subdomains.

**When to use:** For securely exposing internal services without opening firewall ports.

**Example (YAML config):**

```yaml
# /etc/cloudflared/config.yml
tunnel: danny-tunnel
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: danny.tamtham.com
    service: http://localhost:8080
    path: /
  - service: http_status:404
```

**Example (Docker compose):**

```yaml
version: '3'
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: always
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=xxx-xxx-xxx
    volumes:
      - ./config.yml:/etc/cloudflared/config.yml
```

### Anti-Patterns to Avoid

- **Hardcoding secrets in workflow files:** Always use Doppler or GitHub Actions secrets
- **Using legacy Page Rules:** Cloudflare deprecated Page Rules in favor of Cache Rules
- **Exposing home server directly:** Always use Cloudflare Tunnel, never open firewall ports
- **Skipping action version pinning:** Always pin to specific versions (e.g., `@v4` not `@latest`)
- **Using global Doppler token:** Create service tokens with limited permissions per environment

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CI/CD pipeline | Custom deployment scripts | GitHub Actions + Azure SWA | Managed service, built-in deployment, automatic SSL |
| Secrets management | Environment files in repo | Doppler | Encryption at rest, audit logs, rotation support |
| Tunneling | Port forwarding, ngrok | cloudflared | Official Cloudflare tool, free, no session limits |
| DNS management | Manual DNS changes | Cloudflare dashboard/API | API support, Terraform providers, version control |
| Bot protection | Custom CAPTCHA | Cloudflare Turnstile | Privacy-friendly, better UX, free tier |
| Cache configuration | Custom middleware | Cloudflare Cache Rules | Edge-level caching, no code changes needed |

**Key insight:** Infrastructure complexity is better handled by managed services. The cost of building custom solutions (security, maintenance, scalability) far exceeds the value of using established platforms.

## Common Pitfalls

### Pitfall 1: Azure SWA API Path Configuration

**What goes wrong:** API functions not accessible at expected `/api/*` path.

**Why it happens:** Missing `api_location` configuration or incorrect function.json setup.

**How to avoid:** 
- Set `api_location: "api"` in workflow
- Ensure each function has proper `function.json` with `bindings`
- Test API endpoint after deployment: `https://<app-name>.azurestaticapps.net/api/verify-danny`

**Warning signs:** 404 errors on API endpoints, functions not listed in Azure portal.

### Pitfall 2: Doppler Token Permissions

**What goes wrong:** Workflow fails with "unauthorized" or "token not found" errors.

**Why it happens:** Service token lacks permissions for specified project/config, or token expired.

**How to avoid:**
- Create dedicated service tokens in Doppler dashboard
- Set minimum required permissions (read-only for CI/CD)
- Monitor token expiration dates
- Store token in GitHub Actions secrets (not workflow file)

**Warning signs:** Doppler CLI returns 401/403 errors, token expiration warnings.

### Pitfall 3: Cloudflare DNS Propagation

**What goes wrong:** Domain not resolving after DNS changes.

**Why it happens:** DNS propagation takes time (typically 5-30 minutes for Cloudflare).

**How to avoid:**
- Use low TTL values before production changes
- Verify with `dig tamtham.com` or `nslookup tamtham.com`
- Use Cloudflare's "Check DNS" tool in dashboard
- Don't panic during propagation window

**Warning signs:** "Site can't be reached" errors immediately after DNS changes.

### Pitfall 4: Cloudflare Tunnel Credentials Exposure

**What goes going wrong:** Tunnel credentials leaked in repository or logs.

**Why it happens:** Accidental commit of `credentials.json` or TUNNEL_TOKEN in logs.

**How to avoid:**
- Never commit `credentials.json` files
- Use TUNNEL_TOKEN for GitHub Actions, not credentials file
- Rotate credentials immediately if leaked
- Use `.gitignore` for all credential files

**Warning signs:** Unexpected tunnel disconnections, "invalid credential" errors.

### Pitfall 5: Build Timeout Exceeded

**What goes wrong:** Azure SWA build fails with timeout error.

**Why it happens:** Tailwind compilation or image optimization takes too long (>15 min default).

**How to avoid:**
- Optimize image preprocessing (run locally before commit)
- Use `npm ci` instead of `npm install` for faster installs
- Configure `build_timeout_in_minutes: 30` in workflow
- Consider pre-building output and setting `skip_app_build: true`

**Warning signs:** Build runs for 15+ minutes before failing.

## Code Examples

Verified patterns from official sources:

### Azure SWA GitHub Actions Workflow

```yaml
# Source: Microsoft Learn - Azure Static Web Apps build configuration
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          lfs: false
      
      - name: Install OIDC Client
        run: npm install @actions/core@1.10.0 @actions/http-client@1.8.11
      
      - name: Get Id Token
        uses: actions/github-script@v7
        id: idtoken
        with:
          script: |
            const coredemo = require('@actions/core')
            return await coredemo.getIDToken()
          result-encoding: string
      
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: "."
          production_branch: "main"
          github_id_token: ${{ steps.idtoken.outputs.result }}
  
  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### Doppler CLI Integration

```yaml
# Source: Doppler GitHub Actions documentation
- name: Doppler Setup
  uses: dopplerhq/action@v2
  with:
    project: "tamtham-website"
    config: "production"
    token: ${{ secrets.DOPPLER_TOKEN }}
    # Secrets automatically exported as environment variables

# Or using CLI directly
- name: Install Doppler
  run: curl https://assets.getdoppler.com/install.sh | sh

- name: Download Secrets
  run: doppler secrets download --project tamtham-website --config production --format env > .doppler.env

- name: Export to Environment
  run: |
    set -a
    source .doppler.env
    set +a

- name: Use Secret
  run: echo "Validating Turnstile token: $TURNSTILE_SECRET_KEY"
```

### Cloudflare Tunnel Docker Deployment

```yaml
# cloudflared Docker Compose configuration
version: '3.8'
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: always
    command: tunnel --config /etc/cloudflared/config.yml run
    volumes:
      - ./config.yml:/etc/cloudflared/config.yml
      - ./credentials.json:/etc/cloudflared/credentials.json
    environment:
      - no_autoupdate=true

# config.yml
tunnel: danny-tunnel
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: danny.tamtham.com
    service: http://localhost:8080
    path: /
  - service: http_status:404
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Page Rules | Cache Rules | 2023 | More granular control, better performance |
| Manual deployment | GitHub Actions CI/CD | Ongoing | Automated, auditable deployments |
| Environment files | Doppler secrets | Ongoing | Encrypted, centralized secrets management |
| Port forwarding | Cloudflare Tunnel | Ongoing | No firewall changes needed, encrypted |
| Azure access token | OIDC identity token | Azure SWA v2 | More secure, no long-lived secrets |

**Deprecated/outdated:**
- **Page Rules:** Replaced by Cache Rules and Web Application Firewall rules
- **Azure access token:** OIDC token exchange preferred for GitHub Actions
- **Manual DNS changes:** Use Cloudflare API or Terraform for version control
- **Hardcoded secrets:** Never commit secrets to repository

## Open Questions

1. **Cloudflare Tunnel Deployment Method**
   - What we know: cloudflared can run as binary or Docker container on home server
   - What's unclear: Best practice for home server deployment (resource usage, updates, monitoring)
   - Recommendation: Start with binary installation (simpler), migrate to Docker if needed

2. **Doppler Workplace Structure**
   - What we know: Doppler supports multiple projects and configs
   - What's unclear: Should separate production/staging into different projects or configs?
   - Recommendation: Use single project with multiple configs (production, staging) for simplicity

3. **Cloudflare Bot Fight Mode**
   - What we know: Available on all plans, automatic bot detection
   - What's unclear: Impact on Turnstile validity (potential false positives)
   - Recommendation: Enable and monitor, adjust if legitimate users blocked

4. **Action Version Pinning Strategy**
   - What we know: Security best practice to pin versions
   - What's unclear: Pin to major version (e.g., `@v4`) vs. exact version (e.g., `@v4.0.0`)
   - Recommendation: Pin to major version for security updates, manually update quarterly

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification + curl scripts |
| Config file | None — CI/CD verification |
| Quick run command | `curl -I https://tamtham.com` |
| Full suite command | See Wave 0 Gaps below |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEPLOY-01 | GitHub Actions workflow triggers on push | manual | `gh workflow list` | ❌ Wave 0 |
| DEPLOY-02 | Doppler secrets injected into build | manual | `gh run log` (check for secrets) | ❌ Wave 0 |
| DEPLOY-03 | Action versions pinned in workflow | manual | `cat .github/workflows/azure-static-web-apps.yml` | ❌ Wave 0 |
| DEPLOY-04 | Deploy on push to main | manual | `git push origin main` + `gh run watch` | ❌ Wave 0 |
| DEPLOY-05 | Build compiles Tailwind and optimizes images | manual | Check `dist/` or output folder | ❌ Wave 0 |
| CLOUD-01 | tamtham.com resolves to Azure SWA | manual | `curl -I https://tamtham.com` | ❌ Wave 0 |
| CLOUD-02 | danny.tamtham.com accessible via tunnel | manual | `curl -I https://danny.tamtham.com` | ❌ Wave 0 |
| CLOUD-03 | helen.tamtham.com accessible via tunnel | manual | `curl -I https://helen.tamtham.com` | ❌ Wave 0 |
| CLOUD-04 | Bot Fight Mode enabled | manual | Cloudflare dashboard check | ❌ Wave 0 |
| CLOUD-05 | Cache Rules configured | manual | `curl -I -H "Cache-Control: no-cache" https://tamtham.com` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Manual verification of workflow run status
- **Per wave merge:** Full curl tests to all endpoints
- **Phase gate:** All 10 requirements verified green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `.github/workflows/azure-static-web-apps.yml` — DEPLOY-01, DEPLOY-03, DEPLOY-04
- [ ] Doppler GitHub Actions setup — DEPLOY-02
- [ ] Azure SWA API function configuration — DEPLOY-05
- [ ] Cloudflare DNS records (CNAME for tamtham.com) — CLOUD-01
- [ ] Cloudflare Tunnel setup for danny.tamtham.com — CLOUD-02
- [ ] Cloudflare Tunnel setup for helen.tamtham.com — CLOUD-03
- [ ] Cloudflare Bot Fight Mode enablement — CLOUD-04
- [ ] Cloudflare Cache Rules configuration — CLOUD-05
- [ ] Verification script: `tests/05-deployment/verify-deployment.sh`
- [ ] Manual checklist: `.planning/phases/05-deployment-infrastructure/WAVE0-CHECKLIST.md`

## Sources

### Primary (HIGH confidence)
- Microsoft Learn - Azure Static Web Apps build configuration — workflow configuration, API location, build commands
- Doppler Documentation — GitHub Actions integration, CLI usage, secrets management patterns

### Secondary (MEDIUM confidence)
- Cloudflare Documentation — DNS records, Cache Rules, Tunnel concepts
- Cloudflare Tunnel documentation — cloudflared configuration patterns

### Tertiary (LOW confidence)
- GitHub Actions marketplace — action versions and availability
- Community examples for cloudflared Docker deployments

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Azure SWA, GitHub Actions, Doppler CLI all verified with official docs
- Architecture: MEDIUM - Cloudflare Tunnel deployment patterns verified, but specific home server setup needs validation
- Pitfalls: MEDIUM - Common issues identified from documentation, but real-world validation needed

**Research date:** 2026-03-13  
**Valid until:** 2026-04-12 (30 days for stable infrastructure choices)

---

## Additional Notes

### Azure SWA OIDC vs. Access Token

Azure Static Web Apps supports two authentication methods for GitHub Actions:

1. **OIDC Identity Token (Recommended):** More secure, no long-lived secrets, uses GitHub's OIDC endpoint
2. **Azure Access Token:** Legacy method, requires storing long-lived token in GitHub secrets

The OIDC approach is now the default for new Azure SWA setups and should be used for new deployments.

### Cloudflare Tunnel Token Options

Two methods to authenticate cloudflared:

1. **TUNNEL_TOKEN:** Single token for one tunnel (simpler, less flexible)
2. **credentials.json:** More control, supports multiple ingress rules, requires setup via `cloudflared tunnel login`

For this use case, credentials.json method is recommended for better control over multiple subdomains.

### Doppler Pricing Considerations

Doppler offers a free tier suitable for this project:
- 1 workplace
- 3 projects
- 100 secret requests/month

For a static website with infrequent deployments, the free tier should be sufficient. Monitor usage during initial setup.
