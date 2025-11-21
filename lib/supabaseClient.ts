import { createClient } from '@supabase/supabase-js';

// check localStorage first (for client-side config), then env vars
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('jewelerp_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('jewelerp_supabase_key') : null;

// Fallback to placeholder if nothing is found. This ensures the app doesn't crash on load,
// but API calls will fail (prompting the user to enter creds via the UI).
const supabaseUrl = storedUrl || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = storedKey || process.env.SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const updateSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('jewelerp_supabase_url', url);
  localStorage.setItem('jewelerp_supabase_key', key);
  // Force a reload to re-initialize the module-level client
  window.location.reload();
};

export const isConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key';
};