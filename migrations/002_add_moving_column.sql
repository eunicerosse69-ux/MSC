-- Add moving column to tracks table
ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS moving boolean DEFAULT false;
