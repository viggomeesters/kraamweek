import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const securityHeaders = [
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      }
    ];

    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains'
      });
    }

    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  },
  
  // Security configuration
  poweredByHeader: false, // Hide X-Powered-By header
  
  // Content Security Policy
  async rewrites() {
    return [];
  },
  
  // Environment variable validation
  env: {
    CUSTOM_APP_ENV: process.env.NODE_ENV
  }
};

export default nextConfig;
