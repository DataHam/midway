# Tam-Tham Website Implementation Plan

**Analysis Date:** 2026-03-12  
**Based on:** [`tamthamSite.md`](C:\Users\DannyTam-Tham\OneDrive - Tam-Tham\Projects\Corporation\Downloads\tamthamSite.md)  
**Current State:** Partial implementation exists in [`Downloads/tamtham.com/`](C:\Users\DannyTam-Tham\OneDrive - Tam-Tham\Projects\Corporation\Downloads\tamtham.com)

---

## Executive Summary

This plan outlines the complete implementation of a professional personal landing page for **tamtham.com**, featuring:
- Azure Static Web Apps hosting with Cloudflare DNS
- Cloudflare Turnstile CAPTCHA gates for secure subdomain access
- Biography pages for Danny and Helen Tam-Tham
- Cloudflare Tunnels for home server subdomains
- Doppler secrets management with GitHub Actions CI/CD

**Key Gaps Identified:**
1. Current `index.html` is a digital business card, not the full landing page
2. Missing biography pages (`danny.html`, `helen.html`)
3. Missing CAPTCHA gate pages (`verify-danny.html`, `verify-helen.html`)
4. Missing Azure Functions API for Turnstile validation
5. Missing `staticwebapp.config.json` with security headers
6. Missing Tailwind CSS build pipeline
7. Missing Cloudflare Tunnel setup documentation

---

## Project Structure

```
tamtham.com/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml          # CI/CD pipeline with Doppler
├── api/                                        # Azure Functions (SWA API)
│   ├── verify-danny/
│   │   ├── function.json
│   │   └── index.js                           # Turnstile validation + redirect
│   └── verify-helen/
│       ├── function.json
│       └── index.js                           # Turnstile validation + redirect
├── assets/
│   ├── images/
│   │   ├── TamThamLogo.webp                   # Converted from PNG
│   │   ├── HDMain.webp                        # Hero image (no lazy-load)
│   │   ├── DannySquareProfile.webp            # Danny bio
│   │   ├── HelenSquareProfile.webp            # Helen bio
│   │   └── favicons/                          # .ico, .png variants
│   └── fonts/
│       └── Montserrat/                        # Self-hosted WOFF2
├── pages/
│   ├── index.html                             # Home/landing page
│   ├── danny.html                             # Danny biography
│   ├── helen.html                             # Helen biography
│   ├── verify-danny.html                      # CAPTCHA gate → danny.tamtham.com
│   └── verify-helen.html                      # CAPTCHA gate → helen.tamtham.com
├── css/
│   └── styles.css                             # Compiled Tailwind output
├── js/
│   └── main.js                                # Client-side Turnstile widget
├── staticwebapp.config.json                   # SWA routing + security headers
├── sitemap.xml                                # SEO sitemap
├── robots.txt                                 # Search engine directives
├── tailwind.config.js                         # Tailwind with custom brand colors
├── postcss.config.js                          # PostCSS for Tailwind
├── package.json                               # Build dependencies
├── README.md                                  # Project documentation
└── .gitignore                                 # Excluded files
```

---

## Design System (Strict Adherence Required)

### Color Palette (from Tam-Tham Logo Guideline 2021)

| Role | Hex | Usage |
|------|-----|-------|
| Primary Navy | `#103248` | Headers, primary text, nav |
| Primary Yellow | `#F0D04C` | CTAs, highlights, accents |
| Secondary Teal | `#7DC2B6` | Subtitles, secondary CTAs |
| Secondary Red | `#D64E34` | Alerts, important notices |
| Secondary Blue | `#385C8F` | Links, hover states |
| Secondary Grey | `#535A60` | Body text, meta info |

### Typography

- **Font Family:** Montserrat (self-hosted WOFF2, no Google Fonts CDN)
- **Headers:** Bold (700)
- **Accents/Buttons:** SemiBold (600)
- **Body:** Regular (400)

