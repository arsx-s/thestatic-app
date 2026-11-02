# Deployment Guide — The Static

## Mobile application

### iOS (Apple App Store)

1. Apple Developer Program account.
2. Create an App Store Connect app record ("The Static").
3. Configure app privacy disclosures and privacy policy.
4. Build with EAS:

   ```bash
   npx eas-cli@latest build --platform ios --profile production
   ```

5. Submit via EAS or Transporter:

   ```bash
   npx eas-cli@latest submit --platform ios
   ```

6. Provide Apple Review with a dedicated reviewer account and controlled test
   data (do not expose real members' private content).
7. App must include: objectionable-content reporting, blocking, developer
   contact, and in-app account deletion (Apple requirements for UGC apps).

### Android (Google Play)

1. Google Play Console account ($25 one-time fee).
2. Create an app record ("The Static").
3. Complete the Data Safety declaration.
4. Build with EAS:

   ```bash
   npx eas-cli@latest build --platform android --profile production
   ```

5. Upload the AAB to the Play Console and submit for review.

### Backend (Supabase)

1. Provision a Production Supabase project.
2. Apply `supabase/migrations/001_initial_schema.sql`.
3. Create Storage buckets and Edge Functions.
4. Configure environment variables in your hosting/CI platform.
5. Set up database backups and point-in-time recovery.

### Admin dashboard

The Next.js admin dashboard can be deployed to Vercel, Node.js hosting, or a
container platform:

```bash
pnpm --filter @the-static/admin build
pnpm --filter @the-static/admin start
```

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` in the deployment environment.

### Secrets

Never commit secrets to GitHub:
- Supabase service-role key
- Payment-provider secrets
- APNs / FCM credentials
- Signing credentials
