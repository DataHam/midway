# Architecture Analysis

**Overall Pattern:** Hybrid Static Site with Serverless Security Gates.
The project uses Azure Static Web Apps for hosting the main frontend and Cloudflare Workers for edge-side security verification (Turnstile).

## Layers

- **Frontend Layer (`static/`):** Contains the deployment-ready static assets. HTML files are sourced from `pages/` and styles are built from `src/css/`.
- **Security/API Layer (`src/api/`):** Cloudflare Workers that handle Turnstile token verification before allowing access to protected contact information.
- **Infrastructure:** 
  - **Azure Static Web Apps:** Primary host for the static site.
  - **Cloudflare:** Provides DNS, Tunneling (`cloudflared-config.yml`), and Serverless Functions (Workers).
  - **GitHub Actions:** Automates the build and deployment to both Azure and Cloudflare.

## Data Flow (Verification)

1. User visits `verify-danny.html`.
2. Cloudflare Turnstile challenge is presented.
3. On success, the token is sent to the Cloudflare Worker (`src/api/verify-danny/index.js`).
4. Worker validates the token and redirects the user to the protected `danny.html` (or a subdomain).
