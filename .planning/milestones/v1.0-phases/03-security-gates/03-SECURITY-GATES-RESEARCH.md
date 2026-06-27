# Phase 03: Security Gates - Research

**Researched:** 2026-03-13
**Domain:** Cloudflare Turnstile CAPTCHA, Azure Static Web Apps Functions, Rate Limiting
**Confidence:** MEDIUM

## Summary

Phase 03 implements Cloudflare Turnstile CAPTCHA gates to protect subdomain access for Danny and Helen Tam-Tham. The phase delivers client-side gate pages with Turnstile widget integration and server-side API endpoints for token validation via Azure Static Web Apps Functions. Key decisions from CONTEXT.md lock in: 3-attempt rate limit per session, cookie-based tracking, build-time sitekey injection via Doppler, anonymized IP logging (last octet removed), and modal error dialogs with error codes.

**Primary recommendation:** Use Cloudflare Turnstile with `https://challenges.cloudflare.com/turnstile/v0/siteverify` endpoint, Azure Functions v4 with Node.js 20 runtime, and implement cookie-based session tracking with 3-attempt rate limiting.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Error Handling:**
- Error messages: Display all error types with error codes for user feedback
  - `INVALID_CODE` — "The verification code was incorrect. Please try again."
  - `EXPIRED_TOKEN` — "The verification code has expired. Please start over."
  - `RATE_LIMITED` — "Too many failed attempts. Please wait before trying again."
  - `SERVICE_UNAVAILABLE` — "The security service is temporarily unavailable. Please try again later."
- Retry logic: Rate limit after 3 failed attempts per session
- Display: Modal dialog with error details (not inline or toast)
- Tracking: Per session using cookie-based tracking (not IP-based)

**API Response Format:**
- Success response: Hybrid approach
  - Browser receives 302 redirect to subdomain
  - API calls receive JSON: `{ "success": true, "redirectUrl": "https://danny.tamtham.com" }`
- Failure response: JSON with error code and human-readable message
  - Example: `{ "success": false, "error": "INVALID_CODE", "message": "The verification code was incorrect." }`
- Redirect URL: Configurable via query parameter in gate page URL (`?redirect=https://danny.tamtham.com`)
- Token submission: POST request with token in JSON body (most efficient for Azure Functions)

**Turnstile Configuration:**
- Sitekey injection: Build-time injection via `<script>` variable
  - Build script replaces placeholders with Doppler-injected values
  - Example: `window.TAMTHAM_SITEKEY = "BUILD_TIME_SITEKEY";`
- Environments: Same sitekey across dev/staging/production (simpler, sitekeys are public)
- Storage: `<script>` variable declared at page load, before widget initialization
- Validation: API validates sitekey matches expected one (prevents misconfiguration)

**Logging & Monitoring:**
- Events logged: All events for complete audit trail
  - Successful verification + redirect
  - Failed verification + error code
  - Rate limit triggered
  - API errors (e.g., Cloudflare Siteverify API unavailable)
- Detail level: Detailed entries with:
  - Timestamp (UTC)
  - Event type (success, failure, rate_limit, api_error)
  - User ID (danny/helen)
  - Error code (if failed)
  - IP address (anonymized — last octet removed)
  - User agent (truncated to 100 chars)
- Storage: Azure Functions built-in logs (accessible via Azure portal)
- Monitoring: Start with Azure logs only, add dashboard later if needed

### Claude's Discretion

- Exact modal styling and animation
- Cookie name and expiration duration
- IP anonymization method (last octet vs. last two octets)
- Error code naming convention (snake_case vs. uppercase)
- Log retention policy (Azure default vs. custom)

### Deferred Ideas (OUT OF SCOPE)

