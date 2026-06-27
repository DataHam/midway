# Tam-Tham Website

## What This Is

A professional personal website for Danny and Helen Tam-Tham, featuring biography pages and secure "CAPTCHA gates" to protect access to their home server subdomains. Built with a modern static stack (Tailwind v4) and serverless security (Cloudflare Workers).

## Core Value

Users can securely discover and contact Danny or Helen Tam-Tham through verified access gates that protect their external home server subdomains while presenting professional information about their services.

## Requirements

### Validated

- ✓ **DESIGN-01** through **DESIGN-04**: Brand palette, self-hosted fonts, typography scale, and accessibility — phase 1
- ✓ **BIO-01** through **BIO-07**: Danny and Helen biography pages (no meeting links) — phase 2
- ✓ **GATE-01** through **GATE-05**, **GATE-07**: Cloudflare Turnstile integration and server-side validation (except redirect logic) — phase 3
- ✓ **API-01** through **API-04**: Verification endpoints with Turnstile secret handling and privacy-preserving logging — phase 3
- ✓ **SEC-01** through **SEC-05**: HSTS, CSP, and security headers in staticwebapp.config.json — phase 4
- ✓ **SEO-01** through **SEO-05**: Sitemap, robots.txt, favicons, semantic HTML, and heading hierarchy — phase 4
- ✓ **DEPLOY-01** through **DEPLOY-05**: GitHub Actions CI/CD with Doppler and pinned action versions — phase 5
- ✓ **CLOUD-01** through **CLOUD-05**: Cloudflare DNS, Tunnels, Bot Fight Mode, and Cache Rules — phase 5
- ✓ **GATE-06**: Successful validation returns 302 redirect to respective subdomain — phase 6
- ✓ **API-05**: API configured with proper function.json and host.json — phase 8
- ✓ **HOME-01** through **HOME-05**: Home Page grid, routing, and social meta tags — phase 8
- ✓ **IMG-01** through **IMG-05**: WebP conversion, responsive srcset, and CLS prevention — phase 8

### Active

(None currently active — milestone v1.0 complete)

### Out of Scope

- **Meeting booking integration** — Explicitly excluded per requirements.
- **Direct subdomain links from home page** — Security requirement; must use CAPTCHA gate.
- **Mobile app** — Web-first implementation only.
- **Multi-language support** — English only for v1.

## Context

- **Tech Stack:** Node.js, Tailwind v4, PostCSS, Azure Static Web Apps (hosting), Cloudflare Workers (API/Security).
- **Environment:** Production deployments managed via GitHub Actions and Doppler.
- **Home Servers:** Protected subdomains `danny.tamtham.com` and `helen.tamtham.com` accessed via Cloudflare Tunnels.

## Constraints

- **Security**: Must pass Cloudflare Turnstile before exposing contact subdomains.
- **Privacy**: No PII or full IP addresses in logs (anonymized/truncated).
- **Performance**: High accessibility scores (WCAG AA) and optimized image delivery (WebP).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tailwind v4 | Modern build pipeline with CSS-first configuration | ✓ Good |
| Cloudflare Workers | Edge-side verification reduces latency and improves security | ✓ Good |
| Doppler | Centralized secret management for CI/CD security | ✓ Good |

---
*Last updated: 2026-03-15 after v1.0 milestone*
