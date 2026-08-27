import type { Config } from 'tailwindcss';

// Design tokens — see README "Design notes" for the reasoning.
// Palette named after real materials from the subject's own world:
// washi paper, sumi ink, ai-iro indigo (the dye used on old textbooks/hanko cases),
// and a shu (vermilion stamp / hanko) accent used ONLY for the teacher's original marks.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        washi: '#F7F4EC', // paper background
        washiDark: '#EDE8DA', // grid lines / cell borders on paper
        sumi: '#211F1D', // ink black, primary text
        sumiSoft: '#4A463F', // secondary ink, muted text
        ai: {
          DEFAULT: '#1F3A5F', // ai-iro indigo — primary accent
          light: '#3C5A82',
          dark: '#132741',
        },
        shu: '#B33A2E', // hanko vermilion — used sparingly, only for "pending/needs review"
        matcha: '#5C7A54', // approved / success state
      },
      fontFamily: {
        display: ['var(--font-shippori)', 'serif'],
        body: ['var(--font-zen)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        // the genkouyoushi (manuscript grid paper) motif — the page's signature element
        genkou: `linear-gradient(to right, var(--tw-grid-line) 1px, transparent 1px),
                 linear-gradient(to bottom, var(--tw-grid-line) 1px, transparent 1px)`,
      },
    },
  },
  plugins: [],
};
export default config;
