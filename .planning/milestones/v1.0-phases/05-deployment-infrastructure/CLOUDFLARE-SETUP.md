# Cloudflare DNS and Cache Rules Setup

## Phase 05-02: Cloudflare Infrastructure Setup

This document provides step-by-step instructions for configuring Cloudflare DNS, Bot Fight Mode, and Cache Rules for the tamtham.com domain.

---

## Section 1: Add Domain to Cloudflare

### Steps

1. **Sign in to Cloudflare Dashboard**
   - Navigate to: https://dash.cloudflare.com/sign-in
   - Log in with your Cloudflare account credentials

2. **Add a Site**
   - Click the **"Add a Site"** button (usually in the top-right corner)
   - Select **"Add Custom Domain"** option

3. **Enter Domain Name**
   - Domain: `tamtham.com`
   - Click **"Add site"**

4. **Select Plan**
   - Choose **Free** plan (sufficient for this use case)
   - Click **"Continue"**

5. **Wait for Nameserver Scan**
   - Cloudflare will scan existing DNS records
   - Wait for the scan to complete (typically 1-2 minutes)
   - Click **"Continue"**

---

## Section 2: Update Nameservers

### Steps

1. **Copy Cloudflare Nameservers**
   - Cloudflare will display two nameservers, for example:
     - `ns1.cloudflare.com`
     - `ns2.cloudflare.com`
   - Copy both nameserver addresses

2. **Update at Domain Registrar**
   - Log in to your domain registrar (GoDaddy, Namecheap, etc.)
   - Navigate to DNS/Nameserver management for `tamtham.com`
   - Replace existing nameservers with Cloudflare nameservers
   - Save changes

3. **Wait for Propagation**
   - Nameserver propagation typically takes minutes to a few hours
   - Check propagation status in Cloudflare Dashboard
   - Status will show "Active" when complete

---

## Section 3: Configure DNS Records

### Create CNAME Record for Azure Static Web Apps

1. **Navigate to DNS Settings**
   - In Cloudflare Dashboard, select `tamtham.com`
   - Click **"DNS"** → **"Records"**

2. **Add New Record**
   - Click **"Add record"** button

3. **Configure Record Details**
   - **Type:** `CNAME`
   - **Name:** `tamtham.com` (or `@` for apex domain)
   - **Target:** `<your-app-name>.azurestaticapps.net`
     - Replace `<your-app-name>` with your actual Azure SWA app name
     - Example: `tamtham-web.azurestaticapps.net`
   - **Proxy status:** `Proxied` (orange cloud icon should be orange)
   - **TTL:** `Auto`

4. **Save Record**
   - Click **"Save"** button
   - Record will appear in DNS records list with orange cloud icon

### Verification

```bash
# Check DNS resolution
dig tamtham.com
# or
nslookup tamtham.com

# Expected output should show Azure SWA endpoint IP
```

---

## Section 4: Enable Bot Fight Mode

### Steps

1. **Navigate to Security Settings**
   - In Cloudflare Dashboard, select `tamtham.com`
   - Click **"Security"** → **"WAF"**

2. **Enable Bot Fight Mode**
   - Find **"Bot Fight Mode"** section
   - Toggle switch to **"On"**
   - Click **"Save"** or **"Enable"**

3. **Confirmation**
   - Bot Fight Mode shows status as **"On"**
   - Note: Automatic detection, no additional configuration needed
   - Cloudflare automatically detects and blocks malicious bots

### Bot Fight Mode Benefits

- Automatic bot detection using machine learning
- Blocks known bad bots and scrapers
- Challenges suspicious traffic with JavaScript challenges
- Available on all Cloudflare plans (including Free)
- No performance impact on legitimate traffic

---

## Section 5: Configure Cache Rules (Modern Approach)

### Overview

Cloudflare Cache Rules replace the deprecated Page Rules with a more flexible and performant system. Cache Rules use a rule builder interface with field-based conditions.

### Navigate to Cache Rules

1. In Cloudflare Dashboard, select `tamtham.com`
2. Click **"Caching"** → **"Cache Rules"**
3. Click **"Create rule"** button

---

### Rule 1: Cache Static Assets

This rule caches all static assets (HTML, CSS, JS, images, fonts) for 1 year.

1. **Create New Rule**
   - Click **"Create rule"** in Cache Rules section

2. **Configure Rule Details**
   - **Rule name:** `Cache static assets`
   - **Field:** `URI Path`
   - **Operator:** `starts with`
   - **Value:** `/`
   - **Action:** `Cache`
   - **Cache TTL:** `1 year` (or 31536000 seconds)

3. **Advanced Settings (Optional)**
   - **Cache key:** Default (Cloudflare optimizes automatically)
   - **Respect origin headers:** No (Cloudflare TTL takes precedence)
   - **Edge TTL:** Override (use rule TTL)

