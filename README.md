# MSC cargo

A React + Express + Supabase cargo tracking app.

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a local `.env` file from `.env.example`:
   ```bash
   copy .env.example .env
   ```

3. Update `.env` with your Supabase values:
   ```env
   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_KEY=sb_secret_<your-secret>
   SUPABASE_DB_URL=postgresql://<user>:<pass>@<host>:5432/postgres
   PORT=4000
   VITE_API_BASE=
   ```

4. Start both frontend and backend:
   ```bash
   npm run dev
   ```

5. Open the app in your browser at the URL shown by Vite.

## Backend only

```bash
npm run dev:backend
```

## Frontend only

```bash
npm run dev:frontend
```

## Deployment notes

- Keep `.env` local and out of Git.
- Commit only `.env.example` with placeholders.
- Make sure `SUPABASE_KEY` is a secret service key.
- If you deploy frontend and backend separately, set `VITE_API_BASE` to the backend origin.

## GitHub preparation

1. Ensure `.env` is ignored in `.gitignore`.
2. Keep only redacted placeholders in `.env.example`.
3. Push the repo normally once the above is confirmed.
