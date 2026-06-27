/**
 * Rate Limiter Utility
 * 
 * Provides cookie-based session rate limiting for security gates.
 * Tracks failed attempts per session with 3-attempt limit and 1-hour expiration.
 */

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
export function checkRateLimit(context, clientIp) {
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
export function incrementRateLimit(context, clientIp) {
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
export function clearRateLimit(context, clientIp) {
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
