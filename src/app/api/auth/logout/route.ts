import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';
import { handleOptions } from '@/lib/securityMiddleware';
import { AuthService } from '@/lib/authService';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Perform logout
      const result = await AuthService.logout();
      
      if (result.error) {
        console.warn(`Logout error for user: ${req.userId}: ${result.error}`);
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      
      console.info(`Successful logout for user: ${req.userId}`);
      
      return NextResponse.json({
        success: true,
        message: 'Successfully logged out'
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}