# Technology Stack

**Analysis Date:** 2026-02-22

## Languages

**Primary:**
- **JavaScript (ESM):** `src/api/**/*.js`, `scripts/*.js`, `static/*.html` (inline). Used for backend logic (Cloudflare Workers/Azure Functions) and build scripts.
- **HTML5:** `index.html`, `pages/*.html`, `static/*.html`. Core structure for the professional website.

**Secondary:**
- **TypeScript:** `playwright.config.ts`, `tests/**/*.ts`. Used for testing infrastructure and configuration.
- **CSS (Tailwind v4):** `src/css/input.css`. Uses the new Tailwind v4 engine for styling.

## Runtime

**Environment:**
- **Node.js v22:** Specified in CI/CD workflows (`.github/workflows/azure-static-web-apps.yml`).
- **Cloudflare Workers:** Runtime for backend API functions in `src/api/`.

**Package Manager:**
- **npm / pnpm:** Project contains both `package-lock.json` and `pnpm-lock.yaml`. CI/CD specifically uses `npm install`.

## Frameworks

**Core:**
- **Tailwind CSS v4:** `tailwindcss` ^4.2.0. Used for all styling with the new PostCSS-based engine.
- **Cloudflare Workers:** Primary backend framework for serverless functions in `src/api/`.
- **Azure Functions (Legacy/Optional):** `@azure/functions` ^4.11.2. Present in `package.json` and `function.json` files, likely being migrated to or from Cloudflare Workers.

**Testing:**
- **Playwright:** `@playwright/test` ^1.58.2. Used for E2E testing of the website and security gates.
- **Vitest:** `vitest` ^4.1.0. Used for unit and integration testing.

**Build/Dev:**
- **PostCSS:** `postcss` ^8.4.49. Orchestrates the CSS build pipeline with `autoprefixer` and `@tailwindcss/postcss`.
- **Sharp:** `sharp` ^0.33.5. Used for high-performance image optimization and WebP conversion.

## Key Dependencies

**Critical:**
- **@tailwindcss/postcss:** Integration for Tailwind v4 into the PostCSS pipeline.
- **autoprefixer:** Adds vendor prefixes to CSS for cross-browser compatibility.

**Infrastructure:**
- **wrangler:** (implied) Used for managing and deploying Cloudflare Workers.
- **Azure/static-web-apps-deploy:** GitHub Action for deploying to Azure Static Web Apps.

## Configuration

**Environment:**
- **Doppler:** Used for secrets management and environment variable injection (`.doppler.yaml`).
- **staticwebapp.config.json:** Configures Azure Static Web Apps routing, headers, and security policies.

**Build:**
- `postcss.config.js`: PostCSS plugin configuration.
- `package.json`: Contains build scripts and dependency definitions.
- `wrangler.toml`: Cloudflare Workers configuration per function.

## Platform Requirements

**Development:**
- Node.js (v22 recommended).
- pnpm or npm.

**Production:**
- **Azure Static Web Apps:** Hosts the frontend static content.
- **Cloudflare Workers:** Hosts the backend verification APIs.

---

*Stack analysis: 2026-02-22*
