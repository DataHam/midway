/**
 * Unit tests for rate limiter utility
 */
import { describe, it, expect, vi } from 'vitest';
import {
  getRateLimitCookie,
  checkRateLimit,
  incrementRateLimit,
  clearRateLimit
} from '../../src/api/shared/rate-limiter.js';

describe('getRateLimitCookie', () => {
  it('parses valid cookie correctly', () => {
    const mockRequest = {
      headers: {
        get: (name) => name === 'cookie' ? 'tamtham_verification_attempts=%7B%22attempts%22%3A2%2C%22timestamp%22%3A1710345600000%7D' : null
      }
    };
    
    const result = getRateLimitCookie(mockRequest);
    expect(result).toEqual({ attempts: 2, timestamp: 1710345600000 });
  });

  it('returns null for missing cookie', () => {
    const mockRequest = {
      headers: {
        get: (name) => name === 'cookie' ? '' : null
      }
    };
    
    const result = getRateLimitCookie(mockRequest);
    expect(result).toBe(null);
  });

  it('returns null for invalid JSON', () => {
    const mockRequest = {
      headers: {
        get: (name) => name === 'cookie' ? 'tamtham_verification_attempts=invalid-json' : null
      }
    };
    
    const result = getRateLimitCookie(mockRequest);
    expect(result).toBe(null);
  });

  it('handles URL-encoded cookie value', () => {
    const mockRequest = {
      headers: {
        get: (name) => name === 'cookie' ? 'tamtham_verification_attempts=%7B%22attempts%22%3A0%2C%22timestamp%22%3A1710345600000%7D' : null
      }
    };
    
    const result = getRateLimitCookie(mockRequest);
    expect(result).toEqual({ attempts: 0, timestamp: 1710345600000 });
  });
});

describe('checkRateLimit', () => {
  it('returns not limited if no cookie', async () => {
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? '' : null }
      }
    };
    
    const result = await checkRateLimit(mockContext, '192.168.1.1');
    expect(result).toEqual({ limited: false });
  });

it('returns not limited if cookie has <3 attempts', () => {
    const now = Date.now();
    const cookieData = encodeURIComponent(JSON.stringify({ attempts: 2, timestamp: now }));
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? `tamtham_verification_attempts=${cookieData}` : null }
      }
    };
    
    const result = checkRateLimit(mockContext, '192.168.1.1');
    expect(result).toEqual({ limited: false });
  });

  it('returns limited if attempts >= 3', () => {
    const now = Date.now();
    const cookieData = encodeURIComponent(JSON.stringify({ attempts: 3, timestamp: now }));
    const testContext = {
      req: {
        headers: { get: (n) => n === 'cookie' ? `tamtham_verification_attempts=${cookieData}` : null }
      }
    };
    
    const result = checkRateLimit(testContext, '192.168.1.1');
    expect(result).toEqual({
      limited: true,
      message: 'Too many failed attempts. Please wait before trying again.'
    });
  });

  it('resets expired cookies (>1 hour)', () => {
    const oldTimestamp = Date.now() - (2 * 3600 * 1000); // 2 hours ago
    const cookieData = encodeURIComponent(JSON.stringify({ attempts: 3, timestamp: oldTimestamp }));
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? `tamtham_verification_attempts=${cookieData}` : null }
      }
    };
    
    const result = checkRateLimit(mockContext, '192.168.1.1');
    expect(result).toEqual({ limited: false });
  });

  it('resets cookies exactly at 1 hour', () => {
    const oldTimestamp = Date.now() - ((60 * 60) + 1) * 1000; // 1 hour + 1 second ago
    const cookieData = encodeURIComponent(JSON.stringify({ attempts: 3, timestamp: oldTimestamp }));
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? `tamtham_verification_attempts=${cookieData}` : null }
      }
    };
    
    const result = checkRateLimit(mockContext, '192.168.1.1');
    expect(result).toEqual({ limited: false });
  });
});

