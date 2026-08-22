-- ============================================
-- MEDCONNECT DATABASE SCHEMA & RLS POLICIES
-- ============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
  id uuid not null,
  username text null,
  first_name text null,
  last_name text null,
  mobile_number text null,
  email text null,
  distributor_code_used text null,
  created_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_mobile_number_key unique (mobile_number),
  constraint profiles_username_key unique (username),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
);

-- 2. DISTRIBUTORS
create table public.distributors (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  code text null,
  address text not null,
  phone text not null,
  created_at timestamp with time zone null default now(),
  email text null,
  gstin text null,
  owner_name text null,
  status boolean null default true,
  user_id uuid null,
  minimum_order_value numeric null default 0,
  max_debt_amount numeric null default 0,
  area text not null,
  city text not null,
  constraint distributors_pkey primary key (id),
  constraint distributors_code_key unique (code),
  constraint distributors_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- 3. USER ROLES
create table public.user_roles (
  user_id uuid not null,
  role text not null,
  distributor_id uuid null,
  constraint user_roles_pkey primary key (user_id),
  constraint user_roles_distributor_id_fkey foreign KEY (distributor_id) references distributors (id),
  constraint user_roles_user_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint user_roles_role_check check (
    (
      role = any (array['admin'::text, 'distributor'::text])
    )
  )
);

-- 4. RETAILER_DISTRIBUTOR_MAP
create table public.retailer_distributor_map (
  id uuid not null default extensions.uuid_generate_v4 (),
  retailer_id uuid not null,
  distributor_id uuid not null,
  status text not null,
  priority integer null default 0,
  outstanding_amount numeric null default 0,
  created_at timestamp with time zone null default now(),
  constraint retailer_distributor_map_pkey primary key (id),
  constraint retailer_distributor_map_retailer_id_distributor_id_key unique (retailer_id, distributor_id),
  constraint retailer_distributor_map_distributor_id_fkey foreign KEY (distributor_id) references distributors (id) on delete CASCADE,
  constraint retailer_distributor_map_retailer_id_fkey foreign KEY (retailer_id) references profiles (id) on delete CASCADE,
  constraint status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  )
);

-- 5. CATEGORIES
create table public.categories (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  icon_key text not null,
  created_at timestamp with time zone null default now(),
  constraint categories_pkey primary key (id)
);

-- 6. PRODUCTS
create table public.products (
  id uuid not null default extensions.uuid_generate_v4 (),
  distributor_id uuid not null,
  category_id uuid null,
  name text not null,
  strength text null,
  pack_size text null,
  ptr numeric not null,
  mrp numeric not null,
  stock_status text not null,
  discount_percent numeric null,
  is_generic boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint products_pkey primary key (id),
  constraint products_category_id_fkey foreign KEY (category_id) references categories (id) on delete set null,
  constraint products_distributor_id_fkey foreign KEY (distributor_id) references distributors (id) on delete CASCADE,
  constraint products_stock_status_check check (
    (
      stock_status = any (
        array['high'::text, 'low'::text, 'out-of-stock'::text]
      )
    )
  )
);

-- 7. CART_ITEMS
create table public.cart_items (
  id uuid not null default extensions.uuid_generate_v4 (),
  retailer_id uuid not null,
  product_id uuid not null,
  distributor_id uuid not null,
  quantity integer not null,
  created_at timestamp with time zone null default now(),
  constraint cart_items_pkey primary key (id),
  constraint cart_items_retailer_id_product_id_key unique (retailer_id, product_id),
  constraint cart_items_distributor_id_fkey foreign KEY (distributor_id) references distributors (id) on delete CASCADE,
  constraint cart_items_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint cart_items_retailer_id_fkey foreign KEY (retailer_id) references profiles (id) on delete CASCADE,
  constraint cart_items_quantity_check check ((quantity > 0))
);

-- 8. ORDERS
create table public.orders (
  id uuid not null default extensions.uuid_generate_v4 (),
  order_number text not null,
  retailer_id uuid not null,
  distributor_id uuid not null,
  status text not null,
  total_amount numeric not null,
  created_at timestamp with time zone null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number),
  constraint orders_distributor_id_fkey foreign KEY (distributor_id) references distributors (id) on delete CASCADE,
  constraint orders_retailer_id_fkey foreign KEY (retailer_id) references profiles (id) on delete CASCADE,
  constraint orders_status_check check (
    (
      status = any (
        array[
          'placed'::text,
          'processed'::text,
          'confirmed'::text
        ]
      )
    )
  )
);

-- 9. ORDER_ITEMS
create table public.order_items (
  id uuid not null default extensions.uuid_generate_v4 (),
  order_id uuid not null,
  product_id uuid not null,
  quantity integer not null,
  ptr_at_order numeric not null,
  created_at timestamp with time zone null default now(),
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_items_product_id_fkey foreign KEY (product_id) references products (id) on delete RESTRICT,
  constraint order_items_quantity_check check ((quantity > 0))
);

-- 10. RETURNS
create table public.returns (
  id uuid not null default extensions.uuid_generate_v4 (),
  retailer_id uuid not null,
  order_id uuid null,
  product_id uuid not null,
  quantity integer not null,
  return_type text not null,
  status text not null,
  created_at timestamp with time zone null default now(),
  constraint returns_pkey primary key (id),
  constraint returns_retailer_id_fkey foreign KEY (retailer_id) references profiles (id) on delete CASCADE,
  constraint returns_product_id_fkey foreign KEY (product_id) references products (id) on delete RESTRICT,
  constraint returns_order_id_fkey foreign KEY (order_id) references orders (id) on delete set null,
  constraint returns_quantity_check check ((quantity > 0)),
  constraint returns_return_type_check check (
    (
      return_type = any (array['saleable'::text, 'expiry'::text])
    )
  ),
  constraint returns_status_check check (
    (
      status = any (array['draft'::text, 'submitted'::text])
    )
  )
);

-- 11. OTPS
create table public.otps (
  id uuid not null default gen_random_uuid (),
  email text not null,
  otp_hash text not null,
  attempts integer null default 0,
  expires_at timestamp with time zone not null,
  verified boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint otps_pkey primary key (id)
);
create index IF not exists idx_otps_email on public.otps using btree (email);


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
INSERT INTO public.distributors (id, name, code, address, phone, area, city) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'PharmaCorp Distributors', 'PHC123', 'Mumbai, India', '+91 9876543210', 'Andheri East', 'Mumbai'),
  ('d2222222-2222-2222-2222-222222222222', 'MediLife Supplies', 'MLS456', 'Pune, India', '+91 8765432109', 'Kothrud', 'Pune');

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