4. **Save Rule**
   - Click **"Deploy"** button
   - Rule will appear in rule list with status "Active"

---

### Rule 2: Bypass Cache for API

This rule ensures API requests are not cached, always hitting the origin for fresh data.

1. **Create New Rule**
   - Click **"Create rule"** in Cache Rules section

2. **Configure Rule Details**
   - **Rule name:** `Bypass cache for API`
   - **Field:** `URI Path`
   - **Operator:** `starts with`
   - **Value:** `/api`
   - **Action:** `Bypass Cache`

3. **Save Rule**
   - Click **"Deploy"** button
   - Rule will appear in rule list with status "Active"

---

### Cache Rules Priority

Cloudflare evaluates rules in the following order:

1. **Cache Override** rules (highest priority)
2. **Custom Cache Rules** (like the rules above)
3. **Auto Reduces Image Size** settings
4. **Default behavior** (lowest priority)

**Tip:** Place more specific rules (like `/api` bypass) before general rules (like `/` cache).

---

## Section 6: Verification

### DNS Resolution Verification

```bash
# Using dig
dig tamtham.com

# Expected output shows CNAME pointing to Azure SWA
# Example:
# tamtham.com.    300   IN  CNAME   tamtham-web.azurestaticapps.net.
```

```bash
# Using nslookup
nslookup tamtham.com

# Expected output shows Azure SWA endpoint
```

### Proxy Verification

```bash
# Check Cloudflare headers
curl -I https://tamtham.com

# Expected headers include:
# - CF-RAY: <ray-id>
# - Server: cloudflare
# - CF-Cache-Status: HIT or MISS
```

### Cache Rules Verification

```bash
# Test cache behavior with no-cache header
curl -I -H "Cache-Control: no-cache" https://tamtham.com

# Expected CF-Cache-Status:
# - HIT if served from Cloudflare cache
# - MISS if origin not cached yet
# - BYPASS if matches /api rule
```

### Bot Fight Mode Verification

1. **Check Status**
   - Visit Cloudflare Dashboard → Security → WAF
   - Verify Bot Fight Mode shows "On"

2. **Monitor Bot Traffic**
   - Navigate to Analytics → Security → Bots
   - View bot traffic statistics
   - Check blocked bot attempts

---

## Troubleshooting

### DNS Not Propagating

**Issue:** Nameserver changes not taking effect

**Solutions:**
1. Wait longer (propagation can take up to 48 hours)
2. Check nameserver update at registrar
3. Use Cloudflare's DNS checker: https://www.whatsmydns.net/

### Orange Cloud Not Active

**Issue:** DNS record shows gray cloud (DNS only)

**Solutions:**
1. Click orange cloud icon to toggle to proxied
2. Save changes
3. Wait a few minutes for activation

### Cache Not Working

**Issue:** CF-Cache-Status shows BYPASS

**Solutions:**
1. Verify Cache Rules are deployed and active
2. Check rule priority order
3. Ensure no conflicting rules exist
4. Clear Cloudflare cache: Caching → Configuration → Purge Everything

### Bot Fight Mode Not Blocking

**Issue:** Bots still accessing site

**Solutions:**
1. Verify Bot Fight Mode is enabled
2. Check Security → WAF → Events for blocked attempts
3. Review WAF rules for conflicts
4. Consider upgrading to Business plan for advanced bot management

---

## Next Steps

After completing this setup:

1. **Create Cloudflare Tunnels** for subdomain access
   - See: `TUNNEL-CONFIG.md` for tunnel setup instructions

2. **Monitor Performance**
   - Check Analytics → Overview for traffic patterns
   - Review Caching → Configuration for cache hit ratio

3. **Configure Additional Security**
   - Enable SSL/TLS encryption (Full or Full Strict)
   - Set up WAF rules for custom protection
   - Configure Rate Limiting for API endpoints

---

## Quick Reference

| Setting | Value | Purpose |
|---------|-------|---------|
| DNS Record Type | CNAME | Point tamtham.com to Azure SWA |
| Proxy Status | Proxied (Orange Cloud) | Enable Cloudflare CDN and security |
| Bot Fight Mode | Enabled | Automatic bot detection and blocking |
| Static Asset Cache | 1 year | Maximize browser and edge caching |
| API Cache | Bypass | Ensure fresh API responses |
| SSL/TLS | Full | Encrypt traffic between Cloudflare and origin |

---

## Related Documentation

- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Cloudflare Bot Fight Mode](https://www.cloudflare.com/learning/bots/what-is-bot-fight-mode/)
- [Azure Static Web Apps DNS Setup](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain)