- External logging service — Start with Azure Functions logs, add Datadog/Logtail later
- Monitoring dashboard — Set up alerts for unusual patterns later
- Different sitekeys per environment — Same sitekey across dev/staging/prod for simplicity
- IP-based rate limiting — Using session-based tracking instead
- User agent full logging — Truncating to 100 chars for privacy

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GATE-01 | verify-danny.html displays Cloudflare Turnstile widget | Turnstile widget implementation, build-time sitekey injection |
| GATE-02 | verify-helen.html displays Cloudflare Turnstile widget | Turnstile widget implementation, build-time sitekey injection |
| GATE-03 | Client-side widget loads from challenges.cloudflare.com/turnstile/v0/api.js | Widget CDN URL, error callback handling |
| GATE-04 | Server-side validation via /api/verify-danny and /api/verify-helen endpoints | Azure Functions v4 HTTP trigger structure |
| GATE-05 | API validates token against Cloudflare Siteverify API | Siteverify endpoint, POST request format, response parsing |
| GATE-06 | Successful validation returns 302 redirect to respective subdomain | Azure Functions redirect response, hybrid JSON/redirect logic |
| GATE-07 | Failed validation returns 403 with error message | Error response format, rate limiting logic |
| API-01 | /api/verify-danny/index.js validates Turnstile token and redirects | Function structure, error handling patterns |
| API-02 | /api/verify-helen/index.js validates Turnstile token and redirects | Function structure, error handling patterns |
| API-03 | API uses Cloudflare Turnstile secret from environment variable | Azure Functions environment variables, Doppler integration |
| API-04 | API logs basic success/failure (no secrets in logs) | Azure Functions structured logging, IP anonymization |
| API-05 | API configured with proper function.json and host.json | Function configuration patterns, bundle settings |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Cloudflare Turnstile | Latest (v2+) | CAPTCHA alternative | Non-intrusive, WCAG 2.2 AAA compliant, free tier available |
| Azure Functions | v4 runtime | Server-side validation | Azure SWA native integration, Node.js support |
| Node.js | 20.x (LTS) | Runtime for functions | Current LTS, v4 runtime requirement |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @azure/functions | 4.x | Azure Functions SDK | Required for v4 programming model |
| axios | ^1.6.0 | HTTP client for Turnstile API | Simplifies POST requests, better error handling than fetch |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cloudflare Turnstile | Google reCAPTCHA v3 | Turnstile is less intrusive, better privacy, free tier more generous |
| Cookie-based rate limiting | IP-based rate limiting | Cookie-based works better for users behind NAT, but requires cookie consent |
| Azure Functions v3 | Azure Functions v4 | v4 is current standard, better TypeScript support, improved performance |

**Installation:**
```bash
# Azure Functions dependencies
npm install @azure/functions axios

# Local development (optional)
npm install -g azure-functions-core-tools@4 --windows
```

## Architecture Patterns

### Recommended Project Structure
```
api/
├── verify-danny/
│   ├── index.js          # Function entry point
│   └── function.json     # Function configuration
├── verify-helen/
│   ├── index.js          # Function entry point
│   └── function.json     # Function configuration
└── host.json             # Global function configuration

src/
├── verify-danny.html     # Gate page for Danny
├── verify-helen.html     # Gate page for Helen
└── scripts/
    └── inject-sitekey.js # Build-time sitekey injection script
```

### Pattern 1: Turnstile Widget Integration
**What:** Client-side widget loading with error handling and callback
**When to use:** All gate pages requiring human verification
**Example:**
```javascript
// Source: Cloudflare Turnstile documentation
// Widget rendering with error callback
turnstile.render('#turnstile-widget', {
  sitekey: window.TAMTHAM_SITEKEY,
  callback: function(token) {
    // Token received, submit to API
    submitVerification(token);
  },
  'error-callback': function(errorCode) {
    console.error('Turnstile error:', errorCode);
    handleTurnstileError(errorCode);
  },
  'expired-callback': function() {
    console.log('Token expired');
    handleTokenExpiration();
  },
  'timeout-callback': function() {
    console.log('Challenge timed out');
    handleTimeout();
  }
});

function submitVerification(token) {
  fetch('/api/verify-danny', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  })
  .then(response => {
    if (response.redirected) {
      window.location.href = response.url;
    } else {
      return response.json();
    }
  })
  .then(data => {
    if (data.success) {
      window.location.href = data.redirectUrl;
    } else {
      showErrorModal(data.error, data.message);
    }
  })
  .catch(error => {
    console.error('Validation error:', error);
    showErrorModal('SERVICE_UNAVAILABLE', 'The security service is temporarily unavailable.');
  });
}
```

