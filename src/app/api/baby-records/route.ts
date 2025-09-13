import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { withOptionalAuth, AuthenticatedRequest } from '@/lib/authMiddleware';
import { handleOptions } from '@/lib/securityMiddleware';
import { validateBabyRecord } from '@/lib/validation';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!isSupabaseConfigured()) {
        // Return demo data when database is not configured
        return NextResponse.json([
          {
            id: "demo-baby-1",
            timestamp: new Date().toISOString(),
            type: "temperature",
            value: 36.8,
            notes: "Demo temperature reading"
          },
          {
            id: "demo-baby-2",
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            type: "feeding",
            feedingType: "breast_left",
            amount: 120,
            duration: 15,
            notes: "Good feeding session"
          }
        ]);
      }

      const { ApiService } = await import('@/lib/apiService');
      const records = await ApiService.getBabyRecords(req.userId);
      return NextResponse.json(records);
    } catch (error) {
      console.error('Error fetching baby records:', error);
      return NextResponse.json(
        { error: 'Failed to fetch baby records' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const rawData = await req.json();
      
      // Validate and sanitize baby record data
      const validation = validateBabyRecord(rawData);
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: validation.errors 
          },
          { status: 400 }
        );
      }
      
      const recordData = validation.sanitizedValue as Record<string, unknown>;
      
      if (!isSupabaseConfigured()) {
        // Return demo response when database is not configured
        return NextResponse.json({
          id: "demo-created-" + Date.now(),
          ...recordData,
          timestamp: recordData.timestamp || new Date().toISOString(),
          _demo: true,
          _message: "This is a demo response. Configure Supabase for real data persistence."
        }, { status: 201 });
      }

      if (!req.userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Add user ID to the record data
      const recordWithUser = {
        ...recordData,
        user_id: req.userId
      } as unknown as Omit<import('@/types').BabyRecord, 'id'>;

      const { ApiService } = await import('@/lib/apiService');
      const record = await ApiService.addBabyRecord(recordWithUser);
      return NextResponse.json(record, { status: 201 });
    } catch (error) {
      console.error('Error creating baby record:', error);
      return NextResponse.json(
        { error: 'Failed to create baby record' },
        { status: 500 }
      );
    }
  });
}