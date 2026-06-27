# Requirements: Tam-Tham Website

**Defined:** 2026-03-12  
**Core Value:** Users can securely discover and contact Danny or Helen Tam-Tham through verified access gates that protect their external home server subdomains while presenting professional information about their services.

## v1 Requirements

### Design System

- [x] **DESIGN-01**: Implement brand color palette (Navy #103248, Yellow #F0D04C, Teal #7DC2B6, Red #D64E34, Blue #385C8F, Grey #535A60)
- [x] **DESIGN-02**: Use self-hosted Montserrat WOFF2 fonts (no Google Fonts CDN)
- [x] **DESIGN-03**: Apply consistent typography scale (Bold headers, SemiBold accents, Regular body)
- [x] **DESIGN-04**: Ensure WCAG AA accessibility compliance (4.5:1 contrast minimum)

### Home Page

- [ ] **HOME-01**: Hero section with HDMain.webp background and TamThamLogo.png overlay
- [ ] **HOME-02**: Navigation grid with 4 cards (Danny Bio, Helen Bio, Contact Danny, Contact Helen)
- [ ] **HOME-03**: Contact Danny/ Helen links route to CAPTCHA gate pages (NOT direct subdomain)
- [ ] **HOME-04**: Responsive layout (mobile 1 column, tablet 2 columns, desktop 4 columns)
- [ ] **HOME-05**: Add OpenGraph and Twitter meta tags for social sharing

### Biography Pages

- [x] **BIO-01**: Danny page with role, credentials, phone, email, LinkedIn, profile image
- [x] **BIO-02**: Danny page includes Consulting Services section (IT Strategy, Digital Transformation, Healthcare IT)
- [x] **BIO-03**: Danny page has "Download CV" button (placeholder PDF link)
- [x] **BIO-04**: Helen page with role, credentials, phone, email, LinkedIn, Google Scholar, profile image
- [x] **BIO-05**: Helen page includes Selected Research placeholder section
- [x] **BIO-06**: Helen page has "Download CV" button (placeholder PDF link)
- [x] **BIO-07**: NO meeting booking links on either page (explicit exclusion)

### CAPTCHA Gates

- [x] **GATE-01**: verify-danny.html displays Cloudflare Turnstile widget
- [x] **GATE-02**: verify-helen.html displays Cloudflare Turnstile widget
- [x] **GATE-03**: Client-side widget loads from challenges.cloudflare.com/turnstile/v0/api.js
- [x] **GATE-04**: Server-side validation via /api/verify-danny and /api/verify-helen endpoints
- [x] **GATE-05**: API validates token against Cloudflare Siteverify API
- [x] **GATE-06**: Successful validation returns 302 redirect to respective subdomain (Phase 6 - gap closure)
- [x] **GATE-07**: Failed validation returns 403 with error message

### Azure Functions API

- [x] **API-01**: /api/verify-danny/index.js validates Turnstile token and redirects
- [x] **API-02**: /api/verify-helen/index.js validates Turnstile token and redirects
- [x] **API-03**: API uses Cloudflare Turnstile secret from environment variable
- [x] **API-04**: API logs basic success/failure (no secrets in logs)
- [ ] **API-05**: API configured with proper function.json and host.json

### Image Optimization

- [ ] **IMG-01**: Convert all images to WebP format
- [ ] **IMG-02**: Generate responsive srcset variants (375, 768, 1024, 1920px)
- [ ] **IMG-03**: Set explicit width/height attributes to prevent CLS
- [ ] **IMG-04**: Hero image eager-loaded (no lazy)
- [ ] **IMG-05**: Below-fold images use loading="lazy"

### Security Headers

- [x] **SEC-01**: Configure staticwebapp.config.json with HSTS header
- [x] **SEC-02**: Add Content-Security-Policy (allow Turnstile, self-hosted assets)
- [x] **SEC-03**: Set X-Content-Type-Options: nosniff
- [x] **SEC-04**: Set X-Frame-Options: DENY
- [x] **SEC-05**: Set Referrer-Policy: strict-origin-when-cross-origin

### SEO & Metadata

- [x] **SEO-01**: Generate sitemap.xml with all page URLs
- [x] **SEO-02**: Create robots.txt with sitemap reference
- [x] **SEO-03**: Add favicon set (ICO, PNG variants)
- [x] **SEO-04**: Implement semantic HTML (nav, main, footer landmarks)
- [x] **SEO-05**: Proper heading hierarchy (h1 → h2 → h3)

### CI/CD & Deployment

- [x] **DEPLOY-01**: Configure GitHub Actions workflow for Azure SWA deployment
- [x] **DEPLOY-02**: Integrate Doppler for secrets management (Turnstile keys, Azure token)
- [x] **DEPLOY-03**: Pin action versions in workflow (security hardening)
- [x] **DEPLOY-04**: Deploy on push to main branch
- [x] **DEPLOY-05**: Build pipeline compiles Tailwind CSS and optimizes images

### Cloudflare Configuration

- [x] **CLOUD-01**: Configure Cloudflare DNS for tamtham.com (points to Azure SWA)
- [x] **CLOUD-02**: Set up Cloudflare Tunnel for danny.tamtham.com (home server)
- [x] **CLOUD-03**: Set up Cloudflare Tunnel for helen.tamtham.com (home server)
- [x] **CLOUD-04**: Enable Cloudflare Bot Fight Mode
- [x] **CLOUD-05**: Configure modern Cache Rules (not legacy Page Rules)

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DESIGN-01 | Phase 1 | Complete |
| DESIGN-02 | Phase 1 | Complete |
| DESIGN-03 | Phase 1 | Complete |
| DESIGN-04 | Phase 1 | Complete |
| BIO-01 | Phase 2 | Complete |
| BIO-02 | Phase 2 | Complete |
| BIO-03 | Phase 2 | Complete |
| BIO-04 | Phase 2 | Complete |
| BIO-05 | Phase 2 | Complete |
| BIO-06 | Phase 2 | Complete |
| BIO-07 | Phase 2 | Complete |
| GATE-01 | Phase 3 | Complete |
| GATE-02 | Phase 3 | Complete |
| GATE-03 | Phase 3 | Complete |
| GATE-04 | Phase 3 | Complete |
| GATE-05 | Phase 3 | Complete |
| GATE-07 | Phase 3 | Complete |
| API-01 | Phase 3 | Complete |
| API-02 | Phase 3 | Complete |
| API-03 | Phase 3 | Complete |
| API-04 | Phase 3 | Complete |
| SEC-01 | Phase 4 | Complete |
| SEC-02 | Phase 4 | Complete |
| SEC-03 | Phase 4 | Complete |
| SEC-04 | Phase 4 | Complete |
| SEC-05 | Phase 4 | Complete |
| SEO-01 | Phase 4 | Complete |
| SEO-02 | Phase 4 | Complete |
| SEO-03 | Phase 4 | Complete |
| SEO-04 | Phase 4 | Complete |
| SEO-05 | Phase 4 | Complete |
| DEPLOY-01 | Phase 5 | Complete |
| DEPLOY-02 | Phase 5 | Complete |
| DEPLOY-03 | Phase 5 | Complete |
| DEPLOY-04 | Phase 5 | Complete |
| DEPLOY-05 | Phase 5 | Complete |
| CLOUD-01 | Phase 5 | Complete |
| CLOUD-02 | Phase 5 | Complete |
| CLOUD-03 | Phase 5 | Complete |
| CLOUD-04 | Phase 5 | Complete |
| CLOUD-05 | Phase 5 | Complete |
| GATE-06 | Phase 6 | Complete |
| HOME-01 | Phase 8 | Pending |
| HOME-02 | Phase 8 | Pending |
| HOME-03 | Phase 8 | Pending |
| HOME-04 | Phase 8 | Pending |
| HOME-05 | Phase 8 | Pending |
| API-05 | Phase 8 | Pending |
| IMG-01 | Phase 8 | Pending |
| IMG-02 | Phase 8 | Pending |
| IMG-03 | Phase 8 | Pending |
| IMG-04 | Phase 8 | Pending |
| IMG-05 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 53
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-16 after roadmap creation*
