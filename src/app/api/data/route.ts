import { NextResponse } from 'next/server';
import { ApiService } from '@/lib/apiService';

export async function GET() {
  try {
    const data = await ApiService.loadData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching all data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await ApiService.clearAllData();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing all data:', error);
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}