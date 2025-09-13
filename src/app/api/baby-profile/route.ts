import { NextRequest, NextResponse } from 'next/server';
import { ApiService } from '@/lib/apiService';

export async function GET() {
  try {
    const profile = await ApiService.getBabyProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching baby profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch baby profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json();
    const profile = await ApiService.saveBabyProfile(profileData);
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error saving baby profile:', error);
    return NextResponse.json(
      { error: 'Failed to save baby profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const profileData = await request.json();
    const profile = await ApiService.saveBabyProfile(profileData);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating baby profile:', error);
    return NextResponse.json(
      { error: 'Failed to update baby profile' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await ApiService.deleteBabyProfile();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting baby profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete baby profile' },
      { status: 500 }
    );
  }
}