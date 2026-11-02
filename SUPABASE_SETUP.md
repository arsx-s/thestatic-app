# Supabase Setup — The Static

## 1. Create a Supabase project

Create three environments (per the specification):

- Development
- Staging
- Production

Use a nearby supported region (e.g. Singapore) and benchmark from Bangladesh
before selecting the production region.

## 2. Apply the database migration

Run `supabase/migrations/001_initial_schema.sql` against each project via the
Supabase SQL Editor or the Supabase CLI:

```bash
supabase db push
```

or paste the migration contents into the SQL Editor in the Supabase dashboard.

The migration creates:

- Domains: membership, identity, social, messaging, commerce, events,
  notifications, administration
- Tables: members, member_profiles, applications, member_devices, key_packages,
  follows, blocks, mutes, posts, stories, post_interactions, comments, reactions,
  saved_posts, conversations, conversation_members, encrypted_messages,
  message_requests, delivery_receipts, marketplace_listings, store_products,
  store_product_variants, carts, cart_items, store_orders, order_items, events,
  event_registrations, tickets, notification_preferences, push_tokens,
  admin_roles, moderation_reports, audit_logs
- Row Level Security (RLS) enabled on every table
- Indexes and constraints

## 3. Enable Realtime

Enable Realtime for the tables you need live updates from:

- `posts` — new post notifications
- `stories` — story updates
- `encrypted_messages` — message delivery signals
- `follows` — follow notifications
- `marketplace_listings` — marketplace changes
- `events` — event announcements

Disable public channel access in production Realtime configuration.

## 4. Configure Storage buckets

Create these private buckets (all client-encrypted before upload):

- `profile-media`
- `post-media`
- `story-media`
- `message-media`
- `marketplace-media`
- `store-media`
- `event-media`

Use random object identifiers (not usernames/Static IDs). Use signed URLs only
as temporary access mechanisms to ciphertext.

## 5. Edge Functions

Deploy the following Edge Functions (in `supabase/functions/`):

- `provision-member` — admin creates approved accounts
- `login-identifier` — resolve Static ID/username to email for login
- `register-device` — register cryptographic device identity
- `publish-post` — validate and publish encrypted content
- `send-message` — validate and relay ciphertext
- `create-listing` — validate Marketplace listing
- `create-order` — create a Store order
- `register-event` — register an event participant
- `submit-report` — submit content/account reports
- `delete-account` — process account deletion
- `revoke-member` — suspend membership and sessions

Each function requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets.

## 6. Auth configuration

- Disable public user registration (no public signup endpoint).
- Enable email confirmations if desired.
- Passwords are managed by Supabase Auth (Argon2id hashing handled by Supabase).

## 7. Service-role key

The service-role key bypasses RLS. Store it only in server-side environments
(admin dashboard API routes and Edge Functions). Never in the mobile app or
browser.
