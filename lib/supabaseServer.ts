import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-only client. Uses the SERVICE ROLE key, which bypasses row-level security.
// This file must NEVER be imported from a 'use client' component — only from
// app/api/**/route.ts files, which run exclusively on the server.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export const HANDOUTS_BUCKET = 'handouts';
