# Phase 4: Security & SEO - Research

**Researched:** 2026-03-13  
**Domain:** Azure Static Web Apps security headers, Cloudflare Turnstile CSP, SEO best practices  
**Confidence:** HIGH

## Summary

This research covers the implementation of security headers and SEO best practices for the Tam-Tham website hosted on Azure Static Web Apps. The key findings establish that Azure SWA uses `staticwebapp.config.json` for all header configuration, which supports HSTS, CSP, and other security headers natively. Cloudflare Turnstile requires specific CSP allowlisting of `challenges.cloudflare.com` for both script and frame sources, with a recommended nonce-based approach for strict-dynamic support. SEO implementation involves generating `sitemap.xml`, `robots.txt`, favicon assets, and ensuring semantic HTML structure.

**Primary recommendation:** Use `staticwebapp.config.json` with global headers for all security requirements, allowlist `challenges.cloudflare.com` in CSP, and generate static SEO files in the root directory.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- HTML + Tailwind CSS (no framework)
- Azure Static Web Apps hosting
- Cloudflare Turnstile for authentication
- Self-hosted fonts (no Google Fonts CDN)
- Doppler for secrets management
- Brand colors: Navy #103248, Yellow #F0D04C, Teal #7DC2B6

### Claude's Discretion
- CSP nonce vs. hash vs. unsafe-inline approach
- Favicon format selection (ICO, PNG, SVG variants)
- Sitemap generation method (manual vs. script)

### Deferred Ideas (OUT OF SCOPE)
- Google Analytics or similar tracking
- Core Web Vitals monitoring
- Error tracking for API endpoints

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEC-01 | Configure HSTS header in staticwebapp.config.json | globalHeaders section supports HSTS |
| SEC-02 | Add Content-Security-Policy (allow Turnstile, self-hosted) | CSP syntax documented with Turnstile allowlist |
| SEC-03 | Set X-Content-Type-Options: nosniff | Standard header, supported in globalHeaders |
| SEC-04 | Set X-Frame-Options: DENY | Standard header, supported in globalHeaders |
| SEC-05 | Set Referrer-Policy: strict-origin-when-cross-origin | Standard header, supported in globalHeaders |
| SEO-01 | Generate sitemap.xml with all page URLs | Google sitemap schema documented |
| SEO-02 | Create robots.txt with sitemap reference | robots.txt syntax documented |
| SEO-03 | Add favicon set (ICO, PNG variants) | Favicon best practices documented |
| SEO-04 | Implement semantic HTML (nav, main, footer landmarks) | Semantic HTML requirements from requirements |
| SEO-05 | Proper heading hierarchy (h1 → h2 → h3) | Heading hierarchy requirements from requirements |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Azure Static Web Apps | Latest | Hosting platform | Locked decision for this project |
| staticwebapp.config.json | N/A | Security header configuration | Native Azure SWA configuration format |
| Cloudflare Turnstile | Latest | CAPTCHA authentication | Locked decision, replaces reCAPTCHA |
| Montserrat WOFF2 | Self-hosted | Fonts | Locked decision, no Google Fonts CDN |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sitemap.xml | N/A | SEO indexation | Required for search engine discovery |
| robots.txt | N/A | Crawl directives | Required for search engine control |
| Favicon assets | ICO/PNG/SVG | Browser tab icons | Required for branding and UX |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Google Fonts CDN | Self-hosted Montserrat | Locked decision for privacy/performance |
| reCAPTCHA | Cloudflare Turnstile | Locked decision, Turnstile is less intrusive |
| Dynamic sitemap generation | Static sitemap.xml | Static is simpler for static site, no build overhead |
| Meta tag CSP | HTTP header CSP | HTTP header is more secure, cannot be overridden |

**Installation:**
```bash
# No npm packages required - all configuration is static files
# Ensure Tailwind CSS build pipeline is in place from Phase 1
```

## Architecture Patterns

### Recommended Project Structure

```
root/
├── staticwebapp.config.json    # Security headers configuration
├── sitemap.xml                 # SEO sitemap
├── robots.txt                  # Crawl directives
├── assets/
│   ├── fonts/
│   │   └── Montserrat/         # WOFF2 files (Phase 1)
│   └── images/
│       └── favicons/           # Favicon variants
│           ├── favicon.ico
│           ├── favicon-16x16.png
│           ├── favicon-32x32.png
│           └── apple-touch-icon.png
└── pages/                      # HTML pages (Phases 2-3)
    ├── index.html
    ├── danny.html
    ├── helen.html
    ├── verify-danny.html
    └── verify-helen.html
```

