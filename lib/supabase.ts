import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient<any> | null = null;

/**
 * Returns a initialized Supabase client.
 * Handles build-time environments gracefully by returning a dummy proxy
 * instead of throwing or initializing with undefined values.
 */
export const getSupabase = (): SupabaseClient<any> => {
  // Return existing instance if available
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Strict validation for environment variables
  const hasEnvVars = supabaseUrl && supabaseAnonKey && 
                     supabaseUrl !== 'undefined' && 
                     supabaseAnonKey !== 'undefined';

  if (!hasEnvVars) {
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      // In browser, this is a critical configuration error
      console.error('Supabase credentials missing in browser environment.');
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.');
    }
    
    // During build time/SSR in Node.js, return a safe dummy client
    // This prevents "supabaseUrl is required" error from @supabase/supabase-js
    const createDummyClient = (): any => {
      const logger = (prop: string | symbol) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Supabase] "${String(prop)}" accessed during build without env vars.`);
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
  supabaseInstance = createClient<any>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
};

/**
 * Lazy-loaded Supabase client proxy.
 * This can be imported and used anywhere. The actual initialization 
 * will only happen when a property is first accessed.
 */
export const supabase = new Proxy({} as SupabaseClient<any>, {
  get: (target, prop) => {
    const client = getSupabase();
    return (client as any)[prop];
  },
});
