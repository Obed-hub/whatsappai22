-- ============================================================
-- WhatsApp Follow-Up & Alert System Migration
-- Run this in Supabase SQL Editor AFTER whatsapp_engagement.sql
-- ============================================================

-- 1. followups table
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  -- type: soft (2min), urgent (10min), reminder_1h, reminder_24h
  type TEXT NOT NULL CHECK (type IN ('soft', 'urgent', 'reminder_1h', 'reminder_24h')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. alerts table (log of all vendor alerts sent)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- hot_lead | demand_spike | unanswered_customers
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. interests table (tracks product interest per customer)
CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  intent_score INTEGER DEFAULT 50 CHECK (intent_score >= 0 AND intent_score <= 100),
  intent_type TEXT, -- buying_intent | price_inquiry | product_inquiry etc.
  raw_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. back_in_stock_requests — update if exists from old schema, else create
CREATE TABLE IF NOT EXISTS back_in_stock_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'cancelled')),
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- 5. Add intent_type and last_intent_at to customers for quick hot-lead lookup
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_intent TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_intent_at TIMESTAMPTZ;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE back_in_stock_requests ENABLE ROW LEVEL SECURITY;

-- Vendors read their own data (dashboard)
CREATE POLICY "Vendors can view own followups"
  ON followups FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can view own alerts"
  ON alerts FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can view own interests"
  ON interests FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can view own stock requests"
  ON back_in_stock_requests FOR SELECT USING (auth.uid() = vendor_id);

-- Service role bypass (for cron jobs, webhook inserts)
-- These are covered automatically by using the service role key.
-- Explicit allow-all for service_role is not needed; it bypasses RLS by default.

-- ============================================================
-- Indexes for cron job performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_followups_scheduled
  ON followups (scheduled_at)
  WHERE sent_at IS NULL AND cancelled_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_followups_vendor_customer
  ON followups (vendor_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_interests_vendor_product
  ON interests (vendor_id, product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_vendor_created
  ON alerts (vendor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_back_in_stock_product_status
  ON back_in_stock_requests (product_id, status)
  WHERE status = 'pending';