### Pattern 2: Azure Functions HTTP Validation
**What:** Server-side token validation with rate limiting and logging
**When to use:** All verification endpoints
**Example:**
```javascript
// Source: Azure Functions v4 documentation
// HTTP trigger with Turnstile validation
const { app } = require('@azure/functions');

app.http('verify-danny', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'verify-danny',
  handler: async (request, context) => {
    const startTime = Date.now();
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const truncatedUA = userAgent.length > 100 ? userAgent.substring(0, 100) + '...' : userAgent;
    
    // Get IP and anonymize (remove last octet)
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const anonymizedIp = anonymizeIp(clientIp);
    
    try {
      const { token } = await request.json();
      
      if (!token) {
        logEvent(context, 'failure', 'MISSING_TOKEN', anonymizedIp, truncatedUA);
        return {
          status: 400,
          jsonBody: {
            success: false,
            error: 'MISSING_TOKEN',
            message: 'No verification token provided.'
          }
        };
      }

      // Validate sitekey matches expected value
      const expectedSitekey = process.env.TAMTHAM_SITEKEY;
      if (!expectedSitekey) {
        logEvent(context, 'api_error', 'SITEKEY_NOT_CONFIGURED', anonymizedIp, truncatedUA);
        return {
          status: 500,
          jsonBody: {
            success: false,
            error: 'SERVICE_UNAVAILABLE',
            message: 'The security service is temporarily unavailable.'
          }
        };
      }

      // Check rate limit
      const rateLimitExceeded = await checkRateLimit(context, clientIp);
      if (rateLimitExceeded) {
        logEvent(context, 'rate_limit', 'RATE_LIMITED', anonymizedIp, truncatedUA);
        return {
          status: 429,
          jsonBody: {
            success: false,
            error: 'RATE_LIMITED',
            message: 'Too many failed attempts. Please wait before trying again.'
          }
        };
      }

      // Validate token with Cloudflare
      const validation = await validateTurnstileToken(token, expectedSitekey);
      
      if (!validation.success) {
        const errorCode = translateCloudflareError(validation['error-codes']);
        logEvent(context, 'failure', errorCode, anonymizedIp, truncatedUA);
        
        // Increment rate limit counter
        await incrementRateLimit(context, clientIp);
        
        return {
          status: 403,
          jsonBody: {
            success: false,
            error: errorCode,
            message: getErrorMessage(errorCode)
          }
        };
      }

      // Success - clear rate limit counter
      await clearRateLimit(context, clientIp);
      
      // Log success
      logEvent(context, 'success', null, anonymizedIp, truncatedUA);
      
      // Return redirect URL
      const redirectUrl = new URL(request.url).searchParams.get('redirect') || 
                         'https://danny.tamtham.com';
      
      // For browser requests, return 302 redirect
      const acceptHeader = request.headers.get('accept') || '';
      if (acceptHeader.includes('text/html')) {
        return {
          status: 302,
          headers: { Location: redirectUrl }
        };
      }
      
      // For API calls, return JSON
      return {
        status: 200,
        jsonBody: {
          success: true,
          redirectUrl
        }
      };

    } catch (error) {
      context.error('Unexpected error:', error);
      logEvent(context, 'api_error', 'INTERNAL_ERROR', anonymizedIp, truncatedUA);
      
      return {
        status: 500,
        jsonBody: {
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: 'The security service is temporarily unavailable.'
        }
      };
    }
  }
});

function anonymizeIp(ip) {
  // Remove last octet for privacy
  return ip.replace(/\.\d+$/, '.xxx');
}

async function validateTurnstileToken(token, sitekey) {
  const secret = process.env.TURNSTILE_SECRET;
  
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      secret: secret,
      response: token,
      remoteip: clientIp // Optional: helps Cloudflare detect suspicious activity
    })
  });
  
  return await response.json();
}

function logEvent(context, eventType, errorCode, anonymizedIp, userAgent) {
  context.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    eventType,
    errorCode,
    userId: 'danny',
    ip: anonymizedIp,
    userAgent: userAgent
  }));
}

function getErrorMessage(errorCode) {
  const messages = {
    'INVALID_CODE': 'The verification code was incorrect. Please try again.',
    'EXPIRED_TOKEN': 'The verification code has expired. Please start over.',
    'RATE_LIMITED': 'Too many failed attempts. Please wait before trying again.',
    'SERVICE_UNAVAILABLE': 'The security service is temporarily unavailable. Please try again later.'
  };
  return messages[errorCode] || 'An unexpected error occurred.';
}
```

