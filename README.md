# 毎日ノート (Mainichi Note) — Class Handout Archive

Anyone in the class uploads a photo/scan of today's PDF handout. An admin reviews it
in one click, and AI reads the page (kanji, grammar, vocab) and adds it to a
searchable archive. Runs entirely on free tiers — $0/month.

## What you're setting up

| Service | Free tier | What it does |
|---|---|---|
| [Vercel](https://vercel.com) | Yes, forever | Hosts the website |
| [Supabase](https://supabase.com) | Yes, forever | Database, file storage, admin login |
| [Google AI Studio](https://aistudio.google.com) | Yes, generous daily quota | Reads the PDFs and extracts kanji/grammar |

This will take about 30–45 minutes the first time. After that, deploying updates
takes one click.

---

## Step 1 — Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up (free) → **New project**.
2. Pick any name/password/region. Wait ~2 minutes for it to spin up.
3. In the left sidebar, go to **SQL Editor** → **New query**.
4. Open `supabase/schema.sql` from this project, paste the entire contents in, and click **Run**.
   This creates the `handouts` table, the storage bucket for PDFs, and the security
   rules (who can see what).
5. Go to **Project Settings** (gear icon) → **API**. You'll need three values from here
   in Step 3 — keep this tab open:
   - `Project URL`
   - `anon` `public` key
   - `service_role` key (click "reveal") — **keep this secret, never put it in frontend code**

### Create your admin account(s)

Still in Supabase: **Authentication** → **Users** → **Add user** → **Create new user**.
Enter your own email and a password. This is what you'll use to log into `/admin` on
the site. Add one of these for every trusted senior/admin you want to have approval
rights — no extra code needed, just add them here.

---

## Step 2 — Get a free Gemini API key

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Sign in with any Google account → **Create API key**.
3. Copy the key. The free tier easily covers a daily class upload — you will not hit
   limits at this scale.

---

## Step 3 — Run it locally first (recommended, to make sure it works)

You'll need [Node.js](https://nodejs.org) installed (get the LTS version).

```bash
cd kanji-notes
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in the four values from Steps 1–2:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Try uploading a PDF, then go to
`/admin`, sign in with the account you made in Step 1, and click **Process & approve**.
It should show up on the homepage with kanji/grammar extracted.

---

## Step 4 — Put it online with Vercel (free)

1. Push this project to a GitHub repository (create one on github.com, then
   `git init`, `git add .`, `git commit -m "init"`, follow GitHub's push instructions).
2. Go to [vercel.com](https://vercel.com) → sign up with your GitHub account →
   **Add New Project** → pick your repo.
3. Before deploying, expand **Environment Variables** and add the same four keys
   from your `.env.local`.
4. Click **Deploy**. In about a minute you'll get a live URL like
   `kanji-notes.vercel.app` — share that with your class.

Every time you push new changes to GitHub, Vercel redeploys automatically.

---

## How to use it day-to-day

- **Anyone**: go to `/upload`, attach the PDF, optionally add a title/date/name, submit.
- **Admin**: go to `/admin`, sign in, see the **Pending** tab, click **Process & approve**
  (takes ~10-20 seconds while Gemini reads it) or **Reject** if it's a duplicate/bad scan.
- **Everyone**: the homepage lists every approved handout, searchable by kanji, word,
  or grammar pattern. Click into one to see the full breakdown plus the original PDF.

If Gemini misreads something (messy handwriting happens), it lands in the **Failed**
tab with the error shown — you can just try **Process & approve** again, or reject it
and ask for a clearer photo.

---

## Design notes

The visual identity is built around **genkouyoushi** (原稿用紙), the manuscript grid
every Japanese student writes kanji into — kanji cards use that grid as their
background instead of a generic card shape. The palette is named after real
materials: `washi` (paper), `sumi` (ink), `ai` (indigo, the primary accent), and
`shu` (vermilion hanko-stamp red, used only for pending/rejected states) — see
`tailwind.config.ts` for the exact tokens if you want to adjust them.

## Extending this later

Some natural next steps once v1 is running:
- Export a handout's kanji list as printable flashcards / Anki deck
- Weekly digest email of newly approved handouts
- Let students flag a wrong reading/meaning for an admin to fix
- Filter/browse by JLPT level across the whole archive

## Project structure

```
app/
  page.tsx                 → public homepage (search + browse)
  upload/page.tsx           → upload form, no login required
  handout/[id]/page.tsx     → single handout detail view
  admin/page.tsx             → admin login
  admin/dashboard/page.tsx   → review queue (approve/reject)
  api/upload/route.ts        → handles new PDF submissions
  api/process/route.ts       → runs Gemini extraction, admin-only
  api/reject/route.ts        → rejects a pending handout, admin-only
  api/pdf/[id]/route.ts      → serves the PDF file itself
lib/
  gemini.ts                  → the AI extraction prompt + call
  types.ts                   → shared data shapes
  supabase*.ts               → database/auth clients
supabase/schema.sql           → run this once in Supabase's SQL editor
```
