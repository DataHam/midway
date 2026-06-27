# Deployment Infrastructure Summary

## Phase 05: Deployment Infrastructure - COMPLETE ✓

### Components Deployed

#### 1. Azure Static Web Apps CI/CD
- **File:** `.github/workflows/azure-static-web-apps.yml`
- **Status:** ✓ Configured
- **Features:**
  - Doppler secrets integration
  - OIDC authentication for Azure
  - Version-pinned GitHub Actions
  - Build command: `npm run build`

#### 2. Cloudflare Workers (Verification Endpoints)
- **Danny Worker:** `https://tamtham-verify-danny.dataham.workers.dev`
- **Helen Worker:** `https://tamtham-verify-helen.dataham.workers.dev`
- **Status:** ✓ Deployed and tested
- **Function:** Validates Turnstile tokens, redirects on success

#### 3. Cloudflare Tunnel Configuration
- **Tunnel Name:** `combined-tunnel`
- **Config File:** `cloudflared-config.yml`
- **Subdomains:**
  - `danny.tamtham.com` → `http://localhost:8080`
  - `helen.tamtham.com` → `http://localhost:8080`
- **Status:** ⏳ Ready for deployment

#### 4. Documentation
- `.doppler/SETUP.md` - Doppler configuration guide
- `CLOUDFLARE-SETUP.md` - Cloudflare DNS and cache rules
- `TUNNEL-CONFIG.md` - Cloudflare Tunnel setup guide
- `TUNNEL-SETUP.md` - Combined tunnel configuration
- `tests/05-deployment/verify-deployment.sh` - Verification script

### Doppler Secrets (tamtham-com → prd)

| Secret | Purpose | Status |
|--------|---------|--------|
| `TURNSTILE_SECRET_KEY` | Cloudflare Workers validation | ✓ Configured |
| `TUNNEL_TOKEN` | Cloudflare Tunnel authentication | ✓ Available |
| `CLOUDFLARE_WORKER_API` | Cloudflare API access | ✓ Available |
| `AZURE_*` | Azure authentication | ⏳ In Doppler |

### Remaining Manual Steps

#### 1. Cloudflare DNS Configuration
```
Type: CNAME
Name: tamtham.com
Target: <azure-swa-endpoint>.azurestaticapps.net
Proxy: Enabled (orange cloud)
```

#### 2. Cloudflare Tunnel Deployment
```bash
# On home server
$env:TUNNEL_TOKEN = "<from-doppler>"
cloudflared tunnel create combined-tunnel
cloudflared tunnel run combined-tunnel
```

#### 3. Cloudflare Dashboard Setup
- Enable Bot Fight Mode
- Configure Cache Rules
- Verify tunnel status

#### 4. Azure Static Web Apps
- Push to main branch
- Monitor GitHub Actions workflow
- Verify deployment in Azure Portal

### Testing

#### Cloudflare Workers
```bash
# Test invalid token (should return 403)
curl -X POST https://tamtham-verify-danny.dataham.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid"}'

# Expected: {"error":"Verification failed","reasons":["invalid-input-response"]}
```

#### Cloudflare Tunnels (after deployment)
```bash
curl -I https://danny.tamtham.com
curl -I https://helen.tamtham.com
```

### Architecture

```
tamtham.com (Cloudflare)
    ├─ Azure Static Web Apps (main site)
    ├─ danny.tamtham.com → Cloudflare Tunnel → localhost:8080
    └─ helen.tamtham.com → Cloudflare Tunnel → localhost:8080

Verification Flow:
    Client → Cloudflare Workers → Turnstile API → Redirect
```
