---
phase: 03-security-gates
plan: 03
type: execute
wave: 2
depends_on:
  - 03-security-gates-01
files_modified:
  - src/api/verify-helen/index.js
  - src/api/verify-helen/function.json
  - tests/03-security-gates/verify-helen.api.test.js
autonomous: true
requirements:
  - GATE-04
  - GATE-05
  - GATE-06
  - GATE-07
  - API-02
  - API-03
  - API-04
user_setup:
  - service: doppler
    why: "Turnstile secret key retrieval"
    env_vars:
      - name: TURNSTILE_SECRET
        source: "Doppler project configuration"
      - name: TAMTHAM_SITEKEY
        source: "Doppler project configuration"

must_haves:
  truths:
    - Valid token returns 302 redirect to helen.tamtham.com
    - Invalid token returns 403 with error JSON
    - Expired token returns 403 with EXPIRED_TOKEN error
    - Rate limited requests return 429 with RATE_LIMITED error
    - Missing token returns 400 with MISSING_TOKEN error
    - Successful validation clears rate limit counter
    - Failed validation increments rate limit counter
  artifacts:
    - path: "src/api/verify-helen/index.js"
      provides: "Helen verification API endpoint"
      exports: ["handler"]
      min_lines: 100
    - path: "src/api/verify-helen/function.json"
      provides: "Azure Functions configuration"
      contains: "authLevel: anonymous, methods: ['POST']"
    - path: "tests/03-security-gates/verify-helen.api.test.js"
      provides: "Integration tests for Helen API"
      contains: "describe, it, expect, mock"
  key_links:
    - from: "src/api/verify-helen/index.js"
      to: "src/api/shared/error-handler.js"
      via: "import { getErrorMessages, translateCloudflareError } from '../../shared/error-handler.js'"
      pattern: "import.*shared/error-handler"
    - from: "src/api/verify-helen/index.js"
      to: "src/api/shared/logger.js"
      via: "import { logEvent, anonymizeIp, truncateUserAgent } from '../../shared/logger.js'"
      pattern: "import.*shared/logger"
    - from: "src/api/verify-helen/index.js"
      to: "src/api/shared/rate-limiter.js"
      via: "import { checkRateLimit, incrementRateLimit, clearRateLimit } from '../../shared/rate-limiter.js'"
      pattern: "import.*shared/rate-limiter"
    - from: "src/api/verify-helen/index.js"
      to: "src/api/shared/turnstile-utils.js"
      via: "import { validateTurnstileToken, validateSitekey } from '../../shared/turnstile-utils.js'"
      pattern: "import.*shared/turnstile-utils"

---

<objective>
Implement Helen verification API endpoint with Turnstile token validation, rate limiting, and hybrid response format.

Purpose: Provide server-side validation for verify-helen.html gate page, protecting helen.tamtham.com subdomain access with Cloudflare Turnstile verification.

Output: API endpoint with function configuration, integration test scaffold.
</objective>

<execution_context>
@C:/Users/DannyTam-Tham/OneDrive - Tam-Tham/Projects/Corporation/.opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/DannyTam-Tham/OneDrive - Tam-Tham/Projects/Corporation/.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/03-security-gates/03-SECURITY-GATES-CONTEXT.md
@.planning/phases/03-security-gates/03-SECURITY-GATES-RESEARCH.md
@.planning/phases/03-security-gates/03-security-gates-01-SUMMARY.md

# Interface Context for Executors
# Same as Danny API but with Helen-specific values

## Shared Utilities (from Plan 01)
```javascript
// Import these from src/api/shared/
import { getErrorMessages, translateCloudflareError } from '../../shared/error-handler.js';
import { logEvent, anonymizeIp, truncateUserAgent } from '../../shared/logger.js';
import { checkRateLimit, incrementRateLimit, clearRateLimit } from '../../shared/rate-limiter.js';
import { validateTurnstileToken, validateSitekey } from '../../shared/turnstile-utils.js';
```

## Azure Functions v4 HTTP Trigger Pattern
```javascript
const { app } = require('@azure/functions');

app.http('verify-helen', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'verify-helen',
  handler: async (request, context) => {
    // Implementation
  }
});
```

## API Response Format (from CONTEXT.md)
**Success - Browser Request:**
```http
HTTP/1.1 302 Found
Location: https://helen.tamtham.com
```

**Success - API Request:**
```json
{
  "success": true,
  "redirectUrl": "https://helen.tamtham.com"
}
```

**Failure - All Errors:**
```json
{
  "success": false,
  "error": "INVALID_CODE",
  "message": "The verification code was incorrect. Please try again."
}
```

## Error Codes (from CONTEXT.md)
- `INVALID_CODE` — "The verification code was incorrect. Please try again."
- `EXPIRED_TOKEN` — "The verification code has expired. Please start over."
- `RATE_LIMITED` — "Too many failed attempts. Please wait before trying again."
- `SERVICE_UNAVAILABLE` — "The security service is temporarily unavailable. Please try again later."

