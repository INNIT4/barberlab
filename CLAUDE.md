# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # development server
npm run build     # production build (type-checks + compiles)
npm run lint      # ESLint
```

No test suite exists yet. Use `npm run build` to verify TypeScript correctness before finishing any task.

## Environment variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

`DATABASE_URL` uses Supabase's pgbouncer pooler (port 6543, transaction mode). Drizzle is configured with `prepare: false` because of this.

## Architecture

### Route groups

- `app/(marketing)/` — public pages (landing, pricing). No auth required.
- `app/(auth)/` — login and signup. One shared `actions.ts` with `loginAction`, `signupAction`, `logoutAction`.
- `app/(dashboard)/` — protected admin panel. Every page is a Server Component that calls `getCurrentOrg()`.

### Auth + tenant resolution

Every dashboard page starts with:
```ts
const { user, org } = await getCurrentOrg();
```

`getCurrentOrg()` lives in `lib/auth/current-user.ts`. It's wrapped in `React.cache()` so multiple calls within the same request are free. It reads the Supabase session, looks up the user's membership, and returns `{ user, org }`. It redirects to `/login` if no session, `/signup` if the user has no org.

The middleware at `middleware.ts` calls `updateSession()` (from `lib/supabase/middleware.ts`) on every request to keep the Supabase cookie fresh.

### Server Actions pattern

All mutations are Server Actions in `actions.ts` files co-located with the page:

1. Call `getCurrentOrg()` — `org.id` always comes from the server, never from the client
2. Validate with Zod (schemas in `lib/validation/`)
3. Run DB query via Drizzle (`lib/db/index.ts`)
4. Call `revalidatePath()` and return `{ ok: true }` or `{ error, fieldErrors }`

Forms use React 19's `useActionState`. Toast feedback via `sonner`.

### Database

Drizzle ORM on Supabase Postgres. Schema in `lib/db/schema.ts`.

Every tenant-scoped table (`barbers`, `services`, `customers`, `appointments`) has `organizationId`. There are two layers of isolation:
- Server Actions filter by `org.id` from `getCurrentOrg()`
- Supabase RLS policies enforce the same at the DB level

Key constraints to know:
- `appointments`: `EXCLUDE USING gist` prevents double-booking a barber (Postgres error `23P01` → "El barbero ya tiene una cita en ese horario")
- `customers`: `UNIQUE (organization_id, phone)` (Postgres error `23505` → field error on phone)

### Feature flags

Plan limits live in `lib/features/can.ts`. Check before inserting — example:
```ts
const [{ current }] = await db.select({ current: count() }).from(barbers).where(...);
if (!canAddBarber(org.plan, current)) return { error: "..." };
```

Plans: `starter` (1 barbero) · `pro` (5) · `premium` (ilimitado). Defined in `lib/data/plans.ts`.

### Dates and timezone

The org's timezone is stored in `org.timezone` (default `America/Hermosillo`, no DST). Always store UTC in the DB. Use `date-fns-tz`:
- `fromZonedTime(localDate, tz)` to convert local → UTC before inserting
- `formatInTimeZone(utcDate, tz, format)` to display

### UI conventions

- Colors use OKLCH: `oklch(0.25 0.03 60)` — no hex or Tailwind named colors in custom values
- Server Components pass computed data to Client Components as props to avoid hydration mismatches (Radix UI components like `DropdownMenu` must live in `"use client"` files)
- Dialogs for create/edit are controlled components — `open` + `onOpenChange` props, no internal state managing open/close from outside
