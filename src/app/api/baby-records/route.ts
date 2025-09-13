import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
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
    const records = await ApiService.getBabyRecords();
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching baby records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch baby records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const recordData = await request.json();
    
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

    const { ApiService } = await import('@/lib/apiService');
    const record = await ApiService.addBabyRecord(recordData);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating baby record:', error);
    return NextResponse.json(
      { error: 'Failed to create baby record' },
      { status: 500 }
    );
  }
}