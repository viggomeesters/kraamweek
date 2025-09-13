import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, handleOptions } from '@/lib/securityMiddleware';
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rateLimiting';
import { validateRegistrationData } from '@/lib/validation';
import { AuthService } from '@/lib/authService';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  return withSecurity(
    { enableCSRF: true }, // Enable CSRF for registration
    withRateLimit(RATE_LIMIT_CONFIGS.auth, async (req: NextRequest) => {
      try {
        const rawData = await req.json();
        
        // Validate and sanitize registration data
        const validation = validateRegistrationData(rawData);
        if (!validation.isValid) {
          return NextResponse.json(
            { 
              error: 'Validation failed', 
              details: validation.errors 
            },
            { status: 400 }
          );
        }
        
        const registrationData = validation.sanitizedValue as { 
          email: string; 
          password: string; 
          naam: string; 
          rol: 'ouders' | 'kraamhulp'; 
        };
        
        // Attempt registration
        const result = await AuthService.register(registrationData);
        
        if (result.error) {
          // Log failed registration attempt
          console.warn(`Failed registration attempt for email: ${registrationData.email}: ${result.error}`);
          
          return NextResponse.json(
            { error: result.error },
            { status: 400 }
          );
        }
        
        if (!result.user) {
          return NextResponse.json(
            { error: 'Registration failed' },
            { status: 400 }
          );
        }
        
        // Successful registration
        console.info(`Successful registration for user: ${result.user.id}`);
        
        return NextResponse.json({
          user: result.user,
          success: true
        }, { status: 201 });
        
      } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    })
  )(request);
}