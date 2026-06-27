# Tam-Tham Website Codebase Structure

**Analysis Date:** 2026-03-12  
**Based on:** `tamthamSite.md` requirements and existing files in `Downloads/tamtham.com/`

---

## Current State Assessment

### Existing Files

| File | Location | Status | Action Required |
|------|----------|--------|-----------------|
| `index.html` | `Downloads/tamtham.com/` | ✅ Exists | ⚠️ Replace with full landing page |
| `logo.svg` | `Downloads/tamtham.com/` | ✅ Exists | ⚠️ Convert to WebP + keep SVG |
| `LogoOnly.png` | `Downloads/tamtham.com/` | ✅ Exists | ⚠️ Convert to WebP |
| `danny.jpeg` | `Downloads/tamtham.com/` | ⚠️ Wrong format | ✅ Convert to WebP |
| `danny.vcf` | `Downloads/tamtham.com/` | ✅ Exists | ℹ️ Keep for download |
| `.github/workflows/azure-static-web-apps-red-mud-03ec6f910.yml` | `Downloads/tamtham.com/.github/workflows/` | ⚠️ Generic name | ✅ Rename + update |
| `README.md` | `Downloads/tamtham.com/` | ⚠️ Outdated | ✅ Update with new structure |

### Missing Files (Critical)

- ❌ `danny.html` - Biography page
- ❌ `helen.html` - Biography page
- ❌ `verify-danny.html` - CAPTCHA gate
- ❌ `verify-helen.html` - CAPTCHA gate
- ❌ `staticwebapp.config.json` - SWA configuration
- ❌ `api/verify-danny/` - Azure Function
- ❌ `api/verify-helen/` - Azure Function
- ❌ `tailwind.config.js` - Tailwind configuration
- ❌ `postcss.config.js` - PostCSS configuration
- ❌ `package.json` - NPM dependencies
- ❌ `sitemap.xml` - SEO sitemap
- ❌ `robots.txt` - Search engine directives
- ❌ `assets/images/` - Image directory structure
- ❌ `assets/fonts/Montserrat/` - Self-hosted fonts

---

## Recommended Project Structure

```
tamtham.com/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml          # CI/CD pipeline
├── api/
│   ├── verify-danny/
│   │   ├── function.json                     # Azure Function config
│   │   ├── index.js                          # Turnstile validation
│   │   └── host.json                         # Runtime config
│   └── verify-helen/
│       ├── function.json
│       ├── index.js
│       └── host.json
├── assets/
│   ├── images/
│   │   ├── favicons/
│   │   │   ├── favicon.ico
│   │   │   ├── favicon-16x16.png
│   │   │   ├── favicon-32x32.png
│   │   │   ├── apple-touch-icon-180x180.png
│   │   │   └── android-chrome-192x192.png
│   │   ├── TamThamLogo.webp                  # Primary logo (WebP)
│   │   ├── TamThamLogo.png                   # Fallback (PNG)
│   │   ├── HDMain.webp                       # Hero image (no lazy-load)
│   │   ├── HDMain-375.webp                   # Responsive variant
│   │   ├── HDMain-768.webp
│   │   ├── HDMain-1024.webp
│   │   ├── HDMain-1920.webp
│   │   ├── DannySquareProfile.webp           # Danny profile (lazy)
│   │   ├── DannySquareProfile-400.webp
│   │   ├── DannySquareProfile-800.webp
│   │   ├── HelenSquareProfile.webp           # Helen profile (lazy)
│   │   ├── HelenSquareProfile-400.webp
│   │   └── HelenSquareProfile-800.webp
│   ├── fonts/
│   │   └── Montserrat/
│   │       ├── Montserrat-Bold.woff2         # Headers
│   │       ├── Montserrat-SemiBold.woff2     # Buttons, accents
│   │       └── Montserrat-Regular.woff2      # Body text
│   └── documents/
│       ├── cv-danny.pdf                      # Placeholder
│       └── cv-helen.pdf                      # Placeholder
├── pages/
│   ├── index.html                            # Home/landing page
│   ├── danny.html                            # Danny biography
│   ├── helen.html                            # Helen biography
│   ├── verify-danny.html                     # CAPTCHA gate
│   └── verify-helen.html                     # CAPTCHA gate
├── css/
│   └── styles.css                            # Compiled Tailwind (gitignored)
├── js/
│   ├── main.js                               # Global utilities
│   └── turnstile.js                          # Turnstile widget logic
├── scripts/
│   ├── optimize-images.js                    # Image conversion script
│   └── generate-sitemap.js                   # Sitemap generator
├── .gitignore                                # Excluded files
├── .gitattributes                            # Git LFS config (if needed)
├── README.md                                 # Project documentation
├── LICENSE                                   # License file
├── package.json                              # NPM dependencies
├── tailwind.config.js                        # Tailwind customization
├── postcss.config.js                         # PostCSS plugins
├── staticwebapp.config.json                  # SWA routing + headers
├── sitemap.xml                               # SEO sitemap
└── robots.txt                                # Search engine directives
```

