create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  tier text default 'Standard',
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  client_id uuid references clients(id) on delete set null,
  status text not null default 'new',
  carrier text,
  priority text default 'Normal',
  total_items integer default 0,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_company text,
  total_amount numeric(12,2) default 0,
  currency char(3) default 'CZK',
  payment_status text default 'Pending',
  sales_channel text default 'Shopify',
  tracking_number text,
  shipping_address text,
  billing_address text,
  notes text,
  warehouse_slot text,
  promise_date date,
  shipped_at timestamptz,
  status_history jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  barcode text,
  description text default '',
  client_id uuid references clients(id) on delete set null,
  category text,
  weight numeric(10,3) default 0,
  width numeric(10,2) default 0,
  height numeric(10,2) default 0,
  length numeric(10,2) default 0,
  minimum_stock integer default 0,
  current_stock integer default 0,
  unit text default 'pcs',
  price numeric(12,2) default 0,
  currency char(3) default 'CZK',
  active boolean default true,
  warehouse_positions jsonb default '[]'::jsonb,
  batches jsonb default '[]'::jsonb,
  expiration_dates jsonb default '[]'::jsonb,
  images jsonb default '[]'::jsonb,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists products
  add column if not exists barcode text,
  add column if not exists description text default '',
  add column if not exists client_id uuid references clients(id) on delete set null,
  add column if not exists category text,
  add column if not exists weight numeric(10,3) default 0,
  add column if not exists width numeric(10,2) default 0,
  add column if not exists height numeric(10,2) default 0,
  add column if not exists length numeric(10,2) default 0,
  add column if not exists minimum_stock integer default 0,
  add column if not exists current_stock integer default 0,
  add column if not exists unit text default 'pcs',
  add column if not exists price numeric(12,2) default 0,
  add column if not exists currency char(3) default 'CZK',
  add column if not exists active boolean default true,
  add column if not exists warehouse_positions jsonb default '[]'::jsonb,
  add column if not exists batches jsonb default '[]'::jsonb,
  add column if not exists expiration_dates jsonb default '[]'::jsonb,
  add column if not exists images jsonb default '[]'::jsonb,
  add column if not exists attachments jsonb default '[]'::jsonb;

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null default 1,
  unit_price numeric(12,2) default 0,
  sku text,
  name text,
  warehouse_location text,
  in_stock boolean default false,
  picked_quantity integer default 0,
  packed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 0,
  reserved integer not null default 0,
  minimum_stock integer not null default 0,
  status text not null default 'In stock',
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists inventory
  add column if not exists reserved integer not null default 0,
  add column if not exists minimum_stock integer not null default 0,
  add column if not exists status text not null default 'In stock';

create unique index if not exists idx_products_barcode_unique on products(barcode) where barcode is not null and barcode <> '';
create index if not exists idx_orders_client_id on orders(client_id);
create index if not exists idx_orders_external_id on orders(external_id);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);
create index if not exists idx_inventory_product_id on inventory(product_id);

alter table clients enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table inventory enable row level security;
