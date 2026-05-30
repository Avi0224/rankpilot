/**
 * Centralized environment variable management with runtime validation.
 * This ensures that missing environment variables are caught early and 
 * handled gracefully in production.
 */

function requireEnv(name: string, value?: string): string {
  if (!value || value === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
      // In production, we log a critical error but don't necessarily crash the process
      // until the variable is actually needed for a critical operation.
      console.error(`[CRITICAL] Missing required environment variable: ${name}`);
    }
    return '';
  }
  return value;
}

export const env = {
  supabase: {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  },
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};

/**
 * Guard function to check if Supabase is configured.
 * Useful for conditionally enabling features or showing fallback UIs.
 */
export const hasSupabaseConfig = (): boolean => {
  return !!(env.supabase.url && env.supabase.anonKey);
};