## Differences from Danny API
- Redirect URL: 'https://helen.tamtham.com' instead of 'https://danny.tamtham.com'
- userId in logs: 'helen' instead of 'danny'
- Route: 'verify-helen' instead of 'verify-danny'
- Function name: 'verify-helen' instead of 'verify-danny'
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement Helen API endpoint with Turnstile validation</name>
  <files>src/api/verify-helen/index.js, tests/03-security-gates/verify-helen.api.test.js</files>
  <behavior>
    - Test 1: Valid token returns 302 redirect for HTML requests
    - Test 2: Valid token returns JSON with redirectUrl for API requests
    - Test 3: Missing token returns 400 with MISSING_TOKEN error
    - Test 4: Invalid token returns 403 with INVALID_CODE error
    - Test 5: Expired token returns 403 with EXPIRED_TOKEN error
    - Test 6: Rate limited request returns 429 with RATE_LIMITED error
    - Test 7: Successful validation clears rate limit counter
    - Test 8: Failed validation increments rate limit counter
    - Test 9: Logs success event with anonymized IP
    - Test 10: Logs failure event with error code
  </behavior>
  <action>
Create Helen verification API endpoint (same pattern as Danny API but Helen-specific):

**Function Structure**
- Use @azure/functions SDK v4
- HTTP trigger with POST method only
- Anonymous auth level (gate page handles verification)
- Route: 'verify-helen'

**Handler Logic**
Same as Danny API with these Helen-specific values:
1. Extract client IP from x-forwarded-for or x-real-ip headers
2. Anonymize IP using logger.anonymizeIp()
3. Truncate user agent using logger.truncateUserAgent()
4. Parse JSON body to get token
5. Validate token presence (return 400 if missing)
6. Validate sitekey from process.env.TAMTHAM_SITEKEY (return 500 if not configured)
7. Check rate limit using rate-limiter.checkRateLimit() (return 429 if limited)
8. Validate token with Cloudflare using turnstile-utils.validateTurnstileToken()
9. If validation fails:
   - Translate error code using error-handler.translateCloudflareError()
   - Log failure event with error code, userId='helen'
   - Increment rate limit counter
   - Return 403 with error JSON
10. If validation succeeds:
    - Clear rate limit counter
    - Log success event, userId='helen'
    - Get redirect URL from query parameter or default to 'https://helen.tamtham.com'
    - Check Accept header for content type
    - Return 302 redirect for HTML requests, JSON for API requests

**Error Handling**
- Try/catch around main logic
- Catch API errors, log as api_error, return 500 with SERVICE_UNAVAILABLE
- Never log secrets or full IPs

**Configuration**
- Create function.json with:
  - authLevel: 'anonymous'
  - methods: ['POST']
  - route: 'verify-helen'
  - routePrefix: 'api'

Use existing Vitest structure for integration tests. Mock Azure Functions context and request objects.
  </action>
  <verify>
    <automated>npm test -- tests/03-security-gates/verify-helen.api.test.js</automated>
  </verify>
  <done>
    - index.js exports Azure Functions HTTP handler
    - Handler validates Turnstile tokens correctly
    - Returns 302 redirect to helen.tamtham.com for browser requests
    - Returns JSON for API requests
    - Rate limiting works correctly (3 attempts per session)
    - Error codes match CONTEXT.md locked decisions
    - Logs anonymized IP and truncated user agent with userId='helen'
    - Integration tests pass
  </done>
</task>

</tasks>

<verification>
Wave 2 complete when:
1. src/api/verify-helen/index.js exists with handler implementation
2. src/api/verify-helen/function.json exists with correct configuration
3. tests/03-security-gates/verify-helen.api.test.js exists with integration tests
4. Running `npm test -- tests/03-security-gates/verify-helen.api.test.js` passes all tests
5. API returns correct status codes for all error scenarios
</verification>

<success_criteria>
- Valid token: Returns 302 redirect to helen.tamtham.com for HTML requests
- Valid token: Returns JSON { success: true, redirectUrl: 'https://helen.tamtham.com' } for API requests
- Missing token: Returns 400 with { success: false, error: 'MISSING_TOKEN' }
- Invalid token: Returns 403 with { success: false, error: 'INVALID_CODE' }
- Expired token: Returns 403 with { success: false, error: 'EXPIRED_TOKEN' }
- Rate limited: Returns 429 with { success: false, error: 'RATE_LIMITED' }
- Rate limit: Successful validation clears counter, failed validation increments
- Logging: All events logged with anonymized IP, truncated user agent, userId='helen'
- Tests: All integration tests pass
</success_criteria>

<output>
After completion, create `.planning/phases/03-security-gates/03-security-gates-03-SUMMARY.md`
</output>