### Asset Requirements

1. **Hero Image:** `HDMain.webp` - No lazy-load, explicit width/height
2. **Profile Images:** `DannySquareProfile.webp`, `HelenSquareProfile.webp` - Lazy-loaded
3. **Logo:** `TamThamLogo.webp` - Responsive srcset
4. **Favicons:** Multiple sizes (.ico, .png, apple-touch-icon)

**Performance Requirements:**
- Convert all images to WebP (optional AVIF with fallback)
- Use `srcset`/`sizes` for responsive images
- Set explicit `width`/`height` to prevent CLS
- Below-fold images: `loading="lazy"`
- Hero image: no lazy-load

---

## Page Specifications

### 1. Home Page (`index.html`)

**Sections:**
1. **Hero Section**
   - Background: `HDMain.jpg` (converted to WebP)
   - Overlay: Gradient for text readability
   - Logo: `TamThamLogo.png` centered
   - Headline: "Tam-Tham Consulting & Research"

2. **Navigation Grid** (4 cards)
   - "Danny's Biography" → `/danny.html`
   - "Helen's Biography" → `/helen.html`
   - "Contact Danny" → `/verify-danny.html` (NOT direct subdomain link)
   - "Contact Helen" → `/verify-helen.html` (NOT direct subdomain link)

3. **Footer**
   - Copyright notice
   - Social links (LinkedIn)
   - Contact email: info@tamtham.com

**SEO Requirements:**
- `<title>`: "Tam-Tham | Consulting & Research"
- `<meta name="description">`: Professional summary
- OpenGraph tags (og:title, og:description, og:image)
- Twitter Card tags
- `sitemap.xml` entry
- `robots.txt` allow

**Accessibility Requirements:**
- Alt text on all images
- Focus states on all interactive elements
- Keyboard navigation (Tab order)
- Heading hierarchy (h1 → h2 → h3)
- Contrast ratio ≥ 4.5:1 for text

---

### 2. Danny Biography (`danny.html`)

**Content:**
```markdown
Header:
- Name: Danny Tam-Tham
- Credentials: BSc, MBA
- Role: Principal Consultant, Tam-Tham Consulting

Contact Section:
- Phone: [redacted]
- Email: [redacted]
- LinkedIn: https://www.linkedin.com/in/danny-tam-tham/

Image:
- DannySquareProfile.jpg (WebP)

Consulting Services Section:
- Cloud Modernization
- Executive Advisory
- Software Portfolio Audits
- Zero Trust Security
- IT Governance

Key Successes & Core Skills Section:
- **Successes:** Moved organizations to Microsoft 365, managed IT for 17,000+ endpoints, and cut software costs.
- **Skills:** IT Strategy & Budgeting (MBA), Microsoft 365, Zero Trust Network Access, Change Management, ITIL v4.

Action Button:
- "Download CV" → `/assets/cv-danny.pdf` (placeholder)

IMPORTANT: NO "Book a Meeting" or meeting booking links
```

---

### 3. Helen Biography (`helen.html`)

**Content:**
```markdown
Header:
- Name: Helen Tam-Tham
- Credentials: MD, PhD
- Role: Physician Researcher, Alberta Health Services

Contact Section:
- Phone: [redacted]
- Email: [redacted]
- LinkedIn: https://www.linkedin.com/in/helentamtham/
- Google Scholar: https://scholar.google.com/citations?user=Z9t8DPoAAAAJ&hl=en

Image:
- HelenSquareProfile.jpg (WebP)

Selected Research Section:
- [Placeholder] Publication 1
- [Placeholder] Publication 2
- [Placeholder] Publication 3

Action Button:
- "Download CV" → `/assets/cv-helen.pdf` (placeholder)
```

---

### 4. CAPTCHA Gate Pages (`verify-danny.html`, `verify-helen.html`)

**Critical Security Requirement:** These pages implement Cloudflare Turnstile before allowing navigation to subdomains.

