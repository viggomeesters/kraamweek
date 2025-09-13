/**
 * Security middleware for HTTP headers, CSRF protection, and XSS prevention
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface SecurityConfig {
  enableCSRF: boolean;
  enableSecurityHeaders: boolean;
  allowedOrigins: string[];
  contentSecurityPolicy?: string;
}

// CSRF token store (in production, use Redis or similar)
const csrfTokenStore: Map<string, { token: string; expires: number }> = new Map();

/**
 * Generate a secure CSRF token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get session ID from request (simplified for demo)
 */
function getSessionId(request: NextRequest): string {
  // In a real app, this would come from a secure session cookie
  const authorization = request.headers.get('authorization');
  if (authorization) {
    return crypto.createHash('sha256').update(authorization).digest('hex').substring(0, 32);
  }
  
  // Fallback to IP-based session for demo
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').substring(0, 32);
}

/**
 * Validate CSRF token
 */
function validateCSRFToken(request: NextRequest, token: string): boolean {
  const sessionId = getSessionId(request);
  const storedData = csrfTokenStore.get(sessionId);
  
  if (!storedData) {
    return false;
  }
  
  // Check if token expired
  if (Date.now() > storedData.expires) {
    csrfTokenStore.delete(sessionId);
    return false;
  }
  
  return storedData.token === token;
}

/**
 * Get or create CSRF token for session
 */
export function getCSRFToken(request: NextRequest): string {
  const sessionId = getSessionId(request);
  let storedData = csrfTokenStore.get(sessionId);
  
  // Clean up expired tokens
  if (storedData && Date.now() > storedData.expires) {
    csrfTokenStore.delete(sessionId);
    storedData = undefined;
  }
  
  if (!storedData) {
    const token = generateCSRFToken();
    const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    csrfTokenStore.set(sessionId, { token, expires });
    return token;
  }
  
  return storedData.token;
}

/**
 * Security headers configuration
 */
const securityHeaders = {
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enforce HTTPS in production
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline for dev
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; '),
};

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): void {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

/**
 * CSRF protection middleware
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const method = request.method.toUpperCase();
    
    // Only protect state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = request.headers.get('X-CSRF-Token') || 
                       request.headers.get('x-csrf-token') ||
                       (await request.clone().formData().then(
                         formData => formData.get('_csrf_token') as string
                       ).catch(() => null));
      
      if (!csrfToken || !validateCSRFToken(request, csrfToken)) {
        console.warn(`CSRF token validation failed for ${method} ${request.url}`);
        return new NextResponse(
          JSON.stringify({ 
            error: 'CSRF token validation failed',
            code: 'CSRF_TOKEN_INVALID'
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    return handler(request);
  };
}

/**
 * Comprehensive security middleware
 */
export function withSecurity(
  config: Partial<SecurityConfig> = {},
  handler: (request: NextRequest) => Promise<Response>
) {
  const fullConfig: SecurityConfig = {
    enableCSRF: true,
    enableSecurityHeaders: true,
    allowedOrigins: [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    ],
    ...config
  };
  
  return async (request: NextRequest): Promise<Response> => {
    // CORS check
    const origin = request.headers.get('origin');
    if (origin && !fullConfig.allowedOrigins.includes(origin)) {
      console.warn(`CORS violation: Origin ${origin} not allowed`);
      return new NextResponse(
        JSON.stringify({ error: 'CORS policy violation' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Apply CSRF protection if enabled
    let protectedHandler = handler;
    if (fullConfig.enableCSRF) {
      protectedHandler = withCSRFProtection(protectedHandler);
    }
    
    // Execute the handler
    const response = await protectedHandler(request);
    
    // Copy original response
    const newResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
    // Apply security headers if enabled
    if (fullConfig.enableSecurityHeaders) {
      applySecurityHeaders(newResponse);
    }
    
    // Add CORS headers
    if (origin && fullConfig.allowedOrigins.includes(origin)) {
      newResponse.headers.set('Access-Control-Allow-Origin', origin);
      newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    }
    
    // Add CSRF token to response headers for client to use
    if (fullConfig.enableCSRF && ['GET', 'HEAD'].includes(request.method.toUpperCase())) {
      const csrfToken = getCSRFToken(request);
      newResponse.headers.set('X-CSRF-Token', csrfToken);
    }
    
    return newResponse;
  };
}

/**
 * Handle preflight OPTIONS requests
 */
export function handleOptions(): Response {
  const response = new NextResponse(null, { status: 200 });
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return response;
}

/**
 * XSS protection for HTML responses
 */
export function sanitizeHtmlResponse(html: string): string {
  // Basic XSS protection - in production, use a proper HTML sanitizer like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\s*\(/gi, 'eval_disabled(')
    .replace(/setTimeout\s*\(/gi, 'setTimeout_disabled(')
    .replace(/setInterval\s*\(/gi, 'setInterval_disabled(');
}

/**
 * Content Security Policy nonce generator
 */
export function generateCSPNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Create CSP header with nonce
 */
export function createCSPWithNonce(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; ');
}