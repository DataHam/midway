---
phase: 03-security-gates
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/api/shared/error-handler.js
  - src/api/shared/logger.js
  - src/api/shared/rate-limiter.js
  - src/api/shared/turnstile-utils.js
  - tests/03-security-gates/error-handler.test.js
  - tests/03-security-gates/logger.test.js
  - tests/03-security-gates/rate-limiter.test.js
  - tests/03-security-gates/turnstile-utils.test.js
  - tests/03-security-gates/validate-utils.js
autonomous: true
requirements:
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
    - Error codes translate to human-readable messages
    - IP addresses are anonymized before logging
    - User agents are truncated to 100 characters
    - Rate limiting tracks attempts per session via cookies
    - Rate limit triggers after 3 failed attempts
    - Failed attempts increment counter, successful attempts reset it
    - Cookie expires after 1 hour
  artifacts:
    - path: "src/api/shared/error-handler.js"
      provides: "Error code to message translation"
      exports: ["getErrorMessages", "translateCloudflareError"]
      min_lines: 40
    - path: "src/api/shared/logger.js"
      provides: "Structured logging with privacy safeguards"
      exports: ["logEvent", "anonymizeIp", "truncateUserAgent"]
      min_lines: 50
    - path: "src/api/shared/rate-limiter.js"
      provides: "Cookie-based session rate limiting"
      exports: ["checkRateLimit", "incrementRateLimit", "clearRateLimit", "getRateLimitCookie"]
      min_lines: 60
    - path: "src/api/shared/turnstile-utils.js"
      provides: "Cloudflare API client and validation"
      exports: ["validateTurnstileToken", "validateSitekey"]
      min_lines: 45
    - path: "tests/03-security-gates/error-handler.test.js"
      provides: "Unit tests for error handling"
      contains: "describe, it, expect"
    - path: "tests/03-security-gates/logger.test.js"
      provides: "Unit tests for logger utilities"
      contains: "describe, it, expect"
    - path: "tests/03-security-gates/rate-limiter.test.js"
      provides: "Unit tests for rate limiting"
      contains: "describe, it, expect"
    - path: "tests/03-security-gates/turnstile-utils.test.js"
      provides: "Unit tests for Turnstile utilities"
      contains: "describe, it, expect"
    - path: "tests/03-security-gates/validate-utils.js"
      provides: "Integration verification script"
      exports: ["runAllTests"]
  key_links:
    - from: "src/api/shared/error-handler.js"
      to: "src/api/verify-danny/index.js"
      via: "import { getErrorMessages, translateCloudflareError }"
      pattern: "import.*error-handler"
    - from: "src/api/shared/logger.js"
      to: "src/api/verify-danny/index.js"
      via: "import { logEvent, anonymizeIp, truncateUserAgent }"
      pattern: "import.*logger"
    - from: "src/api/shared/rate-limiter.js"
      to: "src/api/verify-danny/index.js"
      via: "import { checkRateLimit, incrementRateLimit, clearRateLimit }"
      pattern: "import.*rate-limiter"
    - from: "src/api/shared/turnstile-utils.js"
      to: "src/api/verify-danny/index.js"
      via: "import { validateTurnstileToken }"
      pattern: "import.*turnstile-utils"

---

<objective>
Create shared API utilities for error handling, logging, rate limiting, and Turnstile validation with comprehensive test scaffolding.

Purpose: Establish reusable infrastructure that both Danny and Helen API endpoints will consume, ensuring consistent error handling, privacy-compliant logging, and session-based rate limiting.

Output: Four shared utility modules, four unit test files, and one integration verification script.
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

# Interface Contracts for Executors
# Extracted from research and CONTEXT.md — use these directly

## Error Handler Interface
```javascript
// src/api/shared/error-handler.js

/**
 * Returns error code to human-readable message mapping
 * @returns {Object} Error messages
 */
export function getErrorMessages() {
  return {
    'INVALID_CODE': 'The verification code was incorrect. Please try again.',
    'EXPIRED_TOKEN': 'The verification code has expired. Please start over.',
    'RATE_LIMITED': 'Too many failed attempts. Please wait before trying again.',
    'SERVICE_UNAVAILABLE': 'The security service is temporarily unavailable. Please try again later.'
  };
}

/**
 * Translates Cloudflare error codes to internal codes
 * @param {string[]} errorCodes - Cloudflare error codes
 * @returns {string} Internal error code
 */
export function translateCloudflareError(errorCodes) {
  if (errorCodes && errorCodes.includes('bad-secret')) {
    return 'INVALID_CODE';
  }
  if (errorCodes && errorCodes.includes('expired-timestamp')) {
    return 'EXPIRED_TOKEN';
  }
  return 'INVALID_CODE';
}
```