### Pattern 1: Security Headers Configuration

**What:** Configure all security headers in `staticwebapp.config.json` using `globalHeaders` section

**When to use:** For all Azure SWA deployments requiring security headers

**Example:**
```json
{
  "globalHeaders": {
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; frame-src https://challenges.cloudflare.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-xss-protection": "1; mode=block"
  },
  "routes": [
    {
      "route": "/favicon.ico",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/assets/fonts/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  ],
  "navigationFallback": {
    "rewrite": "/pages/index.html"
  }
}
```

**Source:** [Azure Static Web Apps Configuration Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)

### Pattern 2: Cloudflare Turnstile CSP Configuration

**What:** Allowlist Turnstile script and frame sources in CSP

**When to use:** On all pages that use Turnstile widget (verify-danny.html, verify-helen.html)

**Example:**
```html
<!-- In verify-danny.html and verify-helen.html -->
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  defer
></script>

<div
  class="cf-turnstile"
  data-sitekey="your-sitekey"
  data-callback="onTurnstileSuccess"
></div>
```

**CSP Requirements:**
- `script-src`: Must include `https://challenges.cloudflare.com`
- `frame-src`: Must include `https://challenges.cloudflare.com`
- Recommended: Use nonce-based approach with `strict-dynamic`

**Source:** [Cloudflare Turnstile CSP Documentation](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)

### Pattern 3: Sitemap.xml Generation

**What:** Generate XML sitemap with all page URLs for search engine discovery

**When to use:** Before deployment to production