### Pattern 3: Cookie-Based Session Tracking
**What:** Track failed attempts using cookies instead of IP
**When to use:** Rate limiting implementation
**Example:**
```javascript
// Cookie-based session tracking
function getRateLimitCookie(request) {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/tamtham_rate_limit_danny=([^;]+)/);
  return match ? JSON.parse(decodeURIComponent(match[1])) : null;
}

function setRateLimitCookie(response, data) {
  const cookieValue = encodeURIComponent(JSON.stringify(data));
  response.headers.set('Set-Cookie', 
    `tamtham_rate_limit_danny=${cookieValue}; ` +
    `Path=/; ` +
    `Max-Age=${3600}; ` + // 1 hour expiration
    `Secure; ` + // HTTPS only
    `HttpOnly; ` + // Not accessible via JavaScript
    `SameSite=Lax`
  );
  return cookieValue;
}

async function checkRateLimit(context, clientIp) {
  const cookie = getRateLimitCookie(context.req);
  const now = Date.now();
  
  if (!cookie || cookie.attempts >= 3) {
    return true; // Rate limited
  }
  
  // Check if cookie expired (1 hour)
  if (now - cookie.timestamp > 3600000) {
    return false; // Reset expired cookie
  }
  
  return false;
}

async function incrementRateLimit(context, clientIp) {
  const cookie = getRateLimitCookie(context.req) || { attempts: 0, timestamp: Date.now() };
  cookie.attempts++;
  cookie.timestamp = Date.now();
  setRateLimitCookie(context.res, cookie);
}

async function clearRateLimit(context, clientIp) {
  setRateLimitCookie(context.res, { attempts: 0, timestamp: Date.now() });
}
```

### Anti-Patterns to Avoid

- **Don't log secrets:** Never include `TURNSTILE_SECRET` or sitekeys in logs
- **Don't use IP-based tracking:** Users behind NAT share IPs, leading to unfair rate limits
- **Don't expose error codes:** Keep error codes internal, only show user-friendly messages
- **Don't use fetch without timeout:** Cloudflare API can timeout, implement retry logic
- **Don't hardcode redirect URLs:** Use query parameter for flexibility

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CAPTCHA widget | Custom bot detection | Cloudflare Turnstile | Complex to get right, Turnstile is proven and free |
| IP anonymization | Custom privacy logic | Simple regex (last octet) | Standard pattern, easy to verify |
| Rate limiting database | Custom session store | Cookie-based tracking | Simpler, no additional infrastructure |
| Structured logging | Custom logger | Azure Functions built-in | Already integrated with Azure portal |
| Sitekey injection | Runtime environment setup | Build-time script | Simpler deployment, no environment variables needed for sitekey |

