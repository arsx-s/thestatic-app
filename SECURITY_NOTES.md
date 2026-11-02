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

## Edge Function Security

All 14 Edge Functions deployed to remote project `ogibtculbretwbrqvsvw`:

- **Authentication**: Every function validates the Bearer token from the Authorization header via `supabase.auth.getUser(token)`. Unauthenticated requests return 401.
- **Authorization**: Admin functions (`provision-member`, `revoke-member`) verify the caller has an admin role (`owner`, `super_admin`, `membership_admin`, `founder`) via `administration.admin_roles`. Member functions verify the caller's `membership.members.status = 'active'`.
- **Input validation**: All functions validate required fields and reject invalid input with 400 errors before any database operation.
- **Schema-qualified references**: All table references use schema-qualified names (e.g., `membership.members`, `social.posts`, `messaging.encrypted_messages`, `administration.audit_logs`). No unqualified table names.
- **Server-side secrets**: Functions use `SUPABASE_SERVICE_ROLE_KEY` (auto-injected by Supabase platform into function runtime) for privileged operations. `SUPABASE_URL` is automatically available. Neither secret is bundled into client code.
- **Audit logging**: Every function writes to `administration.audit_logs` with actor_id, action, target_type, target_id, and metadata.
- **RLS interaction**: Functions use the service-role key, which bypasses RLS. Authorization is enforced in function code (not relying on RLS alone).
- **Runtime verification**: All 14 functions initialize Supabase clients successfully. `login-identifier` returns 200 with `{"email":null}` for non-existent member. All other functions return 401 "Invalid session" when called with anon key (not a valid user JWT) — expected behavior.

### Mandatory Password Change Enforcement

Backend enforcement of `must_change_password` on member-action functions:
- `publish-post`, `send-message`, `create-listing`, `create-order`, `register-event`, `submit-report`, `revoke-member` — all return 403 with `password_change_required: true` if member has not changed their temporary password.
- `login-identifier`, `check-password-change`, `change-password`, `delete-account`, `bootstrap-admin`, `register-device` — exempt (auth/password related or account deletion).
- Frontend redirect: Login page checks `check-password-change` and redirects to `/password-change` screen if required.

### Founder Account Security

- Founder Static ID: `static/001` (reserved, regex-enforced at database level)
- Founder role: `founder` (added to `admin_roles.role` check constraint)
- Database trigger `membership.protect_founder_accounts()` prevents non-founders from modifying founder accounts
- Founder RLS policies: founders can read/update all members; non-founders cannot access founder data via member table policies
- Bootstrap token (`SUPABASE_BOOTSTRAP_TOKEN`) required for one-time founder creation — never stored in code
- Temporary password generated server-side (32 chars, cryptographically random), returned only in bootstrap response, never logged

## Access control

- Row Level Security enabled on all 34 tables across 8 schemas.
- Supabase service-role key never bundled into mobile app or browser.
- Admin dashboard uses server-side authorization (roles checked in API routes).
- Administrators have no backdoor to private encrypted conversations.
- Column-level grants: `anon` can only `SELECT (static_id, username, status)` on `membership.members` — email and other private fields are not accessible.
- `authenticated` members have NO UPDATE privilege on `membership.members` (privilege-level enforcement). Profile edits go through `membership.member_profiles`.
- Database trigger `membership.prevent_member_self_modification()` blocks non-service-role users from changing `status`, `role`, `email`, or `static_id` on their own member record.
- Database trigger `membership.protect_founder_accounts()` blocks non-founders from modifying founder accounts or changing founder role.
- Service role (`auth.uid() IS NULL`) bypasses triggers, allowing admin actions through Edge Functions.
- `members_own_write` RLS policy: `auth.uid() = id` only — members can update their own row, but triggers prevent protected-field changes.
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
