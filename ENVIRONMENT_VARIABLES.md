# Environment Variables — The Static

## PWA — Netlify Site (`apps/web`)

Set in Netlify UI → Site settings → Environment variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://ogibtculbretwbrqvsvw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (publishable) key | Yes | `eyJhbGciOiJIUzI1NiIs...` |

The anon key is safe to ship in the client. Row Level Security (RLS) is the authorization boundary — never ship the service-role key.

## Admin Dashboard — Netlify Site (`apps/admin`)

Set in Netlify UI → Site settings → Environment variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://ogibtculbretwbrqvsvw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server only) | Yes | `eyJ...` |

The service-role key bypasses RLS and must **never** be committed or exposed to the browser. It is used only in API routes and Edge Functions.

## Supabase Edge Functions (Supabase Dashboard → Settings → Edge Functions)

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes (auto-injected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key | Yes (auto-injected) |
| `SUPABASE_BOOTSTRAP_TOKEN` | One-time founder bootstrap token | Yes — for founder account creation |

The `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected into Edge Function runtime by Supabase.

## Bootstrap Token (One-Time Founder Setup)

1. Set `SUPABASE_BOOTSTRAP_TOKEN` in Supabase dashboard → Edge Functions → settings
2. Call `POST https://ogibtculbretwbrqvsvw.supabase.co/functions/v1/bootstrap-admin`
   - Header: `Authorization: Bearer <bootstrap_token>`
   - Body: `{"email": "founder@example.com", "username": "founder"}`
3. Save the `temporary_password` from the response (shown ONLY once)
4. Founder logs in with Static ID `static/001` and temporary password
5. Founder completes mandatory password change

## Example `.env.example` files

Not committed with real values. See `apps/web/.env.example` and `apps/admin/.env.example` for templates.

## Notes

- Do not commit real `.env` files. Add them to `.gitignore`.
- Production secrets are configured in Netlify UI / Supabase dashboard, not in the repository.
- See `SUPABASE_SETUP.md` for provisioning the Supabase project.
- See `DEPLOYMENT_GUIDE.md` for Netlify site configuration details.
