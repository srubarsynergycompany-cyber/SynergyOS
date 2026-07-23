alter table if exists public.clients
  add column if not exists tier text default 'Standard',
  add column if not exists address text;

alter table if exists public.products
  add column if not exists description text default '',
  add column if not exists client_id uuid,
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

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_client_id_fkey'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_client_id_fkey
      foreign key (client_id)
      references public.clients(id)
      on delete set null;
  end if;
end;
$$;

notify pgrst, 'reload schema';