**Key insight:** Turnstile handles all bot detection complexity. The API only needs to validate tokens and implement basic rate limiting. Custom solutions for these problems add significant maintenance burden.

## Common Pitfalls

### Pitfall 1: Cloudflare API Timeout
**What goes wrong:** Siteverify API call hangs or times out
**Why it happens:** Cloudflare API can be slow or unavailable
**How to avoid:** Implement timeout (5 seconds) and retry logic with exponential backoff
**Warning signs:** Function execution time exceeds 10 seconds, frequent 504 errors

### Pitfall 2: Cookie Consent Compliance
**What goes wrong:** Rate limiting cookies violate GDPR/privacy laws
**Why it happens:** Session cookies require user consent in some jurisdictions
**How to avoid:** Use strictly necessary cookies exemption, document in privacy policy
**Warning signs:** Cookie banner appears, users report privacy concerns

### Pitfall 3: Sitekey Mismatch
**What goes wrong:** Widget sitekey doesn't match API validation
**Why it happens:** Build-time injection fails or sitekey changes
**How to avoid:** API validates sitekey matches expected value, add build-time verification
**Warning signs:** All validations fail with INVALID_CODE, widget never issues token

### Pitfall 4: Mixed Response Types
**What goes wrong:** Browser receives JSON instead of redirect, or vice versa
**Why it happens:** Not checking Accept header or content type
**How to avoid:** Check Accept header, return 302 for HTML requests, JSON for API calls
**Warning signs:** Users see JSON on page instead of redirect, API clients get redirect

### Pitfall 5: Logging Sensitive Data
**What goes wrong:** Accidentally logging secrets or full IPs
**Why it happens:** Logging middleware captures all request data
**How to avoid:** Implement custom logger that sanitizes sensitive fields
**Warning signs:** Secrets appear in Azure portal logs, full IPs in audit trail

## Code Examples

### Turnstile Widget with Error Handling

```javascript
// Source: Cloudflare Turnstile documentation
// Complete widget implementation with error handling
document.addEventListener('DOMContentLoaded', function() {
  // Sitekey injected at build time
  const sitekey = window.TAMTHAM_SITEKEY;
  
  if (!sitekey) {
    console.error('Sitekey not configured');
    showError('Configuration error. Please contact support.');
    return;
  }

  turnstile.render('#turnstile-widget', {
    sitekey: sitekey,
    callback: function(token) {
      // Token received, submit to API
      document.getElementById('submit-btn').disabled = true;
      submitVerification(token);
    },
    'error-callback': function(errorCode) {
      console.error('Turnstile error:', errorCode);
      handleTurnstileError(errorCode);
    },
    'expired-callback': function() {
      console.log('Token expired');
      // Auto-reset widget
      turnstile.reset('turnstile-widget');
    },
    'timeout-callback': function() {
      console.log('Challenge timed out');
      // Show reminder to user
      document.getElementById('challenge-notice').style.display = 'block';
    }
  });
});

async function submitVerification(token) {
  try {
    const response = await fetch('/api/verify-danny', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (data.success) {
      // Redirect to subdomain
      window.location.href = data.redirectUrl;
    } else {
      // Show error modal
      showErrorModal(data.error, data.message);
      // Reset widget for retry
      turnstile.reset('turnstile-widget');
    }
  } catch (error) {
    console.error('Network error:', error);
    showErrorModal('SERVICE_UNAVAILABLE', 'The security service is temporarily unavailable.');
    turnstile.reset('turnstile-widget');
  }
}

function showErrorModal(errorCode, message) {
  const modal = document.getElementById('error-modal');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');
  
  errorTitle.textContent = getErrorTitle(errorCode);
  errorMessage.textContent = message;
  modal.style.display = 'flex';
}

function getErrorTitle(errorCode) {
  const titles = {
    'INVALID_CODE': 'Verification Failed',
    'EXPIRED_TOKEN': 'Token Expired',
    'RATE_LIMITED': 'Too Many Attempts',
    'SERVICE_UNAVAILABLE': 'Service Unavailable'
  };
  return titles[errorCode] || 'Error';
}
```

