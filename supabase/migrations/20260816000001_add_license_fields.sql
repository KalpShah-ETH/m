alter table public.profiles
add column if not exists license_20_20b_number text,
add column if not exists license_20_20b_doc_url text,
add column if not exists license_20_20b_expiry date,
add column if not exists license_21_21b_number text,
add column if not exists license_21_21b_doc_url text,
add column if not exists license_21_21b_expiry date,
add column if not exists gstin_number text,
add column if not exists pan_number text,
add column if not exists referral_code text,
add column if not exists whatsapp_opt_in boolean default false,
add column if not exists approval_status text default 'pending';

-- Set up the storage bucket for license uploads
insert into storage.buckets (id, name, public) 
values ('licenses', 'licenses', false)
on conflict (id) do nothing;

-- Ensure RLS policies on the bucket allow authenticated users to upload and read their own files
-- We create these dynamically or they can be managed via the Supabase Dashboard
