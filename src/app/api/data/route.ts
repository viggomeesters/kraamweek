import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      // Return demo data when database is not configured
      return NextResponse.json({
        babyRecords: [
          {
            id: "demo-1",
            timestamp: new Date().toISOString(),
            type: "temperature",
            value: 36.8,
            notes: "Demo baby record - Normal temperature"
          }
        ],
        motherRecords: [
          {
            id: "demo-2", 
            timestamp: new Date().toISOString(),
            type: "mood",
            mood: "good",
            notes: "Demo mother record - Feeling well"
          }
        ],
        familyObservations: [],
        tasks: [
          {
            id: "demo-3",
            title: "Demo Task",
            description: "This is a demo task showing API functionality",
            category: "other",
            priority: "medium",
            status: "pending",
            createdBy: "kraamhulp",
            createdAt: new Date().toISOString()
          }
        ],
        alerts: [],
        babyProfile: {
          id: "demo-profile",
          voornaam: "Demo",
          achternaam: "Baby",
          geslacht: "onbekend",
          geboortedatum: "2024-01-01",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        _demo: true,
        _message: "This is demo data. Configure Supabase environment variables for real database integration."
      });
    }

    // If Supabase is configured, try to load from database
    const { ApiService } = await import('@/lib/apiService');
    const data = await ApiService.loadData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching all data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
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
        _message: "Demo data cleared. Configure Supabase for real data persistence."
      });
    }

    const { ApiService } = await import('@/lib/apiService');
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