**Client-Side (JavaScript):**
```html
<!-- Load Turnstile script -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<!-- Widget container -->
<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>

<!-- Form submission -->
<form id="turnstile-form">
  <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY" data-callback="submitVerification"></div>
  <button type="submit">Continue</button>
</form>

<script>
async function submitVerification(token) {
  const response = await fetch('/api/verify-danny', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  if (response.ok) {
    window.location.href = 'https://danny.tamtham.com';
  } else {
    alert('Verification failed. Please try again.');
  }
}
</script>
```

**Server-Side (Azure Function `/api/verify-danny/index.js`):**
```javascript
export async function functionRequest(context, req) {
  const { token } = await req.body;
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET;
  
  const validationResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    }
  );
  
  const validation = await validationResponse.json();
  
  if (validation.success) {
    context.res = {
      status: 302,
      headers: { Location: 'https://danny.tamtham.com' }
    };
  } else {
    context.res = {
      status: 403,
      body: 'Verification failed'
    };
  }
}
```

**Security Notes:**
- Tokens are single-use, expire after 5 minutes
- Server-side validation is **mandatory** (never trust client-side)
- Do not proxy/cache `api.js` from Cloudflare
- Log basic success/failure events (no secrets in logs)

---

## DevOps & Security Stack

### 1. Secrets Management (Doppler)

**Required Secrets:**
```bash
# Azure Static Web Apps
AZURE_STATIC_WEB_APPS_API_TOKEN

# Cloudflare Turnstile
CLOUDFLARE_TURNSTILE_SITE_KEY
CLOUDFLARE_TURNSTILE_SECRET

# Cloudflare API (for DNS management)
CLOUDFLARE_API_TOKEN

# Optional: Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN
```

**Doppler Setup Commands:**
```bash
# Create project
doppler projects create tamtham-website

# Create environments
doppler environments create dev
doppler environments create prod

# Add secrets
doppler secrets create AZURE_STATIC_WEB_APPS_API_TOKEN --value <token> --env prod
doppler secrets create CLOUDFLARE_TURNSTILE_SITE_KEY --value <sitekey> --env prod
doppler secrets create CLOUDFLARE_TURNSTILE_SECRET --value <secret> --env prod

# Download secrets locally for testing
doppler secrets download --env dev --output-format shell > .env
```

**Security Best Practices:**
- Never commit `.env` files
- Use Doppler GitHub Actions integration for CI/CD
- Rotate secrets quarterly
- Use least-privilege tokens

---

### 2. GitHub Actions Workflow

**File:** `.github/workflows/azure-static-web-apps.yml`

```yaml
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
    name: Build and Deploy
    permissions:
      contents: read
      actions: write
      id-token: write
    
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          lfs: false
      
      - name: Fetch Doppler Secrets
        uses: dopplerhq/secrets-fetch-action@v1.3.0
        with:
          doppler-token: ${{ secrets.DOPPLER_GH_ACTION }}
          project: tamtham-website
          config: prod
          env-vars-output: DOPPLER_SECRETS
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Build Tailwind CSS
        run: npm run build
      
      - name: Build and Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: "/"
          skip_app_build: true
      
      - name: Close Pull Request
        if: github.event_name == 'pull_request' && github.event.action == 'closed'
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

**Workflow Security Hardening:**
- Pin action versions (`@v4`, `@v1.3.0`)
- Use `id-token: write` for OIDC authentication (if using Doppler OIDC)
- Apply least-privilege permissions
- Use Doppler for secrets injection (not GitHub Secrets directly)

---

### 3. Azure Static Web Apps Configuration

**File:** `staticwebapp.config.json`

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "/assets/*", "*.css", "*.js"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com;",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "x-xss-protection": "1; mode=block",
    "referrer-policy": "strict-origin-when-cross-origin"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".webp": "image/webp",
    ".woff2": "font/woff2"
  }
}
```