### Azure Functions with Turnstile Validation

```javascript
// Source: Azure Functions v4 documentation
// Complete verification endpoint with error handling
const { app } = require('@azure/functions');

app.http('verify-danny', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'verify-danny',
  handler: async (request, context) => {
    const startTime = Date.now();
    
    // Extract request data
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const anonymizedIp = anonymizeIp(clientIp);
    const truncatedUA = userAgent.length > 100 ? userAgent.substring(0, 100) + '...' : userAgent;
    
    try {
      // Parse request body
      const body = await request.json();
      const { token } = body;

      // Validate token presence
      if (!token) {
        logEvent(context, 'failure', 'MISSING_TOKEN', anonymizedIp, truncatedUA);
        return createErrorResponse('MISSING_TOKEN', 'No verification token provided.', 400);
      }

      // Get configuration
      const sitekey = process.env.TAMTHAM_SITEKEY;
      const secret = process.env.TURNSTILE_SECRET;
      const redirectUrl = new URL(request.url).searchParams.get('redirect') || 
                         'https://danny.tamtham.com';

      // Validate configuration
      if (!sitekey || !secret) {
        logEvent(context, 'api_error', 'CONFIGURATION_ERROR', anonymizedIp, truncatedUA);
        return createErrorResponse('SERVICE_UNAVAILABLE', 'Service configuration error.', 500);
      }

      // Check rate limit
      const rateLimitStatus = await checkRateLimit(context, clientIp);
      if (rateLimitStatus.limited) {
        logEvent(context, 'rate_limit', 'RATE_LIMITED', anonymizedIp, truncatedUA);
        return createErrorResponse('RATE_LIMITED', rateLimitStatus.message, 429);
      }

      // Validate token with Cloudflare
      const validation = await validateTurnstileToken(token, sitekey, secret, clientIp);
      
      if (!validation.success) {
        const errorCode = translateCloudflareError(validation['error-codes']);
        logEvent(context, 'failure', errorCode, anonymizedIp, truncatedUA);
        
        // Increment rate limit
        await incrementRateLimit(context, clientIp);
        
        return createErrorResponse(errorCode, getErrorMessage(errorCode), 403);
      }

      // Success - clear rate limit
      await clearRateLimit(context, clientIp);
      logEvent(context, 'success', null, anonymizedIp, truncatedUA);

      // Return response based on request type
      const acceptHeader = request.headers.get('accept') || '';
      if (acceptHeader.includes('text/html')) {
        // Browser request - return 302 redirect
        return {
          status: 302,
          headers: { Location: redirectUrl }
        };
      }

      // API request - return JSON
      return {
        status: 200,
        jsonBody: {
          success: true,
          redirectUrl: redirectUrl
        }
      };

    } catch (error) {
      context.error('Unexpected error:', error);
      logEvent(context, 'api_error', 'INTERNAL_ERROR', anonymizedIp, truncatedUA);
      return createErrorResponse('SERVICE_UNAVAILABLE', 'Service temporarily unavailable.', 500);
    }
  }
});

// Helper functions
function anonymizeIp(ip) {
  return ip.replace(/\.\d+$/, '.xxx');
}

async function validateTurnstileToken(token, sitekey, secret, remoteIp) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      secret: secret,
      response: token,
      remoteip: remoteIp
    }),
    timeout: 5000 // 5 second timeout
  });

  if (!response.ok) {
    throw new Error(`Cloudflare API error: ${response.status}`);
  }

  return await response.json();
}

function createErrorResponse(errorCode, message, status) {
  return {
    status: status,
    jsonBody: {
      success: false,
      error: errorCode,
      message: message
    }
  };
}

function getErrorMessage(errorCode) {
  const messages = {
    'INVALID_CODE': 'The verification code was incorrect. Please try again.',
    'EXPIRED_TOKEN': 'The verification code has expired. Please start over.',
    'RATE_LIMITED': 'Too many failed attempts. Please wait before trying again.',
    'SERVICE_UNAVAILABLE': 'The security service is temporarily unavailable. Please try again later.'
  };
  return messages[errorCode] || 'An unexpected error occurred.';
}

function translateCloudflareError(errorCodes) {
  if (errorCodes && errorCodes.includes('bad-secret')) {
    return 'INVALID_CODE';
  }
  if (errorCodes && errorCodes.includes('expired-timestamp')) {
    return 'EXPIRED_TOKEN';
  }
  return 'INVALID_CODE';
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google reCAPTCHA v2 (checkbox) | Cloudflare Turnstile | 2023 | Less intrusive, better UX |
| IP-based rate limiting | Cookie-based session tracking | Current | Better privacy, works behind NAT |
| Global environment variables | Build-time injection | Current | Simpler deployment, no runtime config |
| Azure Functions v3 | Azure Functions v4 | 2022 | Better performance, TypeScript support |
| Plaintext IP logging | Anonymized IP (last octet) | Current | GDPR compliance, privacy-first |

**Deprecated/outdated:**
- reCAPTCHA v2: Turnstile is the recommended alternative
- IP-based rate limiting: Cookie-based is more accurate for real users
- Azure Functions v3: v4 is the current runtime standard

## Open Questions

1. **Cookie expiration duration**
   - What we know: CONTEXT.md specifies cookie-based tracking, Claude's discretion
   - What's unclear: Optimal expiration (1 hour vs. 24 hours)
   - Recommendation: Start with 1 hour (3600 seconds), adjust based on user feedback

2. **IP anonymization granularity**
   - What we know: CONTEXT.md specifies "last octet removed"
   - What's unclear: Whether last two octets would be better for privacy
   - Recommendation: Follow CONTEXT.md (last octet), document in privacy policy

3. **Error code naming convention**
   - What we know: CONTEXT.md shows snake_case (INVALID_CODE, EXPIRED_TOKEN)
   - What's unclear: Whether to use uppercase or title case
   - Recommendation: Use snake_case with uppercase words for consistency

4. **Azure Functions timeout limit**
   - What we know: Consumption plan has 5-minute timeout
   - What's unclear: Whether Turnstile API calls can exceed this
   - Recommendation: Implement 5-second timeout on API calls, well under limit

## Validation Architecture

### Automated Verify Commands

| Wave | Plan | Verify Command | Latency |
|------|------|----------------|---------|
| 1 | 03-01 | `node tests/03-security-gates/validate-utils.js --test-all` | 15s |
| 2 | 03-02 | `curl -X POST http://localhost:7071/api/verify-danny -H "Content-Type: application/json" -d '{"token":"test-token"}'` | 5s |
| 2 | 03-03 | `curl -X POST http://localhost:7071/api/verify-helen -H "Content-Type: application/json" -d '{"token":"test-token"}'` | 5s |
| 3 | 03-04 | `node tests/03-security-gates/validate-gate-pages.js` | 30s |

