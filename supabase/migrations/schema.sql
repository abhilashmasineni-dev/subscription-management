-- REAL-TIME SUBSCRIPTION TRACKER SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. DROP EXISTING TABLES (if any) TO START FRESH
DROP TABLE IF EXISTS deleted_subscriptions;
DROP TABLE IF EXISTS expired_subscriptions;
DROP TABLE IF EXISTS active_subscriptions;

-- 2. CREATE ACTIVE_SUBSCRIPTIONS TABLE
CREATE TABLE active_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_name VARCHAR(255) NOT NULL,
  website_link VARCHAR(255),
  start_date DATE NOT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT expiration_after_start CHECK (expiration_date >= start_date),
  CONSTRAINT positive_cost CHECK (cost > 0),
  CONSTRAINT unique_name_per_user UNIQUE (user_id, subscription_name)
);

-- 3. CREATE EXPIRED_SUBSCRIPTIONS TABLE
CREATE TABLE expired_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_subscription_id UUID, -- Reference to the id from active_subscriptions
  subscription_name VARCHAR(255),
  website_link VARCHAR(255),
  start_date DATE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  cost DECIMAL(10, 2),
  currency VARCHAR(3),
  status VARCHAR(50) DEFAULT 'expired' CHECK (status IN ('expired', 'restored')),
  expired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  can_restore_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  restored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_restore_window CHECK (can_restore_until > expired_at)
);

-- 4. CREATE DELETED_SUBSCRIPTIONS TABLE
CREATE TABLE deleted_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_subscription_id UUID,
  subscription_name VARCHAR(255),
  website_link VARCHAR(255),
  start_date DATE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  cost DECIMAL(10, 2),
  currency VARCHAR(3),
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  can_restore_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  restored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_restore_window_deleted CHECK (can_restore_until > deleted_at)
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE active_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expired_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES

-- active_subscriptions policies
CREATE POLICY "Users can view own active subscriptions"
  ON active_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON active_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON active_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON active_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- expired_subscriptions policies
CREATE POLICY "Users can view own expired subscriptions"
  ON expired_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expired subscriptions"
  ON expired_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expired subscriptions"
  ON expired_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- deleted_subscriptions policies
CREATE POLICY "Users can view own deleted subscriptions"
  ON deleted_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deleted subscriptions"
  ON deleted_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deleted subscriptions"
  ON deleted_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_active_user_status_expiry ON active_subscriptions(user_id, status, expiration_date);
CREATE INDEX idx_expired_user_expiry ON expired_subscriptions(user_id, expired_at);
CREATE INDEX idx_deleted_user_deleted ON deleted_subscriptions(user_id, deleted_at);

-- 8. REAL-TIME EMPOWERMENT
-- Enable real-time for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE active_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE expired_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE deleted_subscriptions;

-- 9. AUTO-CONFIRM EMAILS (Development Bypass)
-- This trigger automatically confirms the email for any new user.
-- This prevents Supabase from hitting the "email rate limit" on free tiers.
CREATE OR REPLACE FUNCTION public.handle_new_user_confirm()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger must be created on the auth.users table.
-- If running via migrations, ensure the user has permissions. 
-- If it fails, run the following in the Supabase SQL Editor:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_confirm();
