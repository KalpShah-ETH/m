-- ============================================
-- MEDCONNECT DATABASE SCHEMA & RLS POLICIES
-- ============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
CREATE TABLE public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text unique,
  first_name text,
  last_name text,
  mobile_number text unique,
  email text unique,
  distributor_code_used text,
  created_at timestamptz default now()
);

-- 2. DISTRIBUTORS
CREATE TABLE public.distributors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique,
  address text not null,
  phone text not null,
  email text,
  gstin text,
  owner_name text,
  status boolean default true,
  user_id uuid REFERENCES auth.users(id),
  minimum_order_value numeric default 0,
  max_debt_amount numeric default 0,
  created_at timestamptz default now()
);

-- 3. RETAILER_DISTRIBUTOR_MAP
CREATE TABLE public.retailer_distributor_map (
  id uuid default uuid_generate_v4() primary key,
  retailer_id uuid references public.profiles(id) on delete cascade not null,
  distributor_id uuid references public.distributors(id) on delete cascade not null,
  status text not null check (status in ('mapped', 'non_mapped')),
  priority int default 0,
  outstanding_amount numeric default 0,
  created_at timestamptz default now(),
  unique (retailer_id, distributor_id)
);

-- 4. CATEGORIES
CREATE TABLE public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon_key text not null,
  created_at timestamptz default now()
);

-- 5. PRODUCTS
CREATE TABLE public.products (
  id uuid default uuid_generate_v4() primary key,
  distributor_id uuid references public.distributors(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  strength text,
  pack_size text,
  ptr numeric not null,
  mrp numeric not null,
  stock_status text check (stock_status in ('high', 'low', 'out-of-stock')) not null,
  discount_percent numeric,
  is_generic boolean default false,
  created_at timestamptz default now()
);

-- 6. CART_ITEMS
CREATE TABLE public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  retailer_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  distributor_id uuid references public.distributors(id) on delete cascade not null,
  quantity int not null check (quantity > 0),
  created_at timestamptz default now(),
  unique (retailer_id, product_id)
);

-- 7. ORDERS
CREATE TABLE public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  retailer_id uuid references public.profiles(id) on delete cascade not null,
  distributor_id uuid references public.distributors(id) on delete cascade not null,
  status text not null check (status in ('placed', 'processed', 'confirmed')),
  total_amount numeric not null,
  created_at timestamptz default now()
);

-- 8. ORDER_ITEMS
CREATE TABLE public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity int not null check (quantity > 0),
  ptr_at_order numeric not null,
  created_at timestamptz default now()
);

-- 9. RETURNS
CREATE TABLE public.returns (
  id uuid default uuid_generate_v4() primary key,
  retailer_id uuid references public.profiles(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete set null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity int not null check (quantity > 0),
  return_type text not null check (return_type in ('saleable', 'expiry')),
  status text not null check (status in ('draft', 'submitted')),
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_distributor_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- 1. Profiles (Users can read and update their own profile)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Shared Tables (Read-only for authenticated users)
CREATE POLICY "Anyone logged in can view distributors" ON public.distributors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone logged in can view categories" ON public.categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone logged in can view products" ON public.products FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Retailer-Owned Tables (cart_items, orders, returns, retailer_distributor_map)
-- Retailer Distributor Map
CREATE POLICY "Retailers can view own map" ON public.retailer_distributor_map FOR SELECT USING (auth.uid() = retailer_id);
CREATE POLICY "Retailers can insert own map" ON public.retailer_distributor_map FOR INSERT WITH CHECK (auth.uid() = retailer_id);
CREATE POLICY "Retailers can update own map" ON public.retailer_distributor_map FOR UPDATE USING (auth.uid() = retailer_id);
CREATE POLICY "Retailers can delete own map" ON public.retailer_distributor_map FOR DELETE USING (auth.uid() = retailer_id);

-- Cart Items
CREATE POLICY "Retailers can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = retailer_id);
CREATE POLICY "Retailers can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = retailer_id);
CREATE POLICY "Retailers can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = retailer_id);
CREATE POLICY "Retailers can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = retailer_id);

-- Orders
CREATE POLICY "Retailers can view own orders" ON public.orders FOR SELECT USING (auth.uid() = retailer_id);
CREATE POLICY "Retailers can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = retailer_id);
CREATE POLICY "Retailers can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = retailer_id);
CREATE POLICY "Retailers can delete own orders" ON public.orders FOR DELETE USING (auth.uid() = retailer_id);

-- Order Items (Join implicitly via orders, but since we insert from Edge Function using service role, select is what matters)
CREATE POLICY "Retailers can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.retailer_id = auth.uid())
);
CREATE POLICY "Retailers can insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.retailer_id = auth.uid())
);

-- Returns
CREATE POLICY "Retailers can view own returns" ON public.returns FOR SELECT USING (auth.uid() = retailer_id);
CREATE POLICY "Retailers can insert own returns" ON public.returns FOR INSERT WITH CHECK (auth.uid() = retailer_id);
CREATE POLICY "Retailers can update own returns" ON public.returns FOR UPDATE USING (auth.uid() = retailer_id);
CREATE POLICY "Retailers can delete own returns" ON public.returns FOR DELETE USING (auth.uid() = retailer_id);


-- ============================================
-- AUTHENTICATION TRIGGER
-- ============================================

-- Function to handle new user signup from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, mobile_number, email, distributor_code_used)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'mobile_number',
    COALESCE(NEW.raw_user_meta_data->>'email_address', NEW.email),
    NEW.raw_user_meta_data->>'distributor_code'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user insertion
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- DUMMY SEED DATA
-- ============================================

-- Example Distributors
INSERT INTO public.distributors (id, name, code, address, phone) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'PharmaCorp Distributors', 'PHC123', 'Mumbai, India', '+91 9876543210'),
  ('d2222222-2222-2222-2222-222222222222', 'MediLife Supplies', 'MLS456', 'Pune, India', '+91 8765432109');

-- Example Categories
INSERT INTO public.categories (id, name, icon_key) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Cardiology', 'heart-pulse'),
  ('c2222222-2222-2222-2222-222222222222', 'Neurology', 'brain'),
  ('c3333333-3333-3333-3333-333333333333', 'Dermatology', 'sparkles');

-- Example Products
INSERT INTO public.products (id, distributor_id, category_id, name, strength, pack_size, ptr, mrp, stock_status, discount_percent, is_generic) VALUES
  (uuid_generate_v4(), 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Telmisartan', '40mg', '10x10', 45.00, 60.00, 'high', 10, false),
  (uuid_generate_v4(), 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Atorvastatin', '10mg', '15x10', 55.00, 85.00, 'low', 5, false),
  (uuid_generate_v4(), 'd2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Levetiracetam', '500mg', '10x10', 120.00, 150.00, 'high', 12, false),
  (uuid_generate_v4(), 'd2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'Ketoconazole Soap', '2%', '75g', 85.00, 110.00, 'out-of-stock', 0, false);
