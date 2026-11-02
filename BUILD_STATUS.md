# BUILD STATUS — THE STATIC

## Project structure (workspace root)
`C:\Users\arsalan\OneDrive\Documents\staticapp-beta` — monorepo (pnpm + Turborepo)

### Directories
- `apps/mobile` — React Native + Expo + TypeScript + Expo Router (SDK 58, development builds)
- `apps/admin` — Next.js + TypeScript (protected admin dashboard)
- `apps/web` — Next.js PWA (installable on iPhone via Safari)
- `packages/shared-types` — domain types
- `packages/validation` — zod schemas
- `packages/crypto-core` — Web Crypto AES-GCM / HKDF / key-wrap primitives
- `packages/api-client` — typed Supabase client wrapper
- `packages/design-system` — monochrome design tokens
- `supabase/migrations` — `001_initial_schema.sql`
- `supabase/functions` — 12 Edge Functions (incl. bootstrap-admin)
- `supabase/seed`
- `docs`, `tests`

### PWA (`apps/web`) — iOS-installable via Safari
- Next.js 15 with App Router
- Web manifest at `/manifest` (standalone mode, portrait orientation)
- Service worker at `/sw` (app shell caching, no private data caching)
- PNG icons: 72x72 through 512x512, apple-touch-icon (180x180), maskable-icon, splash
- All member pages: Home, Discover, Create, Inbox, Profile, Settings, Hub + sub-pages
- All auth pages: Login, Forgot Password, Account Recovery, Device Verification
- All admin pages: Dashboard, Members, Applications, Moderation, Marketplace, Store, Events, Administration
- API routes: `/api/auth/login`, `/api/auth/logout`
- Build: ✅ Compiles successfully (30 pages generated)
- Deploy: Ready for Vercel (connect GitHub repo, set env vars)

### Documents inspected (complete)
- `about the app.txt`
- `appicon.png` (asset)
- `application hierarchy.txt`
- `designsystem.txt`
- `static.logoicon.svg` (approved logo, 3000x3000 SVG)
- `THE STATIC — Product Requirements & Technical Architecture.txt`

### Assets discovered
- `appicon.png` — application icon
- `static.logoicon.svg` — Static logo icon (vector). Used as the brand mark; not redesigned.

### Technology present
- Node v26.13.0, npm 11.20.0, pnpm 12.16.1

## Implementation status — FOUNDATION COMPLETE

### Typecheck (ALL PASSING)
`pnpm typecheck` — 7 packages successful (mobile, admin, shared-types, validation, crypto-core, api-client, design-system).

### Mobile app (`apps/mobile`) — UI-complete, backend-wired via Supabase client
- `app.json` — "The Static", dark UI, iOS/Android plugins (expo-router, expo-crypto, expo-secure-store, expo-media-library, expo-image-picker, expo-av, expo-notifications, expo-sharing, expo-haptics, expo-linking, expo-web-browser, react-native-reanimated, react-native-gesture-handler, react-native-svg)
- `app/_layout.tsx` — root stack (auth vs tabs)
- `app/(auth)/` — login, forgot-password, account-recovery, device-verification
- `app/(tabs)/` — Home (stories rail + chronological feed w/ cursor pagination), Discover (search by username/Static ID, interests), Create (composer w/ audience selector), Inbox (chats/requests), Profile
- `app/hub.tsx` + `hub/marketplace`, `hub/store`, `hub/events` — Static Hub entry points
- `app/settings.tsx` — privacy, security, keys, devices, blocked, notifications, recovery, delete
- `src/lib/supabase.ts` — Supabase client + SecureStore session persistence
- `src/store/auth.ts` — Zustand auth store (SecureStore persisted)
- `src/providers.tsx` — TanStack Query provider
- Dependencies: expo-router, expo-crypto, expo-secure-store, expo-media-library, expo-image-picker, expo-av, expo-notifications, expo-sharing, expo-haptics, @supabase/supabase-js, zustand, @tanstack/react-query, react-native-reanimated, react-native-gesture-handler, react-native-svg, lucide-react-native

### Supabase backend — migration applied to remote project
- `supabase/migrations/001_initial_schema.sql` — full schema (8 schemas, 34 tables), RLS on every table, indexes, constraints, scoped grants
- Migration `001` applied to remote project `ogibtculbretwbrqvsvw` ("The Static") via `supabase db push --remote --yes`
- Migration recorded on both Local and Remote (`supabase migration list --remote` confirms)
- Remote database verified up to date (no pending migrations)
- 8 schemas: membership, identity, social, messaging, commerce, events, notifications, administration
- 34 tables across all schemas
- `password_hash` column removed — Supabase Auth is sole password authority
- `email` not granted to `anon` — column-level grants restrict anon to `(static_id, username, status)` only
- `members_own_write` RLS policy: `auth.uid() = id` only (trigger enforces status/role/email/static_id immutability)
- Column-level UPDATE grants: NO UPDATE privilege on `membership.members` for `authenticated`
- Database trigger `membership.prevent_member_self_modification()` blocks self-modification of status/role/email/static_id for non-service-role users
- `social.reactions` table created after `messaging.encrypted_messages` to respect FK dependency order
- `social.reactions.message_id` → `messaging.encrypted_messages(id)` with proper FK
- `social.reactions.story_id` → `social.stories(id)` with proper FK
- `static_id` regex uses `[0-9]` (PostgreSQL POSIX-compatible, not `\d`)
- RLS on all 34 tables
- 34 RLS policies across all tables

