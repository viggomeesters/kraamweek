import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, handleOptions } from '@/lib/securityMiddleware';
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rateLimiting';
import { validateLoginData } from '@/lib/validation';
import { AuthService } from '@/lib/authService';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  return withSecurity(
    { enableCSRF: true }, // Enable CSRF for login
    withRateLimit(RATE_LIMIT_CONFIGS.auth, async (req: NextRequest) => {
      try {
        const rawData = await req.json();
        
        // Validate and sanitize login data
        const validation = validateLoginData(rawData);
        if (!validation.isValid) {
          return NextResponse.json(
            { 
              error: 'Validation failed', 
              details: validation.errors 
            },
            { status: 400 }
          );
        }
        
        const loginData = validation.sanitizedValue as { email: string; password: string };
        
        // Attempt authentication
        const result = await AuthService.login(loginData);
        
        if (result.error) {
          // Log failed login attempt
          console.warn(`Failed login attempt for email: ${loginData.email}`);
          
          return NextResponse.json(
            { error: result.error },
            { status: 401 }
          );
        }
        
        if (!result.user) {
          return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
          );
        }
        
        // Successful login
        console.info(`Successful login for user: ${result.user.id}`);
        
        return NextResponse.json({
          user: result.user,
          success: true
        });
        
      } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    })
  )(request);
}