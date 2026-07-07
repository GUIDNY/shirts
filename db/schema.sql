-- Orders table for Neon Postgres (provisioned via Vercel Marketplace).
-- Applied automatically by scripts/migrate.mjs (npm run db:migrate).

create extension if not exists "pgcrypto";

create table if not exists orders (
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
  color text not null check (color in ('white', 'black', 'blue', 'red', 'royal', 'pink')),
  quantity int not null check (quantity > 0),

  -- design files (public Vercel Blob URLs with random suffixes)
  image_url text not null,
  mockup_url text not null,
  -- optional back print
  back_image_url text,
  back_mockup_url text,

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

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_gelato_order_id_idx on orders (gelato_order_id);
