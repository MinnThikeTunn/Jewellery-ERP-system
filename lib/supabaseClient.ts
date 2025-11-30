import { createClient } from '@supabase/supabase-js';

// Load from environment variables (Vite loads .env.local automatically)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If keys are missing (common in Vercel before setup), use a placeholder to prevent
// the entire app from crashing (White Screen). The UI will show a connection error instead.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://setup-env-vars.supabase.co', 'missing-keys');

// Deprecated but kept for compatibility
export const isConfigured = () => !!supabaseUrl && !!supabaseAnonKey;

export const updateSupabaseConfig = (url: string, key: string) => {
  // This function is kept to satisfy imports but is effectively no-op for the hardcoded client
  console.log("Config update requested but client is hardcoded.");
};