---
phase: 06-api-redirect
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/api/verify-danny/index.js
  - src/api/verify-helen/index.js
  - pages/verify-danny.html
  - pages/verify-helen.html
autonomous: true
requirements:
  - GATE-06
user_setup: []

must_haves:
  truths:
    - "Valid Turnstile token returns 302 redirect to subdomain for browser navigation"
    - "Valid Turnstile token returns JSON with redirectUrl for fetch API calls"
    - "Client code handles both 302 and JSON response types correctly"
  artifacts:
    - path: "src/api/verify-danny/index.js"
      provides: "Danny verification API with hybrid response"
      exports: ["default"]
      min_lines: 69
    - path: "src/api/verify-helen/index.js"
      provides: "Helen verification API with hybrid response"
      exports: ["default"]
      min_lines: 69
    - path: "pages/verify-danny.html"
      provides: "Gate page that handles redirect response"
      min_lines: 421
    - path: "pages/verify-helen.html"
      provides: "Gate page that handles redirect response"
      min_lines: 391
  key_links:
    - from: "pages/verify-danny.html"
      to: "src/api/verify-danny/index.js"
      via: "fetch POST with token"
      pattern: "fetch\\('/api/verify-danny'\\)"
    - from: "pages/verify-helen.html"
      to: "src/api/verify-helen/index.js"
      via: "fetch POST with token"
      pattern: "fetch\\('/api/verify-helen'\\)"
---

<objective>
Fix redirect logic in verification APIs to properly handle browser navigation vs fetch API calls.

Purpose: Ensure valid Turnstile tokens trigger proper 302 redirects for browser navigation while returning JSON for programmatic calls. This closes the critical GATE-06 gap where the API was returning 302 but the client code expected JSON.

Output: Both APIs detect request type and respond appropriately (302 for HTML navigation, JSON for fetch), plus client code updated to handle both response types.
</objective>

<execution_context>
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/03-security-gates/03-security-gates-VERIFICATION.md

# Current API Implementation
src/api/verify-danny/index.js currently returns Response.redirect() unconditionally on success, which breaks client code that expects JSON.

src/api/verify-helen/index.js has the same issue.

# Client Implementation
Both gate pages call response.json() unconditionally at line 371, which fails when API returns 302.

# Solution
API should detect request type via Accept header:
- If Accept includes 'text/html' → return Response.redirect(url, 302)
- Otherwise → return JSON { redirectUrl: url }

Client should check response type and handle accordingly.
</context>

<tasks>

<task type="auto">
  <name>Fix Danny API to detect browser vs fetch requests</name>
  <files>src/api/verify-danny/index.js</files>
  <action>
Update the success response logic to detect request type via Accept header:

1. Check `request.headers.get('accept').includes('text/html')` to detect browser navigation
2. If HTML request: return `Response.redirect('https://danny.tamtham.com', 302)`
3. If fetch/API request: return `JSON.stringify({ redirectUrl: 'https://danny.tamtham.com' })` with status 200

This allows the same endpoint to work for both browser navigation (direct URL access) and fetch API calls from the gate page.

Reference: Current implementation at line 52-54 returns redirect unconditionally.
</action>
<verify>
  <automated>node -e "const api = require('./src/api/verify-danny/index.js'); console.log('API exports:', typeof api.default);"
</automated>
</verify>
<done>API returns 302 redirect for HTML requests, JSON for fetch requests, both with correct redirect URL</done>
</task>

<task type="auto">
  <name>Fix Helen API to detect browser vs fetch requests</name>
  <files>src/api/verify-helen/index.js</files>
  <action>
Apply the same fix as Danny API but for Helen subdomain:

1. Check `request.headers.get('accept').includes('text/html')` to detect browser navigation
2. If HTML request: return `Response.redirect('https://helen.tamtham.com', 302)`
3. If fetch/API request: return `JSON.stringify({ redirectUrl: 'https://helen.tamtham.com' })` with status 200

This ensures consistency between both verification endpoints.
</action>
<verify>
  <automated>node -e "const api = require('./src/api/verify-helen/index.js'); console.log('API exports:', typeof api.default);"
</automated>
</verify>
<done>API returns 302 redirect for HTML requests, JSON for fetch requests, both with correct redirect URL</done>
</task>

<task type="auto">
  <name>Update gate pages to handle JSON redirect response</name>
  <files>pages/verify-danny.html, pages/verify-helen.html</files>
  <action>
Update the fetch response handling in both gate pages:

1. After calling `response.json()`, check if response contains `redirectUrl`
2. If `redirectUrl` exists, perform redirect via `window.location.href = response.redirectUrl`
3. Keep existing error handling for non-success responses

This allows the client to work with the new JSON response format while maintaining error handling.
</action>
<verify>
  <automated>grep -n "redirectUrl" pages/verify-danny.html pages/verify-helen.html
</automated>
</verify>
<done>Both gate pages check for redirectUrl in JSON response and redirect via window.location.href</done>
</task>

</tasks>

<verification>
1. Test Danny API with HTML Accept header:
   curl -H "Accept: text/html" -X POST -d '{"token":"test"}' http://localhost:8787/api/verify-danny
   Expected: 302 redirect (curl will follow, check headers)

2. Test Danny API with JSON Accept header:
   curl -H "Accept: application/json" -X POST -d '{"token":"test"}' http://localhost:8787/api/verify-danny
   Expected: JSON response with { redirectUrl: "https://danny.tamtham.com" }

3. Test Helen API similarly with helen.tamtham.com URL

4. Open pages/verify-danny.html in browser and complete Turnstile verification
   Expected: Redirects to danny.tamtham.com
</verification>

<success_criteria>
- Both APIs detect Accept header and return appropriate response type
- Browser navigation receives 302 redirect
- Fetch API calls receive JSON with redirectUrl
- Gate pages handle JSON redirect and perform window.location redirect
- All 4 files modified successfully
</success_criteria>

<output>
After completion, create `.planning/phases/06-api-redirect/06-api-redirect-01-SUMMARY.md`
</output>
