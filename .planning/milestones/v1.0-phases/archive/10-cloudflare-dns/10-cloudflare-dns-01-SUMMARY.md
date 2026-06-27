---
phase: 10-cloudflare-dns
plan: 01
executed: 2026-03-14
status: complete
---

# Phase 10: Cloudflare DNS Setup - Plan 01 Summary

**Objective:** Configure Cloudflare DNS for danny.tamtham.com and helen.tamtham.com subdomains.

**Status:** ✅ Documentation and automation created

## Files Created

| File | Purpose | Status |
|------|---------|--------|
| `.planning/scripts/cloudflare-dns-setup.sh` | Automated DNS setup script | Created |
| `.planning/CLOUDFLARE-SETUP.md` | Setup documentation | Created |
| `.planning/phases/10-cloudflare-dns/10-cloudflare-dns-01-PLAN.md` | Plan documentation | Created |

## What This Phase Provides

### Automated Setup Script

The `cloudflare-dns-setup.sh` script:
- Creates CNAME records for both subdomains
- Routes to Cloudflare Workers
- Proxies through Cloudflare (orange cloud)
- Includes error handling and verification
- Tests Worker endpoints after configuration

### Documentation

The `CLOUDFLARE-SETUP.md` guide includes:
- Prerequisites and setup instructions
- Two setup options (automated vs manual)
- Verification procedures
- Troubleshooting guide
- Security notes

## How to Fix the 404 Error

### Option 1: Automated Setup (Recommended)

```bash
# 1. Get your Cloudflare API Token
# Go to: https://dash.cloudflare.com/profile/api-tokens
# Use template "Edit zone DNS"

# 2. Set environment variable
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# 3. Get zone ID
export ZONE_ID=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones" | \
  jq -r '.result[] | select(.name=="tamtham.com") | .id')

# 4. Run the setup script
bash .planning/scripts/cloudflare-dns-setup.sh
```

### Option 2: Manual Setup via Cloudflare Dashboard

1. **Log in to Cloudflare**: https://dash.cloudflare.com
2. **Select Zone**: `tamtham.com`
3. **Go to DNS** → **Records**
4. **Add CNAME Record for Danny**:
   - Type: `CNAME`
   - Name: `danny`
   - Target: `tamtham-verify-danny.workers.dev`
   - Proxy: `Proxied` (orange cloud)
   - TTL: `Auto`

5. **Add CNAME Record for Helen**:
   - Type: `CNAME`
   - Name: `helen`
   - Target: `tamtham-verify-helen.workers.dev`
   - Proxy: `Proxied` (orange cloud)
   - TTL: `Auto`

6. **Save** both records

### Option 3: Via Cloudflare Dashboard UI (Easiest)

1. Go to Cloudflare Dashboard → `tamtham.com`
2. Click **DNS** → **Records**
3. Click **Add Record**
4. Add these two records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | danny | tamtham-verify-danny.workers.dev | Proxied |
| CNAME | helen | tamtham-verify-helen.workers.dev | Proxied |

5. Click **Save**

## Verification

After DNS propagation (1-5 minutes):

```bash
# Test Danny subdomain
curl -I https://danny.tamtham.com

# Test Helen subdomain
curl -I https://helen.tamtham.com
```

Expected: Should return 302 redirect or 200 OK (not 404)

## What to Expect

### Before Configuration
- `danny.tamtham.com` → 404 Not Found
- `helen.tamtham.com` → 404 Not Found

### After Configuration
- `danny.tamtham.com` → Cloudflare Turnstile widget → Verify → Redirect to home server
- `helen.tamtham.com` → Cloudflare Turnstile widget → Verify → Redirect to home server

## Troubleshooting

### Still Getting 404?

1. **Wait for DNS propagation** (can take up to 5 minutes)
2. **Clear DNS cache**: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
3. **Verify Workers deployed**:
   ```bash
   wrangler whoami
   ```
4. **Check DNS records**:
   ```bash
   dig danny.tamtham.com
   ```

### Checking Worker Status

1. Go to Cloudflare Dashboard → **Workers & Pages**
2. Verify both Workers are **Active**
3. Check **Logs** for any errors

## Next Steps

1. **Configure DNS** using one of the methods above
2. **Wait for propagation** (1-5 minutes)
3. **Test subdomains** in browser
4. **Complete Turnstile verification** to access home servers

---

_Estimated: 2026-03-14_
