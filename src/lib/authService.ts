import { supabase } from './supabase';
import { User, LoginCredentials, RegisterData } from '@/types';

export class AuthService {
  private static getSupabase() {
    if (!supabase) {
      throw new Error('Database not configured');
    }
    return supabase;
  }

  // Register a new user
  static async register(data: RegisterData): Promise<{ user: User | null; error: string | null }> {
    try {
      const client = this.getSupabase();
      
      const { data: authData, error: authError } = await client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            naam: data.naam,
            rol: data.rol,
          }
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (authData.user) {
        // Create user profile in our users table
        const { error: profileError } = await this.getSupabase()
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: data.email,
              naam: data.naam,
              rol: data.rol,
              created_at: new Date().toISOString(),
              profile_completed: false,
            }
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't return error here as auth was successful
        }

        const user: User = {
          id: authData.user.id,
          email: data.email,
          naam: data.naam,
          rol: data.rol,
          createdAt: new Date().toISOString(),
          profileCompleted: false,
        };

        return { user, error: null };
      }

      return { user: null, error: 'Gebruiker kon niet worden aangemaakt' };
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, error: 'Er is een fout opgetreden bij het registreren' };
    }
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await this.getSupabase().auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (authData.user) {
        // Get user profile from our users table
        const { data: profile, error: profileError } = await this.getSupabase()
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError || !profile) {
          console.error('Error fetching user profile:', profileError);
          // Create profile if it doesn't exist (for backward compatibility)
          const userMetadata = authData.user.user_metadata;
          const newProfile = {
            id: authData.user.id,
            email: authData.user.email || credentials.email,
            naam: userMetadata?.naam || 'Gebruiker',
            rol: userMetadata?.rol || 'ouders',
            created_at: new Date().toISOString(),
            profile_completed: false,
          };

          await this.getSupabase().from('users').insert([newProfile]);
          
          const user: User = {
            id: authData.user.id,
            email: newProfile.email,
            naam: newProfile.naam,
            rol: newProfile.rol as 'ouders' | 'kraamhulp',
            createdAt: newProfile.created_at,
            profileCompleted: false,
          };

          return { user, error: null };
        }

        // Update last login time
        await this.getSupabase()
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', authData.user.id);

        const user: User = {
          id: profile.id,
          email: profile.email,
          naam: profile.naam,
          rol: profile.rol,
          createdAt: profile.created_at,
          lastLoginAt: new Date().toISOString(),
          profileCompleted: profile.profile_completed || false,
        };

        return { user, error: null };
      }

      return { user: null, error: 'Inloggen mislukt' };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error: 'Er is een fout opgetreden bij het inloggen' };
    }
  }

  // Logout user
  static async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await this.getSupabase().auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: 'Er is een fout opgetreden bij het uitloggen' };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await this.getSupabase().auth.getUser();

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: null };
      }

      // Get user profile from our users table
      const { data: profile, error: profileError } = await this.getSupabase()
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        return { user: null, error: 'Gebruikersprofiel niet gevonden' };
      }

      const user: User = {
        id: profile.id,
        email: profile.email,
        naam: profile.naam,
        rol: profile.rol,
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at,
        profileCompleted: profile.profile_completed || false,
      };

      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error: 'Er is een fout opgetreden bij het ophalen van gebruikersgegevens' };
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<Pick<User, 'naam' | 'rol' | 'profileCompleted'>>): Promise<{ error: string | null }> {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.naam !== undefined) updateData.naam = updates.naam;
      if (updates.rol !== undefined) updateData.rol = updates.rol;
      if (updates.profileCompleted !== undefined) updateData.profile_completed = updates.profileCompleted;

      const { error } = await this.getSupabase()
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'Er is een fout opgetreden bij het updaten van het profiel' };
    }
  }

  // Check if Supabase is configured
  static isConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  // Setup auth state change listener
  static onAuthStateChange(callback: (user: User | null) => void) {
    return this.getSupabase().auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user } = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}