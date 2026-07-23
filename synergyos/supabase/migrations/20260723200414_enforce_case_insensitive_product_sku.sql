begin;

lock table public.products in share row exclusive mode;

do $$
declare
  conflict_details text;
begin
  select string_agg(
    format('%s => %s', normalized_sku, variants),
    E'\n'
    order by normalized_sku
  )
  into conflict_details
  from (
    select
      lower(btrim(sku)) as normalized_sku,
      string_agg(
        format('%s (id=%s)', sku, id),
        ', '
        order by sku, id
      ) as variants
    from public.products
    group by lower(btrim(sku))
    having count(*) > 1
  ) conflicts;

  if conflict_details is not null then
    raise exception using
      errcode = '23505',
      message = 'Cannot enforce case-insensitive product SKU uniqueness.',
      detail = conflict_details,
      hint = 'Resolve every listed SKU conflict explicitly, then rerun this migration.';
  end if;
end
$$;

create unique index if not exists idx_products_sku_lower_unique
  on public.products ((lower(btrim(sku))));

commit;
