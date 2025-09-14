import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables
function validateEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.warn('Database features will be disabled. Using demo mode.');
    return false;
  }
  
  return true;
}

// Safe defaults for development - API will work without database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

// Validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Additional security validation
function validateSupabaseConfig(): boolean {
  if (!isValidUrl(supabaseUrl)) {
    console.error('Invalid Supabase URL');
    return false;
  }
  
  if (supabaseKey.length < 20) {
    console.error('Supabase key appears to be invalid (too short)');
    return false;
  }
  
  // Check for development/demo values in production
  if (process.env.NODE_ENV === 'production') {
    if (supabaseUrl.includes('demo') || supabaseKey === 'demo-key') {
      console.error('Demo Supabase configuration detected in production');
      return false;
    }
  }
  
  return true;
}

let supabaseClient: SupabaseClient | null = null;

try {
  if (validateEnvironment() && validateSupabaseConfig()) {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'kraamweek-app'
        }
      }
    });
  } else {
    console.warn('Supabase client not initialized due to configuration issues');
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

export const supabase = supabaseClient;

export const isSupabaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    supabaseClient
  );
};