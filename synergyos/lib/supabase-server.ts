import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../types/supabase';

type SupabaseServerClient = SupabaseClient<Database>;

let supabaseServer: SupabaseServerClient | null = null;

function getRequiredSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    const missingVars = [
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
      !supabaseSecretKey ? 'SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY' : null,
    ].filter(Boolean);

    throw new Error(
      `Missing required Supabase environment variable(s): ${missingVars.join(', ')}`
    );
  }

  return { supabaseUrl, supabaseSecretKey };
}

export function getSupabaseServer(): SupabaseServerClient {
  if (supabaseServer) {
    return supabaseServer;
  }

  const { supabaseUrl, supabaseSecretKey } = getRequiredSupabaseEnv();
  supabaseServer = createClient<Database>(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseServer;
}
