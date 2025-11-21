import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://gsfivewutdkpshxrvjdy.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZml2ZXd1dGRrcHNoeHJ2amR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Mzc4ODgsImV4cCI6MjA3OTIxMzg4OH0.NXOUFHEVXX5ZiueQqB9mrevCm2VSfbBVtZiVVYWKt7Y';

const getStoredConfig = () => {
  const url = localStorage.getItem('jewelerp_supabase_url');
  const key = localStorage.getItem('jewelerp_supabase_key');
  return {
    url: url || DEFAULT_URL,
    key: key || DEFAULT_KEY
  };
};

const config = getStoredConfig();

export const supabase = createClient(config.url, config.key);

// Deprecated but kept for compatibility, always true now
export const isConfigured = () => true;

export const updateSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('jewelerp_supabase_url', url);
  localStorage.setItem('jewelerp_supabase_key', key);
  window.location.reload();
};