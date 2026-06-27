/**
 * Unit tests for logger utility
 */
import { describe, it, expect, vi } from 'vitest';
import { anonymizeIp, truncateUserAgent, logEvent } from '../../src/api/shared/logger.js';

describe('anonymizeIp', () => {
  it('removes last octet from IPv4 address', () => {
    const result = anonymizeIp('192.168.1.123');
    expect(result).toBe('192.168.1.xxx');
  });

  it('handles localhost', () => {
    const result = anonymizeIp('127.0.0.1');
    expect(result).toBe('127.0.0.xxx');
  });

  it('handles any IPv4 address', () => {
    const result = anonymizeIp('10.0.0.255');
    expect(result).toBe('10.0.0.xxx');
  });

  it('returns unknown for null', () => {
    const result = anonymizeIp(null);
    expect(result).toBe('unknown');
  });

  it('returns unknown for undefined', () => {
    const result = anonymizeIp(undefined);
    expect(result).toBe('unknown');
  });

  it('returns unknown for empty string', () => {
    const result = anonymizeIp('');
    expect(result).toBe('unknown');
  });

  it('uses regex to match last octet', () => {
    const result = anonymizeIp('172.16.0.100');
    expect(result).toBe('172.16.0.xxx');
  });
});

describe('truncateUserAgent', () => {
  it('truncates to exactly 100 characters', () => {
    const longAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    const result = truncateUserAgent(longAgent);
    expect(result.length).toBe(103); // 100 chars + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('does not add ... if under 100 chars', () => {
    const shortAgent = 'Mozilla/5.0';
    const result = truncateUserAgent(shortAgent);
    expect(result).toBe('Mozilla/5.0');
    expect(result.length).toBe(11);
  });

  it('handles exactly 100 characters', () => {
    const exactAgent = 'a'.repeat(100);
    const result = truncateUserAgent(exactAgent);
    expect(result).toBe(exactAgent);
    expect(result.length).toBe(100);
  });

  it('handles null', () => {
    const result = truncateUserAgent(null);
    expect(result).toBe('unknown');
  });

  it('handles undefined', () => {
    const result = truncateUserAgent(undefined);
    expect(result).toBe('unknown');
  });

  it('handles empty string', () => {
    const result = truncateUserAgent('');
    expect(result).toBe('unknown');
  });
});

describe('logEvent', () => {
  it('logs structured JSON with all fields', () => {
    const mockContext = {
      info: vi.fn()
    };

    logEvent(
      mockContext,
      'success',
      null,
      '192.168.1.xxx',
      'Mozilla/5.0',
      'danny'
    );

    expect(mockContext.info).toHaveBeenCalledTimes(1);
    const calledWith = JSON.parse(mockContext.info.mock.calls[0][0]);
    
    expect(calledWith).toHaveProperty('timestamp');
    expect(calledWith.eventType).toBe('success');
    expect(calledWith.errorCode).toBe(null);
    expect(calledWith.userId).toBe('danny');
    expect(calledWith.ip).toBe('192.168.1.xxx');
    expect(calledWith.userAgent).toBe('Mozilla/5.0');
  });

  it('logs failure event with error code', () => {
    const mockContext = {
      info: vi.fn()
    };

    logEvent(
      mockContext,
      'failure',
      'INVALID_CODE',
      '10.0.0.xxx',
      'Chrome/91.0',
      'helen'
    );

    const calledWith = JSON.parse(mockContext.info.mock.calls[0][0]);
    expect(calledWith.eventType).toBe('failure');
    expect(calledWith.errorCode).toBe('INVALID_CODE');
    expect(calledWith.userId).toBe('helen');
  });

  it('logs rate_limit event', () => {
    const mockContext = {
      info: vi.fn()
    };

    logEvent(
      mockContext,
      'rate_limit',
      'RATE_LIMITED',
      '172.16.0.xxx',
      'Safari/14.1'
    );

    const calledWith = JSON.parse(mockContext.info.mock.calls[0][0]);
    expect(calledWith.eventType).toBe('rate_limit');
    expect(calledWith.errorCode).toBe('RATE_LIMITED');
    expect(calledWith.userId).toBe('danny'); // default
  });

  it('logs api_error event', () => {
    const mockContext = {
      info: vi.fn()
    };

    logEvent(
      mockContext,
      'api_error',
      'SERVICE_UNAVAILABLE',
      '8.8.8.xxx',
      'Firefox/89.0'
    );

    const calledWith = JSON.parse(mockContext.info.mock.calls[0][0]);
    expect(calledWith.eventType).toBe('api_error');
    expect(calledWith.errorCode).toBe('SERVICE_UNAVAILABLE');
  });

  it('logs with anonymized IP', () => {
    const mockContext = {
      info: vi.fn()
    };

    logEvent(
      mockContext,
      'success',
      null,
      '192.168.1.xxx',
      'Mozilla/5.0'
    );

    const calledWith = JSON.parse(mockContext.info.mock.calls[0][0]);
    expect(calledWith.ip).toBe('192.168.1.xxx');
    expect(calledWith.ip).not.toMatch(/\.\d+$/); // Should not have numeric last octet
  });

  it('logs truncated user agent', () => {
    const mockContext = {
      info: vi.fn()
    };

    const longAgent = 'a'.repeat(150);
    logEvent(
      mockContext,
      'success',
      null,
      '192.168.1.xxx',
      longAgent
    );

    const calledWith = JSON.parse(mockContext.info.mock.calls[0][0]);
    expect(calledWith.userAgent.length).toBe(103); // 100 + '...'
    expect(calledWith.userAgent.endsWith('...')).toBe(true);
  });
});
