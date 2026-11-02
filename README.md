# The Static

There's more of us than you think.

A private, members-only social network and community ecosystem for iOS and
Android, with a separate administrator dashboard. Built with React Native +
Expo, Supabase, and Next.js.

## What was built

- **Mobile app** (`apps/mobile`): React Native + Expo + TypeScript + Expo
  Router. Home (stories rail + chronological following feed), Discover
  (member search by username / Static ID, interests), Create (post composer
  with audience selector), Inbox (chats, message requests), Profile, Settings,
  Static Hub (Marketplace, Store, Events entry points), authentication
  (login, forgot password, account recovery, device verification).
- **Backend** (`supabase/`): PostgreSQL schema with Row Level Security on every
  table, private Storage buckets, and Edge Functions for privileged operations
  (provision-member, login-identifier, register-device, publish-post, and more).
- **Admin dashboard** (`apps/admin`): Next.js + TypeScript, protected by
  server-side session and role checks. Overview, Members, Applications,
  Moderation, Marketplace, Store, Events, Administration.
- **Shared packages**: `shared-types`, `validation`, `crypto-core`,
  `api-client`, `design-system`.

## What works

- Mobile app navigation and all core screens (UI-complete).
- TypeScript typecheck passes across the entire monorepo (`pnpm typecheck`).
- Database schema with RLS policies, indexes, and constraints.
- Login UI and Supabase client configured (requires Supabase credentials to
  connect to a live backend).

## What still needs external credentials

- Supabase project URL + anon key (mobile) and service-role key (admin).
- Edge Functions deployed to a Supabase project.
- Apple Developer / Google Play Console accounts for store builds.
- BDT payment-provider credentials for live Store checkout.
- APNs / FCM push credentials.

## How to run

See `SETUP_GUIDE.md` for installation, environment setup, and running the
mobile app and admin dashboard.

See `DEPLOYMENT_GUIDE.md` for iOS/Android store release instructions.

## Documentation

- `BUILD_STATUS.md` — implementation status and assumptions
- `ENVIRONMENT_VARIABLES.md` — required environment variables
- `SUPABASE_SETUP.md` — Supabase project provisioning
- `SECURITY_NOTES.md` — encryption model and access control
- `KNOWN_LIMITATIONS.md` — known gaps and deferred features

## License

Private / proprietary. All rights reserved.
