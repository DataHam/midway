/**
 * Logger Utility
 * 
 * Provides structured logging with privacy safeguards for security gates.
 * Anonymizes IP addresses and truncates user agents to protect user privacy.
 */

/**
 * Anonymizes IP address by removing last octet
 * @param {string} ip - Full IP address
 * @returns {string} Anonymized IP (e.g., 192.168.1.xxx)
 */
export function anonymizeIp(ip) {
  if (!ip) return 'unknown';
  return ip.replace(/\.\d+$/, '.xxx');
}

/**
 * Truncates user agent to 100 characters
 * @param {string} userAgent - Full user agent string
 * @returns {string} Truncated user agent
 */
export function truncateUserAgent(userAgent) {
  const maxLen = 100;
  if (!userAgent || userAgent.length === 0) return 'unknown';
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
 * @param {string} userId - 'danny' or 'helen'
 */
export function logEvent(context, eventType, errorCode, anonymizedIp, userAgent, userId = 'danny') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    errorCode,
    userId,
    ip: anonymizedIp,
    userAgent: truncateUserAgent(userAgent)
  };

  context.info(JSON.stringify(logEntry));
}
