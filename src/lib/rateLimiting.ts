/**
 * Rate limiting middleware for API routes
 * Prevents abuse and brute force attacks
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    requests: number;
    windowStart: number;
    blocked: boolean;
  };
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore: RateLimitStore = {};

// Default rate limit configs for different route types
export const RATE_LIMIT_CONFIGS = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
  },
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // Very strict for sensitive operations
  },
};

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (for production with proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  // Include user agent to make it harder to bypass
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${clientIp}:${userAgent.substring(0, 50)}`;
}

/**
 * Clean up old entries from the rate limit store
 */
function cleanupStore() {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    const entry = rateLimitStore[key];
    if (now - entry.windowStart > 24 * 60 * 60 * 1000) { // Clean up entries older than 24 hours
      delete rateLimitStore[key];
    }
  });
}

/**
 * Check if request should be rate limited
 */
function isRateLimited(clientId: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const entry = rateLimitStore[clientId];
  
  // Clean up store periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanupStore();
  }
  
  if (!entry) {
    // First request from this client
    rateLimitStore[clientId] = {
      requests: 1,
      windowStart: now,
      blocked: false,
    };
    return false;
  }
  
  // Check if we're in a new window
  if (now - entry.windowStart >= config.windowMs) {
    // Reset for new window
    entry.requests = 1;
    entry.windowStart = now;
    entry.blocked = false;
    return false;
  }
  
  // Check if already blocked in this window
  if (entry.blocked) {
    return true;
  }
  
  // Increment request count
  entry.requests++;
  
  // Check if limit exceeded
  if (entry.requests > config.maxRequests) {
    entry.blocked = true;
    return true;
  }
  
  return false;
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.api,
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const clientId = getClientId(request);
    
    if (isRateLimited(clientId, config)) {
      // Log rate limit violation
      console.warn(`Rate limit exceeded for client: ${clientId.split(':')[0]} on ${request.url}`);
      
      return new NextResponse(
        JSON.stringify({
          error: 'Te veel verzoeken. Probeer het later opnieuw.',
          retryAfter: Math.ceil(config.windowMs / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + config.windowMs).toISOString(),
          },
        }
      );
    }
    
    // Get remaining requests for headers
    const entry = rateLimitStore[clientId];
    const remaining = Math.max(0, config.maxRequests - (entry?.requests || 0));
    
    try {
      const response = await handler(request);
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());
      
      return response;
    } catch (error) {
      // Don't count failed requests against rate limit for server errors
      if (entry && !config.skipFailedRequests) {
        entry.requests = Math.max(0, entry.requests - 1);
      }
      throw error;
    }
  };
}

/**
 * Enhanced rate limiting for authentication routes
 */
export function withAuthRateLimit(handler: (request: NextRequest) => Promise<Response>) {
  return withRateLimit(RATE_LIMIT_CONFIGS.auth, async (request: NextRequest) => {
    const response = await handler(request);
    
    // If authentication failed, increase the penalty
    if (response.status === 401 || response.status === 403) {
      const clientId = getClientId(request);
      const entry = rateLimitStore[clientId];
      if (entry) {
        // Double the request count for failed auth attempts
        entry.requests = Math.min(entry.requests * 2, RATE_LIMIT_CONFIGS.auth.maxRequests + 10);
      }
    }
    
    return response;
  });
}

/**
 * Strict rate limiting for sensitive operations
 */
export function withStrictRateLimit(handler: (request: NextRequest) => Promise<Response>) {
  return withRateLimit(RATE_LIMIT_CONFIGS.strict, handler);
}

/**
 * Get rate limit status for a client (useful for debugging)
 */
export function getRateLimitStatus(request: NextRequest): {
  clientId: string;
  requests: number;
  windowStart: number;
  blocked: boolean;
} | null {
  const clientId = getClientId(request);
  const entry = rateLimitStore[clientId];
  
  if (!entry) {
    return null;
  }
  
  return {
    clientId: clientId.split(':')[0], // Only return IP part for privacy
    requests: entry.requests,
    windowStart: entry.windowStart,
    blocked: entry.blocked,
  };
}