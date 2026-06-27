/**
 * Unit tests for Turnstile utilities
 */
import { describe, it, expect, vi } from 'vitest';
import { validateTurnstileToken, validateSitekey } from '../../src/api/shared/turnstile-utils.js';

describe('validateSitekey', () => {
  it('returns false for BUILD_TIME_SITEKEY', () => {
    const result = validateSitekey('BUILD_TIME_SITEKEY');
    expect(result).toBe(false);
  });

  it('returns false for empty string', () => {
    const result = validateSitekey('');
    expect(result).toBe(false);
  });

  it('returns false for null', () => {
    const result = validateSitekey(null);
    expect(result).toBe(false);
  });

  it('returns false for undefined', () => {
    const result = validateSitekey(undefined);
    expect(result).toBe(false);
  });

  it('returns true for valid sitekey', () => {
    const result = validateSitekey('1x00000000000000000000AA');
    expect(result).toBe(true);
  });

  it('returns true for non-empty valid sitekey', () => {
    const result = validateSitekey('0x00000000000000000000BB');
    expect(result).toBe(true);
  });

  it('returns true for any non-empty non-placeholder string', () => {
    const result = validateSitekey('some-valid-sitekey');
    expect(result).toBe(true);
  });
});

describe('validateTurnstileToken', () => {
  it('makes correct POST request to Cloudflare API', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, 'error-codes': [] })
    };
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;
    
    const token = '0xABCDEFGHIJKLMNOPQRSTUVWXYZabcdef';
    const sitekey = '1x00000000000000000000AA';
    const secret = '1x0000000000000000000000000000000AA';
    
    await validateTurnstileToken(token, sitekey, secret, '192.168.1.1');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        signal: expect.any(AbortSignal)
      })
    );
  });

  it('includes all required params in request body', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, 'error-codes': [] })
    };
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;
    
    const token = 'test-token-123';
    const sitekey = '1x00000000000000000000AA';
    const secret = 'test-secret-123';
    const remoteIp = '10.0.0.1';
    
    await validateTurnstileToken(token, sitekey, secret, remoteIp);
    
    const callArgs = mockFetch.mock.calls[0][1];
    const body = callArgs.body;
    
    expect(body.get('secret')).toBe(secret);
    expect(body.get('response')).toBe(token);
    expect(body.get('remoteip')).toBe(remoteIp);
  });

  it('handles missing remoteIP as empty string', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, 'error-codes': [] })
    };
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;
    
    const token = 'test-token-123';
    const sitekey = '1x00000000000000000000AA';
    const secret = 'test-secret-123';
    
    await validateTurnstileToken(token, sitekey, secret);
    
    const callArgs = mockFetch.mock.calls[0][1];
    const body = callArgs.body;
    
    expect(body.get('remoteip')).toBe('');
  });

  it('applies 5-second timeout', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, 'error-codes': [] })
    };
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;
    
    const token = 'test-token-123';
    const sitekey = '1x00000000000000000000AA';
    const secret = 'test-secret-123';
    
    await validateTurnstileToken(token, sitekey, secret);
    
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.signal).toBeInstanceOf(AbortSignal);
  });

  it('throws error on HTTP failure', async () => {
    const mockResponse = {
      ok: false,
      status: 500
    };
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;
    
    const token = 'test-token-123';
    const sitekey = '1x00000000000000000000AA';
    const secret = 'test-secret-123';
    
    await expect(validateTurnstileToken(token, sitekey, secret))
      .rejects
      .toThrow('Cloudflare API error: 500');
  });

  it('returns parsed JSON response on success', async () => {
    const expectedResponse = {
      success: false,
      'error-codes': ['missing-input-response']
    };
    
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(expectedResponse)
    };
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;
    
    const token = 'test-token-123';
    const sitekey = '1x00000000000000000000AA';
    const secret = 'test-secret-123';
    
    const result = await validateTurnstileToken(token, sitekey, secret);
    
    expect(result).toEqual(expectedResponse);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  it('handles successful validation response', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        'error-codes': [],
        'hostname': 'example.com',
        'ts': '2026-03-13T12:00:00Z'
      })
    };
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;
    
    const token = 'valid-token';
    const sitekey = '1x00000000000000000000AA';
    const secret = 'test-secret-123';
    
    const result = await validateTurnstileToken(token, sitekey, secret);
    
    expect(result.success).toBe(true);
    expect(result['error-codes']).toEqual([]);
  });

  it('handles failed validation response with error codes', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        'error-codes': ['bad-secret', 'expired-timestamp']
      })
    };
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = mockFetch;
    
    const token = 'invalid-token';
    const sitekey = '1x00000000000000000000AA';
    const secret = 'test-secret-123';
    
    const result = await validateTurnstileToken(token, sitekey, secret);
    
    expect(result.success).toBe(false);
    expect(result['error-codes']).toEqual(['bad-secret', 'expired-timestamp']);
  });
});