**Security Headers Explained:**
- **HSTS:** Enforce HTTPS for 1 year, preload list
- **CSP:** Restrict script sources (allow Cloudflare Turnstile), block inline scripts except Turnstile
- **X-Content-Type-Options:** Prevent MIME sniffing
- **X-Frame-Options:** Prevent clickjacking
- **X-XSS-Protection:** Legacy XSS filter
- **Referrer-Policy:** Limit referrer information

---

### 4. Cloudflare Configuration

#### DNS Setup

**Records:**
```
Type    Name                Value/Target                    Proxy Status
A       @                   <Azure SWA IP>                  Proxied (Orange Cloud)
CNAME   danny               <Cloudflare Tunnel ID>.trycloudflare.com  Proxied
CNAME   helen               <Cloudflare Tunnel ID>.trycloudflare.com  Proxied
```

**Note:** Azure SWA provides a CNAME for custom domains (not A record). Use the CNAME provided in Azure SWA portal.

#### Cloudflare Tunnel Configuration

**Step 1: Install cloudflared on Home Server**
```powershell
# Download cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"

# Create config directory
New-Item -ItemType Directory -Force -Path "C:\cloudflared"
```

**Step 2: Create Tunnel in Cloudflare Dashboard**
1. Go to **Network** → **Zero Trust** → **Tunnels**
2. Click **Create a tunnel**
3. Choose **cloudflared** as connector type
4. Name: `tamtham-home-server`
5. Select **Public Hostname**
6. Add subdomain:
   - Subdomain: `danny`
   - Domain: `tamtham.com`
   - Service: `http://localhost:8080` (Danny's home server port)
   - Enable **HTTP Host Header Override**: `danny.tamtham.com`
7. Add subdomain:
   - Subdomain: `helen`
   - Domain: `tamtham.com`
   - Service: `http://localhost:8081` (Helen's home server port)
   - Enable **HTTP Host Header Override**: `helen.tamtham.com`

**Step 3: Run cloudflared Service**
```powershell
# Install as Windows Service
.\cloudflared.exe service install <TUNNEL_TOKEN>

# Verify service
.\cloudflared.exe service status
```

**Step 4: Configure Cloudflare Security**
1. **Bot Fight Mode:** Enable (free tier)
2. **WAF Rules:** Create rules to block known bot patterns
3. **Cache Rules:** Use modern Cache Rules (not Page Rules)
   - Cache static assets (`/assets/*`, `*.css`, `*.js`, `*.webp`) for 1 month
   - Don't cache API endpoints (`/api/*`)
   - Don't cache dynamic pages (`/verify-*`)

---

## Build Pipeline

### Dependencies (`package.json`)

```json
{
  "name": "tamtham-website",
  "version": "1.0.0",
  "description": "Tam-Tham personal landing page",
  "scripts": {
    "dev": "npx tailwindcss -i ./pages/index.html -o ./css/styles.css --watch",
    "build": "npx tailwindcss -i ./pages/index.html -o ./css/styles.css --minify",
    "optimize-images": "node scripts/optimize-images.js",
    "generate-sitemap": "node scripts/generate-sitemap.js"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4"
  }
}
```

### Tailwind Configuration (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'primary-navy': '#103248',
        'primary-yellow': '#F0D04C',
        'secondary-teal': '#7DC2B6',
        'secondary-red': '#D64E34',
        'secondary-blue': '#385C8F',
        'secondary-grey': '#535A60'
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif']
      }
    }
  },
  plugins: []
}
```

### PostCSS Configuration (`postcss.config.js`)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

---

## Image Optimization Script

**File:** `scripts/optimize-images.js`

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const images = [
  { src: 'HDMain.jpg', dest: 'HDMain.webp', lazy: false },
  { src: 'DannySquareProfile.jpg', dest: 'DannySquareProfile.webp', lazy: true },
  { src: 'HelenSquareProfile.jpg', dest: 'HelenSquareProfile.webp', lazy: true },
  { src: 'TamThamLogo.png', dest: 'TamThamLogo.webp', lazy: false }
];

const assetsDir = path.join(__dirname, '..', 'assets', 'images');

images.forEach(({ src, dest, lazy }) => {
  const srcPath = path.join(assetsDir, src);
  const destPath = path.join(assetsDir, dest);
  
  if (fs.existsSync(srcPath)) {
    console.log(`Converting ${src} to ${dest}...`);
    execSync(`npx sharp "${srcPath}" -o "${destPath}"`);
    
    // Generate responsive variants
    [375, 768, 1024, 1920].forEach(width => {
      const variantPath = path.join(assetsDir, `${dest.replace('.webp', `-${width}.webp`)}`);
      execSync(`npx sharp "${srcPath}" -w ${width} -o "${variantPath}"`);
    });
    
    console.log(`✓ ${dest} created with responsive variants`);
  } else {
    console.warn(`⚠ ${src} not found at ${srcPath}`);
  }
});

console.log('Image optimization complete!');
```