### Feedback Latency
- Unit tests (Wave 1): < 10s for error handler, logger, rate limiter, turnstile utils
- Integration tests (Wave 2): < 30s per API endpoint (local Azure Functions runtime)
- UI verification (Wave 3): Manual checkpoint for modal dialog and Turnstile widget rendering

### Sampling Continuity
- Wave 1: Utilities validated in isolation with unit tests (mocked dependencies)
- Wave 2: APIs validated against local Azure Functions with mocked Cloudflare Siteverify API
- Wave 3: Full integration with real Turnstile widget in browser, actual API endpoints

### Wave 0 Test Completeness
- Wave 0 creates: `.planning/phases/03-security-gates/tests/03-security-gates/` scaffold
- Include test files:
  - `error-handler.test.js` — Unit tests for error code generation, modal display logic
  - `logger.test.js` — Unit tests for IP anonymization, user agent truncation, log formatting
  - `rate-limiter.test.js` — Unit tests for cookie-based session tracking, 3-attempt limit
  - `turnstile-utils.test.js` — Unit tests for sitekey validation, placeholder replacement
  - `verify-danny.api.test.js` — Empty scaffold for Danny API integration tests
  - `verify-helen.api.test.js` — Empty scaffold for Helen API integration tests
  - `gate-pages.manual.test.md` — Manual verification checklist for gate pages
