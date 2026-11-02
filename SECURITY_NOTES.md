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

- Row Level Security enabled on every exposed table.
- Supabase service-role key never bundled into mobile app or browser.
- Admin dashboard uses server-side authorization (roles checked in API routes).
- Administrators have no backdoor to private encrypted conversations.

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
