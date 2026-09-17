# TaskMate

A small, shared task board for two people. No workspaces, no complicated
permissions — just tasks Dip gives, and tasks Wife completes.

- **Given tasks** — created by Dip, waiting for Wife.
- **Completed tasks** — moved here once Wife marks them done. Dip can react
  with an emoji and an optional note.

## Stack

Next.js (App Router) · TypeScript · React · Tailwind CSS · PostgreSQL · Prisma

Everything here runs on Vercel's free/hobby tier and a free Postgres
database (Neon, Supabase, or Vercel Postgres all work) — no paid services
required.

## How access works

There's no email/password login and no NextAuth. Instead:

1. Anyone who knows the shared access code (`APP_ACCESS_CODE`) can get in.
2. After entering it, they pick **"I'm Dip"** or **"I'm Wife"**.
3. That choice is remembered on the device via a signed, `httpOnly` cookie —
   not `localStorage` — so it can't be read or edited from the browser
   console. The cookie is verified (HMAC signature) on every request, and
   every mutation endpoint re-checks the role on the server before doing
   anything. A hidden button in the UI is never the only thing stopping
   Wife's account from deleting a task, for example — the API route itself
   refuses it.

## Project structure

```
prisma/
  schema.prisma        Task, Label, Reaction models
  seed.ts              Demo tasks + default labels (safe to re-run)
src/
  app/
    login/              Access-code screen
    role/                "I'm Dip" / "I'm Wife" screen
    api/
      auth/              verify code, set role, logout/reset
      tasks/             CRUD + complete/reopen + reactions
      labels/            list + add labels
    page.tsx             Dashboard (server component, fetches initial data)
  components/            UI (TaskCard, TaskSheet, ReactionBar, BottomNav, …)
  lib/
    db.ts                Prisma client singleton
    session.ts           Signed-cookie session (no external auth library)
    auth.ts              requireOwner / requireRole helpers used by every API route
    utils.ts             Date formatting, priority styles
  types/                 Shared TypeScript types
```

## 1. Install dependencies

```bash
npm install
```

(`npm install` runs `prisma generate` automatically via `postinstall`. This
needs normal internet access to download Prisma's query engine — it isn't
included in this sandbox's restricted network, but works on any regular
machine or in Vercel's build.)

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Then fill in `.env.local`:

```env
APP_ACCESS_CODE=2703
SESSION_SECRET=<a long random string — e.g. output of `openssl rand -base64 32`>
DATABASE_URL=<your Postgres connection string>
```

`APP_ACCESS_CODE` is only ever read on the server (inside
`/api/auth/verify`), so it's never bundled into frontend JavaScript.

### Getting a free Postgres database

Any of these work on their free tier:

- [Neon](https://neon.tech) — recommended, integrates cleanly with Vercel
- [Supabase](https://supabase.com)
- [Vercel Postgres](https://vercel.com/storage/postgres)

Copy the connection string they give you into `DATABASE_URL`.

## 3. Run migrations and seed the database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

The seed script upserts the default labels (YouTube Video, Coding Task,
House Work, Personal, Shopping, Study, Health, Work, Other) and adds a
handful of demo tasks — but only if the tasks table is empty, so it's safe
to run again later. Delete the demo tasks from the app whenever you're
ready for the real list.

## 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`, enter the access code, and pick a role.

## 5. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Import it into [Vercel](https://vercel.com/new).
3. In **Project Settings → Environment Variables**, add:
   - `APP_ACCESS_CODE`
   - `SESSION_SECRET`
   - `DATABASE_URL`
4. Deploy.
5. Run the production migration once, pointed at your production database:
   ```bash
   DATABASE_URL="<production-url>" npx prisma migrate deploy
   DATABASE_URL="<production-url>" npm run db:seed   # optional, for demo data
   ```
   (Or add `prisma migrate deploy` as part of your Vercel build command if
   you'd rather it run automatically on every deploy.)

That's it — no serverless function config, no Redis, no third-party auth
provider needed.

## Development database reset

**`npm run db:reset` permanently deletes all data** (it runs
`prisma migrate reset`). It is never run automatically — only when you type
it yourself. Use it if you want to wipe a dev database and start clean.

## Notes on the data model

- **Labels** are their own table (`Label`), not a hardcoded enum, so adding
  a new one is just a row — Dip can add labels from Settings, and the UI
  picks them up immediately.
- **Priority** (`LOW` / `NORMAL` / `HIGH`) and **Status** (`GIVEN` /
  `COMPLETED`) are Prisma enums, kept intentionally small.
- **Reaction** is one-per-task (`taskId` is unique), because it's meant to
  be Dip's one verdict on a finished task, not an open comment thread.

## Security checklist

- Access code never appears in client bundles — checked only in
  `/api/auth/verify`, server-side, against `process.env.APP_ACCESS_CODE`.
- Session is an `httpOnly`, signed cookie (HMAC-SHA256) — the role can't be
  edited from the browser without knowing `SESSION_SECRET`.
- Every mutating API route (`create`, `edit`, `delete`, `reopen`, `react`,
  `add label`) calls `requireOwner()` and returns `403` for Wife's session,
  regardless of what the request body says.
- `complete` is the one mutation both roles can call — intentionally, since
  either person might finish a task.
- All request bodies are validated server-side (title length, known label
  IDs, known priority/emoji values) before touching the database.
