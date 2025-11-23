import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://gsfivewutdkpshxrvjdy.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZml2ZXd1dGRrcHNoeHJ2amR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Mzc4ODgsImV4cCI6MjA3OTIxMzg4OH0.NXOUFHEVXX5ZiueQqB9mrevCm2VSfbBVtZiVVYWKt7Y';

// Directly use the constants. 
// We removed localStorage logic to ensure the hardcoded keys are always respected.
export const supabase = createClient(DEFAULT_URL, DEFAULT_KEY);

// Deprecated but kept for compatibility
export const isConfigured = () => true;

export const updateSupabaseConfig = (url: string, key: string) => {
  // This function is kept to satisfy imports but is effectively no-op for the hardcoded client
  console.log("Config update requested but client is hardcoded.");
};