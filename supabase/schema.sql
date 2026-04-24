-- WhatsStore AI Supabase Schema

-- Enable Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  description TEXT,
  delivery_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  tags TEXT[] DEFAULT '{}',
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  consent_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, phone)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone_number_id TEXT,
  last_user_message_at TIMESTAMPTZ DEFAULT NOW(),
  window_open_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automations table
CREATE TABLE IF NOT EXISTS automations (
  vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
  auto_reply_enabled BOOLEAN DEFAULT true,
  ai_enabled BOOLEAN DEFAULT true,
  followup_enabled BOOLEAN DEFAULT false,
  welcome_message TEXT,
  reminder_1 INTEGER DEFAULT 24,
  reminder_2 INTEGER DEFAULT 48,
  reminder_3 INTEGER DEFAULT 72,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Back in stock requests
CREATE TABLE IF NOT EXISTS back_in_stock_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Connections
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
  phone_number_id TEXT,
  waba_id TEXT,
  access_token TEXT,
  verify_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can view own profile" ON vendors FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Vendors can update own profile" ON vendors FOR UPDATE USING (auth.uid() = id);

-- Stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage own stores" ON stores FOR ALL USING (auth.uid() = vendor_id);
CREATE POLICY "Public can view stores" ON stores FOR SELECT USING (true);

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage own products" ON products FOR ALL USING (auth.uid() = vendor_id);
CREATE POLICY "Public can view published products" ON products FOR SELECT USING (is_published = true);

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage own customers" ON customers FOR ALL USING (auth.uid() = vendor_id);

-- Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage own conversations" ON conversations FOR ALL USING (auth.uid() = vendor_id);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage own messages" ON messages FOR ALL USING (auth.uid() = vendor_id);

-- Automations
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage own automations" ON automations FOR ALL USING (auth.uid() = vendor_id);

-- Back in stock
ALTER TABLE back_in_stock_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage own requests" ON back_in_stock_requests FOR ALL USING (auth.uid() = vendor_id);

-- WhatsApp Connections
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can manage own connection" ON whatsapp_connections FOR ALL USING (auth.uid() = vendor_id);

-- Triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_whatsapp_connections_updated_at BEFORE UPDATE ON whatsapp_connections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Storage Buckets & Policies
-- Note: Buckets "store-assets" and "product-images" must be created first before applying these policies

-- Allow public access to read files
CREATE POLICY "Give users public access to store assets" ON storage.objects FOR SELECT USING (bucket_id = 'store-assets');
CREATE POLICY "Give users public access to product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload store assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'store-assets');
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow users to update their own store assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'store-assets' AND auth.uid() = owner);
CREATE POLICY "Allow users to update their own product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND auth.uid() = owner);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own store assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'store-assets' AND auth.uid() = owner);
CREATE POLICY "Allow users to delete their own product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND auth.uid() = owner);
