import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '@/lib/apiService';

export async function GET() {
  try {
    const alerts = await ApiService.getAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const alertData = await request.json();
    const alert = await ApiService.addAlert(alertData);
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}