-- Up Migration

-- ==========================================
-- FIX 1: retailer_distributor_map
-- ==========================================
-- Drop the overly permissive update policy for retailers
DROP POLICY IF EXISTS "Retailers can update own map" ON public.retailer_distributor_map;
DROP POLICY IF EXISTS "Retailers can delete own map" ON public.retailer_distributor_map;

-- Add a policy allowing ONLY distributors to update rows where they are the assigned distributor
-- (Optional defense-in-depth, since Distributor app uses service_role anyway)
CREATE POLICY "Distributors can update own map" ON public.retailer_distributor_map
  FOR UPDATE
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors WHERE user_id = auth.uid()
    )
  );

-- ==========================================
-- FIX 2: orders & order_items
-- ==========================================
-- Retailers should not be able to self-approve orders or delete them (destroying audit trails)
DROP POLICY IF EXISTS "Retailers can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Retailers can delete own orders" ON public.orders;

-- Retailers should NOT be able to insert orders directly (bypassing the Edge Function pricing logic)
DROP POLICY IF EXISTS "Retailers can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Retailers can insert own order items" ON public.order_items;

-- ==========================================
-- FIX 3: returns
-- ==========================================
-- Retailers should not be able to self-approve returns, delete them, or insert them directly (bypassing Edge Function logic)
DROP POLICY IF EXISTS "Retailers can update own returns" ON public.returns;
DROP POLICY IF EXISTS "Retailers can delete own returns" ON public.returns;
DROP POLICY IF EXISTS "Retailers can insert own returns" ON public.returns;

-- Note: cart_items is left alone because retailers DO need INSERT/UPDATE/DELETE access to build their active cart natively.

-- ==========================================
-- FIX 4: Storage Policies
-- ==========================================
-- Drop the massive "God Mode" access to the entire bucket
DROP POLICY IF EXISTS "Allow authenticated full access to licenses" ON storage.objects;

-- 1. Users have full control over files strictly inside their own user ID folder
CREATE POLICY "Users can manage their own license folder" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'licenses' AND (auth.uid()::text = (string_to_array(name, '/'))[1]))
  WITH CHECK (bucket_id = 'licenses' AND (auth.uid()::text = (string_to_array(name, '/'))[1]));

-- 2. Users need to be able to read/delete from the temporary pending/ folder during registration to move their files
CREATE POLICY "Users can read temp pending files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'licenses' AND name LIKE 'pending/%');

CREATE POLICY "Users can delete temp pending files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'licenses' AND name LIKE 'pending/%');

-- 3. Allow anonymous users (during registration) to upload files ONLY into the pending/ folder
DROP POLICY IF EXISTS "Allow anon uploads to pending folder" ON storage.objects;
CREATE POLICY "Allow anon uploads to pending folder" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'licenses' AND name LIKE 'pending/%');
