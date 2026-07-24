begin;

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  inventory_id uuid null references public.inventory(id) on delete set null,
  product_id uuid null references public.products(id) on delete set null,
  sku text not null,
  location text not null,
  delta integer not null check (delta <> 0),
  quantity_before integer not null check (quantity_before >= 0),
  quantity_after integer not null check (quantity_after >= 0),
  reason text not null check (btrim(reason) <> ''),
  actor_label text null,
  created_at timestamptz not null default now()
);

create index idx_inventory_movements_inventory_id
  on public.inventory_movements (inventory_id);

create index idx_inventory_movements_product_id
  on public.inventory_movements (product_id);

create index idx_inventory_movements_created_at_desc
  on public.inventory_movements (created_at desc);

alter table public.inventory_movements enable row level security;

revoke all on table public.inventory_movements from public, anon, authenticated;
grant select, insert on table public.inventory_movements to service_role;

create function public.adjust_inventory(
  p_inventory_id uuid,
  p_delta integer,
  p_reason text,
  p_request_id uuid,
  p_actor_label text default null
)
returns table (
  movement_id uuid,
  inventory_id uuid,
  product_id uuid,
  sku text,
  location text,
  delta integer,
  quantity_before integer,
  quantity_after integer,
  reason text,
  actor_label text,
  created_at timestamptz
)
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_existing public.inventory_movements%rowtype;
  v_movement public.inventory_movements%rowtype;
  v_product_id uuid;
  v_sku text;
  v_location text;
  v_quantity_before integer;
  v_quantity_after integer;
begin
  if p_inventory_id is null then
    raise exception using
      errcode = '22023',
      message = 'Inventory adjustment inventory_id is required.';
  end if;

  if p_delta is null or p_delta = 0 then
    raise exception using
      errcode = '22023',
      message = 'Inventory adjustment delta must be a non-zero integer.';
  end if;

  if p_reason is null or btrim(p_reason) = '' then
    raise exception using
      errcode = '22023',
      message = 'Inventory adjustment reason is required.';
  end if;

  if p_request_id is null then
    raise exception using
      errcode = '22023',
      message = 'Inventory adjustment request_id is required.';
  end if;

  select m.*
  into v_existing
  from public.inventory_movements m
  where m.request_id = p_request_id;

  if found then
    return query
    select
      v_existing.id,
      v_existing.inventory_id,
      v_existing.product_id,
      v_existing.sku,
      v_existing.location,
      v_existing.delta,
      v_existing.quantity_before,
      v_existing.quantity_after,
      v_existing.reason,
      v_existing.actor_label,
      v_existing.created_at;
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_request_id::text, 0)
  );

  select m.*
  into v_existing
  from public.inventory_movements m
  where m.request_id = p_request_id;

  if found then
    return query
    select
      v_existing.id,
      v_existing.inventory_id,
      v_existing.product_id,
      v_existing.sku,
      v_existing.location,
      v_existing.delta,
      v_existing.quantity_before,
      v_existing.quantity_after,
      v_existing.reason,
      v_existing.actor_label,
      v_existing.created_at;
    return;
  end if;

  select
    i.product_id,
    i.quantity,
    coalesce(nullif(btrim(i.location), ''), 'UNASSIGNED'),
    p.sku
  into
    v_product_id,
    v_quantity_before,
    v_location,
    v_sku
  from public.inventory i
  join public.products p on p.id = i.product_id
  where i.id = p_inventory_id
  for update of i;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = format('Inventory row %s was not found.', p_inventory_id);
  end if;

  v_quantity_after := v_quantity_before + p_delta;

  if v_quantity_after < 0 then
    raise exception using
      errcode = '23514',
      message = 'Inventory adjustment would make quantity negative.',
      detail = format(
        'inventory_id=%s, quantity_before=%s, delta=%s, quantity_after=%s',
        p_inventory_id,
        v_quantity_before,
        p_delta,
        v_quantity_after
      );
  end if;

  update public.inventory
  set
    quantity = v_quantity_after,
    updated_at = now()
  where id = p_inventory_id;

  insert into public.inventory_movements (
    request_id,
    inventory_id,
    product_id,
    sku,
    location,
    delta,
    quantity_before,
    quantity_after,
    reason,
    actor_label
  )
  values (
    p_request_id,
    p_inventory_id,
    v_product_id,
    v_sku,
    v_location,
    p_delta,
    v_quantity_before,
    v_quantity_after,
    btrim(p_reason),
    nullif(btrim(p_actor_label), '')
  )
  returning *
  into v_movement;

  return query
  select
    v_movement.id,
    v_movement.inventory_id,
    v_movement.product_id,
    v_movement.sku,
    v_movement.location,
    v_movement.delta,
    v_movement.quantity_before,
    v_movement.quantity_after,
    v_movement.reason,
    v_movement.actor_label,
    v_movement.created_at;
end
$$;

revoke all on function public.adjust_inventory(uuid, integer, text, uuid, text)
  from public, anon, authenticated;

grant execute on function public.adjust_inventory(uuid, integer, text, uuid, text)
  to service_role;

commit;
