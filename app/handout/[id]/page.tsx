import { notFound } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { createServiceClient } from '@/lib/supabaseServer';
import type { Handout } from '@/lib/types';

export const revalidate = 0;

async function getHandout(id: string): Promise<Handout | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('handouts')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single();
  if (error || !data) return null;
  return data as Handout;
}

export default async function HandoutPage({ params }: { params: { id: string } }) {
  const handout = await getHandout(params.id);
  if (!handout || !handout.extracted) notFound();
  const { extracted } = handout;

  return (
    <main className="min-h-screen bg-washi">
      <NavBar />

      <section className="mx-auto max-w-5xl px-6 pt-12 pb-6">
        <Link href="/" className="text-sm text-ai underline underline-offset-4">
          ← Back to archive
        </Link>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-display text-4xl text-sumi">{handout.title}</h1>
          <a
            href={`/api/pdf/${handout.id}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-ai underline underline-offset-4"
          >
            View original PDF ↗
          </a>
        </div>
        <p className="mt-2 text-sumiSoft">
          {handout.class_date ?? 'Undated'}
          {extracted.level ? ` · Level ${extracted.level}` : ''}
          {handout.uploader_name ? ` · uploaded by ${handout.uploader_name}` : ''}
        </p>
        {extracted.summary && <p className="mt-3 max-w-2xl text-sumi">{extracted.summary}</p>}
      </section>

      {extracted.kanji.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="font-display text-2xl text-sumi mb-5">Kanji</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {extracted.kanji.map((k, i) => (
              <div key={i} className="rounded-sm border border-sumi/10 bg-white/50 p-3">
                <div className="kanji-cell mb-2 text-4xl font-display text-sumi">{k.char}</div>
                <p className="font-mono text-xs text-ai">
                  {[k.onyomi, k.kunyomi].filter(Boolean).join(' · ') || '—'}
                </p>
                <p className="text-sm text-sumiSoft mt-1">{k.meaning}</p>
                {k.example_word && (
                  <p className="text-xs text-sumiSoft/80 mt-1.5 border-t border-sumi/10 pt-1.5">
                    {k.example_word}
                    {k.example_reading ? `（${k.example_reading}）` : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {extracted.grammar.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="font-display text-2xl text-sumi mb-5">Grammar patterns</h2>
          <div className="space-y-4">
            {extracted.grammar.map((g, i) => (
              <div key={i} className="rounded-sm border border-sumi/10 bg-white/50 p-5">
                <p className="font-display text-xl text-ai">{g.pattern}</p>
                <p className="text-sumi mt-1">{g.meaning}</p>
                {g.example_jp && (
                  <div className="mt-3 border-l-2 border-ai/30 pl-4">
                    <p className="text-sumi">{g.example_jp}</p>
                    <p className="text-sm text-sumiSoft mt-0.5">{g.example_en}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {extracted.vocabulary.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="font-display text-2xl text-sumi mb-5">Vocabulary</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
            {extracted.vocabulary.map((v, i) => (
              <div key={i} className="flex justify-between border-b border-sumi/10 py-2 text-sm">
                <span className="text-sumi">
                  {v.word} <span className="text-sumiSoft">{v.reading}</span>
                </span>
                <span className="text-sumiSoft">{v.meaning}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {extracted.notes && (
        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="font-display text-2xl text-sumi mb-3">Notes</h2>
          <p className="text-sumi whitespace-pre-wrap">{extracted.notes}</p>
        </section>
      )}

      <div className="h-16" />
    </main>
  );
}
