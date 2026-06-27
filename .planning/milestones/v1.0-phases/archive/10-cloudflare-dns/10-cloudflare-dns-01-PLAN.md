---
phase: 10-cloudflare-dns
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/scripts/cloudflare-dns-setup.sh
  - .planning/CLOUDFLARE-SETUP.md
autonomous: true
requirements:
  - CLOUD-02
  - CLOUD-03
---

<objective>
Configure Cloudflare DNS for danny.tamtham.com and helen.tamtham.com subdomains.

Purpose: Route subdomain traffic to Cloudflare Workers that handle Turnstile verification and redirect to home servers.

Output: Cloudflare DNS configuration script and documentation for setting up subdomains.
</objective>

<execution_context>
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

# Current State
- Cloudflare Workers deployed for verify-danny and verify-helen APIs
- Workers are accessible via Cloudflare API but DNS not configured
- Need to set up subdomain routing to Workers

# Requirements
- CLOUD-02: Cloudflare Worker for danny.tamtham.com verification API
- CLOUD-03: Cloudflare Worker for helen.tamtham.com verification API

# Solution
Create DNS CNAME records that route subdomains to Cloudflare Workers:
- danny.tamtham.com → tamtham-verify-danny.workers.dev
- helen.tamtham.com → tamtham-verify-helen.workers.dev

Or use Workers Routes for more control.
</context>

<tasks>

<task type="auto">
  <name>Create Cloudflare DNS setup script</name>
  <files>.planning/scripts/cloudflare-dns-setup.sh</files>
  <action>
    Create a bash script to configure Cloudflare DNS:
    
    1. Script should use Cloudflare API to create/update DNS records
    2. Create CNAME records for subdomains:
       - danny.tamtham.com → tamtham-verify-danny.workers.dev
       - helen.tamtham.com → tamtham-verify-helen.workers.dev
    3. Set proxy status to "orange" (Cloudflare proxy active)
    4. Use environment variable for API token
    
    Include error handling and validation.
  </action>
  <verify>
    <automated>cat .planning/scripts/cloudflare-dns-setup.sh | head -50</automated>
  </verify>
  <done>DNS setup script created with Cloudflare API calls</done>
</task>

<task type="auto">
  <name>Create Cloudflare setup documentation</name>
  <files>.planning/CLOUDFLARE-SETUP.md</files>
  <action>
    Create documentation for Cloudflare setup:
    
    1. Prerequisites (Cloudflare account, API token)
    2. Worker deployment verification
    3. DNS record configuration steps
    4. Testing procedures
    5. Troubleshooting guide
    
    Include commands to check current DNS records and test Workers.
  </action>
  <verify>
    <automated>cat .planning/CLOUDFLARE-SETUP.md | head -50</automated>
  </verify>
  <done>Cloudflare setup documentation created</done>
</task>

</tasks>

<verification>
1. Verify script syntax: bash -n .planning/scripts/cloudflare-dns-setup.sh
2. Check documentation completeness
3. Verify DNS records can be created via Cloudflare dashboard manually
</verification>

<success_criteria>
- [ ] DNS setup script created
- [ ] Cloudflare setup documentation created
- [ ] Script includes error handling
- [ ] Documentation includes testing procedures
- [ ] All files committed to git
</success_criteria>

<output>
After completion, create `.planning/phases/10-cloudflare-dns/10-cloudflare-dns-01-SUMMARY.md`
</output>
