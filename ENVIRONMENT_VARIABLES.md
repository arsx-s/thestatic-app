# Environment Variables — The Static

## Mobile application (`apps/mobile/.env`)

Create `apps/mobile/.env` from `.env.example`. These are compile-time constants
injected by Expo (`EXPO_PUBLIC_*` prefix).

| Variable | Description | Required | Example |
|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://abcdefg.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (publishable) key | Yes | `eyJhbGciOiJIUzI1NiIs...` |

The anon key is safe to ship in the client. Row Level Security (RLS) is the
authorization boundary — never ship the service-role key.

## Admin dashboard (`apps/admin/.env.local`)

| Variable | Description | Required | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://abcdefg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server only) | Yes | `eyJ...` |

The service-role key bypasses RLS and must **never** be committed or exposed to
the browser. It is used only in API routes and Edge Functions.

## Supabase Edge Functions (`supabase/.env` or platform secret store)

| Variable | Description | Required |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key | Yes |

## Example `.env.example` (mobile)

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Notes

- Do not commit real `.env` files. Add them to `.gitignore`.
- Production secrets (service-role keys, payment credentials, APNs/FCM keys)
  are configured in your hosting/CI environment, not in the repository.
- See `SUPABASE_SETUP.md` for provisioning the Supabase project.
