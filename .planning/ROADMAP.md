# Roadmap: Tam-Tham Website

## Current Status
The project is in its final delivery stages. Phases 1 through 5 are complete, establishing the foundation, biography content, security gates, and infrastructure. Current focus is on Phase 6 (Gap Closure) and Phase 8 (Final Polish).

## Phases

- [x] **Phase 1: Brand Foundation** - Establish visual identity, typography, and accessibility standards.
- [x] **Phase 2: Professional Biographies** - Launch profile pages for Danny and Helen.
- [x] **Phase 3: Security Gates & Verification** - Implement CAPTCHA-protected entry points and backend verification API.
- [x] **Phase 4: Security Hardening & SEO** - Configure production-grade security headers and search engine visibility.
- [x] **Phase 5: DevOps & Cloud Infrastructure** - Set up automated CI/CD and edge network routing via Cloudflare.
- [ ] **Phase 6: Secure Redirects** - Implement final 302 redirects for successful verifications.
- [ ] **Phase 8: Experience Polish & Asset Optimization** - Finalize home page, optimize images, and clean up API configuration.

## Phase Details

### Phase 1: Brand Foundation
**Goal**: Establish the visual identity and core styling of the site.
**Depends on**: Nothing
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04
**Success Criteria**:
  1. Brand color palette (Navy, Yellow, Teal, Red, Blue, Grey) is applied via Tailwind configuration.
  2. Self-hosted Montserrat fonts are loaded and used across all pages.
  3. Typography scale (headers/body) is consistent with the design guide.
  4. Color contrast meets WCAG AA standards (min 4.5:1).
**Plans**: Complete

### Phase 2: Professional Biographies
**Goal**: Create the professional profiles for Danny and Helen.
**Depends on**: Phase 1
**Requirements**: BIO-01, BIO-02, BIO-03, BIO-04, BIO-05, BIO-06, BIO-07
**Success Criteria**:
  1. Danny's page includes credentials, consulting services, and contact info.
  2. Helen's page includes credentials, research interests, and contact info.
  3. Both pages have functional "Download CV" placeholder links.
  4. No meeting booking links are present on either profile.
**Plans**: Complete

### Phase 3: Security Gates & Verification API
**Goal**: Deploy the CAPTCHA-protected entry points and backend verification API.
**Depends on**: Phase 2
**Requirements**: GATE-01, GATE-02, GATE-03, GATE-04, GATE-05, GATE-07, API-01, API-02, API-03, API-04
**Success Criteria**:
  1. Verification pages (Danny/Helen) load the Turnstile widget correctly.
  2. API validates Turnstile tokens using secrets from environment variables.
  3. API logs successes and failures without leaking sensitive data.
  4. Users receive a 403 error on failed validation.
**Plans**: Complete

### Phase 4: Security Hardening & SEO
**Goal**: Configure production-grade security headers and search engine visibility.
**Depends on**: Phase 1
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEO-01, SEO-02, SEO-03, SEO-04, SEO-05
**Success Criteria**:
  1. HSTS, CSP, and other security headers are active and verified.
  2. Sitemap.xml and robots.txt are generated and accessible.
  3. Favicons are visible in the browser tab.
  4. Page structure uses semantic HTML and correct heading hierarchy.
**Plans**: Complete

### Phase 5: DevOps & Cloud Infrastructure
**Goal**: Set up automated CI/CD and edge network routing.
**Depends on**: Phase 3, Phase 4
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05, CLOUD-01, CLOUD-02, CLOUD-03, CLOUD-04, CLOUD-05
**Success Criteria**:
  1. GitHub Actions deploys the site to Azure SWA automatically.
  2. Doppler provides secrets for Turnstile and Azure during the build.
  3. Cloudflare DNS routes tamtham.com to Azure.
  4. Cloudflare Tunnels securely expose the home server subdomains.
**Plans**: Complete

### Phase 6: Secure Redirects
**Goal**: Complete the user journey from verification to protected subdomains.
**Depends on**: Phase 3, Phase 5
**Requirements**: GATE-06
**Success Criteria**:
  1. User is automatically redirected (302) to the correct subdomain after passing the CAPTCHA.
**Plans**: TBD

### Phase 8: Experience Polish & Asset Optimization
**Goal**: Finalize the home page, optimize images, and clean up API configuration.
**Depends on**: Phase 1, Phase 5, Phase 6
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, IMG-01, IMG-02, IMG-03, IMG-04, IMG-05, API-05
**Success Criteria**:
  1. Home page features a responsive hero section and 4-card navigation grid.
  2. Navigation cards route to bio pages or verification gates (no direct subdomain links).
  3. All images are optimized (WebP) with responsive srcset variants.
  4. Page load performance is high with no Layout Shift (CLS) from images.
  5. API configuration is clean and fully compliant with Azure Functions standards.
**Plans**: TBD

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Brand Foundation | 2/2 | Complete | 2026-03-12 |
| 2. Professional Biographies | 3/3 | Complete | 2026-03-12 |
| 3. Security Gates & API | 4/4 | Complete | 2026-03-13 |
| 4. Security Hardening & SEO | 5/5 | Complete | 2026-03-13 |
| 5. DevOps & Infrastructure | 4/4 | Complete | 2026-03-13 |
| 6. Secure Redirects | 0/1 | Not started | - |
| 8. Experience Polish | 0/3 | Not started | - |
