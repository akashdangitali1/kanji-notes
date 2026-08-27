'use client';

import { createBrowserClient } from '@supabase/ssr';

// Public, browser-safe client. Uses the anon key, which is safe to expose —
// row-level security policies (see supabase/schema.sql) control what it can actually do.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
