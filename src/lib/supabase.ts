import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a client only if environment variables are available
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Export a safe supabase client that throws meaningful errors
export { supabase };

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseKey);
};