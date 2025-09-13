export interface Database {
  public: {
    Tables: {
      baby_records: {
        Row: {
          id: string;
          timestamp: string;
          type: 'sleep' | 'feeding' | 'temperature' | 'diaper' | 'jaundice' | 'note' | 'pumping' | 'weight';
          value?: string | number;
          notes?: string;
          duration?: number;
          amount?: number;
          weight?: number;
          diaper_type?: 'wet' | 'dirty' | 'both';
          diaper_amount?: 'little' | 'medium' | 'much';
          jaundice_level?: number;
          feeding_type?: 'bottle' | 'breast_left' | 'breast_right' | 'breast_both';
          breast_side?: 'left' | 'right' | 'both';
          note_category?: 'general' | 'question' | 'todo';
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          timestamp: string;
          type: 'sleep' | 'feeding' | 'temperature' | 'diaper' | 'jaundice' | 'note' | 'pumping' | 'weight';
          value?: string | number;
          notes?: string;
          duration?: number;
          amount?: number;
          weight?: number;
          diaper_type?: 'wet' | 'dirty' | 'both';
          diaper_amount?: 'little' | 'medium' | 'much';
          jaundice_level?: number;
          feeding_type?: 'bottle' | 'breast_left' | 'breast_right' | 'breast_both';
          breast_side?: 'left' | 'right' | 'both';
          note_category?: 'general' | 'question' | 'todo';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          timestamp?: string;
          type?: 'sleep' | 'feeding' | 'temperature' | 'diaper' | 'jaundice' | 'note' | 'pumping' | 'weight';
          value?: string | number;
          notes?: string;
          duration?: number;
          amount?: number;
          weight?: number;
          diaper_type?: 'wet' | 'dirty' | 'both';
          diaper_amount?: 'little' | 'medium' | 'much';
          jaundice_level?: number;
          feeding_type?: 'bottle' | 'breast_left' | 'breast_right' | 'breast_both';
          breast_side?: 'left' | 'right' | 'both';
          note_category?: 'general' | 'question' | 'todo';
          created_at?: string;
          updated_at?: string;
        };
      };
      mother_records: {
        Row: {
          id: string;
          timestamp: string;
          type: 'temperature' | 'blood_pressure' | 'mood' | 'pain' | 'feeding_session' | 'note';
          value?: string | number;
          notes?: string;
          duration?: number;
          blood_pressure_systolic?: number;
          blood_pressure_diastolic?: number;
          pain_level?: number;
          mood?: 'excellent' | 'good' | 'okay' | 'low' | 'very_low';
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          timestamp: string;
          type: 'temperature' | 'blood_pressure' | 'mood' | 'pain' | 'feeding_session' | 'note';
          value?: string | number;
          notes?: string;
          duration?: number;
          blood_pressure_systolic?: number;
          blood_pressure_diastolic?: number;
          pain_level?: number;
          mood?: 'excellent' | 'good' | 'okay' | 'low' | 'very_low';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          timestamp?: string;
          type?: 'temperature' | 'blood_pressure' | 'mood' | 'pain' | 'feeding_session' | 'note';
          value?: string | number;
          notes?: string;
          duration?: number;
          blood_pressure_systolic?: number;
          blood_pressure_diastolic?: number;
          pain_level?: number;
          mood?: 'excellent' | 'good' | 'okay' | 'low' | 'very_low';
          created_at?: string;
          updated_at?: string;
        };
      };
      baby_profiles: {
        Row: {
          id: string;
          voornaam: string;
          achternaam: string;
          roepnaam?: string;
          geslacht: 'jongen' | 'meisje' | 'onbekend';
          geboortedatum: string;
          geboortijd?: string;
          geboortgewicht?: number;
          geboortelengte?: number;
          hoofdomvang?: number;
          goede_start_score?: number;
          zwangerschapsduur?: number;
          moeder_naam?: string;
          partner_naam?: string;
          huisarts?: string;
          verloskundige?: string;
          ziekenhuis?: string;
          bijzonderheden?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          voornaam: string;
          achternaam: string;
          roepnaam?: string;
          geslacht: 'jongen' | 'meisje' | 'onbekend';
          geboortedatum: string;
          geboortijd?: string;
          geboortgewicht?: number;
          geboortelengte?: number;
          hoofdomvang?: number;
          goede_start_score?: number;
          zwangerschapsduur?: number;
          moeder_naam?: string;
          partner_naam?: string;
          huisarts?: string;
          verloskundige?: string;
          ziekenhuis?: string;
          bijzonderheden?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          voornaam?: string;
          achternaam?: string;
          roepnaam?: string;
          geslacht?: 'jongen' | 'meisje' | 'onbekend';
          geboortedatum?: string;
          geboortijd?: string;
          geboortgewicht?: number;
          geboortelengte?: number;
          hoofdomvang?: number;
          goede_start_score?: number;
          zwangerschapsduur?: number;
          moeder_naam?: string;
          partner_naam?: string;
          huisarts?: string;
          verloskundige?: string;
          ziekenhuis?: string;
          bijzonderheden?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description?: string;
          category: 'household' | 'baby_care' | 'mother_care' | 'administrative' | 'other';
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in_progress' | 'completed';
          assigned_to?: 'parents' | 'kraamhulp' | 'family' | 'other';
          created_by: 'parents' | 'kraamhulp';
          created_at: string;
          completed_at?: string;
          suggested_by?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          category: 'household' | 'baby_care' | 'mother_care' | 'administrative' | 'other';
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in_progress' | 'completed';
          assigned_to?: 'parents' | 'kraamhulp' | 'family' | 'other';
          created_by: 'parents' | 'kraamhulp';
          created_at?: string;
          completed_at?: string;
          suggested_by?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: 'household' | 'baby_care' | 'mother_care' | 'administrative' | 'other';
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in_progress' | 'completed';
          assigned_to?: 'parents' | 'kraamhulp' | 'family' | 'other';
          created_by?: 'parents' | 'kraamhulp';
          created_at?: string;
          completed_at?: string;
          suggested_by?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          timestamp: string;
          type: 'warning' | 'critical' | 'info';
          category: 'baby' | 'mother' | 'general';
          message: string;
          related_record_id?: string;
          acknowledged?: boolean;
          acknowledged_by?: string;
          acknowledged_at?: string;
          resolution_comment?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          timestamp: string;
          type: 'warning' | 'critical' | 'info';
          category: 'baby' | 'mother' | 'general';
          message: string;
          related_record_id?: string;
          acknowledged?: boolean;
          acknowledged_by?: string;
          acknowledged_at?: string;
          resolution_comment?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          timestamp?: string;
          type?: 'warning' | 'critical' | 'info';
          category?: 'baby' | 'mother' | 'general';
          message?: string;
          related_record_id?: string;
          acknowledged?: boolean;
          acknowledged_by?: string;
          acknowledged_at?: string;
          resolution_comment?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      family_observations: {
        Row: {
          id: string;
          timestamp: string;
          observer: string;
          category: 'bonding' | 'environment' | 'support' | 'health' | 'general';
          observation: string;
          concerns?: string[];
          recommendations?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          timestamp: string;
          observer: string;
          category: 'bonding' | 'environment' | 'support' | 'health' | 'general';
          observation: string;
          concerns?: string[];
          recommendations?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          timestamp?: string;
          observer?: string;
          category?: 'bonding' | 'environment' | 'support' | 'health' | 'general';
          observation?: string;
          concerns?: string[];
          recommendations?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}