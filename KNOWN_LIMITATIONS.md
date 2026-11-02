# Known Limitations — The Static

## Cryptography

- Direct-message E2EE uses client-side AES-256-GCM envelope encryption, NOT a
  full Signal Protocol implementation. `libsignal` (AGPLv3) was evaluated but
  not adopted pending licensing and engineering review.
- MLS (RFC 9420) for group messaging is evaluated but NOT implemented.
- No independent cryptographic audit has been performed. Do not claim
  Signal-level security.
- Key recovery: a recovery key is generated on device; loss of all devices and
  the recovery key means encrypted history may not be recoverable (by design,
  no admin backdoor).
- Content revocation: removing a follower revokes future access but cannot
  guarantee previously downloaded ciphertext is deleted from their device.

## Backend / Supabase

- Supabase project credentials are not yet configured. The app will not connect
  to a live backend until `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set.
- Edge Functions are written but not deployed to a Supabase project.
- Realtime channel authorization policies are not yet configured.

## Payments / Commerce

- Static Marketplace: no payment custody, escrow, or automatic delivery.
  Transactions are completed independently between buyer and seller.
- Static Store: checkout is built in test mode. No payment-provider
  credentials are configured. Do not process live payments until a BDT payment
  provider is integrated and credentials are provided.
- No payment card information is stored.

## Music

- Music attachments use external links and metadata only (approved providers).
- No licensed music catalogue or streaming; no copyrighted tracks are rehosted.

## Platform

- iOS builds require macOS or EAS Build (this environment is Windows).
- Android builds can use EAS Build without Android Studio locally.
- Push notifications (APNs / FCM) are not configured.

## Icons

- Coolicons is a Figma community resource (no npm package). The app uses
  lucide-react-native for consistent stroke icons as a documented adaptation.
  Replace with Coolicons (SVG) when a usable icon source is integrated.

## Scope

- Group messaging, biometric app unlock, encrypted backups, and video/audio
  calls are deferred to later releases per the product roadmap.
- The admin dashboard is functional for core modules but some pages are
  placeholders awaiting backend wiring.
