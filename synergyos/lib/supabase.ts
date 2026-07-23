import { createClient } from '@supabase/supabase-js';

type SupabaseBrowserClient = ReturnType<typeof createClient>;

let supabase: SupabaseBrowserClient | null = null;

function getRequiredSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
      !supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    ].filter(Boolean);

    throw new Error(
      `Missing required Supabase environment variable(s): ${missingVars.join(', ')}`
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function getSupabase() {
  if (supabase) {
    return supabase;
  }

  const { supabaseUrl, supabaseAnonKey } = getRequiredSupabaseEnv();
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}
