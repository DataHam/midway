# Wave 0 Verification Checklist

## Pre-Deployment Verification

This checklist ensures all prerequisites are complete before production deployment.

---

## Section 1: Doppler Setup

- [ ] Doppler account created
- [ ] Workplace "tamtham-website" created
- [ ] Project "tamtham-website" created
- [ ] Config "production" created
- [ ] All secrets added (TURNSTILE_SECRET_KEY, AZURE_*)
- [ ] Service token generated with read permissions
- [ ] DOPPLER_TOKEN added to GitHub Secrets
- [ ] AZURE_STATIC_WEB_APPS_API_TOKEN added to GitHub Secrets

---

## Section 2: Azure Static Web Apps

- [ ] Azure SWA resource created in Azure Portal
- [ ] Deployment credentials available (API token)
- [ ] API functions directory structure correct (`api/verify-danny/`, `api/verify-helen/`)
- [ ] function.json files present for both APIs
- [ ] Build command tested locally (`npm run build`)

---

## Section 3: Cloudflare DNS

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] DNS propagation complete (wait 5-30 minutes)
- [ ] CNAME record created for tamtham.com
- [ ] Proxy enabled (orange cloud)
- [ ] DNS verified: `dig tamtham.com`

---

## Section 4: Cloudflare Tunnels

- [ ] Zero Trust account created in Cloudflare
- [ ] Tunnel created for danny.tamtham.com
- [ ] Tunnel created for helen.tamtham.com
- [ ] cloudflared installed on home server
- [ ] Tunnel authentication completed
- [ ] Tunnel configuration file created
- [ ] Tunnel service started and running
- [ ] Tunnel status shows "Connected"

---

## Section 5: Cloudflare Security

- [ ] Bot Fight Mode enabled
- [ ] Cache Rules configured (not legacy Page Rules)
- [ ] WAF rules reviewed and adjusted if needed

---

## Section 6: GitHub Actions

- [ ] Workflow file committed to repository
- [ ] Workflow enabled in GitHub Actions tab
- [ ] Manual workflow run tested successfully

---

## Section 7: Final Verification

- [ ] `tests/05-deployment/verify-deployment.sh` created
- [ ] All checklist items completed
- [ ] Production deployment successful
- [ ] All subdomains accessible
- [ ] Human verification approved

---

## Completion Date

**Date Completed:** _______________

**Verified By:** _______________

**Notes:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