---

## Directory Purposes

### `.github/workflows/`
**Purpose:** CI/CD automation for Azure Static Web Apps  
**Contains:** GitHub Actions workflow files  
**Key Files:**
- `azure-static-web-apps.yml` - Main deployment pipeline
- **Add:** `security-audit.yml` (optional, runs on PR)

**Guidelines:**
- Pin all action versions (e.g., `@v4`, not `@latest`)
- Use Doppler for secrets injection
- Apply least-privilege permissions
- Include `id-token: write` for OIDC if using Doppler OIDC

---

### `api/`
**Purpose:** Azure Functions for server-side Turnstile validation  
**Contains:** Serverless API endpoints  
**Key Files:**
- `verify-danny/function.json` - Function configuration
- `verify-danny/index.js` - Turnstile validation logic
- `verify-helen/function.json` - Function configuration
- `verify-helen/index.js` - Turnstile validation logic

**Guidelines:**
- Use Node.js 18+ runtime
- Implement server-side token validation (never trust client)
- Return 302 redirect on success, 403 on failure
- Log basic events (no secrets in logs)
- Apply rate limiting (configure in `host.json` or Cloudflare)

---

### `assets/`
**Purpose:** Static assets (images, fonts, documents)  
**Contains:** Optimized media files  
**Key Files:**
- `images/` - WebP images with responsive variants
- `fonts/Montserrat/` - Self-hosted WOFF2 fonts
- `documents/` - CV PDFs, vCard files

**Guidelines:**
- Convert all images to WebP (optional AVIF with fallback)
- Generate responsive variants using `srcset`
- Set explicit `width`/`height` to prevent CLS
- Hero image: no lazy-load
- Below-fold images: `loading="lazy"`
- Self-host fonts (no Google Fonts CDN)
- Optimize with tools: `sharp`, `svgo`, `woff2cropper`

---

### `pages/`
**Purpose:** HTML templates for all pages  
**Contains:** Static HTML files with inline Tailwind classes  
**Key Files:**
- `index.html` - Home/landing page
- `danny.html` - Danny biography
- `helen.html` - Helen biography
- `verify-danny.html` - CAPTCHA gate page
- `verify-helen.html` - CAPTCHA gate page

**Guidelines:**
- Use semantic HTML5 elements (`<header>`, `<main>`, `<footer>`)
- Maintain proper heading hierarchy (`h1` → `h2` → `h3`)
- Include all SEO meta tags (OpenGraph, Twitter, description)
- Add accessibility attributes (`alt`, `aria-label`, `role`)
- Use Tailwind utility classes inline (or compile separate CSS)
- Include Cloudflare Turnstile script on gate pages

---

### `css/`
**Purpose:** Compiled CSS output  
**Contains:** Minified Tailwind CSS  
**Key Files:**
- `styles.css` - Compiled output (gitignored)

