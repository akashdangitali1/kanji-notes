import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="border-b border-sumi/10">
      <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-sumi">毎日ノート</span>
          <span className="font-mono text-xs uppercase tracking-widest text-sumiSoft">
            mainichi note
          </span>
        </Link>
        <nav className="flex items-center gap-6 font-body text-sm text-sumiSoft">
          <Link href="/" className="hover:text-sumi transition-colors">
            Archive
          </Link>
          <Link href="/upload" className="hover:text-sumi transition-colors">
            Upload today&apos;s PDF
          </Link>
          <Link
            href="/admin"
            className="rounded-sm border border-ai px-3 py-1.5 text-ai hover:bg-ai hover:text-washi transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
