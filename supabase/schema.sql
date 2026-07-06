-- Run this once in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),

  -- customer details
  customer_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  city text not null,
  zip text not null,
  notes text,

  -- product
  product_type text not null check (product_type in ('men', 'women', 'kids')),
  size text not null check (size in ('S', 'M', 'L', 'XL', 'XXL')),
  color text not null check (color in ('white', 'black', 'blue')),
  quantity int not null check (quantity > 0),

  -- design files (paths inside Supabase Storage, not public URLs)
  image_path text not null,
  mockup_path text not null,

  -- pricing
  price numeric(10, 2) not null,

  -- status
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  order_status text not null default 'received' check (
    order_status in ('received', 'paid', 'sent_to_gelato', 'printing', 'shipped', 'completed')
  ),

  -- integrations
  gelato_order_id text,
  stripe_session_id text unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_stripe_session_id_idx on public.orders (stripe_session_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

-- Row Level Security: only the server (service role key) may read/write orders.
-- The service role key bypasses RLS entirely, so no policies are needed for it;
-- we simply enable RLS with no policies to block anon/public access completely.
alter table public.orders enable row level security;

-- Storage buckets:
--   designs  -> private (raw customer artwork, admin access only via signed URLs)
--   mockups  -> public  (preview renders, safe to show to the customer)
-- Create these in Supabase Dashboard > Storage, or via SQL below.
insert into storage.buckets (id, name, public)
values ('designs', 'designs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('mockups', 'mockups', true)
on conflict (id) do nothing;

-- Allow public read of mockups bucket only.
create policy if not exists "Public read mockups"
  on storage.objects for select
  using (bucket_id = 'mockups');

-- No public policies for the "designs" bucket or writes to either bucket:
-- all uploads and reads of "designs" go through server routes using the
-- service role key, which bypasses these policies entirely.
