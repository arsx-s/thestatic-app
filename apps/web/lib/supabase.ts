import { createClient } from "@supabase/supabase-js";
import { Database } from "@the-static/api-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const AUTH_STORAGE_KEY = "thestatic:auth";

export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      // The OAuth code is exchanged by /auth/callback so the member record can
      // be resolved before the app routes anywhere.
      detectSessionInUrl: false,
      storageKey: AUTH_STORAGE_KEY,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | null = null;

// Lazy supabase client - only created on first use, not at module load time
// This prevents build-time failures when env vars are not yet available
export const supabase: any = new Proxy({}, {
  get(_target, prop: string) {
    if (!_supabase) {
      _supabase = createSupabaseClient();
    }
    return (_supabase as any)[prop];
  },
});

export function getSupabaseClient() {
  if (!_supabase) {
    _supabase = createSupabaseClient();
  }
  return _supabase;
}
