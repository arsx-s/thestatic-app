# Security Notes — The Static

## Encryption model

- Client-side AES-256-GCM envelope encryption for posts, stories, marketplace
  listings, and private profile fields.
- Direct messages: ciphertext stored in PostgreSQL; keys never leave the
  device. A full Signal Protocol / MLS implementation is pending licensing and
  security review (see KNOWN_LIMITATIONS.md).
- Private keys stored in iOS Keychain / Android Keystore via `expo-secure-store`.
- No plaintext private messages or media in backend storage.

## What the server can see (unavoidable metadata)

- Static IDs, usernames, membership status, follow/block/mute relationships.
- Post/story audience references, creation timestamps, encryption version.
- Message routing metadata (conversation IDs, sender device IDs, timestamps).
- Delivery/push tokens.
- Commerce and event metadata required for fulfilment.

The server CANNOT see:
- Post/story/comment plaintext (ciphertext only).
- Direct message plaintext (ciphertext only).
- Private encryption keys.
- User passwords (Supabase Auth hashes with Argon2id).

## Authentication

- Supabase Auth is the authority for password verification and session issuance.
- No custom password system. No public registration endpoint.
- Login resolves Static ID/username to email via a protected, rate-limited
  Edge Function (`login-identifier`).
- Sessions persisted in secure storage (not AsyncStorage).

## Access control

- Row Level Security enabled on all 34 tables across 8 schemas.
- Supabase service-role key never bundled into mobile app or browser.
- Admin dashboard uses server-side authorization (roles checked in API routes).
- Administrators have no backdoor to private encrypted conversations.
- Column-level grants: `anon` can only `SELECT (static_id, username, status)` on `membership.members` — email and other private fields are not accessible.
- `authenticated` members have NO UPDATE privilege on `membership.members` (privilege-level enforcement). Profile edits go through `membership.member_profiles`.
- Database trigger `membership.prevent_member_self_modification()` blocks non-service-role users from changing `status`, `role`, `email`, or `static_id` on their own member record.
- Service role (`auth.uid() IS NULL`) bypasses the trigger, allowing admin actions through Edge Functions.
- `members_own_write` RLS policy: `auth.uid() = id` only — members can update their own row, but the trigger prevents protected-field changes.
- `in_sync` audience requires mutual following (both `follows` rows must exist).
- Message access restricted to conversation participants via `conversation_members` RLS policy.
- Administration tables (`admin_roles`, `moderation_reports`, `audit_logs`) have `using (false)` policies — no public or authenticated member access.

## App Store requirements

- User-generated-content reporting and blocking.
- In-app account deletion.
- Developer contact information.
- Reviewer account with controlled test data.

## Remaining validation

- Independent cryptographic audit required before claiming Signal-level
  security.
- RLS policies should be tested with multiple independent member accounts.
- Penetration testing recommended before public release.
