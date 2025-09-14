import { supabase, isSupabaseConfigured } from './supabase';
import { BabyRecord, MotherRecord, Task, Alert, BabyProfile, FamilyObservation, AppData } from '@/types';

export class ApiService {
  private static getSupabase() {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Database not configured');
    }
    return supabase;
  }
  // Helper to transform database records to frontend types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static transformBabyRecord(dbRecord: any): BabyRecord {
    return {
      id: dbRecord.id,
      timestamp: dbRecord.timestamp,
      type: dbRecord.type,
      value: dbRecord.value,
      notes: dbRecord.notes,
      duration: dbRecord.duration,
      amount: dbRecord.amount,
      weight: dbRecord.weight,
      diaperType: dbRecord.diaper_type,
      diaperAmount: dbRecord.diaper_amount,
      jaundiceLevel: dbRecord.jaundice_level as 1 | 2 | 3 | 4 | 5 | undefined,
      feedingType: dbRecord.feeding_type,
      breastSide: dbRecord.breast_side,
      noteCategory: dbRecord.note_category,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static transformMotherRecord(dbRecord: any): MotherRecord {
    return {
      id: dbRecord.id,
      timestamp: dbRecord.timestamp,
      type: dbRecord.type,
      value: dbRecord.value,
      notes: dbRecord.notes,
      duration: dbRecord.duration,
      bloodPressure: dbRecord.blood_pressure_systolic && dbRecord.blood_pressure_diastolic 
        ? {
            systolic: dbRecord.blood_pressure_systolic,
            diastolic: dbRecord.blood_pressure_diastolic,
          }
        : undefined,
      painLevel: dbRecord.pain_level as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | undefined,
      mood: dbRecord.mood,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static transformBabyProfile(dbRecord: any): BabyProfile {
    return {
      id: dbRecord.id,
      voornaam: dbRecord.voornaam,
      achternaam: dbRecord.achternaam,
      roepnaam: dbRecord.roepnaam,
      geslacht: dbRecord.geslacht,
      geboortedatum: dbRecord.geboortedatum,
      geboortijd: dbRecord.geboortijd,
      geboortgewicht: dbRecord.geboortgewicht,
      geboortelengte: dbRecord.geboortelengte,
      hoofdomvang: dbRecord.hoofdomvang,
      goedeStartScore: dbRecord.goede_start_score,
      zwangerschapsduur: dbRecord.zwangerschapsduur,
      moederNaam: dbRecord.moeder_naam,
      partnerNaam: dbRecord.partner_naam,
      huisarts: dbRecord.huisarts,
      verloskundige: dbRecord.verloskundige,
      ziekenhuis: dbRecord.ziekenhuis,
      bijzonderheden: dbRecord.bijzonderheden,
      createdAt: dbRecord.created_at || new Date().toISOString(),
      updatedAt: dbRecord.updated_at || new Date().toISOString(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static transformTask(dbRecord: any): Task {
    return {
      id: dbRecord.id,
      title: dbRecord.title,
      description: dbRecord.description,
      category: dbRecord.category,
      priority: dbRecord.priority,
      status: dbRecord.status,
      assignedTo: dbRecord.assigned_to,
      createdBy: dbRecord.created_by,
      createdAt: dbRecord.created_at,
      completedAt: dbRecord.completed_at,
      suggestedBy: dbRecord.suggested_by,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static transformAlert(dbRecord: any): Alert {
    return {
      id: dbRecord.id,
      timestamp: dbRecord.timestamp,
      type: dbRecord.type,
      category: dbRecord.category,
      message: dbRecord.message,
      relatedRecordId: dbRecord.related_record_id,
      acknowledged: dbRecord.acknowledged,
      acknowledgedBy: dbRecord.acknowledged_by,
      acknowledgedAt: dbRecord.acknowledged_at,
      resolutionComment: dbRecord.resolution_comment,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static transformFamilyObservation(dbRecord: any): FamilyObservation {
    return {
      id: dbRecord.id,
      timestamp: dbRecord.timestamp,
      observer: dbRecord.observer,
      category: dbRecord.category,
      observation: dbRecord.observation,
      concerns: dbRecord.concerns,
      recommendations: dbRecord.recommendations,
    };
  }

  // Baby Records
  static async getBabyRecords(userId?: string): Promise<BabyRecord[]> {
    const client = this.getSupabase();
    
    let query = client
      .from('baby_records')
      .select('*')
      .order('timestamp', { ascending: false });

    // Filter by user ID if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data?.map(this.transformBabyRecord) || [];
  }

  static async addBabyRecord(record: Omit<BabyRecord, 'id'>): Promise<BabyRecord> {
    const dbRecord = {
      timestamp: record.timestamp,
      type: record.type,
      value: record.value,
      notes: record.notes,
      duration: record.duration,
      amount: record.amount,
      weight: record.weight,
      diaper_type: record.diaperType,
      diaper_amount: record.diaperAmount,
      jaundice_level: record.jaundiceLevel,
      feeding_type: record.feedingType,
      breast_side: record.breastSide,
      note_category: record.noteCategory,
    };

    const { data, error } = await this.getSupabase()
      .from('baby_records')
      .insert(dbRecord)
      .select()
      .single();

    if (error) throw error;
    return this.transformBabyRecord(data);
  }

  // Mother Records
  static async getMotherRecords(userId?: string): Promise<MotherRecord[]> {
    const client = this.getSupabase();
    
    let query = client
      .from('mother_records')
      .select('*')
      .order('timestamp', { ascending: false });

    // Filter by user ID if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data?.map(this.transformMotherRecord) || [];
  }

  static async addMotherRecord(record: Omit<MotherRecord, 'id'>): Promise<MotherRecord> {
    const dbRecord = {
      timestamp: record.timestamp,
      type: record.type,
      value: record.value,
      notes: record.notes,
      duration: record.duration,
      blood_pressure_systolic: record.bloodPressure?.systolic,
      blood_pressure_diastolic: record.bloodPressure?.diastolic,
      pain_level: record.painLevel,
      mood: record.mood,
    };

    const { data, error } = await this.getSupabase()
      .from('mother_records')
      .insert(dbRecord)
      .select()
      .single();

    if (error) throw error;
    return this.transformMotherRecord(data);
  }

  // Baby Profile
  static async getBabyProfile(): Promise<BabyProfile | null> {
    const { data, error } = await this.getSupabase()
      .from('baby_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }
    return data ? this.transformBabyProfile(data) : null;
  }

  static async saveBabyProfile(profile: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<BabyProfile> {
    const dbProfile = {
      voornaam: profile.voornaam,
      achternaam: profile.achternaam,
      roepnaam: profile.roepnaam,
      geslacht: profile.geslacht,
      geboortedatum: profile.geboortedatum,
      geboortijd: profile.geboortijd,
      geboortgewicht: profile.geboortgewicht,
      geboortelengte: profile.geboortelengte,
      hoofdomvang: profile.hoofdomvang,
      goede_start_score: profile.goedeStartScore,
      zwangerschapsduur: profile.zwangerschapsduur,
      moeder_naam: profile.moederNaam,
      partner_naam: profile.partnerNaam,
      huisarts: profile.huisarts,
      verloskundige: profile.verloskundige,
      ziekenhuis: profile.ziekenhuis,
      bijzonderheden: profile.bijzonderheden,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.getSupabase()
      .from('baby_profiles')
      .upsert(dbProfile)
      .select()
      .single();

    if (error) throw error;
    return this.transformBabyProfile(data);
  }

  static async deleteBabyProfile(): Promise<void> {
    const { error } = await this.getSupabase()
      .from('baby_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) throw error;
  }

  // Tasks
  static async getTasks(): Promise<Task[]> {
    const { data, error } = await this.getSupabase()
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.transformTask) || [];
  }

  static async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const dbTask = {
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: task.status,
      assigned_to: task.assignedTo,
      created_by: task.createdBy,
      completed_at: task.completedAt,
      suggested_by: task.suggestedBy,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await this.getSupabase()
      .from('tasks')
      .insert(dbTask)
      .select()
      .single();

    if (error) throw error;
    return this.transformTask(data);
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;

    const { data, error } = await this.getSupabase()
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.transformTask(data);
  }

  // Alerts
  static async getAlerts(): Promise<Alert[]> {
    const { data, error } = await this.getSupabase()
      .from('alerts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data?.map(this.transformAlert) || [];
  }

  static async addAlert(alert: Omit<Alert, 'id'>): Promise<Alert> {
    const dbAlert = {
      timestamp: alert.timestamp,
      type: alert.type,
      category: alert.category,
      message: alert.message,
      related_record_id: alert.relatedRecordId,
      acknowledged: alert.acknowledged,
      acknowledged_by: alert.acknowledgedBy,
      acknowledged_at: alert.acknowledgedAt,
      resolution_comment: alert.resolutionComment,
    };

    const { data, error } = await this.getSupabase()
      .from('alerts')
      .insert(dbAlert)
      .select()
      .single();

    if (error) throw error;
    return this.transformAlert(data);
  }

  // Family Observations
  static async getFamilyObservations(): Promise<FamilyObservation[]> {
    const { data, error } = await this.getSupabase()
      .from('family_observations')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data?.map(this.transformFamilyObservation) || [];
  }

  static async addFamilyObservation(observation: Omit<FamilyObservation, 'id'>): Promise<FamilyObservation> {
    const dbObservation = {
      timestamp: observation.timestamp,
      observer: observation.observer,
      category: observation.category,
      observation: observation.observation,
      concerns: observation.concerns,
      recommendations: observation.recommendations,
    };

    const { data, error } = await this.getSupabase()
      .from('family_observations')
      .insert(dbObservation)
      .select()
      .single();

    if (error) throw error;
    return this.transformFamilyObservation(data);
  }

  // Load all data (compatible with existing interface)
  static async loadData(userId?: string): Promise<AppData> {
    const [babyRecords, motherRecords, tasks, alerts, familyObservations, babyProfile] = await Promise.all([
      this.getBabyRecords(userId),
      this.getMotherRecords(userId),
      this.getTasks(),
      this.getAlerts(),
      this.getFamilyObservations(),
      this.getBabyProfile(),
    ]);

    return {
      babyRecords,
      motherRecords,
      familyObservations,
      tasks,
      alerts,
      babyProfile: babyProfile || undefined,
    };
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    await Promise.all([
      this.getSupabase().from('baby_records').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      this.getSupabase().from('mother_records').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      this.getSupabase().from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      this.getSupabase().from('alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      this.getSupabase().from('family_observations').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      this.getSupabase().from('baby_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);
  }
}