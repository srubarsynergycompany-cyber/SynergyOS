alter table public.orders
  add column if not exists customer_phone text,
  add column if not exists customer_company text,
  add column if not exists warehouse_slot text,
  add column if not exists promise_date date;
