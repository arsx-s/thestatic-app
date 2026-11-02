-- 002_founder_and_temp_password.sql
-- The Static — founder account and temporary password system.
--
-- Changes:
-- 1. Update static_id regex to allow founder format (static/001)
-- 2. Add must_change_password column to membership.members
-- 3. Add founder role protection via RLS and database trigger

-- ============================================================
-- 1. Update static_id check constraint to allow founder format
-- ============================================================

-- Drop and recreate the check constraint with expanded pattern
-- Accepts both ST-00001 format and static/001 founder format
ALTER TABLE membership.members DROP CONSTRAINT IF EXISTS members_static_id_check;

ALTER TABLE membership.members
  ADD CONSTRAINT members_static_id_check
  CHECK (static_id ~ '^(ST-[0-9]{5}|static/[0-9]{3})$');

-- ============================================================
-- 2. Add must_change_password column
-- ============================================================

ALTER TABLE membership.members
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Index for querying members who need password change
CREATE INDEX IF NOT EXISTS idx_members_must_change_password
  ON membership.members(must_change_password)
  WHERE must_change_password = true;

-- ============================================================
-- 3. Add founder role to admin_roles check constraint
-- ============================================================

ALTER TABLE administration.admin_roles DROP CONSTRAINT IF EXISTS admin_roles_role_check;

ALTER TABLE administration.admin_roles
  ADD CONSTRAINT admin_roles_role_check
  CHECK (role in ('owner','super_admin','membership_admin','moderator','marketplace_moderator','store_manager','event_manager','founder'));

-- ============================================================
-- 4. Founder role protection trigger
-- ============================================================

-- Prevent non-founders from modifying founder accounts
CREATE OR REPLACE FUNCTION membership.protect_founder_accounts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If the row being modified is a founder account
  IF OLD.role = 'founder' OR NEW.role = 'founder' THEN
    -- Only allow the change if the acting user is also a founder
    -- auth.uid() returns NULL for service-role calls, which bypasses this check
    IF auth.uid() IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM membership.members
        WHERE id = auth.uid() AND role = 'founder'
      ) THEN
        RAISE EXCEPTION 'Founder accounts cannot be modified by non-founders';
      END IF;
    END IF;
  END IF;

  -- Prevent changing role away from founder if acting user is not founder
  IF OLD.role = 'founder' AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM membership.members
        WHERE id = auth.uid() AND role = 'founder'
      ) THEN
        RAISE EXCEPTION 'Founder role cannot be changed by non-founders';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER membership_protect_founder_accounts
  BEFORE UPDATE ON membership.members
  FOR EACH ROW
  EXECUTE FUNCTION membership.protect_founder_accounts();

-- ============================================================
-- 4. Update RLS policies for founder protection
-- ============================================================

-- Founders can read all members
CREATE POLICY "founders_read_all_members"
  ON membership.members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM membership.members
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Founders can update members (except founder role protection handled by trigger)
CREATE POLICY "founders_update_members"
  ON membership.members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM membership.members
      WHERE id = auth.uid() AND role = 'founder'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership.members
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- ============================================================
-- 5. Grant permissions for new column
-- ============================================================

GRANT SELECT (must_change_password) ON membership.members TO authenticated;
GRANT UPDATE (must_change_password) ON membership.members TO authenticated;

-- ============================================================
-- 6. Audit log entry
-- ============================================================

-- This migration is applied via supabase db push; audit logging
-- for schema changes is handled at the application layer.
