# Setup Guide — The Static

## Prerequisites

- Node.js >= 20
- pnpm (installed globally via the pnpm install script)
- Supabase account and project
- (iOS builds) macOS with Xcode, or EAS Build
- (Android builds) Android Studio, or EAS Build

## 1. Install dependencies

```bash
pnpm install
```

This installs all workspace packages (mobile, admin, shared packages).

## 2. Configure environment variables

Copy the example files and fill in your Supabase credentials:

```bash
cp apps/mobile/.env.example apps/mobile/.env
cp apps/admin/.env.example apps/admin/.env.local
```

See `ENVIRONMENT_VARIABLES.md` for the full variable reference.

## 3. Set up Supabase

1. Create a Supabase project.
2. Apply `supabase/migrations/001_initial_schema.sql`.
3. Create the private Storage buckets.
4. Deploy the Edge Functions in `supabase/functions/`.
5. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Function secrets.

See `SUPABASE_SETUP.md` for details.

## 4. Run the mobile application

```bash
pnpm --filter @the-static/mobile start
```

This starts the Expo dev server. Press `a` for Android or `i` for iOS simulator.

For a development build (required for secure storage and native modules):

```bash
pnpm --filter @the-static/mobile run:android
# or
pnpm --filter @the-static/mobile run:ios
```

iOS builds require macOS; otherwise use EAS Build:

```bash
npx eas-cli@latest build --platform android
npx eas-cli@latest build --platform ios
```

## 5. Run the admin dashboard

```bash
pnpm --filter @the-static/admin dev
```

Open `http://localhost:3000`. Sign in with an administrator account.

## 6. Typecheck and lint

```bash
pnpm typecheck
pnpm lint
```

## 7. Build

```bash
pnpm build
```
