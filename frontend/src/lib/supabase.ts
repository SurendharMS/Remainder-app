import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in frontend/.env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Initiates GitHub OAuth sign-in flow.
 */
export async function signInWithGitHub() {
  return await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

/**
 * Signs out current user session.
 */
export async function signOut() {
  return await supabase.auth.signOut();
}