**Guidelines:**
- Do not commit compiled CSS to git
- Generate via `npm run build`
- Configure in `postcss.config.js`
- Use `--minify` flag for production

---

### `js/`
**Purpose:** Client-side JavaScript  
**Contains:** Interactive functionality  
**Key Files:**
- `main.js` - Global utilities (analytics, form handling)
- `turnstile.js` - Turnstile widget initialization

**Guidelines:**
- Use ES modules (`<script type="module">`)
- Avoid inline scripts (CSP compliance)
- Handle Turnstile callback asynchronously
- Add error handling for API failures

---

### `scripts/`
**Purpose:** Build automation scripts  
**Contains:** Node.js utility scripts  
**Key Files:**
- `optimize-images.js` - Image conversion to WebP
- `generate-sitemap.js` - Sitemap generation

**Guidelines:**
- Use `sharp` for image optimization
- Generate responsive variants automatically
- Include lastmod dates in sitemap
- Validate XML before deployment

---

## Key File Locations

### Entry Points

| File | Purpose | Location |
|------|---------|----------|
| `pages/index.html` | Home/landing page | `/pages/index.html` |
| `pages/danny.html` | Danny biography | `/pages/danny.html` |
| `pages/helen.html` | Helen biography | `/pages/helen.html` |
| `pages/verify-danny.html` | CAPTCHA gate (Danny) | `/pages/verify-danny.html` |
| `pages/verify-helen.html` | CAPTCHA gate (Helen) | `/pages/verify-helen.html` |

### Configuration

| File | Purpose | Location |
|------|---------|----------|
| `tailwind.config.js` | Tailwind customization | `/tailwind.config.js` |
| `postcss.config.js` | PostCSS plugins | `/postcss.config.js` |
| `package.json` | NPM dependencies | `/package.json` |
| `staticwebapp.config.json` | SWA routing + headers | `/staticwebapp.config.json` |
| `.gitignore` | Git exclusions | `/.gitignore` |

### Core Logic

| File | Purpose | Location |
|------|---------|----------|
| `api/verify-danny/index.js` | Turnstile validation (Danny) | `/api/verify-danny/index.js` |
| `api/verify-helen/index.js` | Turnstile validation (Helen) | `/api/verify-helen/index.js` |
| `js/turnstile.js` | Turnstile widget logic | `/js/turnstile.js` |

### Testing

| File | Purpose | Location |
|------|---------|----------|
| `scripts/optimize-images.js` | Image optimization | `/scripts/optimize-images.js` |
| `scripts/generate-sitemap.js` | Sitemap generation | `/scripts/generate-sitemap.js` |

**Note:** No formal test suite required for static site, but use scripts for validation.

---

## Naming Conventions

### Files

| Pattern | Example | Purpose |
|---------|---------|---------|
| `kebab-case.html` | `verify-danny.html` | HTML pages |
| `kebab-case.js` | `turnstile.js` | JavaScript files |
| `kebab-case.config.js` | `tailwind.config.js` | Configuration files |
| `PascalCase` | `TamThamLogo.webp` | Assets with brand name |
| `kebab-case-<width>.webp` | `HDMain-768.webp` | Responsive image variants |

### Directories

| Pattern | Example | Purpose |
|---------|---------|---------|
| `lowercase/` | `assets/images/` | Asset folders |
| `lowercase/` | `api/verify-danny/` | Azure Functions |
| `.github/` | `.github/workflows/` | GitHub-specific |

### Variables (JavaScript)

| Pattern | Example | Purpose |
|---------|---------|---------|
| `camelCase` | `turnstileSiteKey` | Variables, functions |
| `UPPER_SNAKE_CASE` | `CLOUDFLARE_TURNSTILE_SECRET` | Constants, env vars |
| `PascalCase` | `TurnstileWidget` | Classes, constructors |

---

## Where to Add New Code

### New Feature (e.g., Contact Form)

