/**
 * Turnstile Utils Utility
 * 
 * Provides Cloudflare Turnstile token validation via Siteverify API
 * and sitekey configuration validation for security gates.
 */

const SITEVERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const API_TIMEOUT = 5000; // 5 seconds

/**
 * Validates token against Cloudflare Siteverify API
 * @param {string} token - Turnstile token from client
 * @param {string} sitekey - Sitekey from environment
 * @param {string} secret - Secret key from environment (Doppler)
 * @param {string} remoteIp - Client IP (optional)
 * @returns {Promise<Object>} { success: boolean, 'error-codes': string[] }
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
  if (!sitekey || sitekey.length === 0) {
    return false;
  }
  return sitekey !== 'BUILD_TIME_SITEKEY';
}

/**
 * Retrieves Turnstile secret key from environment
 * @returns {string} Secret key or empty string if not set
 */
export function getSecret() {
  return process.env.TURNSTILE_SECRET_KEY || '';
}

/**
 * Retrieves Turnstile sitekey from environment
 * @returns {string} Sitekey or empty string if not set
 */
export function getSitekey() {
  return process.env.TAMTHAM_SITEKEY || '';
}
