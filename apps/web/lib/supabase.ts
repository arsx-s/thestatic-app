import { createClient } from "@supabase/supabase-js";
import { Database } from "@the-static/api-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseClient(accessToken?: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    },
    auth: { autoRefreshToken: false, persistSession: false },
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

export const AUTH_STORAGE_KEY = "thestatic:auth:session";

export async function persistSession(accessToken: string, refreshToken: string): Promise<void> {
  localStorage.setItem(`${AUTH_STORAGE_KEY}:access`, accessToken);
  localStorage.setItem(`${AUTH_STORAGE_KEY}:refresh`, refreshToken);
}

export async function clearStoredSession(): Promise<void> {
  localStorage.removeItem(`${AUTH_STORAGE_KEY}:access`);
  localStorage.removeItem(`${AUTH_STORAGE_KEY}:refresh`);
}

export async function getStoredAccessToken(): Promise<string | null> {
  return localStorage.getItem(`${AUTH_STORAGE_KEY}:access`);
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return localStorage.getItem(`${AUTH_STORAGE_KEY}:refresh`);
}