**Primary Code:**
- Form HTML: `/pages/contact.html`
- Form logic: `/js/contact-form.js`
- API endpoint: `/api/contact/submit/`

**Configuration:**
- Update `staticwebapp.config.json` for routing
- Update CSP in headers if adding new domains

**Documentation:**
- Update `README.md` with feature description

---

### New Component/Module

**Implementation:**
- Component HTML: `/pages/components/` (if reusable)
- Component JS: `/js/components/`
- Component CSS: Use Tailwind utilities (no separate CSS)

**Example:**
```
pages/components/
└── bio-card.html        # Reusable bio section
```

---

### Utilities

**Shared Helpers:**
- `/js/utils/` - Utility functions
- `/scripts/` - Build scripts

**Example:**
```
js/utils/
├── analytics.js         # Google Analytics
├── CSP-report.js        # CSP violation reporting
└── image-lazy.js        # Intersection Observer for lazy-load
```

---

## Special Directories

### `.github/`
**Purpose:** GitHub-specific configuration  
**Generated:** No  
**Committed:** Yes  
**Contents:**
- `workflows/` - CI/CD pipeline files

**Guidelines:**
- Pin action versions
- Use Doppler for secrets
- Apply least-privilege permissions

---

### `api/`
**Purpose:** Azure Functions (SWA API)  
**Generated:** No  
**Committed:** Yes  
**Contents:**
- `verify-danny/` - Turnstile validation function
- `verify-helen/` - Turnstile validation function

**Guidelines:**
- Use Node.js 18+
- Implement server-side validation
- Log events (no secrets)
- Apply rate limiting

---

### `assets/fonts/`
**Purpose:** Self-hosted web fonts  
**Generated:** No (downloaded/converted)  
**Committed:** Yes  
**Contents:**
- `Montserrat/` - WOFF2 font files

**Guidelines:**
- Use WOFF2 format (best browser support)
- Include fallback to system fonts
- Optimize with `woff2cropper` or similar

---

### `css/`
**Purpose:** Compiled CSS output  
**Generated:** Yes (via `npm run build`)  
**Committed:** No (add to `.gitignore`)  
**Contents:**
- `styles.css` - Minified Tailwind output

**Guidelines:**
- Generate before deployment
- Do not commit to git
- Use `--minify` flag

---

## Build & Deployment Flow

```
1. Developer pushes to main branch
   ↓
2. GitHub Actions triggered
   ↓
3. Doppler fetches secrets
   ↓
4. npm install (dependencies)
   ↓
5. npm run build (Tailwind compile)
   ↓
6. npm run optimize-images (convert WebP)
   ↓
7. npm run generate-sitemap
   ↓
8. Azure SWA deploys to production
   ↓
9. Custom domain (tamtham.com) serves content
   ↓
10. Cloudflare proxies traffic + applies security
```

---

## Existing Files Migration Plan

### From `Downloads/tamtham.com/`

| File | Action | New Location |
|------|--------|--------------|
| `index.html` | ✅ Replace | `pages/index.html` (new content) |
| `logo.svg` | ✅ Keep | `assets/images/TamThamLogo.svg` |
| `LogoOnly.png` | ✅ Convert | `assets/images/TamThamLogo.webp` |
| `danny.jpeg` | ✅ Convert | `assets/images/DannySquareProfile.webp` |
| `danny.vcf` | ✅ Keep | `assets/documents/danny.vcf` |
| `README.md` | ✅ Update | `README.md` (new content) |

### From `Downloads/tamtham.com/.github/workflows/`

| File | Action |
|------|--------|
| `azure-static-web-apps-red-mud-03ec6f910.yml` | ✅ Rename to `azure-static-web-apps.yml` |
| | ✅ Update with Doppler integration |
| | ✅ Add security hardening |

---

## File Creation Order

### Phase 1: Foundation
1. `.gitignore`
2. `package.json`
3. `tailwind.config.js`
4. `postcss.config.js`
5. `.github/workflows/azure-static-web-apps.yml`

