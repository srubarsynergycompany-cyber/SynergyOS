begin;

do $$
declare
  missing_columns text;
begin
  select string_agg(required_column, ', ' order by required_column)
  into missing_columns
  from (
    values
      ('public.products.current_stock'),
      ('public.inventory.product_id'),
      ('public.inventory.quantity'),
      ('public.inventory.location')
  ) required(required_column)
  where not exists (
    select 1
    from information_schema.columns
    where table_schema = split_part(required_column, '.', 1)
      and table_name = split_part(required_column, '.', 2)
      and column_name = split_part(required_column, '.', 3)
  );

  if missing_columns is not null then
    raise exception using
      message = 'Cannot backfill product inventory because required columns are missing.',
      detail = missing_columns;
  end if;
end
$$;

lock table public.products, public.inventory in share row exclusive mode;

do $$
declare
  conflict_details text;
begin
  select string_agg(
    format(
      'inventory_id=%s, product_id=%s, quantity=%s',
      id,
      product_id,
      quantity
    ),
    E'\n'
    order by product_id, id
  )
  into conflict_details
  from public.inventory
  where quantity < 0;

  if conflict_details is not null then
    raise exception using
      message = 'Cannot enforce non-negative inventory quantities.',
      detail = conflict_details,
      hint = 'Resolve every listed negative inventory quantity explicitly, then rerun this migration.';
  end if;
end
$$;

do $$
declare
  conflict_details text;
begin
  select string_agg(
    format(
      '%s (id=%s): current_stock=%s, inventory_total=%s',
      sku,
      product_id,
      current_stock,
      inventory_total
    ),
    E'\n'
    order by sku, product_id
  )
  into conflict_details
  from (
    select
      p.id as product_id,
      p.sku,
      p.current_stock,
      sum(i.quantity) as inventory_total
    from public.products p
    join public.inventory i on i.product_id = p.id
    group by p.id, p.sku, p.current_stock
    having sum(i.quantity) is distinct from p.current_stock
  ) conflicts;

  if conflict_details is not null then
    raise exception using
      message = 'Cannot backfill inventory because existing inventory totals differ from products.current_stock.',
      detail = conflict_details,
      hint = 'Resolve every listed stock mismatch explicitly, then rerun this migration.';
  end if;
end
$$;

do $$
declare
  conflict_details text;
begin
  select string_agg(
    format(
      'product_id=%s, normalized_location=%s, inventory_ids=%s',
      product_id,
      normalized_location,
      inventory_ids
    ),
    E'\n'
    order by product_id, normalized_location
  )
  into conflict_details
  from (
    select
      product_id,
      lower(trim(location)) as normalized_location,
      string_agg(id::text, ', ' order by id) as inventory_ids
    from public.inventory
    where location is not null
    group by product_id, lower(trim(location))
    having count(*) > 1
  ) conflicts;

  if conflict_details is not null then
    raise exception using
      message = 'Cannot enforce unique product inventory locations.',
      detail = conflict_details,
      hint = 'Resolve every listed product and location conflict explicitly, then rerun this migration.';
  end if;
end
$$;

do $$
declare
  conflict_details text;
begin
  select string_agg(
    format('%s (id=%s): current_stock=%s', sku, id, current_stock),
    E'\n'
    order by sku, id
  )
  into conflict_details
  from public.products p
  where not exists (
    select 1
    from public.inventory i
    where i.product_id = p.id
  )
    and (p.current_stock is null or p.current_stock < 0);

  if conflict_details is not null then
    raise exception using
      message = 'Cannot backfill products with invalid current_stock values.',
      detail = conflict_details,
      hint = 'Set every listed current_stock to a non-negative integer, then rerun this migration.';
  end if;
end
$$;

insert into public.inventory (product_id, quantity, location)
select
  p.id,
  p.current_stock,
  'UNASSIGNED'
from public.products p
where not exists (
  select 1
  from public.inventory i
  where i.product_id = p.id
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.inventory'::regclass
      and conname = 'inventory_quantity_nonnegative'
  ) then
    alter table public.inventory
      add constraint inventory_quantity_nonnegative
      check (quantity >= 0);
  end if;
end
$$;

create unique index if not exists idx_inventory_product_location_normalized_unique
  on public.inventory (product_id, lower(trim(location)));

commit;