- Manual verification checklist includes:
  - Turnstile widget renders on verify-danny.html and verify-helen.html
  - Modal dialog displays on failed verification
  - Error codes displayed correctly (INVALID_CODE, EXPIRED_TOKEN, RATE_LIMITED, SERVICE_UNAVAILABLE)
  - Cookie-based session tracking works (3 attempts per session)

### Cloudflare Turnstile API Reference
- **Siteverify endpoint:** `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- **Request format:** POST with `application/x-www-form-urlencoded`
- **Required parameters:** `secret` (TURNSTILE_SECRET_KEY), `response` (token), `remoteip` (optional)
- **Response format:** JSON `{ "success": boolean, "error-codes": string[] }`
- **Error codes:** `missing-input-secret`, `invalid-input-secret`, `missing-input-response`, `invalid-input-response`, `bad-request`, `timeout-or-duplicate`

### Azure Functions v4 Configuration
- **Runtime:** Node.js 20.x LTS
- **Model:** Code-centric (v4) with `@azure/functions` SDK
- **HTTP trigger:** `app.http()` with methods ["POST"]
- **Environment variables:** Retrieved via `process.env.VARIABLE_NAME`
- **Logging:** `context.info()`, `context.error()`, `context.warn()`
- **Timeout:** Default 5 minutes (well under consumption plan limit)

### Cookie-Based Rate Limiting Implementation
- **Cookie name:** `tamtham_verification_attempts`
- **Expiration:** 1 hour from last attempt
- **Security flags:** `HttpOnly`, `Secure` (in production)
- **Value format:** JSON `{ attempts: number, lastAttempt: ISO8601_timestamp }`
- **Max attempts:** 3 per session
- **Reset:** Cookie expires or manual page refresh after 3 attempts

### IP Anonymization Pattern
- **Method:** Remove last octet from IPv4 address
- **Example:** `192.168.1.123` → `192.168.1.*`
- **Rationale:** Balances debugging needs with privacy compliance
- **Documentation:** Document in privacy policy as "IP addresses are anonymized before logging"

### User Agent Truncation
- **Method:** Truncate to first 100 characters
- **Rationale:** Preserves browser/OS identification while reducing log size
- **Example:** `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...` → `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (limit 100 chars)`

## Sources

### Primary (HIGH confidence)
- Cloudflare Turnstile documentation (https://developers.cloudflare.com/turnstile/) - Widget rendering, error callbacks, timeout handling
- Azure Functions v4 documentation - HTTP trigger structure, environment variables, logging patterns
- Stack Overflow Azure Functions discussions (2024-2025) - v4 runtime patterns, common issues

### Secondary (MEDIUM confidence)
- Cloudflare API reference - Siteverify endpoint structure
- GitHub repositories with Turnstile implementations - Client-side patterns

### Tertiary (LOW confidence)
- Community discussions on cookie-based rate limiting - Needs verification with privacy legal review

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Cloudflare Turnstile and Azure Functions v4 are well-documented, current standards
- Architecture: MEDIUM - Cookie-based rate limiting needs privacy compliance verification
- Pitfalls: MEDIUM - Cloudflare API timeout behavior not fully documented, requires monitoring

**Research date:** 2026-03-13
**Valid until:** 2026-04-12 (30 days for stable technologies)
