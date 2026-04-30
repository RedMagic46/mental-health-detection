import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Standard client for client-side and general server-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for operations that bypass RLS (like user creation/admin actions)
// ONLY use this in server-side routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
