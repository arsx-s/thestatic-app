# Deployment Guide — The Static

## Netlify Deployment (PWA + Admin Dashboard)

The Static uses Netlify for hosting both the member-facing PWA and the admin dashboard. Both are separate Netlify sites connected to the same GitHub repository (`thestaticwrld-s/thestatic-app`).

### Monorepo Build Configuration

The repository is a pnpm/Turborepo monorepo. Netlify must be configured with **base directory = `/` (root)** so that `pnpm install` finds `pnpm-workspace.yaml` and installs all workspace dependencies.

### PWA Site — Member-Facing (Existing: https://thestaticapp.netlify.app/)

**Netlify Site Settings:**

| Setting | Value |
|---------|-------|
| Base directory | `/` |
| Build command | `pnpm --filter @the-static/web run build` |
| Publish directory | `apps/web/.next` |
| Functions directory | `.netlify/functions` |
| Node version | 20 |

**Environment Variables (Netlify UI → Site settings → Environment variables):**

| Variable | Value | Visibility |
|----------|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ogibtculbretwbrqvsvw.supabase.co` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard → Settings → API | Public |

### Admin Dashboard Site — Separate Netlify Site

**Create a new Netlify site** connected to the same GitHub repository:

| Setting | Value |
|---------|-------|
| Base directory | `/` |
| Build command | `pnpm --filter @the-static/admin run build` |
| Publish directory | `apps/admin/.next` |
| Functions directory | `.netlify/functions` |
| Node version | 20 |

**Environment Variables:**

| Variable | Value | Visibility |
|----------|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ogibtculbretwbrqvsvw.supabase.co` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard → Settings → API | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard → Settings → API | **Secret** |

### Custom Domains (Optional)

When ready to connect custom domains:

| Domain | Netlify Site | DNS Configuration |
|--------|-------------|-------------------|
| `app.thestatic.com` | PWA site | CNAME → `thestaticapp.netlify.app` |
| `admin.thestatic.com` | Admin site | CNAME → `<admin-site>.netlify.app` |

### Automatic Deployments

All changes pushed to `main` branch trigger automatic deployments on both Netlify sites (GitHub integration).

### iOS PWA Installation

1. Open Safari on iPhone
2. Navigate to PWA URL (e.g., `https://thestaticapp.netlify.app/`)
3. Tap Share → "Add to Home Screen"
4. Open from Home Screen — runs in standalone mode

### Troubleshooting 404 on PWA URL

If the PWA returns 404 after deployment:

1. Verify Netlify site settings: Base directory = `/`, Build command = `pnpm --filter @the-static/web run build`, Publish directory = `apps/web/.next`
2. Check deploy logs in Netlify UI for build errors
3. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
4. Ensure `apps/web/` is tracked in git (not gitignored)

## Mobile Application (Not Published to App Stores)

The Static is distributed as a PWA only. No Apple App Store or Google Play Store publication is planned.

## Backend (Supabase)

Already deployed:
- Project: `ogibtculbretwbrqvsvw` ("The Static")
- Migration 001: 34 tables, 8 schemas, RLS on all
- Migration 002: Founder support, temp password column, founder protection trigger
- Edge Functions: 14 deployed, all ACTIVE

## Secrets

Never commit secrets to GitHub:
- Supabase service-role key
- Payment-provider secrets
- `SUPABASE_BOOTSTRAP_TOKEN`
- Signing credentials

All secrets configured in Netlify UI / Supabase dashboard only.
