/**
 * Error Handler Utility
 * 
 * Provides error code to human-readable message translation
 * and Cloudflare error code mapping for security gates.
 */

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
