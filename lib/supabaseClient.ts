import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Deprecated but kept for compatibility
export const isConfigured = () => true;

export const updateSupabaseConfig = (url: string, key: string) => {
  // This function is kept to satisfy imports but is effectively no-op for the hardcoded client
  console.log("Config update requested but client is hardcoded.");
};