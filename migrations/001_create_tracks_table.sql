-- Supabase migration: create tracks table
CREATE TABLE IF NOT EXISTS public.tracks (
  id text PRIMARY KEY,
  vessel text,
  origin text,
  dest text,
  eta text,
  status text,
  loc text,
  moving boolean DEFAULT false,
  inserted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
