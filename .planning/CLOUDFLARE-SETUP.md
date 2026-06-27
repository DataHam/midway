# Cloudflare DNS Setup Guide

This guide explains how to configure Cloudflare DNS for the Tam-Tham website subdomains.

## Overview

The website uses Cloudflare Workers to handle Turnstile verification for two subdomains:
- **danny.tamtham.com** → Routes to verification API → Redirects to home server
- **helen.tamtham.com** → Routes to verification API → Redirects to home server

## Prerequisites

1. **Cloudflare Account** with access to the `tamtham.com` zone
2. **Cloudflare API Token** with `Zone:Edit` permissions
3. **Cloudflare Workers Deployed**:
   - `tamtham-verify-danny` (already deployed via GitHub Actions)
   - `tamtham-verify-helen` (already deployed via GitHub Actions)

## Getting Your Cloudflare API Token

1. Log in to Cloudflare Dashboard
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use template **Edit zone DNS** or create custom token with:
   - **Zone Resources**: `*` (or specific zone)
   - **Permissions**: 
     - `Zone - DNS - Edit`
     - `Zone - Cloudflare Tunnel - Read`
5. Copy the generated token

## Quick Setup

### Option 1: Automated Script (Recommended)

```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# Run the setup script
bash .planning/scripts/cloudflare-dns-setup.sh
```

### Option 2: Manual Setup via Cloudflare Dashboard

1. **Log in to Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com

2. **Select Zone**: `tamtham.com`

3. **Go to DNS** → **Records**

4. **Add CNAME Record for Danny**:
   - Type: `CNAME`
   - Name: `danny`
   - Target: `tamtham-verify-danny.workers.dev`
   - Proxy status: `Proxied` (orange cloud)
   - TTL: `Auto`

5. **Add CNAME Record for Helen**:
   - Type: `CNAME`
   - Name: `helen`
   - Target: `tamtham-verify-helen.workers.dev`
   - Proxy status: `Proxied` (orange cloud)
   - TTL: `Auto`

6. **Save** both records

## Verification

### Check DNS Records

```bash
# Using the script
bash .planning/scripts/cloudflare-dns-setup.sh

# Or manually check
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" | \
  jq '.result[] | select(.name | contains("tamtham.com"))'
```

### Test Subdomains

```bash
# Test Danny subdomain
curl -I https://danny.tamtham.com

# Test Helen subdomain
curl -I https://helen.tamtham.com
```

Expected response:
- Status code: `302` (redirect) or `200` (OK)
- Location header should point to home server

### Browser Test

1. Visit: https://danny.tamtham.com
2. You should see:
   - Cloudflare Turnstile widget
   - "Verify and Continue" button
   - If valid verification → Redirect to home server

## Troubleshooting

### 404 Error

**Symptom**: Getting 404 when visiting subdomain

**Possible causes**:
1. DNS not propagated yet (wait 5-10 minutes)
2. Worker not deployed
3. DNS record not configured

**Solution**:
```bash
# Check if Worker is deployed
wrangler whoami

# Check DNS records
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records"

# Re-run setup script
bash .planning/scripts/cloudflare-dns-setup.sh
```

### 522 Error (Connection Timed Out)

**Symptom**: Cloudflare shows 522 error

**Cause**: Worker not responding

**Solution**:
1. Check Worker logs in Cloudflare Dashboard
2. Verify Worker is activated
3. Check Worker bindings and environment variables

### Turnstile Not Loading

**Symptom**: Turnstile widget doesn't appear

**Possible causes**:
1. Sitekey not configured in HTML
2. CSP blocking Turnstile
3. Network issues

**Solution**:
1. Verify sitekey is set in GitHub Actions workflow
2. Check CSP headers allow `challenges.cloudflare.com`
3. Test with browser DevTools console

## Worker Logs

### View Worker Logs

1. Go to Cloudflare Dashboard → **Workers & Pages**
2. Select `tamtham-verify-danny` or `tamtham-verify-helen`
3. Click **Logs** tab

### Enable Worker Logging

```toml
# In wrangler.toml
[observability]
enabled = true
head_sampling_rate = 100
```

## Cleanup

To remove DNS records:

```bash
# Get record ID
record_id=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | \
  jq -r ".result[] | select(.name==\"danny.tamtham.com\") | .id")

# Delete record
curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$record_id" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

## Additional Configuration

### Custom SSL/TLS

By default, Cloudflare provides SSL for proxied domains. No additional configuration needed.

### Cache Rules

Recommended Cache Rules for Workers:
```
Path: /*
Cache Level: Standard
Edge TTL: 0 (no caching for API responses)
```

### Rate Limiting

Consider adding Cloudflare Rate Limiting:
- Path: `/api/*`
- Matches: 100 requests per 1 minute
- Action: Block or challenge

## Security Notes

1. **Never commit API tokens** to git
2. **Use GitHub Secrets** for CI/CD integration
3. **Rotate API tokens** periodically
4. **Monitor Cloudflare logs** for suspicious activity

## Resources

- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare API Documentation](https://api.cloudflare.com/)
- [Turnstile Documentation](https://developers.cloudflare.com/turnstile/)

---

*Last updated: 2026-03-14*
