import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        id: "demo-profile",
        voornaam: "Demo",
        achternaam: "Baby", 
        geslacht: "onbekend",
        geboortedatum: "2024-01-01",
        geboortgewicht: 3250,
        geboortelengte: 50,
        hoofdomvang: 35,
        moederNaam: "Demo Moeder",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const { ApiService } = await import('@/lib/apiService');
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
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        id: "demo-created-profile",
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _demo: true,
        _message: "Demo profile created. Configure Supabase for real data persistence."
      }, { status: 201 });
    }

    const { ApiService } = await import('@/lib/apiService');
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
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        id: "demo-updated-profile",
        ...profileData,
        updatedAt: new Date().toISOString(),
        _demo: true,
        _message: "Demo profile updated. Configure Supabase for real data persistence."
      });
    }

    const { ApiService } = await import('@/lib/apiService');
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
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        success: true, 
        _demo: true,
        _message: "Demo profile deleted. Configure Supabase for real data persistence."
      });
    }

    const { ApiService } = await import('@/lib/apiService');
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