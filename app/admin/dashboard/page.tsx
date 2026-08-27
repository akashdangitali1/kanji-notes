'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { createClient } from '@/lib/supabaseClient';
import type { Handout, HandoutStatus } from '@/lib/types';

const TABS: { key: HandoutStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<HandoutStatus>('pending');
  const [handouts, setHandouts] = useState<Handout[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  const load = useCallback(async (status: HandoutStatus) => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('handouts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    setHandouts((data as Handout[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/admin');
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) load(tab);
  }, [tab, checkingAuth, load]);

  async function handleProcess(id: string) {
    setBusyId(id);
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load(tab);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Processing failed.');
      await load(tab);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    await fetch('/api/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load(tab);
    setBusyId(null);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin');
  }

  async function handleCleanup() {
    if (!confirm('This permanently deletes every handout (PDF + data) older than 5 days. Continue?')) return;
    const res = await fetch('/api/cleanup');
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? 'Cleanup failed.');
      return;
    }
    alert(`Deleted ${data.deleted} handout(s) older than 5 days.`);
    load(tab);
  }

  if (checkingAuth) return null;

  return (
    <main className="min-h-screen bg-washi">
      <NavBar />
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-sumi">Review queue</h1>
          <div className="flex items-center gap-4">
            <button onClick={handleCleanup} className="text-sm text-shu underline underline-offset-4">
              Delete old handouts now
            </button>
            <button onClick={handleSignOut} className="text-sm text-sumiSoft underline underline-offset-4">
              Sign out
            </button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-sumi/10 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-body transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-ai text-ai'
                  : 'text-sumiSoft hover:text-sumi'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sumiSoft">Loading…</p>
        ) : handouts.length === 0 ? (
          <p className="text-sumiSoft">Nothing here.</p>
        ) : (
          <ul className="space-y-3">
            {handouts.map((h) => (
              <li key={h.id} className="rounded-sm border border-sumi/10 bg-white/50 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-display text-lg text-sumi">{h.title}</p>
                    <p className="text-sm text-sumiSoft">
                      {h.class_date ?? 'Undated'}
                      {h.uploader_name ? ` · from ${h.uploader_name}` : ''}
                      {' · '}
                      {new Date(h.created_at).toLocaleString()}
                    </p>
                    {h.status === 'failed' && h.error_message && (
                      <p className="text-sm text-shu mt-1">Error: {h.error_message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={`/api/pdf/${h.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-ai underline underline-offset-4"
                    >
                      View PDF
                    </a>
                    {(h.status === 'pending' || h.status === 'failed') && (
                      <>
                        <button
                          onClick={() => handleProcess(h.id)}
                          disabled={busyId === h.id}
                          className="rounded-sm bg-ai px-3 py-1.5 text-sm text-washi hover:bg-ai-dark transition-colors disabled:opacity-50"
                        >
                          {busyId === h.id ? 'Processing…' : 'Process & approve'}
                        </button>
                        <button
                          onClick={() => handleReject(h.id)}
                          disabled={busyId === h.id}
                          className="rounded-sm border border-shu px-3 py-1.5 text-sm text-shu hover:bg-shu hover:text-washi transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}