**Installation:**
```bash
npm install --save-dev sharp
```

---

## Sitemap & Robots.txt

### Sitemap (`sitemap.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tamtham.com/</loc>
    <lastmod>2026-03-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tamtham.com/danny.html</loc>
    <lastmod>2026-03-12</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tamtham.com/helen.html</loc>
    <lastmod>2026-03-12</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Robots.txt (`robots.txt`)

```
User-agent: *
Allow: /

Sitemap: https://tamtham.com/sitemap.xml

# Disallow API endpoints
Disallow: /api/
```

---

## Implementation Checklist

### Phase 1: Foundation (Day 1-2)

- [ ] Create repository structure
- [ ] Initialize npm project
- [ ] Configure Tailwind CSS
- [ ] Set up Doppler project and environments
- [ ] Add secrets to Doppler
- [ ] Create GitHub Actions workflow
- [ ] Test local build pipeline

### Phase 2: Content Pages (Day 3-4)

- [ ] Create `index.html` with hero section
- [ ] Create `danny.html` biography page
- [ ] Create `helen.html` biography page
- [ ] Optimize and convert images to WebP
- [ ] Add responsive image variants
- [ ] Implement Tailwind styling
- [ ] Test accessibility (keyboard, contrast, alt text)

### Phase 3: CAPTCHA Gate (Day 5-6)

- [ ] Create `verify-danny.html`
- [ ] Create `verify-helen.html`
- [ ] Set up Cloudflare Turnstile (get site key + secret)
- [ ] Create Azure Functions API (`/api/verify-danny`, `/api/verify-helen`)
- [ ] Implement server-side token validation
- [ ] Test Turnstile widget and redirect flow
- [ ] Add rate limiting to API endpoints

### Phase 4: Configuration (Day 7)

- [ ] Create `staticwebapp.config.json` with security headers
- [ ] Generate `sitemap.xml`
- [ ] Create `robots.txt`
- [ ] Add favicon set
- [ ] Add OpenGraph and Twitter meta tags
- [ ] Configure PostCSS build

### Phase 5: Cloudflare Setup (Day 8)

- [ ] Configure Cloudflare DNS records
- [ ] Set up Cloudflare Tunnel
- [ ] Configure cloudflared on home server
- [ ] Enable Bot Fight Mode
- [ ] Create Cache Rules (modern Rules product)
- [ ] Test subdomain routing

### Phase 6: Azure SWA Deployment (Day 9)

- [ ] Create Azure Static Web App resource
- [ ] Configure custom domain (tamtham.com)
- [ ] Set up SSL certificate
- [ ] Add GitHub repository connection
- [ ] Test CI/CD deployment
- [ ] Verify security headers in production

### Phase 7: Testing & Launch (Day 10)

