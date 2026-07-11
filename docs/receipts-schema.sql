-- Receipts feature: services catalog, per-business receipt branding,
-- receipts and their line items. Run this in the Supabase SQL editor
-- (or via `supabase db push`). Mirrors the existing per-user + RLS pattern.

-- ── Services catalog ────────────────────────────────────────────────────────
create table if not exists public.project_services (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null,
  name text not null,
  price numeric not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint project_services_pkey primary key (id),
  constraint project_services_user_id_fkey foreign key (user_id) references auth.users (id),
  constraint project_services_project_id_fkey foreign key (project_id) references public.projects (id) on delete cascade
);

-- ── Receipt branding (one row per business) ─────────────────────────────────
create table if not exists public.project_branding (
  project_id uuid not null,
  user_id uuid not null default auth.uid(),
  display_name text not null default '',
  prefix text not null default '',
  logo_url text,
  phone text,
  email text,
  address text,
  footer_note text,
  created_at timestamptz not null default now(),
  constraint project_branding_pkey primary key (project_id),
  constraint project_branding_user_id_fkey foreign key (user_id) references auth.users (id),
  constraint project_branding_project_id_fkey foreign key (project_id) references public.projects (id) on delete cascade
);

-- ── Receipts ────────────────────────────────────────────────────────────────
create table if not exists public.receipts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null,
  client_id uuid,
  customer_name text not null default '',
  customer_email text,
  customer_phone text,
  number integer not null default 1,
  issued_date date not null default current_date,
  reference_label text,
  reference_value text,
  paid_by text,
  notes text,
  total numeric not null default 0,
  pdf_url text,
  status text not null default 'draft' check (status = any (array['draft'::text, 'sent'::text])),
  created_at timestamptz not null default now(),
  constraint receipts_pkey primary key (id),
  constraint receipts_user_id_fkey foreign key (user_id) references auth.users (id),
  constraint receipts_project_id_fkey foreign key (project_id) references public.projects (id) on delete cascade,
  constraint receipts_client_id_fkey foreign key (client_id) references public.project_clients (id) on delete set null
);

-- ── Receipt line items ──────────────────────────────────────────────────────
create table if not exists public.receipt_items (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  receipt_id uuid not null,
  service_id uuid,
  description text not null,
  unit_price numeric not null default 0,
  quantity numeric not null default 1,
  amount numeric not null default 0,
  position integer not null default 0,
  constraint receipt_items_pkey primary key (id),
  constraint receipt_items_user_id_fkey foreign key (user_id) references auth.users (id),
  constraint receipt_items_receipt_id_fkey foreign key (receipt_id) references public.receipts (id) on delete cascade,
  constraint receipt_items_service_id_fkey foreign key (service_id) references public.project_services (id) on delete set null
);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.project_services enable row level security;
alter table public.project_branding enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;

create policy "own project_services" on public.project_services
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own project_branding" on public.project_branding
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own receipts" on public.receipts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own receipt_items" on public.receipt_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Storage bucket for generated receipt PDFs (public read) ──────────────────
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

create policy "own receipts upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipts' and owner = auth.uid());
create policy "public receipts read" on storage.objects
  for select using (bucket_id = 'receipts');