## Logger Interface
```javascript
// src/api/shared/logger.js

/**
 * Anonymizes IP address by removing last octet
 * @param {string} ip - Full IP address
 * @returns {string} Anonymized IP (e.g., 192.168.1.* *)
 */
export function anonymizeIp(ip) {
  return ip.replace(/\.\d+$/, '.xxx');
}

/**
 * Truncates user agent to 100 characters
 * @param {string} userAgent - Full user agent string
 * @returns {string} Truncated user agent
 */
export function truncateUserAgent(userAgent) {
  const maxLen = 100;
  return userAgent.length > maxLen 
    ? userAgent.substring(0, maxLen) + '...' 
    : userAgent;
}

/**
 * Logs structured event with privacy safeguards
 * @param {Object} context - Azure Functions context
 * @param {string} eventType - success, failure, rate_limit, api_error
 * @param {string|null} errorCode - Error code if failure
 * @param {string} anonymizedIp - Anonymized IP address
 * @param {string} userAgent - Truncated user agent
 */
export function logEvent(context, eventType, errorCode, anonymizedIp, userAgent) {
  context.info(JSON.stringify({
    timestamp: new Date().toISOString(),
    eventType,
    errorCode,
    userId: 'danny', // or 'helen'
    ip: anonymizedIp,
    userAgent: userAgent
  }));
}
```

## Rate Limiter Interface
```javascript
// src/api/shared/rate-limiter.js

const COOKIE_NAME = 'tamtham_verification_attempts';
const MAX_ATTEMPTS = 3;
const EXPIRATION_HOURS = 1;

/**
 * Parses rate limit cookie from request
 * @param {Object} request - Azure Functions HTTP request
 * @returns {Object|null} Cookie data or null
 */
export function getRateLimitCookie(request) {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

/**
 * Checks if rate limit is exceeded for current session
 * @param {Object} context - Azure Functions context
 * @param {string} clientIp - Client IP (for logging)
 * @returns {Object} { limited: boolean, message: string }
 */
export async function checkRateLimit(context, clientIp) {
  const cookie = getRateLimitCookie(context.req);
  const now = Date.now();
  
  // No cookie yet — not limited
  if (!cookie) {
    return { limited: false };
  }
  
  // Check if expired
  if (now - cookie.timestamp > EXPIRATION_HOURS * 3600 * 1000) {
    return { limited: false }; // Reset expired
  }
  
  // Check attempt count
  if (cookie.attempts >= MAX_ATTEMPTS) {
    return { 
      limited: true, 
      message: 'Too many failed attempts. Please wait before trying again.' 
    };
  }
  
  return { limited: false };
}

/**
 * Increments rate limit counter
 * @param {Object} context - Azure Functions context
 * @param {string} clientIp - Client IP
 */
export async function incrementRateLimit(context, clientIp) {
  const cookie = getRateLimitCookie(context.req) || { attempts: 0, timestamp: Date.now() };
  cookie.attempts++;
  cookie.timestamp = Date.now();
  setRateLimitCookie(context.res, cookie);
}

/**
 * Clears rate limit counter on success
 * @param {Object} context - Azure Functions context
 * @param {string} clientIp - Client IP
 */
export async function clearRateLimit(context, clientIp) {
  setRateLimitCookie(context.res, { attempts: 0, timestamp: Date.now() });
}

/**
 * Sets rate limit cookie on response
 * @param {Object} response - Azure Functions HTTP response
 * @param {Object} data - Cookie data
 */
function setRateLimitCookie(response, data) {
  const cookieValue = encodeURIComponent(JSON.stringify(data));
  const cookieHeader = `${COOKIE_NAME}=${cookieValue}; ` +
    `Path=/; ` +
    `Max-Age=${3600}; ` +
    `Secure; ` +
    `HttpOnly; ` +
    `SameSite=Lax`;
  response.headers.set('Set-Cookie', cookieHeader);
}
```

## Turnstile Utils Interface
```javascript
// src/api/shared/turnstile-utils.js

const SITEVERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const API_TIMEOUT = 5000; // 5 seconds

/**
 * Validates token against Cloudflare Siteverify API
 * @param {string} token - Turnstile token from client
 * @param {string} sitekey - Sitekey from environment
 * @param {string} secret - Secret key from environment (Doppler)
 * @param {string} remoteIp - Client IP (optional)
 * @returns {Object} { success: boolean, 'error-codes': string[] }
 */
export async function validateTurnstileToken(token, sitekey, secret, remoteIp) {
  const response = await fetch(SITEVERIFY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      secret: secret,
      response: token,
      remoteip: remoteIp || ''
    }),
    signal: AbortSignal.timeout(API_TIMEOUT)
  });
  
  if (!response.ok) {
    throw new Error(`Cloudflare API error: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Validates that sitekey matches expected value
 * @param {string} sitekey - Sitekey from environment
 * @returns {boolean} True if valid
 */
