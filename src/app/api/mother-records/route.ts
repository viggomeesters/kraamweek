import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json([
        {
          id: "demo-mother-1",
          timestamp: new Date().toISOString(),
          type: "mood",
          mood: "good",
          notes: "Feeling well today"
        },
        {
          id: "demo-mother-2", 
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          type: "blood_pressure",
          bloodPressure: { systolic: 120, diastolic: 80 },
          notes: "Normal blood pressure reading"
        }
      ]);
    }

    const { ApiService } = await import('@/lib/apiService');
    const records = await ApiService.getMotherRecords();
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching mother records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mother records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const recordData = await request.json();
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        id: "demo-created-mother-" + Date.now(),
        ...recordData,
        timestamp: recordData.timestamp || new Date().toISOString(),
        _demo: true,
        _message: "Demo mother record created. Configure Supabase for real data persistence."
      }, { status: 201 });
    }

    const { ApiService } = await import('@/lib/apiService');
    const record = await ApiService.addMotherRecord(recordData);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating mother record:', error);
    return NextResponse.json(
      { error: 'Failed to create mother record' },
      { status: 500 }
    );
  }
}