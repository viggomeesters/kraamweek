import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '@/lib/apiService';

export async function GET() {
  try {
    const observations = await ApiService.getFamilyObservations();
    return NextResponse.json(observations);
  } catch (error) {
    console.error('Error fetching family observations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family observations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const observationData = await request.json();
    const observation = await ApiService.addFamilyObservation(observationData);
    return NextResponse.json(observation, { status: 201 });
  } catch (error) {
    console.error('Error creating family observation:', error);
    return NextResponse.json(
      { error: 'Failed to create family observation' },
      { status: 500 }
    );
  }
}