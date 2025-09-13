import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '@/lib/apiService';

export async function GET() {
  try {
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