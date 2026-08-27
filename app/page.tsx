import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { createServiceClient } from '@/lib/supabaseServer';
import type { Handout } from '@/lib/types';

export const revalidate = 0; // always show the freshest queue state

async function getApprovedHandouts(query: string): Promise<Handout[]> {
  const supabase = createServiceClient();
  let req = supabase
    .from('handouts')
    .select('*')
    .eq('status', 'approved')
    .order('class_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  const { data, error } = await req;
  if (error || !data) return [];

  if (!query) return data as Handout[];

  const q = query.toLowerCase();
  return (data as Handout[]).filter((h) => {
    const inTitle = h.title?.toLowerCase().includes(q);
    const inKanji = h.extracted?.kanji?.some(
      (k) => k.char.includes(query) || k.meaning.toLowerCase().includes(q)
    );
    const inGrammar = h.extracted?.grammar?.some(
      (g) => g.pattern.includes(query) || g.meaning.toLowerCase().includes(q)
    );
    const inVocab = h.extracted?.vocabulary?.some(
      (v) => v.word.includes(query) || v.meaning.toLowerCase().includes(q)
    );
    return inTitle || inKanji || inGrammar || inVocab;
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? '';
  const handouts = await getApprovedHandouts(query);

  return (
    <main className="min-h-screen bg-washi">
      <NavBar />

      <section className="mx-auto max-w-5xl px-6 pt-14 pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ai mb-3">
          Class archive
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-sumi leading-tight max-w-2xl">
          Every handout, kanji, and grammar point your class has ever gotten.
        </h1>
        <p className="mt-4 text-sumiSoft max-w-xl">
          Upload today&apos;s PDF and it gets read automatically — kanji, readings, grammar
          patterns and vocabulary, pulled out and searchable, so nobody has to retype a
          handout by hand again.
        </p>

        <form action="/" className="mt-8 flex gap-2 max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search a kanji, word, or grammar pattern…"
            className="flex-1 rounded-sm border border-sumi/20 bg-white/60 px-4 py-2.5 font-body text-sumi placeholder:text-sumiSoft/60 focus:border-ai outline-none"
          />
          <button
            type="submit"
            className="rounded-sm bg-ai px-5 py-2.5 text-washi font-body hover:bg-ai-dark transition-colors"
          >
            Search
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        {handouts.length === 0 ? (
          <div className="grid-paper rounded-sm border border-sumi/10 py-16 text-center">
            <p className="text-sumiSoft">
              {query
                ? `Nothing approved yet matches "${query}".`
                : 'No handouts approved yet — be the first to upload one.'}
            </p>
            <Link href="/upload" className="mt-4 inline-block text-ai underline underline-offset-4">
              Upload a PDF
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-sumi/10 border-t border-b border-sumi/10">
            {handouts.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/handout/${h.id}`}
                  className="group flex items-center justify-between py-5 gap-6"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg text-sumi truncate group-hover:text-ai transition-colors">
                      {h.title}
                    </p>
                    <p className="mt-1 text-sm text-sumiSoft">
                      {h.class_date ?? 'Undated'}
                      {h.extracted?.level ? ` · ${h.extracted.level}` : ''}
                      {h.extracted?.summary ? ` · ${h.extracted.summary}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 font-mono text-xs text-sumiSoft text-right">
                    {h.extracted?.kanji.length ?? 0} kanji
                    <br />
                    {h.extracted?.grammar.length ?? 0} grammar
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