describe('incrementRateLimit', () => {
  it('increments attempts counter', () => {
    const now = Date.now();
    const cookieData = encodeURIComponent(JSON.stringify({ attempts: 1, timestamp: now }));
    const mockContext = {
      req: {
        headers: { get: (n) => n === 'cookie' ? `tamtham_verification_attempts=${cookieData}` : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    incrementRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    expect(setCookie).toContain('tamtham_verification_attempts=');
    
    // Parse to verify attempts incremented
    const cookieMatch = setCookie.match(/tamtham_verification_attempts=([^;]+)/);
    if (cookieMatch) {
      const decoded = decodeURIComponent(cookieMatch[1]);
      const data = JSON.parse(decoded);
      expect(data.attempts).toBe(2);
    }
  });

  it('creates new cookie if none exists', () => {
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? '' : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    incrementRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    expect(setCookie).toContain('tamtham_verification_attempts=');
    
    const cookieMatch = setCookie.match(/tamtham_verification_attempts=([^;]+)/);
    if (cookieMatch) {
      const data = JSON.parse(decodeURIComponent(cookieMatch[1]));
      expect(data.attempts).toBe(1);
    }
  });

  it('updates timestamp on increment', () => {
    const oldTimestamp = Date.now() - 1000;
    const cookieData = encodeURIComponent(JSON.stringify({ attempts: 1, timestamp: oldTimestamp }));
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? `tamtham_verification_attempts=${cookieData}` : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    incrementRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    const cookieMatch = setCookie.match(/tamtham_verification_attempts=([^;]+)/);
    if (cookieMatch) {
      const data = JSON.parse(decodeURIComponent(cookieMatch[1]));
      expect(data.timestamp).toBeGreaterThan(oldTimestamp);
    }
  });
});

describe('clearRateLimit', () => {
  it('resets attempts to 0', () => {
    const now = Date.now();
    const cookieData = encodeURIComponent(JSON.stringify({ attempts: 3, timestamp: now }));
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? `tamtham_verification_attempts=${cookieData}` : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    clearRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    const cookieMatch = setCookie.match(/tamtham_verification_attempts=([^;]+)/);
    if (cookieMatch) {
      const data = JSON.parse(decodeURIComponent(cookieMatch[1]));
      expect(data.attempts).toBe(0);
    }
  });

  it('updates timestamp on clear', () => {
    const oldTimestamp = Date.now() - 1000;
    const cookieData = encodeURIComponent(JSON.stringify({ attempts: 3, timestamp: oldTimestamp }));
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? `tamtham_verification_attempts=${cookieData}` : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    clearRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    const cookieMatch = setCookie.match(/tamtham_verification_attempts=([^;]+)/);
    if (cookieMatch) {
      const data = JSON.parse(decodeURIComponent(cookieMatch[1]));
      expect(data.timestamp).toBeGreaterThan(oldTimestamp);
    }
  });
});

describe('Cookie Security Flags', () => {
  it('sets Secure flag', () => {
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? '' : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    incrementRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    expect(setCookie).toContain('Secure');
    expect(setCookie).toContain('tamtham_verification_attempts=');
  });

  it('sets HttpOnly flag', () => {
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? '' : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    incrementRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('tamtham_verification_attempts=');
  });

  it('sets SameSite=Lax', () => {
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? '' : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    incrementRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('tamtham_verification_attempts=');
  });

  it('sets Max-Age=3600 (1 hour)', () => {
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? '' : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    incrementRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    expect(setCookie).toContain('Max-Age=3600');
    expect(setCookie).toContain('tamtham_verification_attempts=');
  });

  it('sets Path=/', () => {
    const mockContext = {
      req: {
        headers: { get: (name) => name === 'cookie' ? '' : null }
      },
      res: {
        headers: new Map()
      }
    };
    
    incrementRateLimit(mockContext, '192.168.1.1');
    
    const setCookie = mockContext.res.headers.get('Set-Cookie');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('tamtham_verification_attempts=');
  });
});
