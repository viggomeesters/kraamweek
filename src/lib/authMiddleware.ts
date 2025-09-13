import { NextRequest } from 'next/server';
import { supabase } from './supabase';
import { withSecurity } from './securityMiddleware';
import { withRateLimit, RATE_LIMIT_CONFIGS } from './rateLimiting';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  user?: {
    id: string;
    email: string;
    rol: string;
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<Response>
): Promise<Response> {
  // Apply security middleware and rate limiting
  return withSecurity(
    { enableCSRF: false }, // Disable CSRF for API calls using Bearer tokens
    withRateLimit(RATE_LIMIT_CONFIGS.api, async (req: NextRequest) => {
      try {
        // Get the Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({ error: 'Missing or invalid authorization header' }),
            { 
              status: 401, 
              headers: { 
                'Content-Type': 'application/json',
                'WWW-Authenticate': 'Bearer realm="API"'
              } 
            }
          );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Basic token format validation
        if (token.length < 20 || token.length > 2048) {
          return new Response(
            JSON.stringify({ error: 'Invalid token format' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Verify the JWT token with Supabase
        if (!supabase) {
          return new Response(
            JSON.stringify({ error: 'Database not configured' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
          console.warn(`Authentication failed: ${error?.message || 'Invalid user'}`);
          return new Response(
            JSON.stringify({ error: 'Invalid or expired token' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Get user profile from our users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.warn(`User profile not found for ID: ${user.id}`);
          return new Response(
            JSON.stringify({ error: 'User profile not found' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Validate user data
        if (!profile.email || !profile.rol || !['ouders', 'kraamhulp'].includes(profile.rol)) {
          console.warn(`Invalid user profile data for ID: ${user.id}`);
          return new Response(
            JSON.stringify({ error: 'Invalid user profile' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Add user info to request
        const authenticatedRequest = req as AuthenticatedRequest;
        authenticatedRequest.userId = user.id;
        authenticatedRequest.user = {
          id: user.id,
          email: profile.email,
          rol: profile.rol,
        };

        return handler(authenticatedRequest);
      } catch (error) {
        console.error('Authentication error:', error);
        return new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    })
  )(request);
}

export function withOptionalAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<Response>
): Promise<Response> {
  // For routes that work with or without auth, but provide user context when available
  return withSecurity(
    { enableCSRF: false },
    withRateLimit(RATE_LIMIT_CONFIGS.api, async (req: NextRequest) => {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No auth provided, continue without user context
        const unauthenticatedRequest = req as AuthenticatedRequest;
        return handler(unauthenticatedRequest);
      }

      // Auth provided, try to authenticate
      return withAuth(req, handler);
    })
  )(request);
}