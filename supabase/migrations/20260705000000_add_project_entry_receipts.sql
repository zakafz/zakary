-- Adds receipt-file support to project entries.
--
-- The project_* tables already exist in this project, so this migration is
-- purely additive: a receipt_url column plus the storage buckets used for
-- project logos and payment receipts. Safe to run more than once.

alter table public.project_entries
  add column if not exists receipt_url text;

-- Public-read storage buckets (URLs are stored on the rows), writable by any
-- authenticated user.
insert into storage.buckets (id, name, public)
values
  ('project-logos', 'project-logos', true),
  ('project-receipts', 'project-receipts', true)
on conflict (id) do nothing;

drop policy if exists "project buckets public read" on storage.objects;
create policy "project buckets public read"
  on storage.objects for select to public
  using (bucket_id in ('project-logos', 'project-receipts'));

drop policy if exists "project buckets authenticated write" on storage.objects;
create policy "project buckets authenticated write"
  on storage.objects for all to authenticated
  using (bucket_id in ('project-logos', 'project-receipts'))
  with check (bucket_id in ('project-logos', 'project-receipts'));