export function validateSitekey(sitekey) {
  return sitekey && sitekey.length > 0 && sitekey !== 'BUILD_TIME_SITEKEY';
}
```
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement error handler utility</name>
  <files>src/api/shared/error-handler.js, tests/03-security-gates/error-handler.test.js</files>
  <action>
Create error handler module with two exported functions:

**getErrorMessages()**
- Returns object mapping error codes to human-readable messages
- Codes: INVALID_CODE, EXPIRED_TOKEN, RATE_LIMITED, SERVICE_UNAVAILABLE
- Messages per locked decision in CONTEXT.md

**translateCloudflareError(errorCodes)**
- Takes array of Cloudflare error codes (e.g., ['bad-secret'])
- Returns internal error code
- Mapping: 'bad-secret' → 'INVALID_CODE', 'expired-timestamp' → 'EXPIRED_TOKEN'
- Default: 'INVALID_CODE'

Write unit tests covering:
- All 4 error messages are correct
- translateCloudflareError handles 'bad-secret' correctly
- translateCloudflareError handles 'expired-timestamp' correctly
- translateCloudflareError defaults to 'INVALID_CODE' for unknown codes

Use existing Vitest test structure from Phase 1.
  </action>
  <verify>
    <automated>npm test -- tests/03-security-gates/error-handler.test.js</automated>
  </verify>
  <done>
    - error-handler.js exports getErrorMessages() and translateCloudflareError()
    - All 4 error messages match CONTEXT.md locked decisions
    - Unit tests pass with 100% coverage on error handler functions
  </done>
</task>

<task type="auto">
  <name>Task 2: Implement logger utility with privacy safeguards</name>
  <files>src/api/shared/logger.js, tests/03-security-gates/logger.test.js</files>
  <action>
Create logger module with three exported functions:

**anonymizeIp(ip)**
- Removes last octet from IPv4 address using regex
- Example: '192.168.1.123' → '192.168.1.xxx'
- Per CONTEXT.md locked decision

**truncateUserAgent(userAgent)**
- Truncates to first 100 characters
- Adds '...' suffix if truncated
- Example: 'Mozilla/5.0... (200 chars)' → 'Mozilla/5.0... (100 chars)...'

**logEvent(context, eventType, errorCode, anonymizedIp, userAgent)**
- Logs structured JSON to Azure Functions context
- eventType: 'success', 'failure', 'rate_limit', 'api_error'
- Includes: timestamp (UTC), eventType, errorCode (null if success), userId ('danny' or 'helen'), ip, userAgent
- Never logs secrets or full IPs

Write unit tests covering:
- anonymizeIp removes last octet correctly
- anonymizeIp handles edge cases (localhost, IPv6 if needed)
- truncateUserAgent truncates at exactly 100 chars
- truncateUserAgent doesn't add '...' if under 100 chars
- logEvent formats JSON correctly with all fields
  </action>
  <verify>
    <automated>npm test -- tests/03-security-gates/logger.test.js</automated>
  </verify>
  <done>
    - logger.js exports anonymizeIp(), truncateUserAgent(), logEvent()
    - IP anonymization removes last octet per CONTEXT.md
    - User agent truncation at 100 chars per CONTEXT.md
    - Unit tests pass with 100% coverage
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement cookie-based rate limiter</name>
  <files>src/api/shared/rate-limiter.js, tests/03-security-gates/rate-limiter.test.js</files>
  <action>
Create rate limiter module with cookie-based session tracking:

**Constants (per CONTEXT.md)**
- COOKIE_NAME: 'tamtham_verification_attempts'
- MAX_ATTEMPTS: 3
- EXPIRATION_HOURS: 1

**getRateLimitCookie(request)**
- Parses cookie from request.headers.get('cookie')
- Returns parsed JSON or null if missing/invalid
- Uses encodeURIComponent/decodeURIComponent for safety

**checkRateLimit(context, clientIp)**
- Returns { limited: false } if no cookie
- Returns { limited: false } if cookie expired (>1 hour)
- Returns { limited: true, message } if attempts >= 3
- Message: 'Too many failed attempts. Please wait before trying again.'

**incrementRateLimit(context, clientIp)**
- Increments attempts counter
- Updates timestamp to now
- Sets cookie on response with HttpOnly, Secure, SameSite=Lax flags

**clearRateLimit(context, clientIp)**
- Resets attempts to 0
- Updates timestamp to now
- Sets cookie on response

Write unit tests covering:
- getRateLimitCookie parses valid cookie correctly
- getRateLimitCookie returns null for missing cookie
- checkRateLimit allows <3 attempts
- checkRateLimit blocks >=3 attempts
- checkRateLimit resets expired cookies
- incrementRateLimit increases counter
- clearRateLimit resets counter to 0
  </action>
  <verify>
    <automated>npm test -- tests/03-security-gates/rate-limiter.test.js</automated>
  </verify>
  <done>
    - rate-limiter.js exports getRateLimitCookie(), checkRateLimit(), incrementRateLimit(), clearRateLimit()
    - Cookie name matches 'tamtham_verification_attempts' per CONTEXT.md
    - Rate limit triggers at 3 attempts per CONTEXT.md
    - Cookie expires after 1 hour per CONTEXT.md
    - Unit tests pass with 100% coverage
  </done>
</task>

<task type="auto">
  <name>Task 4: Implement Turnstile validation utility</name>
  <files>src/api/shared/turnstile-utils.js, tests/03-security-gates/turnstile-utils.test.js</files>
  <action>
Create Turnstile utility module with two exported functions:

**validateTurnstileToken(token, sitekey, secret, remoteIp)**
- POSTs to https://challenges.cloudflare.com/turnstile/v0/siteverify
- Content-Type: application/x-www-form-urlencoded
- Body params: secret, response (token), remoteip (optional)
- 5-second timeout using AbortSignal.timeout()
- Returns parsed JSON: { success: boolean, 'error-codes': string[] }
- Throws error on HTTP failure

**validateSitekey(sitekey)**
- Validates sitekey is not empty and not placeholder
- Returns true if valid, false if BUILD_TIME_SITEKEY or empty

Write unit tests covering:
- validateSitekey returns false for BUILD_TIME_SITEKEY
- validateSitekey returns false for empty string
- validateSitekey returns true for valid sitekey
- validateTurnstileToken makes correct POST request (mocked)
- validateTurnstileToken includes all required params
- validateTurnstileToken applies 5-second timeout
  </action>
  <verify>
    <automated>npm test -- tests/03-security-gates/turnstile-utils.test.js</automated>
  </verify>
  <done>
    - turnstile-utils.js exports validateTurnstileToken() and validateSitekey()
    - validateTurnstileToken hits correct Cloudflare endpoint
    - 5-second timeout implemented per RESEARCH.md pitfalls
    - validateSitekey prevents misconfiguration
    - Unit tests pass with 100% coverage
  </done>
</task>

<task type="auto">
  <name>Task 5: Create integration verification script</name>
  <files>tests/03-security-gates/validate-utils.js</files>
  <action>
Create standalone verification script that can be run independently:

**Structure**
- Import all 4 utilities from src/api/shared/
- Import all 4 test modules
- Provide CLI interface: node validate-utils.js --test-all

**Commands**
- `--test-all`: Run all unit tests, report pass/fail
- `--help`: Show usage instructions

**Output**
- Clear pass/fail for each test file
- Summary with total tests run, total passed, total failed
- Exit code 0 if all pass, 1 if any fail

**Requirements**
- Must work without Azure Functions runtime
- Must use mocked dependencies for unit tests
- Must be compatible with Vitest CLI
  </action>
  <verify>
    <automated>node tests/03-security-gates/validate-utils.js --test-all</automated>
  </verify>
  <done>
    - validate-utils.js is executable via node
    - --test-all flag runs all 4 test suites
    - Output shows pass/fail for each test file
    - Exit code is 0 when all tests pass
    - Verification completes in <15 seconds
  </done>
</task>

</tasks>

<verification>
Wave 1 complete when:
1. All 4 utility modules exist in src/api/shared/
2. All 4 unit test files exist in tests/03-security-gates/
3. Integration verification script exists and runs successfully
4. Running `node tests/03-security-gates/validate-utils.js --test-all` returns exit code 0
5. All unit tests pass with 100% coverage on utility functions
</verification>

<success_criteria>
- Error handler: All 4 error codes map to correct messages from CONTEXT.md
- Logger: IP anonymization removes last octet, user agent truncates at 100 chars
- Rate limiter: Cookie-based tracking with 3-attempt limit, 1-hour expiration
- Turnstile utils: Correct API endpoint, 5-second timeout, sitekey validation
- Tests: All unit tests pass, integration script runs successfully
- Coverage: 100% coverage on all utility functions
</success_criteria>

<output>
After completion, create `.planning/phases/03-security-gates/03-security-gates-01-SUMMARY.md`
</output>
