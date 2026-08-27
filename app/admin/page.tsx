'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { createClient } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-washi">
      <NavBar />
      <section className="mx-auto max-w-sm px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ai mb-3">Admin</p>
        <h1 className="font-display text-3xl text-sumi mb-6">Sign in to review uploads</h1>
        <p className="text-sm text-sumiSoft mb-6">
          Admin accounts are created directly in the Supabase dashboard (Authentication →
          Users). If you don&apos;t have one yet, ask whoever set this project up.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-sm border border-sumi/20 bg-white/60 px-3 py-2.5 text-sumi outline-none focus:border-ai"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-sm border border-sumi/20 bg-white/60 px-3 py-2.5 text-sumi outline-none focus:border-ai"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-ai py-2.5 text-washi hover:bg-ai-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          {error && <p className="text-sm text-shu">{error}</p>}
        </form>
      </section>
    </main>
  );
}
