import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabaseConfig } from './env';

let supabaseInstance: SupabaseClient<any> | null = null;

/**
 * Returns an initialized Supabase client.
 * Handles build-time environments gracefully by returning a dummy proxy
 * instead of throwing or initializing with undefined values.
 */
export const getSupabase = (): SupabaseClient<any> => {
  // Return existing instance if available (Singleton pattern)
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = env.supabase;

  // Strict validation for environment variables using our env utility
  if (!hasSupabaseConfig()) {
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      // In browser, this is a critical configuration error. 
      // We log it and return a dummy to prevent immediate crash loops.
      console.error('[Supabase] Credentials missing. Features requiring database access will be disabled.');
    }
    
    // During build time/SSR in Node.js, or when env vars are missing:
    // Return a safe dummy client that prevents "supabaseUrl is required" error.
    const createDummyClient = (): any => {
      const logger = (prop: string | symbol) => {
        if (env.isDevelopment) {
          console.warn(`[Supabase] "${String(prop)}" accessed but credentials are missing.`);
        }
      };

      // Recursive proxy to handle chaining like supabase.from().select().eq()
      const proxy: any = new Proxy(() => proxy, {
        get: (target, prop) => {
          if (prop === 'auth') {
            return {
              getSession: () => Promise.resolve({ data: { session: null }, error: null }),
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
              signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
              signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
              signOut: () => Promise.resolve({ error: null }),
            };
          }
          
          // Handle common promise methods to make it awaitable
          if (prop === 'then') {
            return (resolve: any) => resolve({ data: null, error: null, count: 0 });
          }

          logger(prop);
          return proxy;
        },
        apply: (target, thisArg, args) => {
          return proxy;
        }
      });

      return proxy;
    };

    return createDummyClient() as SupabaseClient<any>;
  }

  // Initialize the real client
  try {
    supabaseInstance = createClient<any>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error('[Supabase] Initialization failed:', error);
    // Fallback to dummy client if creation fails
    return getSupabase(); 
  }

  return supabaseInstance;
};

/**
 * Lazy-loaded Supabase client proxy.
 * This can be imported and used anywhere. The actual initialization 
 * will only happen when a property is first accessed.
 * This prevents initialization during module import time, 
 * which is critical for Next.js build-time stability.
 */
export const supabase = new Proxy({} as SupabaseClient<any>, {
  get: (target, prop) => {
    const client = getSupabase();
    return (client as any)[prop];
  },
});
