import type { Metadata } from 'next';
import { Shippori_Mincho, Zen_Kaku_Gothic_New, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Display face: a mincho (serif) style used in real Japanese textbooks and signage —
// gives headers a bit of print-calligraphy weight without being a costume-y "Japanese font".
const shippori = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-shippori',
});

// Body face: renders Japanese and Latin text with matching weight/rhythm, so kanji
// sit naturally next to English glosses instead of looking mismatched.
const zen = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-zen',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: '毎日ノート — Class Handout Archive',
  description: 'Upload today\u2019s handout, get the kanji, grammar, and vocab pulled out automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shippori.variable} ${zen.variable} ${mono.variable}`}>
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
