import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '@/lib/apiService';

export async function GET() {
  try {
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