- [ ] End-to-end testing of all pages
- [ ] Test CAPTCHA gate flow
- [ ] Verify subdomain redirects
- [ ] Performance testing (Lighthouse)
- [ ] Accessibility audit (axe, WAVE)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness testing
- [ ] Final Doppler secret rotation
- [ ] Launch and monitor

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Turnstile token validation fails | Users blocked from subdomains | Implement client-side fallback with manual verification step |
| Azure Functions cold start latency | Delayed redirect | Use Premium plan or provisioned instances |
| Cloudflare Tunnel disconnects | Subdomains unavailable | Configure auto-restart service, monitor with Cloudflare dashboard |
| Image optimization fails | Slow page load | Provide JPEG fallbacks, use Cloudflare Polish |
| CSP blocks legitimate resources | Broken functionality | Use CSP report-only mode during development |
| Doppler token expires | CI/CD breaks | Set token expiration alerts, use OIDC if available |

---

## Monitoring & Maintenance

### Key Metrics to Track

1. **Performance:**
   - Lighthouse score (target: 90+ on all metrics)
   - Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

2. **Security:**
   - CSP violation reports
   - Turnstile failure rate
   - API rate limiting events

3. **Availability:**
   - Azure SWA uptime
   - Cloudflare Tunnel status
   - Subdomain accessibility

### Maintenance Schedule

- **Weekly:** Check Cloudflare dashboard for errors
- **Monthly:** Rotate Doppler secrets, review CSP reports
- **Quarterly:** Update dependencies, audit security headers
- **Annually:** Review and update content, refresh images

---

## Success Criteria

**Technical:**
- [ ] All pages load without console errors
- [ ] CAPTCHA gate blocks unverified users
- [ ] Security headers present and valid
- [ ] Images optimized (WebP, responsive)
- [ ] CI/CD deploys on every push to main
- [ ] Subdomains accessible via Cloudflare Tunnel

**UX:**
- [ ] All navigation links work correctly
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Performance score > 90 (Lighthouse)

**Security:**
- [ ] No secrets in source control
- [ ] Turnstile tokens validated server-side
- [ ] CSP prevents XSS attacks
- [ ] HSTS enforced

---

## Appendix A: Cloudflare Turnstile Setup

1. **Create Turnstile Site Key:**
   - Go to Cloudflare Dashboard → Turnstile
   - Click "Add Site"
   - Enter domain: `tamtham.com`
   - Select widget type: "Non-interactive" or "Invisible"
   - Copy Site Key and Secret Key

2. **Add to Doppler:**
   ```bash
   doppler secrets create CLOUDFLARE_TURNSTILE_SITE_KEY --value <sitekey> --env prod
   doppler secrets create CLOUDFLARE_TURNSTILE_SECRET --value <secret> --env prod
   ```

3. **Test Locally:**
   ```bash
   doppler run -- npm run dev
   ```

---

## Appendix B: Azure Functions API Structure

**File Layout:**
```
api/
├── verify-danny/
│   ├── function.json
│   ├── index.js
│   └── host.json
└── verify-helen/
    ├── function.json
    ├── index.js
    └── host.json
```

**function.json:**
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "method": "post",
      "name": "req"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ]
}
```

**host.json:**
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  }
}
```

---

## Appendix C: Environment Variables Reference

| Variable | Purpose | Source |
|----------|---------|--------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure SWA deployment | Azure Portal |
| `DOPPLER_GH_ACTION` | GitHub Actions authentication | Doppler Dashboard |
| `CLOUDFLARE_TURNSTILE_SITE_KEY` | Turnstile widget ID | Cloudflare Dashboard |
| `CLOUDFLARE_TURNSTILE_SECRET` | Turnstile validation | Cloudflare Dashboard |
| `CLOUDFLARE_API_TOKEN` | Cloudflare DNS management | Cloudflare Dashboard |
| `CLOUDFLARE_TUNNEL_TOKEN` | Cloudflared authentication | Cloudflare Zero Trust |

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-12  
**Next Review:** 2026-04-12