### Supabase backend — Edge Functions deployed to remote project
- All 12 Edge Functions deployed to remote project `ogibtculbretwbrqvsvw` ("The Static") via `supabase functions deploy --yes`
- All functions status: ACTIVE, version 1
- Functions: bootstrap-admin, create-listing, create-order, delete-account, login-identifier, provision-member, publish-post, register-device, register-event, revoke-member, send-message, submit-report
- All functions use schema-qualified table references (e.g., `membership.members`, `social.posts`, `messaging.encrypted_messages`)
- All functions authenticate via Bearer token from Authorization header
- All functions use service-role key (SUPABASE_SERVICE_ROLE_KEY) for server-side operations — **auto-injected by Supabase platform** (verified by login-identifier returning 200)
- All functions write audit logs to administration.audit_logs
- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY automatically available in function runtime
- Runtime test results:
  - login-identifier: PASS (200, {"email":null} for non-existent member ST-00001)
  - All other 11 functions: PASS (401 "Invalid session" with anon key — expected, requires valid member/admin JWT)
  - No 500 crashes, no 404s, no initialization errors on any function
- Functional testing with real member accounts requires initial admin account creation (bootstrapping — use bootstrap-admin Edge Function with SUPABASE_BOOTSTRAP_TOKEN, or provision-member with admin JWT)

### Admin dashboard (`apps/admin`) — Next.js + TypeScript
- Protected by server-side session + role checks (middleware + API routes)
- `app/(auth)/login` — admin sign-in via `/api/auth/login`
- `app/(admin)/_layout.tsx` — shell with navigation (Overview, Members, Applications, Reports, Marketplace, Store, Events, Administration)
- Pages: dashboard, members (with provision + status update API), applications, moderation, marketplace, store, events, administration
- API routes: `/api/auth/login`, `/api/auth/logout`, `/api/admin/members`, `/api/admin/applications`, `/api/admin/reports`

### Documentation created
- `README.md`, `BUILD_STATUS.md`, `SETUP_GUIDE.md`, `SUPABASE_SETUP.md`
- `ENVIRONMENT_VARIABLES.md`, `DEPLOYMENT_GUIDE.md`, `SECURITY_NOTES.md`, `KNOWN_LIMITATIONS.md`
- `.env.example` (mobile + admin), `.gitignore`

### Missing credentials / external services
- Supabase project URL + anon key (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`)
- Supabase service-role key (server-side only)
- Apple Developer / Google Play Console accounts
- BDT payment-provider credentials (live Store checkout)
- APNs / FCM push credentials

### Important assumptions
- No public registration; accounts provisioned by admins via Edge Function.
- Music: external links/metadata only (no licensed catalogue).
- Group messaging deferred to a later release.
- Coolicons is Figma-only (no npm); lucide-react-native used for stroke icons.
- iOS Keychain / Android Keystore via expo-secure-store; Web Crypto for AES-GCM.
- Store checkout in test mode until payment credentials are provided.

### Founder account bootstrap (REQUIRES USER ACTION)
- Founder Static ID: `static/001` (reserved, cannot be changed)
- Founder role: `founder`
- Founder account NOT YET CREATED — requires bootstrap-admin Edge Function invocation
- To create: Set `SUPABASE_BOOTSTRAP_TOKEN` env var in Supabase dashboard → Edge Functions → settings, then call
  `POST https://ogibtculbretwbrqvsvw.supabase.co/functions/v1/bootstrap-admin`
  with Header: `Authorization: Bearer <bootstrap_token>`
  and Body: `{"email": "founder@example.com", "username": "founder"}`
- Response includes temporary password (shown ONLY once, never logged)
- Founder must change password on first login (mandatory)
- Founder can access both PWA and Admin Dashboard with same credentials

### Migration 002 — Founder & Temp Password System
- `must_change_password` column added to `membership.members`
- `static_id` regex updated to allow `static/001` founder format
- `founder` added to `admin_roles.role` check constraint
- `membership.protect_founder_accounts()` trigger blocks non-founders from modifying founder accounts
- Founder RLS policies added

### Edge Function Security — Password Change Enforcement
Backend enforcement of `must_change_password` on:
- `publish-post` — blocks post creation until password changed
- `send-message` — blocks message sending until password changed
- `create-listing` — blocks listing creation until password changed
- `create-order` — blocks order creation until password changed
- `register-event` — blocks event registration until password changed
- `submit-report` — blocks report submission until password changed
- `revoke-member` — blocks admin revocation until password changed
- `delete-account` — NOT blocked (user can delete account with temp password)
- `login-identifier`, `register-device`, `bootstrap-admin`, `check-password-change`, `change-password` — exempt (auth/password related)

### Missing credentials / external services (UPDATED)
- Supabase project URL + anon key: CONFIGURED in .env files
- Supabase service-role key: auto-injected into Edge Functions, not in client code
- `SUPABASE_BOOTSTRAP_TOKEN`: NOT SET — required for founder bootstrap (set in Supabase dashboard)
- Apple Developer / Google Play Console accounts: not needed (PWA only)
- BDT payment-provider credentials: not needed (test mode)
- APNs / FCM push credentials: not needed (web push only)
- Vercel account: needed for PWA deployment (connect GitHub repo at https://vercel.com)
- Custom domains (app.thestatic.com, admin.thestatic.com): not configured — use Vercel deployment URLs

