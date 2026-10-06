alter table public.products add column if not exists name_ar text not null default '';
alter table public.products add column if not exists description_ar text not null default '';
alter table public.categories add column if not exists name_ar text not null default '';
alter table public.variants add column if not exists name_ar text not null default '';
alter table public.modifiers add column if not exists name_ar text not null default '';

create or replace function public.bareeq_menu_save(p_entity text,p_record jsonb,p_user uuid,p_session uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 if public.bareeq_staff(p_user,p_session) is distinct from 'founder' then raise exception 'FORBIDDEN'; end if;
 perform pg_advisory_xact_lock(710051);
 if p_entity='products' then
  if length(trim(p_record->>'name')) not between 1 and 120 or (p_record->>'slug') !~ '^[a-z0-9-]+$' or length(p_record->>'description')>2000 or length(p_record->>'name_ar')>120 or length(p_record->>'description_ar')>2000 then raise exception 'INVALID_PRODUCT'; end if;
  if coalesce(p_record->>'image','')<>'' and (p_record->>'image') !~ '^(/assets/|https://)' then raise exception 'INVALID_IMAGE_URL'; end if;
  insert into public.products(id,slug,name,name_ar,category_id,description,description_ar,price_minor,available,active,image,illustrative)
  values(p_record->>'id',p_record->>'slug',p_record->>'name',coalesce(p_record->>'name_ar',''),p_record->>'category_id',coalesce(p_record->>'description',''),coalesce(p_record->>'description_ar',''),(p_record->>'price_minor')::integer,(p_record->>'available')::boolean,(p_record->>'active')::boolean,p_record->>'image',coalesce((p_record->>'illustrative')::boolean,false))
  on conflict(id) do update set slug=excluded.slug,name=excluded.name,name_ar=excluded.name_ar,category_id=excluded.category_id,description=excluded.description,description_ar=excluded.description_ar,price_minor=excluded.price_minor,available=excluded.available,active=excluded.active,image=excluded.image,illustrative=excluded.illustrative
  returning to_jsonb(products) into result;
 elsif p_entity='categories' then
  insert into public.categories(id,name,name_ar) values(p_record->>'id',p_record->>'name',coalesce(p_record->>'name_ar','')) on conflict(id) do update set name=excluded.name,name_ar=excluded.name_ar returning to_jsonb(categories) into result;
 elsif p_entity='variants' then
  insert into public.variants(id,product_id,name,name_ar,price_minor,available) values(coalesce((p_record->>'id')::uuid,gen_random_uuid()),p_record->>'product_id',p_record->>'name',coalesce(p_record->>'name_ar',''),(p_record->>'price_minor')::integer,(p_record->>'available')::boolean) on conflict(id) do update set name=excluded.name,name_ar=excluded.name_ar,price_minor=excluded.price_minor,available=excluded.available returning to_jsonb(variants) into result;
 elsif p_entity='modifiers' then
  insert into public.modifiers(id,name,name_ar,price_minor,available) values(coalesce((p_record->>'id')::uuid,gen_random_uuid()),p_record->>'name',coalesce(p_record->>'name_ar',''),(p_record->>'price_minor')::integer,(p_record->>'available')::boolean) on conflict(id) do update set name=excluded.name,name_ar=excluded.name_ar,price_minor=excluded.price_minor,available=excluded.available returning to_jsonb(modifiers) into result;
  insert into public.product_modifiers(product_id,modifier_id) values(p_record->>'product_id',(result->>'id')::uuid) on conflict do nothing;
 else raise exception 'INVALID_ENTITY'; end if;
 return result;
end $$;