### Phase 2: Content
6. `pages/index.html`
7. `pages/danny.html`
8. `pages/helen.html`
9. `pages/verify-danny.html`
10. `pages/verify-helen.html`

### Phase 3: Backend
11. `api/verify-danny/function.json`
12. `api/verify-danny/index.js`
13. `api/verify-helen/function.json`
14. `api/verify-helen/index.js`

### Phase 4: Assets
15. `assets/images/` directory structure
16. Image conversion (WebP)
17. Font files (Montserrat WOFF2)
18. Favicons

### Phase 5: Configuration
19. `staticwebapp.config.json`
20. `sitemap.xml`
21. `robots.txt`
22. `README.md`

---

## Git LFS Considerations

**Files to consider for Git LFS:**
- Large image files (if > 10MB each)
- PDF documents (CVs)

**Git LFS config (`.gitattributes`):**
```
assets/images/*.webp filter=lfs diff=lfs merge=lfs -text
assets/images/*.jpg filter=lfs diff=lfs merge=lfs -text
assets/images/*.png filter=lfs diff=lfs merge=lfs -text
assets/fonts/* filter=lfs diff=lfs merge=lfs -text
assets/documents/*.pdf filter=lfs diff=lfs merge=lfs -text
```

**Note:** WebP files are typically smaller than originals, may not need LFS.

---

## Security Considerations

### CSP Configuration

**Required directives in `staticwebapp.config.json`:**
```json
{
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com;"
  }
}
```

**Key points:**
- Allow Turnstile script (`https://challenges.cloudflare.com`)
- Allow inline scripts for Turnstile widget initialization
- Block external fonts (self-hosted only)
- Allow data: for inline images if needed

### Secrets Management

**Never commit:**
- `.env` files
- Doppler tokens
- Azure deployment tokens
- Cloudflare API keys
- Turnstile secret keys

**Use Doppler for:**
- CI/CD secret injection
- Local development (`doppler run -- npm run dev`)
- Environment-specific values

---

## Performance Optimization

### Image Optimization
- Convert to WebP with `sharp`
- Generate responsive variants (375, 768, 1024, 1920px)
- Use `srcset`/`sizes` in HTML
- Set explicit `width`/`height` to prevent CLS

### Font Optimization
- Self-host Montserrat WOFF2
- Use `font-display: swap` in CSS
- Subset fonts if possible (only needed weights)

### CSS Optimization
- Compile with Tailwind `--minify`
- Remove unused classes (Tailwind does this automatically)
- Defer non-critical JavaScript

### Caching Strategy (Cloudflare)
- Static assets: 1 month cache
- HTML pages: no-cache or short cache
- API endpoints: no-cache

---

## Testing Checklist

### Functional Testing
- [ ] All pages load without errors
- [ ] Navigation links work correctly
- [ ] CAPTCHA gate blocks unverified users
- [ ] Redirects work after successful verification
- [ ] Subdomains accessible via Cloudflare Tunnel

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Alt text on all images
- [ ] Heading hierarchy correct
- [ ] Contrast ratio ≥ 4.5:1

### Security Testing
- [ ] CSP headers present
- [ ] HSTS enforced
- [ ] No console errors
- [ ] Turnstile tokens validated server-side

---

## Maintenance Guidelines

### Regular Tasks
- **Weekly:** Check Cloudflare dashboard for errors
- **Monthly:** Rotate Doppler secrets, review CSP reports
- **Quarterly:** Update dependencies, audit security
- **Annually:** Review content, refresh images

### Dependency Updates
```bash
npm update                    # Update all dependencies
npm audit                     # Check for vulnerabilities
npm outdated                  # View outdated packages
```

### Monitoring
- Azure SWA deployment logs
- Cloudflare analytics
- Turnstile failure rate
- API error rates

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-12  
**Next Review:** 2026-04-12
