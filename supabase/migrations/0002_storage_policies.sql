-- Storage RLS policies for all three private buckets.
-- Create the buckets in the Supabase dashboard before running this file.

create policy "owner rw project-models" on storage.objects
  for all
  using  (bucket_id = 'project-models' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'project-models' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "owner rw project-images" on storage.objects
  for all
  using  (bucket_id = 'project-images' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'project-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "owner rw project-data" on storage.objects
  for all
  using  (bucket_id = 'project-data' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'project-data' and auth.uid()::text = (storage.foldername(name))[1]);
