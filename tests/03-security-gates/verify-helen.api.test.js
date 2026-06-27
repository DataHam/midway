/**
 * Integration tests for Helen verification API endpoint
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock shared utilities before importing the handler
vi.mock('../../src/api/shared/turnstile-utils.js', () => ({
  validateTurnstileToken: vi.fn(),
  validateSitekey: vi.fn(),
  getSecret: vi.fn(),
  getSitekey: vi.fn()
}));

vi.mock('../../src/api/shared/error-handler.js', () => ({
  getErrorMessages: vi.fn(),
  translateCloudflareError: vi.fn()
}));

vi.mock('../../src/api/shared/logger.js', () => ({
  logEvent: vi.fn(),
  anonymizeIp: vi.fn((ip) => ip.replace(/\.\d+$/, '.xxx')),
  truncateUserAgent: vi.fn((ua) => ua?.substring(0, 100) || 'unknown')
}));

vi.mock('../../src/api/shared/rate-limiter.js', () => ({
  checkRateLimit: vi.fn(),
  incrementRateLimit: vi.fn(),
  clearRateLimit: vi.fn()
}));

// Now import the mocked modules
const { validateTurnstileToken, getSecret } = await import('../../src/api/shared/turnstile-utils.js');
const { getErrorMessages, translateCloudflareError } = await import('../../src/api/shared/error-handler.js');
const { logEvent } = await import('../../src/api/shared/logger.js');
const { checkRateLimit, incrementRateLimit, clearRateLimit } = await import('../../src/api/shared/rate-limiter.js');
import { handler } from '../../src/api/verify-helen/index.js';

describe('Helen Verification API', () => {
  let mockContext;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockContext = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      req: {
        headers: new Map()
      },
      res: {
        headers: new Map()
      }
    };
    
    // Set up default mocks
    validateTurnstileToken.mockResolvedValue({ success: true });
    getErrorMessages.mockReturnValue({
      'INVALID_CODE': 'The verification code was incorrect. Please try again.',
      'EXPIRED_TOKEN': 'The verification code has expired. Please start over.',
      'RATE_LIMITED': 'Too many failed attempts. Please wait before trying again.',
      'SERVICE_UNAVAILABLE': 'The security service is temporarily unavailable. Please try again later.'
    });
    translateCloudflareError.mockImplementation((errorCodes) => {
      if (errorCodes && errorCodes.includes('expired-timestamp')) {
        return 'EXPIRED_TOKEN';
      }
      return 'INVALID_CODE';
    });
    checkRateLimit.mockReturnValue({ limited: false });
    getSecret.mockReturnValue('test-secret-key');
  });

  const createMockRequest = (body = {}, headers = {}, searchParams = []) => {
    const mockReq = {
      headers: {
        get: (name) => {
          const lowerName = name.toLowerCase();
          if (lowerName === 'content-type') return 'application/json';
          if (lowerName === 'user-agent') return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
          if (lowerName === 'cookie') return mockContext.req.headers.get('cookie') || '';
          return headers[lowerName] || null;
        }
      },
      json: async () => body,
      url: `http://localhost/api/verify-helen${searchParams.length > 0 ? '?' + searchParams.join('&') : ''}`
    };
    return mockReq;
  };

  describe('Test 1: Valid token returns 302 redirect for HTML requests', () => {
    it('should return 302 with Location header for browser requests', async () => {
      const request = createMockRequest(
        { token: 'valid-turnstile-token' },
        { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      );
      
      const response = await handler(request, mockContext);
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('https://helen.tamtham.com');
      expect(response.headers.get('Set-Cookie')).toContain('tamtham_verification_attempts=');
    });
  });

  describe('Test 2: Valid token returns JSON with redirectUrl for API requests', () => {
    it('should return JSON with redirectUrl for API requests', async () => {
      const request = createMockRequest(
        { token: 'valid-turnstile-token' },
        { 
          'user-agent': 'Mozilla/5.0',
          'accept': 'application/json'
        }
      );
      
      const response = await handler(request, mockContext);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.redirectUrl).toBe('https://helen.tamtham.com');
    });
  });

  describe('Test 3: Missing token returns 400 with MISSING_TOKEN error', () => {
    it('should return 400 when token is missing', async () => {
      const request = createMockRequest({}, { 'user-agent': 'Mozilla/5.0' });
      
      const response = await handler(request, mockContext);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('MISSING_TOKEN');
    });
  });

  describe('Test 4: Invalid token returns 403 with INVALID_CODE error', () => {
    it('should return 403 with INVALID_CODE for invalid token', async () => {
      validateTurnstileToken.mockResolvedValue({ 
        success: false, 
        'error-codes': ['invalid-token'] 
      });
      
      const request = createMockRequest(
        { token: 'invalid-token' },
        { 'user-agent': 'Mozilla/5.0' }
      );
      
      const response = await handler(request, mockContext);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('INVALID_CODE');
    });
  });

  describe('Test 5: Expired token returns 403 with EXPIRED_TOKEN error', () => {
    it('should return 403 with EXPIRED_TOKEN for expired token', async () => {
      validateTurnstileToken.mockResolvedValue({ 
        success: false, 
        'error-codes': ['expired-timestamp'] 
      });
      
      const request = createMockRequest(
        { token: 'expired-token' },
        { 'user-agent': 'Mozilla/5.0' }
      );
      
      const response = await handler(request, mockContext);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('EXPIRED_TOKEN');
    });
  });

  describe('Test 6: Rate limited request returns 429 with RATE_LIMITED error', () => {
    it('should return 429 when rate limit exceeded', async () => {
      checkRateLimit.mockReturnValue({ 
        limited: true, 
        message: 'Too many failed attempts. Please wait before trying again.' 
      });
      
      const request = createMockRequest(
        { token: 'any-token' },
        { 'user-agent': 'Mozilla/5.0' }
      );
      
      const response = await handler(request, mockContext);
      const data = await response.json();
      
      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toBe('RATE_LIMITED');
    });
  });

  describe('Test 7: Successful validation clears rate limit counter', () => {
    it('should call clearRateLimit on successful validation', async () => {
      const request = createMockRequest(
        { token: 'valid-token' },
        { 'user-agent': 'Mozilla/5.0' }
      );
      
      await handler(request, mockContext);
      
      expect(clearRateLimit).toHaveBeenCalledWith(mockContext, expect.any(String));
    });
  });

  describe('Test 8: Failed validation increments rate limit counter', () => {
    it('should call incrementRateLimit on failed validation', async () => {
      validateTurnstileToken.mockResolvedValue({ 
        success: false, 
        'error-codes': ['invalid-token'] 
      });
      
      const request = createMockRequest(
        { token: 'invalid-token' },
        { 'user-agent': 'Mozilla/5.0' }
      );
      
      await handler(request, mockContext);
      
      expect(incrementRateLimit).toHaveBeenCalledWith(mockContext, expect.any(String));
    });
  });

  describe('Test 9: Logs success event with anonymized IP', () => {
    it('should log success with anonymized IP on valid token', async () => {
      const request = createMockRequest(
        { token: 'valid-token' },
        { 
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '192.168.1.100'
        }
      );
      
      await handler(request, mockContext);
      
      expect(logEvent).toHaveBeenCalledWith(
        mockContext,
        'success',
        null,
        '192.168.1.xxx',
        expect.any(String),
        'helen'
      );
    });
  });

  describe('Test 10: Logs failure event with error code', () => {
    it('should log failure with error code on invalid token', async () => {
      validateTurnstileToken.mockResolvedValue({ 
        success: false, 
        'error-codes': ['invalid-token'] 
      });
      
      const request = createMockRequest(
        { token: 'invalid-token' },
        { 'x-forwarded-for': '10.0.0.50' }
      );
      
      await handler(request, mockContext);
      
      expect(logEvent).toHaveBeenCalledWith(
        mockContext,
        'failure',
        'INVALID_CODE',
        '10.0.0.xxx',
        expect.any(String),
        'helen'
      );
    });
  });
});
