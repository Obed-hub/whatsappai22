-- WhatsApp Store Engagement System Migration

-- 1. Update products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS popularity_score DECIMAL DEFAULT 0;

-- 2. Update customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_message TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_message TEXT;

-- 3. Create button_clicks table
CREATE TABLE IF NOT EXISTS button_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  button_type TEXT NOT NULL,
  target_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'whatsapp_button',
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create store_visits table
CREATE TABLE IF NOT EXISTS store_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  source TEXT,
  ref TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE button_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_visits ENABLE ROW LEVEL SECURITY;

-- 7. Policies
CREATE POLICY "Vendors can view own button clicks" ON button_clicks FOR SELECT USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can view own analytics events" ON analytics_events FOR SELECT USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can view own store visits" ON store_visits FOR SELECT USING (auth.uid() = vendor_id);

-- 8. Public insert for tracking (if needed by redirect route)
-- Note: Tracking route uses service role usually, but for direct visits:
CREATE POLICY "Public can insert store visits" ON store_visits FOR INSERT WITH CHECK (true);
