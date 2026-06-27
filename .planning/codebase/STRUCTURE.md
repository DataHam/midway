# Structure Analysis

## Directory Layout

- `pages/`: Source HTML files. This appears to be the primary location for content development.
- `static/`: The distribution/build directory. GitHub Actions injects secrets (like Turnstile Sitekeys) into files here before deployment.
- `src/api/`: Source code for Cloudflare Workers.
- `src/css/`: PostCSS/Tailwind source files (`input.css`).
- `assets/`: Shared static resources (fonts, images, favicons).
- `scripts/`: Utility scripts for build-time optimizations (e.g., `optimize-images.js`).
- `tests/`: Playwright E2E tests and Vitest unit tests for the API logic.

## Key File Mappings

- **Build Entry:** `src/css/input.css` -> `static/css/styles.css`
- **Deployment Source:** The `static/` directory is the target for Azure Static Web App deployment.
- **API Entry:** `src/api/[worker-name]/index.js`

## Configuration

- `staticwebapp.config.json`: Defines routing and security headers for Azure.
- `package.json`: Manages build scripts (PostCSS, optimization) and dependencies.
- `wrangler.toml`: Configuration for Cloudflare Worker deployments.
