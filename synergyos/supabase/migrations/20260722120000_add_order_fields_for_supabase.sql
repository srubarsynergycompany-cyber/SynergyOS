alter table if exists orders
  add column if not exists total_amount numeric(12,2),
  add column if not exists currency char(3) default 'CZK',
  add column if not exists payment_status text,
  add column if not exists shipping_address text,
  add column if not exists billing_address text,
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz,
  add column if not exists notes text,
  add column if not exists sales_channel text,
  add column if not exists status_history jsonb default '[]'::jsonb;

alter table if exists order_items
  add column if not exists unit_price numeric(12,2),
  add column if not exists sku text,
  add column if not exists name text,
  add column if not exists warehouse_location text,
  add column if not exists in_stock boolean default false,
  add column if not exists picked_quantity integer default 0,
  add column if not exists packed boolean default false;