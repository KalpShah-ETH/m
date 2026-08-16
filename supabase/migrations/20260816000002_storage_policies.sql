-- Allow unauthenticated (anon) users to upload ONLY to the pending/ directory
create policy "Allow anon uploads to pending folder"
on storage.objects for insert
to public
with check (
    bucket_id = 'licenses' 
    and name like 'pending/%'
);

-- Allow authenticated users (who will move the file to their own folder) full access to licenses bucket
create policy "Allow authenticated full access to licenses"
on storage.objects for all
to authenticated
using ( bucket_id = 'licenses' )
with check ( bucket_id = 'licenses' );
