-- Run this once in your Supabase project's SQL Editor (Supabase dashboard -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists handouts (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled handout',
  class_date date,
  uploader_name text,
  pdf_path text not null,
  status text not null default 'pending' check (status in ('pending','processing','approved','rejected','failed')),
  extracted jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

-- Everyone (including anonymous visitors) can read APPROVED handouts only.
-- Pending/rejected ones stay invisible to the public until an admin approves them.
alter table handouts enable row level security;

create policy "public can read approved handouts"
  on handouts for select
  using (status = 'approved');

-- Authenticated admins can read/update everything (used by the admin dashboard,
-- which signs in via Supabase Auth email/password).
create policy "admins can read all handouts"
  on handouts for select
  to authenticated
  using (true);

create policy "admins can update handouts"
  on handouts for update
  to authenticated
  using (true);

-- Inserts (new uploads) happen through the /api/upload server route using the
-- service role key, which bypasses RLS entirely, so no public insert policy is needed.
-- This keeps "who can create a pending row" enforced by your own API logic, not
-- by an open table policy.

-- Storage bucket for the actual PDF files.
insert into storage.buckets (id, name, public)
values ('handouts', 'handouts', false)
on conflict (id) do nothing;

-- Only admins (authenticated users) can read files directly from storage.
-- The public site never links straight to storage; it goes through
-- /api routes so unapproved PDFs are never reachable by URL guessing.
create policy "admins can read handout files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'handouts');
