# Vercel Deployment Configuration — The Static
#
# Two separate Vercel projects deployed from the same monorepo:
#
# PROJECT 1: Member PWA
#   Root Directory: apps/web
#   Framework Preset: Next.js
#   Build Command: pnpm --filter @the-static/web run build
#   Output Directory: .next (auto-detected by Vercel Next.js integration)
#   Install Command: pnpm install
#   Environment Variables:
#     NEXT_PUBLIC_SUPABASE_URL = https://ogibtculbretwbrqvsvw.supabase.co
#     NEXT_PUBLIC_SUPABASE_ANON_KEY = <from Supabase dashboard Settings > API>
#
# PROJECT 2: Admin Dashboard
#   Root Directory: apps/admin
#   Framework Preset: Next.js
#   Build Command: pnpm --filter @the-static/admin run build
#   Output Directory: .next (auto-detected by Vercel Next.js integration)
#   Install Command: pnpm install
#   Environment Variables:
#     NEXT_PUBLIC_SUPABASE_URL = https://ogibtculbretwbrqvsvw.supabase.co
#     NEXT_PUBLIC_SUPABASE_ANON_KEY = <from Supabase dashboard Settings > API>
#     SUPABASE_SERVICE_ROLE_KEY = <from Supabase dashboard Settings > API> (server-side only)
#
# Deployment:
#   1. Connect GitHub repository thestaticwrld-s/thestatic-app to Vercel
#   2. Create Project 1 with root directory apps/web
#   3. Create Project 2 with root directory apps/admin
#   4. Add environment variables to each project
#   5. Deploy both projects
#   6. PWA URL: https://<project1>.vercel.app (e.g. thestaticapp.vercel.app)
#   7. Admin URL: https://<project2>.vercel.app (e.g. thestatic-admin.vercel.app)
#   8. Custom domains: app.thestatic.com -> Project 1, admin.thestatic.com -> Project 2
