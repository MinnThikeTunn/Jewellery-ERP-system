import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables
// For production deployments, set these via your hosting provider's environment configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration - check for non-empty strings
const isValidConfig = typeof SUPABASE_URL === 'string' && 
                      SUPABASE_URL.trim().length > 0 &&
                      typeof SUPABASE_ANON_KEY === 'string' && 
                      SUPABASE_ANON_KEY.trim().length > 0;

// Create Supabase client
let supabaseClient: SupabaseClient;

if (isValidConfig) {
  supabaseClient = createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim());
} else {
  // Log detailed error for developers
  const errorMessage = 
    'Supabase Configuration Error: Missing or empty required environment variables.\n' +
    'Please create a .env file with:\n' +
    '  VITE_SUPABASE_URL=your-supabase-project-url\n' +
    '  VITE_SUPABASE_ANON_KEY=your-supabase-anon-key\n' +
    'See .env.example for reference.';
  
  console.error(errorMessage);
  
  // Throw error during development/build to catch configuration issues early
  if (import.meta.env.DEV) {
    throw new Error(errorMessage);
  }
  
  // For production builds without config, create a placeholder that will fail clearly
  // This allows the app to at least render an error state rather than crashing
  supabaseClient = createClient(
    'https://misconfigured.supabase.co',
    'misconfigured-key-check-env-vars'
  );
}

export const supabase = supabaseClient;

// Check if Supabase is properly configured
export const isConfigured = () => isValidConfig;

/** 
 * @deprecated Use environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY instead.
 * This function is no longer functional and will be removed in a future version.
 */
export const updateSupabaseConfig = () => {
  console.warn(
    "updateSupabaseConfig is deprecated and no longer functional. " +
    "Use environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY instead."
  );
};