**Example:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tamtham.com/</loc>
    <lastmod>2026-03-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tamtham.com/pages/danny.html</loc>
    <lastmod>2026-03-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tamtham.com/pages/helen.html</loc>
    <lastmod>2026-03-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Source:** [Google Sitemap Schema](https://www.sitemaps.org/protocol.html)

### Pattern 4: robots.txt Configuration

**What:** Create robots.txt to guide search engine crawlers

**When to use:** Before deployment to production

**Example:**
```txt
User-agent: *
Allow: /

Sitemap: https://tamtham.com/sitemap.xml
```

**Source:** [Google robots.txt Guide](https://developers.google.com/search/docs/crawling-indexing/robots/introduction)

### Anti-Patterns to Avoid

- **❌ Using meta tags for CSP:** Meta tag CSP can be overridden by attackers; always use HTTP headers
- **❌ Including Google Fonts CDN:** Violates locked decision; use self-hosted Montserrat WOFF2
- **❌ Using unsafe-inline without nonce:** If using strict CSP, prefer nonce-based approach
- **❌ Missing favicon variants:** Browser compatibility requires multiple formats
- **❌ Dynamic sitemap generation overhead:** Static sitemap is simpler for static sites

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Security headers | Custom middleware or server config | `staticwebapp.config.json` | Native Azure SWA support, no code required |
| CSP generation | Manual CSP string construction | Predefined template in config | Reduces errors, ensures consistency |
| Sitemap generation | Custom XML generation script | Static sitemap.xml | Simpler, no build overhead, easier to validate |
| robots.txt | Dynamic robots.txt logic | Static robots.txt | No conditional logic needed for this project |
| Favicon generation | Custom favicon creation | Online favicon generator | Professional quality, multiple formats |

**Key insight:** All security and SEO requirements can be met with static files and configuration, no custom code needed. This reduces attack surface and maintenance burden.

## Common Pitfalls

### Pitfall 1: CSP Blocking Turnstile

**What goes wrong:** Turnstile widget fails to load due to CSP restrictions

**Why it happens:** Missing `https://challenges.cloudflare.com` in `script-src` or `frame-src` directives

**How to avoid:** Always include both `script-src https://challenges.cloudflare.com` and `frame-src https://challenges.cloudflare.com` in CSP

**Warning signs:** Console errors like "Refused to load script because it violates the following Content Security Policy directive"

### Pitfall 2: HSTS Preload Issues

**What goes wrong:** Site cannot be added to HSTS preload list due to configuration errors

**Why it happens:** Missing `includeSubDomains` or `preload` flags, or incorrect `max-age`

**How to avoid:** Use `max-age=31536000; includeSubDomains; preload` exactly as specified

**Warning signs:** HSTS preload checker fails validation

### Pitfall 3: Sitemap URL Mismatch

**What goes wrong:** Search engines cannot index pages due to incorrect sitemap URLs

**Why it happens:** Sitemap URLs don't match actual deployed URLs (missing `/pages/` prefix, wrong domain)

**How to avoid:** Verify sitemap URLs match production deployment structure exactly

**Warning signs:** Google Search Console shows "Submitted URL not found" errors

### Pitfall 4: Favicon Cache Issues

**What goes wrong:** Old favicon persists after deployment

**Why it happens:** Browsers aggressively cache favicons

**How to avoid:** Use multiple favicon formats and consider versioning in filename if needed

**Warning signs:** Favicon doesn't change after deployment, even after hard refresh

### Pitfall 5: Heading Hierarchy Violations

**What goes wrong:** SEO and accessibility tools flag improper heading structure

**Why it happens:** Using `<h2>` before `<h1>`, or skipping heading levels

**How to avoid:** Ensure single `<h1>` per page, sequential heading levels (h1 → h2 → h3)

**Warning signs:** Lighthouse accessibility audit fails on "heading-order" check

## Code Examples

Verified patterns from official sources:

### Azure SWA Security Header Configuration

```json
{
  "globalHeaders": {
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; frame-src https://challenges.cloudflare.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin"
  },
  "routes": [
    {
      "route": "/pages/*",
      "headers": {
        "cache-control": "public, max-age=3600"
      }
    },
    {
      "route": "/assets/fonts/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/assets/images/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  ],
  "navigationFallback": {
    "rewrite": "/pages/index.html"
  }
}
```

**Source:** [Azure Static Web Apps Configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)

### Turnstile Widget Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Access - Tam-Tham</title>
  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
    defer
  ></script>
</head>
<body>
  <h1>Security Verification</h1>
  <p>Please complete the security check to access your subdomain.</p>
  
  <div
    class="cf-turnstile"
    data-sitekey="your-sitekey-here"
    data-callback="onTurnstileSuccess"
    data-error-callback="onTurnstileError"
    data-expired-callback="onTurnstileExpired"
  ></div>

  <script>
    function onTurnstileSuccess(token) {
      // Submit token to API endpoint
      fetch('/api/verify-danny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      .then(response => {
        if (response.redirected) {
          window.location = response.url;
        } else {
          showError('Verification failed');
        }
      })
      .catch(error => {
        showError('Network error');
      });
    }

    function onTurnstileError(errorCode) {
      console.error('Turnstile error:', errorCode);
      showError('Security check failed. Please try again.');
    }

    function onTurnstileExpired() {
      console.log('Turnstile token expired');
      showError('Session expired. Please refresh and try again.');
    }

    function showError(message) {
      // Display error modal
      const modal = document.createElement('div');
      modal.className = 'error-modal';
      modal.innerHTML = `<p>${message}</p><button onclick="this.parentElement.remove()">Close</button>`;
      document.body.appendChild(modal);
    }
  </script>
</body>
</html>
```

**Source:** [Cloudflare Turnstile Client-Side Rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)

### Sitemap.xml Generation

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://tamtham.com/</loc>
    <lastmod>2026-03-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tamtham.com/pages/danny.html</loc>
    <lastmod>2026-03-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tamtham.com/pages/helen.html</loc>
    <lastmod>2026-03-13</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Source:** [Sitemap Protocol Specification](https://www.sitemaps.org/protocol.html)

### robots.txt Configuration

```txt
# Tam-Tham Website robots.txt
# Generated: 2026-03-13

User-agent: *
Allow: /

# Disallow admin or private paths (if any)
# Disallow: /private/

Sitemap: https://tamtham.com/sitemap.xml
```

**Source:** [Google robots.txt Introduction](https://developers.google.com/search/docs/crawling-indexing/robots/introduction)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| reCAPTCHA v2 | Cloudflare Turnstile | Project decision | Less intrusive, better UX |
| Google Fonts CDN | Self-hosted WOFF2 | Project decision | Improved privacy, no external requests |
| Meta tag CSP | HTTP header CSP | Security best practice | Cannot be overridden by attackers |
| Dynamic sitemap | Static sitemap.xml | Static site architecture | Simpler, no build overhead |

**Deprecated/outdated:**
- **reCAPTCHA:** Turnstile is the chosen alternative
- **Google Fonts:** Violates privacy and performance requirements
- **unsafe-eval in CSP:** Not needed for this project, avoid for security

## Open Questions

1. **CSP Nonce Implementation**
   - What we know: Turnstile supports nonce-based CSP with strict-dynamic
   - What's unclear: Whether nonce implementation adds meaningful value for this static site
   - Recommendation: Start with `unsafe-inline` for simplicity, migrate to nonce if security requirements increase

2. **Favicon Format Selection**
   - What we know: ICO, PNG (16x16, 32x32), and Apple Touch Icon are standard
   - What's unclear: Whether SVG favicon is widely supported
   - Recommendation: Generate ICO + PNG variants, skip SVG for now

3. **Sitemap Update Frequency**
   - What we know: Sitemap should reflect current page structure
   - What's unclear: Whether to include lastmod dates or regenerate on every deploy
   - recommendation: Use static sitemap with current date, regenerate on each deployment

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None required (manual verification) |
| Config file | N/A — manual verification commands |
| Quick run command | `curl -I https://tamtham.com` |
| Full suite command | See verification commands below |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| SEC-01 | HSTS header present | unit | `curl -I https://tamtham.com | grep -i strict-transport-security` | ❌ Wave 0 |
| SEC-02 | CSP header present with Turnstile allowlist | unit | `curl -I https://tamtham.com | grep -i content-security-policy` | ❌ Wave 0 |
| SEC-03 | X-Content-Type-Options: nosniff | unit | `curl -I https://tamtham.com | grep -i x-content-type-options` | ❌ Wave 0 |
| SEC-04 | X-Frame-Options: DENY | unit | `curl -I https://tamtham.com | grep -i x-frame-options` | ❌ Wave 0 |
| SEC-05 | Referrer-Policy header present | unit | `curl -I https://tamtham.com | grep -i referrer-policy` | ❌ Wave 0 |
| SEO-01 | sitemap.xml accessible and valid | unit | `curl -I https://tamtham.com/sitemap.xml` | ❌ Wave 0 |
| SEO-02 | robots.txt accessible with sitemap reference | unit | `curl https://tamtham.com/robots.txt | grep -i sitemap` | ❌ Wave 0 |
| SEO-03 | Favicon variants present | unit | `curl -I https://tamtham.com/favicon.ico` | ❌ Wave 0 |
| SEO-04 | Semantic HTML landmarks present | manual | View page source, check for `<nav>`, `<main>`, `<footer>` | ❌ Wave 0 |
| SEO-05 | Proper heading hierarchy | manual | View page source, verify h1 → h2 → h3 sequence | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `curl -I https://tamtham.com` (header verification)
- **Per wave merge:** Full suite of 10 verification commands
- **Phase gate:** All 10 requirements verified green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `staticwebapp.config.json` — SEC-01 through SEC-05
- [ ] `sitemap.xml` — SEO-01
- [ ] `robots.txt` — SEO-02
- [ ] `assets/images/favicons/` — SEO-03
- [ ] Manual verification checklist for SEO-04 and SEO-05

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

## Sources

### Primary (HIGH confidence)
- [Azure Static Web Apps Configuration Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration) - globalHeaders, routes, responseOverrides
- [Cloudflare Turnstile CSP Documentation](https://developers.cloudflare.com/turnstile/reference/content-security-policy/) - script-src, frame-src requirements
- [Sitemap Protocol Specification](https://www.sitemaps.org/protocol.html) - XML schema, required elements
- [Google Search Central - Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) - sitemap best practices

### Secondary (MEDIUM confidence)
- [Cloudflare Turnstile Client-Side Rendering](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) - widget implementation patterns
- [Google robots.txt Introduction](https://developers.google.com/search/docs/crawling-indexing/robots/introduction) - robots.txt syntax

### Tertiary (LOW confidence)
- N/A — All critical findings verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries and configuration formats verified with official docs
- Architecture: HIGH - Patterns based on Azure SWA and Cloudflare official documentation
- Pitfalls: HIGH - Common issues documented in official troubleshooting guides

**Research date:** 2026-03-13  
**Valid until:** 2026-04-12 (30 days for stable Azure SWA and Cloudflare APIs)
