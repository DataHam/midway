/**
 * Unit tests for error handler utility
 */
import { describe, it, expect } from 'vitest';
import { getErrorMessages, translateCloudflareError } from '../../src/api/shared/error-handler.js';

describe('getErrorMessages', () => {
  it('returns all 4 error messages correctly', () => {
    const messages = getErrorMessages();
    
    expect(messages).toHaveProperty('INVALID_CODE');
    expect(messages).toHaveProperty('EXPIRED_TOKEN');
    expect(messages).toHaveProperty('RATE_LIMITED');
    expect(messages).toHaveProperty('SERVICE_UNAVAILABLE');
  });

  it('INVALID_CODE message matches locked decision', () => {
    const messages = getErrorMessages();
    expect(messages.INVALID_CODE).toBe('The verification code was incorrect. Please try again.');
  });

  it('EXPIRED_TOKEN message matches locked decision', () => {
    const messages = getErrorMessages();
    expect(messages.EXPIRED_TOKEN).toBe('The verification code has expired. Please start over.');
  });

  it('RATE_LIMITED message matches locked decision', () => {
    const messages = getErrorMessages();
    expect(messages.RATE_LIMITED).toBe('Too many failed attempts. Please wait before trying again.');
  });

  it('SERVICE_UNAVAILABLE message matches locked decision', () => {
    const messages = getErrorMessages();
    expect(messages.SERVICE_UNAVAILABLE).toBe('The security service is temporarily unavailable. Please try again later.');
  });
});

describe('translateCloudflareError', () => {
  it('translates bad-secret to INVALID_CODE', () => {
    const result = translateCloudflareError(['bad-secret']);
    expect(result).toBe('INVALID_CODE');
  });

  it('translates expired-timestamp to EXPIRED_TOKEN', () => {
    const result = translateCloudflareError(['expired-timestamp']);
    expect(result).toBe('EXPIRED_TOKEN');
  });

  it('defaults to INVALID_CODE for unknown codes', () => {
    const result = translateCloudflareError(['unknown-error']);
    expect(result).toBe('INVALID_CODE');
  });

  it('defaults to INVALID_CODE for empty array', () => {
    const result = translateCloudflareError([]);
    expect(result).toBe('INVALID_CODE');
  });

  it('defaults to INVALID_CODE for null', () => {
    const result = translateCloudflareError(null);
    expect(result).toBe('INVALID_CODE');
  });

  it('defaults to INVALID_CODE for undefined', () => {
    const result = translateCloudflareError(undefined);
    expect(result).toBe('INVALID_CODE');
  });

  it('handles multiple error codes - bad-secret takes precedence', () => {
    const result = translateCloudflareError(['bad-secret', 'expired-timestamp']);
    expect(result).toBe('INVALID_CODE');
  });
});
