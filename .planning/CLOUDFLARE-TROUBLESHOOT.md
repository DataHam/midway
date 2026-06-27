# Cloudflare Workers Troubleshooting Guide

## Issue: Workers Not Accessible

The Workers (`tamtham-verify-danny` and `tamtham-verify-helen`) need to be properly deployed and configured.

## Step 1: Verify Workers Are Deployed

### Check in Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Click **Workers & Pages** (left sidebar)
3. Look for:
   - `tamtham-verify-danny`
   - `tamtham-verify-helen`

### If Workers Don't Exist

You need to deploy them manually:

```bash
# Navigate to Danny Worker directory
cd src/api/verify-danny

# Deploy to Cloudflare
wrangler deploy

# Navigate to Helen Worker directory
cd ../../verify-helen

# Deploy to Cloudflare
wrangler deploy
```

### If You Don't Have Wrangler Installed

```bash
npm install -D wrangler
```

## Step 2: Configure Worker Routes

Workers need routes to be accessible via your subdomains.

### Via Cloudflare Dashboard

1. Go to **Workers & Pages**
2. Click on `tamtham-verify-danny`
3. Click **Triggers** tab
4. Click **Add custom domain**
5. Enter: `danny.tamtham.com`
6. Click **Save**

Repeat for Helen: `helen.tamtham.com`

### Via API (Alternative)

```bash
# Get your Cloudflare API Token
export CLOUDFLARE_API_TOKEN="your-token"
export ZONE_ID="your-zone-id"

# Add route for Danny Worker
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pattern":"danny.tamtham.com/*","script":"tamtham-verify-danny"}'

# Add route for Helen Worker
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/workers/routes" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pattern":"helen.tamtham.com/*","script":"tamtham-verify-helen"}'
```

## Step 3: Configure Environment Variables

Workers need the Turnstile secret key.

### Via Dashboard

1. Go to **Workers & Pages**
2. Click on `tamtham-verify-danny`
3. Click **Settings** tab
4. Scroll to **Variables and secrets**
5. Add variable:
   - Name: `TURNSTILE_SECRET_KEY`
   - Value: Your Turnstile secret key (from Cloudflare Dashboard)

Repeat for Helen Worker.

## Step 4: Verify Worker Code

Check the Worker code is correct:

```bash
cat src/api/verify-danny/index.js
```

Key requirements:
- Must return `Response.redirect()` for browser requests
- Must return JSON for API requests
- Must use `TURNSTILE_SECRET_KEY` from environment

## Step 5: Test Worker Directly

After deployment, test the Worker directly:

```bash
# Test Danny Worker
curl -X POST https://tamtham-verify-danny.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}'

# Expected: 403 (invalid token) or redirect
```

## Common Issues

### Issue: "Script not found"

**Cause:** Worker not deployed or route not configured

**Fix:**
1. Deploy Worker: `wrangler deploy`
2. Add custom domain in Triggers tab

### Issue: "403 Forbidden"

**Cause:** Invalid Turnstile token (expected for test)

**Fix:** This is normal. Use a valid token from actual Turnstile widget.

### Issue: "401 Unauthorized"

**Cause:** Missing or incorrect TURNSTILE_SECRET_KEY

**Fix:** Add secret key in Worker Settings → Variables and secrets

### Issue: DNS not resolving

**Cause:** DNS propagation takes time (1-5 minutes typically)

**Fix:**
1. Wait 5-10 minutes
2. Clear DNS cache
3. Verify DNS records in Cloudflare Dashboard

## Quick Fix Checklist

- [ ] Workers deployed in Cloudflare Dashboard
- [ ] Custom domains added in Triggers tab
- [ ] TURNSTILE_SECRET_KEY configured in Variables
- [ ] DNS CNAME records created (danny → tamtham-verify-danny.workers.dev)
- [ ] DNS CNAME records created (helen → tamtham-verify-helen.workers.dev)
- [ ] Orange cloud (proxy) enabled for DNS records

## Alternative: Use Cloudflare Pages

If Workers are too complex, you can use Cloudflare Pages:

1. Create Pages project
2. Connect to GitHub repo
3. Configure build settings
4. Add custom domains

## Need More Help?

Check Cloudflare documentation:
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Workers Troubleshooting](https://developers.cloudflare.com/workers/troubleshooting/)

---

*Last updated: 2026-03-14*
