-- 001_initial_schema.sql
-- The Static — initial database schema.
-- Organised into logical domains within the public schema.
-- Row Level Security is enabled on every exposed table.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Domain: membership
-- ============================================================

create table membership.members (
  id uuid primary key default gen_random_uuid(),
  static_id text unique not null check (static_id ~ '^ST-\d{5}$'),
  username text unique not null check (length(username) between 3 and 30) check (username ~ '^[a-z0-9._]+$'),
  email text unique,
  password_hash text not null,
  status text not null default 'pending' check (status in ('pending','approved','invited','active','suspended','removed')),
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table membership.member_profiles (
  member_id uuid references membership.members(id) on delete cascade primary key,
  display_name text,
  bio text,
  interests text[] not null default '{}',
  location text,
  music_status text,
  profile_photo_url text,
  visibility text not null default 'all_members' check (visibility in ('all_members','connections_only')),
  updated_at timestamptz not null default now()
);

create table membership.applications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references membership.members(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references membership.members(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Domain: identity
-- ============================================================

create table identity.member_devices (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references membership.members(id) on delete cascade,
  name text,
  platform text not null check (platform in ('ios','android','web')),
  status text not null default 'active' check (status in ('active','revoked')),
  identity_public_key text,
  device_public_key text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table identity.key_packages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references membership.members(id) on delete cascade,
  device_id uuid not null references identity.member_devices(id) on delete cascade,
  public_key_package jsonb not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Domain: social
-- ============================================================

create table social.follows (
  follower_id uuid not null references membership.members(id) on delete cascade,
  following_id uuid not null references membership.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table social.blocks (
  blocker_id uuid not null references membership.members(id) on delete cascade,
  blocked_id uuid not null references membership.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table social.mutes (
  muter_id uuid not null references membership.members(id) on delete cascade,
  muted_id uuid not null references membership.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (muter_id, muted_id),
  check (muter_id <> muted_id)
);

create table social.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references membership.members(id) on delete cascade,
  audience text not null default 'followers' check (audience in ('followers','in_sync','all_members','custom')),
  encryption_version int not null default 1,
  encrypted_content text not null,
  encrypted_media_reference text,
  audience_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table social.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references membership.members(id) on delete cascade,
  audience text not null default 'in_sync' check (audience in ('followers','in_sync','all_members','custom')),
  encryption_version int not null default 1,
  encrypted_content text not null,
  encrypted_media_reference text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table social.post_interactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references social.posts(id) on delete cascade,
  member_id uuid not null references membership.members(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('like','repost','save')),
  created_at timestamptz not null default now(),
  unique (post_id, member_id, interaction_type)
);

create table social.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references social.posts(id) on delete cascade,
  author_id uuid not null references membership.members(id) on delete cascade,
  encrypted_content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table social.reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid,
  story_id uuid,
  member_id uuid not null references membership.members(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  check ((message_id is null) <> (story_id is null))
);

create table social.saved_posts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references social.posts(id) on delete cascade,
  member_id uuid not null references membership.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, member_id)
);

-- ============================================================
-- Domain: messaging
-- ============================================================

create table messaging.conversations (
  id uuid primary key default gen_random_uuid(),
  conversation_type text not null default 'direct' check (conversation_type in ('direct','request')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table messaging.conversation_members (
  conversation_id uuid not null references messaging.conversations(id) on delete cascade,
  member_id uuid not null references membership.members(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, member_id)
);

create table messaging.encrypted_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references messaging.conversations(id) on delete cascade,
  sender_device_id uuid not null references identity.member_devices(id) on delete cascade,
  ciphertext text not null,
  protocol_version int not null default 1,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table messaging.message_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references membership.members(id) on delete cascade,
  recipient_id uuid not null references membership.members(id) on delete cascade,
  encrypted_payload text,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create table messaging.delivery_receipts (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messaging.encrypted_messages(id) on delete cascade,
  member_id uuid not null references membership.members(id) on delete cascade,
  delivered_at timestamptz not null default now(),
  read_at timestamptz,
  unique (message_id, member_id)
);

-- ============================================================
-- Domain: commerce
-- ============================================================

create table commerce.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references membership.members(id) on delete cascade,
  category text not null,
  status text not null default 'active' check (status in ('active','sold','removed')),
  encrypted_listing text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table commerce.store_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_bdt numeric(12,2) not null check (price_bdt >= 0),
  inventory int not null default 0,
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table commerce.store_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references commerce.store_products(id) on delete cascade,
  sku text,
  size text,
  color text,
  price_adjustment_bdt numeric(12,2) not null default 0,
  inventory int not null default 0,
  active boolean not null default true
);

create table commerce.carts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references membership.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table commerce.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references commerce.carts(id) on delete cascade,
  product_id uuid not null references commerce.store_products(id) on delete cascade,
  variant_id uuid references commerce.store_product_variants(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  unique (cart_id, product_id, variant_id)
);

create table commerce.store_orders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references membership.members(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','paid','fulfilled','cancelled','refunded')),
  total_bdt numeric(12,2) not null check (total_bdt >= 0),
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table commerce.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references commerce.store_orders(id) on delete cascade,
  product_id uuid not null references commerce.store_products(id),
  variant_id uuid references commerce.store_product_variants(id),
  quantity int not null default 1 check (quantity > 0),
  unit_price_bdt numeric(12,2) not null check (unit_price_bdt >= 0)
);

-- ============================================================
-- Domain: events
-- ============================================================

create table events.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  capacity int,
  registration_deadline timestamptz,
  status text not null default 'draft' check (status in ('draft','published','cancelled','past')),
  application_phase boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table events.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events.events(id) on delete cascade,
  member_id uuid not null references membership.members(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected','attended','cancelled')),
  ticket_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, member_id)
);

create table events.tickets (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references events.event_registrations(id) on delete cascade,
  qr_payload text,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Domain: notifications
-- ============================================================

create table notifications.notification_preferences (
  member_id uuid references membership.members(id) on delete cascade primary key,
  push_enabled boolean not null default true,
  message_notifications boolean not null default true,
  follow_notifications boolean not null default true,
  updated_at timestamptz not null default now()
);

create table notifications.push_tokens (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references membership.members(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios','android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Domain: administration
-- ============================================================

create table administration.admin_roles (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references membership.members(id) on delete cascade,
  role text not null check (role in ('owner','super_admin','membership_admin','moderator','marketplace_moderator','store_manager','event_manager')),
  assigned_by uuid references membership.members(id),
  assigned_at timestamptz not null default now(),
  unique (member_id, role)
);

create table administration.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references membership.members(id) on delete cascade,
  target_type text not null check (target_type in ('post','story','message','listing','member','event')),
  target_id uuid not null,
  encrypted_evidence text,
  status text not null default 'open' check (status in ('open','reviewed','resolved','dismissed')),
  reviewed_by uuid references membership.members(id),
  reviewed_at timestamptz,
  decision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table administration.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references membership.members(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_members_static_id on membership.members(static_id);
create index idx_members_username on membership.members(username);
create index idx_members_status on membership.members(status);

create index idx_follows_follower on social.follows(follower_id);
create index idx_follows_following on social.follows(following_id);
create index idx_blocks_blocker on social.blocks(blocker_id);
create index idx_blocks_blocked on social.blocks(blocked_id);

create index idx_posts_author on social.posts(author_id);
create index idx_posts_created_at on social.posts(created_at desc);
create index idx_stories_author on social.stories(author_id);
create index idx_stories_expires_at on social.stories(expires_at);

create index idx_conversations_type on messaging.conversations(conversation_type);
create index idx_conversation_members_member on messaging.conversation_members(member_id);
create index idx_encrypted_messages_conversation on messaging.encrypted_messages(conversation_id, created_at desc);
create index idx_message_requests_recipient on messaging.message_requests(recipient_id, status);

create index idx_marketplace_listings_seller on commerce.marketplace_listings(seller_id);
create index idx_marketplace_listings_category on commerce.marketplace_listings(category);
create index idx_marketplace_listings_status on commerce.marketplace_listings(status);

create index idx_store_orders_member on commerce.store_orders(member_id);

create index idx_events_status on events.events(status);
create index idx_events_starts_at on events.events(starts_at);
create index idx_event_registrations_event on events.event_registrations(event_id);

create index idx_audit_logs_actor on administration.audit_logs(actor_id);
create index idx_audit_logs_created_at on administration.audit_logs(created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table membership.members enable row level security;
alter table membership.member_profiles enable row level security;
alter table membership.applications enable row level security;
alter table identity.member_devices enable row level security;
alter table identity.key_packages enable row level security;
alter table social.follows enable row level security;
alter table social.blocks enable row level security;
alter table social.mutes enable row level security;
alter table social.posts enable row level security;
alter table social.stories enable row level security;
alter table social.post_interactions enable row level security;
alter table social.comments enable row level security;
alter table social.reactions enable row level security;
alter table social.saved_posts enable row level security;
alter table messaging.conversations enable row level security;
alter table messaging.conversation_members enable row level security;
alter table messaging.encrypted_messages enable row level security;
alter table messaging.message_requests enable row level security;
alter table messaging.delivery_receipts enable row level security;
alter table commerce.marketplace_listings enable row level security;
alter table commerce.store_products enable row level security;
alter table commerce.store_product_variants enable row level security;
alter table commerce.carts enable row level security;
alter table commerce.cart_items enable row level security;
alter table commerce.store_orders enable row level security;
alter table commerce.order_items enable row level security;
alter table events.events enable row level security;
alter table events.event_registrations enable row level security;
alter table events.tickets enable row level security;
alter table notifications.notification_preferences enable row level security;
alter table notifications.push_tokens enable row level security;
alter table administration.admin_roles enable row level security;
alter table administration.moderation_reports enable row level security;
alter table administration.audit_logs enable row level security;

-- ============================================================
-- RLS policies: membership.members
-- ============================================================
-- Public read of active member identity fields (username, static_id, status) for discovery.
-- Sensitive profile fields live in member_profiles with separate visibility policy.
create policy "members_public_read_active"
  on membership.members for select
  using (status = 'active');

create policy "members_own_write"
  on membership.members for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- RLS policies: membership.member_profiles
-- ============================================================
create policy "profiles_read_visible"
  on membership.member_profiles for select
  using (
    visibility = 'all_members'
    or exists (
      select 1 from social.follows f
      where f.following_id = member_profiles.member_id
        and f.follower_id = auth.uid()
    )
    or exists (
      select 1 from social.follows f
      where f.follower_id = member_profiles.member_id
        and f.following_id = auth.uid()
    )
  );

create policy "profiles_own_write"
  on membership.member_profiles for all
  using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

-- ============================================================
-- RLS policies: social.follows
-- ============================================================
create policy "follows_read"
  on social.follows for select
  using (true);

create policy "follows_insert_own"
  on social.follows for insert
  with check (auth.uid() = follower_id);

create policy "follows_delete_own"
  on social.follows for delete
  using (auth.uid() = follower_id);

-- ============================================================
-- RLS policies: social.blocks / mutes
-- ============================================================
create policy "blocks_read_own"
  on social.blocks for select
  using (auth.uid() = blocker_id);

create policy "blocks_insert_own"
  on social.blocks for insert
  with check (auth.uid() = blocker_id);

create policy "blocks_delete_own"
  on social.blocks for delete
  using (auth.uid() = blocker_id);

create policy "mutes_read_own"
  on social.mutes for select
  using (auth.uid() = muter_id);

create policy "mutes_insert_own"
  on social.mutes for insert
  with check (auth.uid() = muter_id);

create policy "mutes_delete_own"
  on social.mutes for delete
  using (auth.uid() = muter_id);

-- ============================================================
-- RLS policies: social.posts
-- ============================================================
create policy "posts_read_authorized_audience"
  on social.posts for select
  using (
    author_id = auth.uid()
    or (deleted_at is null and (
      audience = 'all_members'
      or exists (
        select 1 from social.follows f
        where f.following_id = posts.author_id
          and f.follower_id = auth.uid()
          and (audience = 'followers' or audience = 'in_sync')
      )
      or exists (
        select 1 from social.follows a
        join social.follows b on a.follower_id = b.following_id
        where a.following_id = posts.author_id
          and a.follower_id = auth.uid()
          and b.follower_id = posts.author_id
          and b.following_id = auth.uid()
          and audience = 'in_sync'
      )
    ))
  );

create policy "posts_insert_own"
  on social.posts for insert
  with check (auth.uid() = author_id);

create policy "posts_update_own"
  on social.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- ============================================================
-- RLS policies: social.stories
-- ============================================================
create policy "stories_read_authorized_audience"
  on social.stories for select
  using (
    author_id = auth.uid()
    or (deleted_at is null and expires_at > now() and (
      audience = 'all_members'
      or exists (
        select 1 from social.follows f
        where f.following_id = stories.author_id
          and f.follower_id = auth.uid()
          and (audience = 'followers' or audience = 'in_sync')
      )
    ))
  );

create policy "stories_insert_own"
  on social.stories for insert
  with check (auth.uid() = author_id);

-- ============================================================
-- RLS policies: messaging
-- ============================================================
create policy "conversations_read_member"
  on messaging.conversations for select
  using (exists (
    select 1 from messaging.conversation_members cm
    where cm.conversation_id = conversations.id
      and cm.member_id = auth.uid()
  ));

create policy "conversation_members_read_own"
  on messaging.conversation_members for select
  using (member_id = auth.uid());

create policy "encrypted_messages_read_participant"
  on messaging.encrypted_messages for select
  using (exists (
    select 1 from messaging.conversation_members cm
    where cm.conversation_id = encrypted_messages.conversation_id
      and cm.member_id = auth.uid()
  ));

create policy "encrypted_messages_insert_participant"
  on messaging.encrypted_messages for insert
  with check (exists (
    select 1 from messaging.conversation_members cm
    where cm.conversation_id = encrypted_messages.conversation_id
      and cm.member_id = auth.uid()
  ));

create policy "message_requests_read_parties"
  on messaging.message_requests for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "message_requests_insert_sender"
  on messaging.message_requests for insert
  with check (sender_id = auth.uid());

-- ============================================================
-- RLS policies: commerce
-- ============================================================
create policy "marketplace_listings_read_active"
  on commerce.marketplace_listings for select
  using (status = 'active');

create policy "marketplace_listings_insert_seller"
  on commerce.marketplace_listings for insert
  with check (auth.uid() = seller_id);

create policy "marketplace_listings_update_seller"
  on commerce.marketplace_listings for update
  using (auth.uid() = seller_id);

create policy "store_products_read_active"
  on commerce.store_products for select
  using (status = 'active');

create policy "carts_read_own"
  on commerce.carts for select
  using (member_id = auth.uid());

create policy "carts_insert_own"
  on commerce.carts for insert
  with check (member_id = auth.uid());

create policy "cart_items_read_own"
  on commerce.cart_items for select
  using (exists (
    select 1 from commerce.carts c where c.id = cart_items.cart_id and c.member_id = auth.uid()
  ));

create policy "cart_items_write_own"
  on commerce.cart_items for all
  using (exists (
    select 1 from commerce.carts c where c.id = cart_items.cart_id and c.member_id = auth.uid()
  ))
  with check (exists (
    select 1 from commerce.carts c where c.id = cart_items.cart_id and c.member_id = auth.uid()
  ));

create policy "store_orders_read_own"
  on commerce.store_orders for select
  using (member_id = auth.uid());

create policy "store_orders_insert_own"
  on commerce.store_orders for insert
  with check (member_id = auth.uid());

create policy "order_items_read_own"
  on commerce.order_items for select
  using (exists (
    select 1 from commerce.store_orders o where o.id = order_items.order_id and o.member_id = auth.uid()
  ));

-- ============================================================
-- RLS policies: events
-- ============================================================
create policy "events_read_published"
  on events.events for select
  using (status = 'published');

create policy "event_registrations_read_own"
  on events.event_registrations for select
  using (member_id = auth.uid());

create policy "event_registrations_insert_own"
  on events.event_registrations for insert
  with check (member_id = auth.uid());

-- ============================================================
-- RLS policies: notifications
-- ============================================================
create policy "notification_preferences_read_own"
  on notifications.notification_preferences for select
  using (member_id = auth.uid());

create policy "notification_preferences_write_own"
  on notifications.notification_preferences for all
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "push_tokens_read_own"
  on notifications.push_tokens for select
  using (member_id = auth.uid());

create policy "push_tokens_write_own"
  on notifications.push_tokens for all
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

-- ============================================================
-- RLS policies: administration (service-role only; no public access)
-- ============================================================
create policy "admin_roles_no_public"
  on administration.admin_roles for all
  using (false);

create policy "moderation_reports_no_public"
  on administration.moderation_reports for all
  using (false);

create policy "audit_logs_no_public"
  on administration.audit_logs for all
  using (false);

-- ============================================================
-- Revoke unnecessary defaults
-- ============================================================
revoke all on all tables in schema public from anon, authenticated;
grant select on membership.members to anon, authenticated;
grant all on membership.member_profiles to authenticated;
grant all on social.follows to authenticated;
grant all on social.blocks to authenticated;
grant all on social.mutes to authenticated;
grant all on social.posts to authenticated;
grant all on social.stories to authenticated;
grant all on social.post_interactions to authenticated;
grant all on social.comments to authenticated;
grant all on social.reactions to authenticated;
grant all on social.saved_posts to authenticated;
grant all on messaging.conversations to authenticated;
grant all on messaging.conversation_members to authenticated;
grant all on messaging.encrypted_messages to authenticated;
grant all on messaging.message_requests to authenticated;
grant all on messaging.delivery_receipts to authenticated;
grant all on commerce.marketplace_listings to authenticated;
grant all on commerce.store_products to authenticated;
grant all on commerce.store_product_variants to authenticated;
grant all on commerce.carts to authenticated;
grant all on commerce.cart_items to authenticated;
grant all on commerce.store_orders to authenticated;
grant all on commerce.order_items to authenticated;
grant all on events.events to authenticated;
grant all on events.event_registrations to authenticated;
grant all on events.tickets to authenticated;
grant all on notifications.notification_preferences to authenticated;
grant all on notifications.push_tokens to authenticated;
