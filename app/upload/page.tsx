'use client';

import { useState } from 'react';
import NavBar from '@/components/NavBar';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [classDate, setClassDate] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setStatus('error');
      setMessage('Choose a PDF first.');
      return;
    }
    setStatus('sending');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('class_date', classDate);
    formData.append('uploader_name', uploaderName);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed.');
      setStatus('done');
      setMessage('Uploaded! An admin will review it, then it\u2019ll appear in the archive.');
      setFile(null);
      setTitle('');
      setClassDate('');
      setUploaderName('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <main className="min-h-screen bg-washi">
      <NavBar />
      <section className="mx-auto max-w-xl px-6 py-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ai mb-3">Upload</p>
        <h1 className="font-display text-3xl text-sumi mb-2">Send today&apos;s handout</h1>
        <p className="text-sumiSoft mb-8">
          No account needed. It goes to an admin for a quick check, then gets added to the
          archive automatically.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-sumiSoft mb-1.5" htmlFor="file">
              PDF file
            </label>
            <input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-sm border border-sumi/20 bg-white/60 px-3 py-2.5 text-sumi file:mr-4 file:rounded-sm file:border-0 file:bg-ai file:px-3 file:py-1.5 file:text-washi"
            />
          </div>

          <div>
            <label className="block text-sm text-sumiSoft mb-1.5" htmlFor="title">
              Title <span className="text-sumiSoft/60">(optional — e.g. &quot;Lesson 12: te-form&quot;)</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-sm border border-sumi/20 bg-white/60 px-3 py-2.5 text-sumi outline-none focus:border-ai"
            />
          </div>

          <div>
            <label className="block text-sm text-sumiSoft mb-1.5" htmlFor="date">
              Class date <span className="text-sumiSoft/60">(optional)</span>
            </label>
            <input
              id="date"
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="w-full rounded-sm border border-sumi/20 bg-white/60 px-3 py-2.5 text-sumi outline-none focus:border-ai"
            />
          </div>

          <div>
            <label className="block text-sm text-sumiSoft mb-1.5" htmlFor="name">
              Your name <span className="text-sumiSoft/60">(optional, so classmates know who to thank)</span>
            </label>
            <input
              id="name"
              type="text"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              className="w-full rounded-sm border border-sumi/20 bg-white/60 px-3 py-2.5 text-sumi outline-none focus:border-ai"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-sm bg-ai py-3 text-washi font-body hover:bg-ai-dark transition-colors disabled:opacity-50"
          >
            {status === 'sending' ? 'Uploading…' : 'Submit for review'}
          </button>

          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-shu' : 'text-matcha'}`}>
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
