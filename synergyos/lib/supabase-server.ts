import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  const missingVars = [
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !supabaseSecretKey ? 'SUPABASE_SECRET_KEY' : null,
  ].filter(Boolean);

  throw new Error(
    `Missing required Supabase environment variable(s): ${missingVars.join(', ')}`
  );
}

export const supabaseServer = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
