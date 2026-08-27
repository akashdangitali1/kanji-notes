import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Used inside app/api/**/route.ts to check "is the caller a logged-in admin?"
// by reading their Supabase Auth session cookie (set at /admin login).
export function createRouteClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

/** Throws if there's no logged-in admin session. Call at the top of any admin-only route. */
export async function requireAdmin() {
  const supabase = createRouteClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Response(JSON.stringify({ error: 'Not signed in as admin.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return data.user;
}
