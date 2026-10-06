create schema if not exists private;
revoke all on schema private from public;
create table public.staff_roles (user_id uuid primary key references auth.users(id) on delete cascade, role text not null check(role in ('founder','cashier','manager','kitchen')), active boolean not null default true);
create table public.branches (id uuid primary key default gen_random_uuid(), name text not null, active boolean not null default true, timezone text not null default 'Africa/Cairo', instapay_details text, receipt_retention_days integer not null default 7 check(receipt_retention_days between 3 and 30));
create table public.categories (id text primary key, name text not null unique);
create table public.products (id text primary key, slug text not null unique, name text not null, category_id text not null references public.categories(id), description text not null default '', price_minor integer check(price_minor between 0 and 10000000), available boolean not null default true, active boolean not null default true, image text, illustrative boolean not null default false);
create table public.variants (id uuid primary key default gen_random_uuid(), product_id text not null references public.products(id), name text not null, price_minor integer not null check(price_minor between 0 and 10000000), available boolean not null default true);
create table public.modifiers (id uuid primary key default gen_random_uuid(), name text not null, price_minor integer not null check(price_minor between 0 and 10000000), available boolean not null default true);
create table public.product_modifiers (product_id text references public.products(id), modifier_id uuid references public.modifiers(id), primary key(product_id,modifier_id));
create table public.branch_availability (branch_id uuid references public.branches(id), product_id text references public.products(id), available boolean not null default true, primary key(branch_id,product_id));
create table public.cafe_tables (id uuid primary key default gen_random_uuid(), branch_id uuid not null references public.branches(id), number text not null, active boolean not null default true, unique(branch_id,number));
create table public.orders (id uuid primary key default gen_random_uuid(), number bigint generated always as identity unique, branch_id uuid not null references public.branches(id), source text not null check(source in ('web','cashier','qr')), fulfillment text not null check(fulfillment in ('takeaway','dine_in')), table_id uuid references public.cafe_tables(id), customer_name text not null check(length(customer_name) between 1 and 80), phone text not null default '' check(length(phone)<=30), notes text not null default '' check(length(notes)<=500), status text not null check(status in ('awaiting_receipt','awaiting_payment_verification','new','accepted','preparing','ready','completed','cancelled','payment_rejected')), payment_method text not null check(payment_method in ('cash','instapay','gateway')), total_minor bigint not null check(total_minor>=0), currency text not null default 'EGP', created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz);
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id), product_id text not null references public.products(id), variant_id uuid references public.variants(id), product_name text not null, variant_name text, quantity integer not null check(quantity between 1 and 99), unit_minor bigint not null check(unit_minor>=0), line_minor bigint not null check(line_minor=unit_minor*quantity));
create table public.order_item_modifiers (id uuid primary key default gen_random_uuid(), item_id uuid not null references public.order_items(id), modifier_id uuid not null references public.modifiers(id), name text not null, price_minor integer not null check(price_minor>=0));
create table public.payments (order_id uuid primary key references public.orders(id), method text not null check(method in ('cash','instapay','gateway')), status text not null check(status in ('unpaid','pending','verified','rejected','collected')), amount_minor bigint not null check(amount_minor>=0), verified_by uuid references auth.users(id), verified_at timestamptz, rejection_reason text, provider text, provider_reference text unique);
create table public.receipts (order_id uuid primary key references public.orders(id), path text not null unique, uploaded_at timestamptz not null default now(), delete_after timestamptz not null, deleted_at timestamptz);
create table public.order_events (id bigint generated always as identity primary key, order_id uuid not null references public.orders(id), actor_id uuid references auth.users(id), event text not null, previous_state text, new_state text, reason text, created_at timestamptz not null default now());
create table public.notification_outbox (id bigint generated always as identity primary key, order_id uuid not null references public.orders(id), audience text not null check(audience in ('founder','cashier')), event text not null, created_at timestamptz not null default now(), delivered_at timestamptz, attempts integer not null default 0, next_attempt_at timestamptz not null default now(), unique(order_id,event));
create table public.push_subscriptions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, endpoint text not null unique, subscription jsonb not null, created_at timestamptz not null default now());
create table public.integration_outbox (id bigint generated always as identity primary key, order_id uuid not null references public.orders(id), event text not null, payload jsonb not null default '{}', created_at timestamptz not null default now(), delivered_at timestamptz, unique(order_id,event));
create table private.order_keys (key uuid primary key, token_hash text not null, payload_hash text not null, order_id uuid not null references public.orders(id));
create table private.rate_limits (key text primary key, window_start timestamptz not null default now(), hits integer not null default 1);
alter table private.order_keys enable row level security;
alter table private.rate_limits enable row level security;

create function private.staff_role() returns text language sql stable security definer set search_path='' as $$
select r.role from public.staff_roles r where r.user_id=(select auth.uid()) and r.active
and exists(select 1 from auth.sessions s where s.id=((select auth.jwt())->>'session_id')::uuid and s.user_id=r.user_id)
$$;
grant usage on schema private to authenticated;
revoke all on function private.staff_role() from public;
grant execute on function private.staff_role() to authenticated;

do $$ declare t text; begin
foreach t in array array['staff_roles','branches','categories','products','variants','modifiers','product_modifiers','branch_availability','cafe_tables','orders','order_items','order_item_modifiers','payments','receipts','order_events','notification_outbox','push_subscriptions','integration_outbox'] loop
execute format('alter table public.%I enable row level security',t);
execute format('revoke all on public.%I from anon, authenticated',t);
end loop;
foreach t in array array['branches','categories','products','variants','modifiers','product_modifiers','branch_availability','cafe_tables'] loop
execute format('grant select on public.%I to anon, authenticated',t);
execute format('create policy menu_read on public.%I for select to anon, authenticated using (true)',t);
end loop;
end $$;
grant select on public.staff_roles, public.orders, public.order_items, public.order_item_modifiers, public.payments, public.order_events to authenticated;
create policy own_role on public.staff_roles for select to authenticated using(user_id=(select auth.uid()) and (select private.staff_role()) is not null);
create policy staff_orders on public.orders for select to authenticated using((select private.staff_role())='founder' or ((select private.staff_role())='cashier' and status in ('new','accepted','preparing','ready','completed','cancelled') and (payment_method='cash' or exists(select 1 from public.payments p where p.order_id=orders.id and p.status='verified'))));
create policy staff_payments on public.payments for select to authenticated using((select private.staff_role())='founder' or ((select private.staff_role())='cashier' and (method='cash' or status='verified')));
create policy staff_items on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id));
create policy staff_item_modifiers on public.order_item_modifiers for select to authenticated using(exists(select 1 from public.order_items i where i.id=item_id));
create policy founder_events on public.order_events for select to authenticated using((select private.staff_role())='founder');

create index orders_created on public.orders(created_at desc);
create index orders_queue on public.orders(status,created_at);
create index items_order on public.order_items(order_id);
create index item_modifiers_item on public.order_item_modifiers(item_id);
create index events_order on public.order_events(order_id);
create index variants_product on public.variants(product_id);
create index receipts_expiry on public.receipts(delete_after) where deleted_at is null;
create index outbox_pending on public.notification_outbox(next_attempt_at) where delivered_at is null;

create function public.bareeq_staff(p_user uuid,p_session uuid) returns text language sql security invoker set search_path='' as $$
select r.role from public.staff_roles r join auth.sessions s on s.user_id=r.user_id where r.user_id=p_user and r.active and s.id=p_session
$$;

create function public.bareeq_quote(p jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare l jsonb; m jsonb; pr public.products; v public.variants; mo public.modifiers; lines jsonb='[]'; mods jsonb; qty integer; unit bigint; total bigint=0; b public.branches; vn text; vid uuid;
begin
 perform pg_advisory_xact_lock(710051);
 select * into b from public.branches where id=(p->>'branch_id')::uuid and active;
 if not found then raise exception 'BRANCH_UNAVAILABLE'; end if;
 if jsonb_typeof(p->'items')<>'array' or jsonb_array_length(p->'items') not between 1 and 50 then raise exception 'INVALID_ITEMS'; end if;
 for l in select value from jsonb_array_elements(p->'items') loop
  if (l->>'quantity') !~ '^[0-9]+$' then raise exception 'INVALID_QUANTITY'; end if;
  qty=(l->>'quantity')::integer;
  if qty not between 1 and 99 then raise exception 'INVALID_QUANTITY'; end if;
  select * into pr from public.products where id=l->>'product_id' and active and available;
  if not found or exists(select 1 from public.branch_availability where branch_id=b.id and product_id=pr.id and not available) then raise exception 'PRODUCT_UNAVAILABLE'; end if;
  unit=pr.price_minor; vn=null; vid=null;
  if l->>'variant_id' is not null then
   select * into v from public.variants where id=(l->>'variant_id')::uuid and product_id=pr.id and available;
   if not found then raise exception 'INVALID_VARIANT'; end if;
   unit=v.price_minor; vn=v.name; vid=v.id;
  elsif exists(select 1 from public.variants where product_id=pr.id) then raise exception 'VARIANT_REQUIRED'; end if;
  if unit is null then raise exception 'PRICE_UNAVAILABLE'; end if;
  mods='[]';
  if jsonb_typeof(l->'modifier_ids')<>'array' or jsonb_array_length(l->'modifier_ids')>12 then raise exception 'INVALID_MODIFIERS'; end if;
  if (select count(*)<>count(distinct value) from jsonb_array_elements_text(l->'modifier_ids')) then raise exception 'DUPLICATE_MODIFIER'; end if;
  for m in select value from jsonb_array_elements(l->'modifier_ids') loop
   select x.* into mo from public.modifiers x join public.product_modifiers pm on pm.modifier_id=x.id where x.id=(m#>>'{}')::uuid and pm.product_id=pr.id and x.available;
   if not found then raise exception 'INVALID_MODIFIER'; end if;
   unit=unit+mo.price_minor; mods=mods||jsonb_build_object('id',mo.id,'name',mo.name,'price_minor',mo.price_minor);
  end loop;
  total=total+unit*qty;
  lines=lines||jsonb_build_object('product_id',pr.id,'product_name',pr.name,'variant_id',vid,'variant_name',vn,'quantity',qty,'unit_minor',unit,'line_minor',unit*qty,'modifiers',mods);
 end loop;
 return jsonb_build_object('lines',lines,'total_minor',total,'currency','EGP','quote_hash',md5(lines::text||b.id::text),'instapay_details',b.instapay_details);
end $$;

create function public.bareeq_create(p jsonb,p_key uuid,p_token_hash text,p_user uuid default null,p_session uuid default null) returns jsonb language plpgsql security invoker set search_path='' as $$
declare q jsonb; old private.order_keys; o public.orders; l jsonb; m jsonb; item uuid; role_name text; initial text; payload_hash text=md5((p-'quote_hash')::text);
begin
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into old from private.order_keys where key=p_key;
 if found then
  if old.token_hash<>p_token_hash or old.payload_hash<>payload_hash then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
  select * into o from public.orders where id=old.order_id;
  return to_jsonb(o);
 end if;
 if p->>'source'<>'web' then
  role_name=public.bareeq_staff(p_user,p_session);
  if role_name is null or role_name not in ('founder','cashier') then raise exception 'FORBIDDEN'; end if;
 end if;
 if p->>'source' not in ('web','cashier') or p->>'fulfillment' not in ('takeaway','dine_in') or p->>'payment_method' not in ('cash','instapay') then raise exception 'INVALID_ORDER'; end if;
 if p->>'table_id' is not null and not exists(select 1 from public.cafe_tables where id=(p->>'table_id')::uuid and branch_id=(p->>'branch_id')::uuid and active) then raise exception 'INVALID_TABLE'; end if;
 q=public.bareeq_quote(p);
 if p->>'quote_hash' is distinct from q->>'quote_hash' then return jsonb_build_object('price_changed',true,'quote',q); end if;
 if p->>'payment_method'='instapay' and nullif(q->>'instapay_details','') is null then raise exception 'INSTAPAY_NOT_CONFIGURED'; end if;
 initial=case when p->>'payment_method'='instapay' then 'awaiting_receipt' else 'new' end;
 insert into public.orders(branch_id,source,fulfillment,table_id,customer_name,phone,notes,status,payment_method,total_minor,created_by)
 values((p->>'branch_id')::uuid,p->>'source',p->>'fulfillment',(p->>'table_id')::uuid,trim(p->>'customer_name'),coalesce(p->>'phone',''),coalesce(p->>'notes',''),initial,p->>'payment_method',(q->>'total_minor')::bigint,p_user) returning * into o;
 for l in select value from jsonb_array_elements(q->'lines') loop
  insert into public.order_items(order_id,product_id,variant_id,product_name,variant_name,quantity,unit_minor,line_minor) values(o.id,l->>'product_id',(l->>'variant_id')::uuid,l->>'product_name',l->>'variant_name',(l->>'quantity')::integer,(l->>'unit_minor')::bigint,(l->>'line_minor')::bigint) returning id into item;
  for m in select value from jsonb_array_elements(l->'modifiers') loop
   insert into public.order_item_modifiers(item_id,modifier_id,name,price_minor) values(item,(m->>'id')::uuid,m->>'name',(m->>'price_minor')::integer);
  end loop;
 end loop;
 insert into public.payments(order_id,method,status,amount_minor) values(o.id,o.payment_method,case when o.payment_method='cash' then 'unpaid' else 'pending' end,o.total_minor);
 insert into private.order_keys values(p_key,p_token_hash,payload_hash,o.id);
 insert into public.order_events(order_id,actor_id,event,new_state) values(o.id,p_user,'created',initial);
 if initial='new' then
  insert into public.notification_outbox(order_id,audience,event) values(o.id,'cashier','actionable');
  insert into public.integration_outbox(order_id,event) values(o.id,'order.confirmed');
 end if;
 return to_jsonb(o);
end $$;

create function public.bareeq_order(p_id uuid,p_token_hash text) returns jsonb language sql security invoker set search_path='' as $$
select to_jsonb(o)||jsonb_build_object('instapay_details',b.instapay_details) from public.orders o join private.order_keys k on k.order_id=o.id join public.branches b on b.id=o.branch_id where o.id=p_id and k.token_hash=p_token_hash
$$;

create function public.bareeq_receipt(p_id uuid,p_token_hash text,p_path text) returns void language plpgsql security invoker set search_path='' as $$
declare o public.orders; days integer;
begin
 select * into o from public.orders where id=p_id for update;
 if not exists(select 1 from private.order_keys where order_id=p_id and token_hash=p_token_hash) then raise exception 'FORBIDDEN'; end if;
 if o.status='awaiting_payment_verification' and exists(select 1 from public.receipts where order_id=p_id and path=p_path) then return; end if;
 if o.status<>'awaiting_receipt' then raise exception 'INVALID_TRANSITION'; end if;
 select receipt_retention_days into days from public.branches where id=o.branch_id;
 insert into public.receipts(order_id,path,delete_after) values(p_id,p_path,now()+make_interval(days=>days));
 update public.orders set status='awaiting_payment_verification',updated_at=now() where id=p_id;
 insert into public.order_events(order_id,event,previous_state,new_state) values(p_id,'receipt_uploaded',o.status,'awaiting_payment_verification');
 insert into public.notification_outbox(order_id,audience,event) values(p_id,'founder','verification_required');
end $$;

create function public.bareeq_transition(p_id uuid,p_next text,p_user uuid,p_session uuid,p_reason text default '') returns jsonb language plpgsql security invoker set search_path='' as $$
declare o public.orders; r text; old_status text;
begin
 r=public.bareeq_staff(p_user,p_session);
 if r is null or r not in ('founder','cashier') then raise exception 'FORBIDDEN'; end if;
 select * into o from public.orders where id=p_id for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 old_status=o.status;
 if p_next in ('new','payment_rejected') then
  if r<>'founder' then raise exception 'FORBIDDEN'; end if;
  if o.status=p_next then return to_jsonb(o); end if;
  if o.status<>'awaiting_payment_verification' then raise exception 'INVALID_TRANSITION'; end if;
  if p_next='payment_rejected' and length(trim(p_reason)) not between 1 and 500 then raise exception 'REASON_REQUIRED'; end if;
  update public.payments set status=case when p_next='new' then 'verified' else 'rejected' end,verified_by=p_user,verified_at=now(),rejection_reason=nullif(p_reason,'') where order_id=p_id and status='pending';
  if not found then raise exception 'INVALID_PAYMENT_STATE'; end if;
  if p_next='new' then
   insert into public.notification_outbox(order_id,audience,event) values(p_id,'cashier','actionable') on conflict do nothing;
   insert into public.integration_outbox(order_id,event) values(p_id,'order.confirmed') on conflict do nothing;
  end if;
 else
  if o.payment_method<>'cash' and not exists(select 1 from public.payments where order_id=p_id and status='verified') then raise exception 'PAYMENT_NOT_VERIFIED'; end if;
  if o.status=p_next then return to_jsonb(o); end if;
  if not ((o.status='new' and p_next='accepted') or (o.status='accepted' and p_next='preparing') or (o.status='preparing' and p_next='ready') or (o.status='ready' and p_next='completed') or (o.status in ('new','accepted','preparing','ready') and p_next='cancelled')) then raise exception 'INVALID_TRANSITION'; end if;
  if p_next='cancelled' and length(trim(p_reason)) not between 1 and 500 then raise exception 'REASON_REQUIRED'; end if;
  if p_next='completed' and o.payment_method='cash' then update public.payments set status='collected',verified_by=p_user,verified_at=now() where order_id=p_id; end if;
 end if;
 update public.orders set status=p_next,updated_at=now(),completed_at=case when p_next='completed' then now() else completed_at end where id=p_id returning * into o;
 insert into public.order_events(order_id,actor_id,event,previous_state,new_state,reason) values(p_id,p_user,'status_changed',old_status,p_next,nullif(p_reason,''));
 return to_jsonb(o);
end $$;

create function public.bareeq_rate(p_key text,p_limit integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into private.rate_limits(key) values(p_key) on conflict(key) do update set hits=case when private.rate_limits.window_start<now()-interval '1 minute' then 1 else private.rate_limits.hits+1 end,window_start=case when private.rate_limits.window_start<now()-interval '1 minute' then now() else private.rate_limits.window_start end returning hits into n;
 return n<=p_limit;
end $$;

create function public.bareeq_report(p_day date,p_branch uuid,p_user uuid,p_session uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb; tz text;
begin
 if public.bareeq_staff(p_user,p_session) is distinct from 'founder' then raise exception 'FORBIDDEN'; end if;
 select timezone into tz from public.branches where id=p_branch;
 select jsonb_build_object('day',p_day,'timezone',tz,'order_count',count(*),'completed_count',count(*) filter(where status='completed'),'cancelled_count',count(*) filter(where status in ('cancelled','payment_rejected')),'revenue_minor',coalesce(sum(total_minor) filter(where status='completed'),0),'average_minor',coalesce(avg(total_minor) filter(where status='completed'),0),'cash_minor',coalesce(sum(total_minor) filter(where status='completed' and payment_method='cash'),0),'instapay_minor',coalesce(sum(total_minor) filter(where status='completed' and payment_method='instapay'),0),'online_minor',coalesce(sum(total_minor) filter(where status='completed' and source='web'),0),'dine_in_minor',coalesce(sum(total_minor) filter(where status='completed' and source<>'web' and fulfillment='dine_in'),0),'takeaway_minor',coalesce(sum(total_minor) filter(where status='completed' and source<>'web' and fulfillment='takeaway'),0)) into result from public.orders where branch_id=p_branch and (created_at at time zone tz)::date=p_day;
 return result||jsonb_build_object('top_products',(select coalesce(jsonb_agg(t),'[]') from (select i.product_name,sum(i.quantity) quantity,sum(i.line_minor) revenue_minor from public.order_items i join public.orders o on o.id=i.order_id where o.branch_id=p_branch and o.status='completed' and (o.created_at at time zone tz)::date=p_day group by i.product_name order by sum(i.quantity) desc limit 10)t));
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('receipts','receipts',false,2097152,array['image/jpeg','image/png','image/webp']),('menu-images','menu-images',true,2097152,array['image/jpeg','image/png','image/webp']);
-- No direct receipt/object policies: only checked Edge Functions use Storage APIs.
alter publication supabase_realtime add table public.orders;
do $$ declare f record; begin for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'bareeq_%' loop execute 'revoke all on function '||f.signature||' from public, anon, authenticated'; execute 'grant execute on function '||f.signature||' to service_role'; end loop; end $$;
grant usage on schema private to service_role;
grant all on all tables in schema private to service_role;

create function public.bareeq_menu_save(p_entity text,p_record jsonb,p_user uuid,p_session uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 if public.bareeq_staff(p_user,p_session) is distinct from 'founder' then raise exception 'FORBIDDEN'; end if;
 perform pg_advisory_xact_lock(710051);
 if p_entity='products' then
  if length(trim(p_record->>'name')) not between 1 and 120 or (p_record->>'slug') !~ '^[a-z0-9-]+$' or length(p_record->>'description')>2000 then raise exception 'INVALID_PRODUCT'; end if;
  if coalesce(p_record->>'image','')<>'' and (p_record->>'image') !~ '^(/assets/|https://)' then raise exception 'INVALID_IMAGE_URL'; end if;
  insert into public.products(id,slug,name,category_id,description,price_minor,available,active,image,illustrative) values(p_record->>'id',p_record->>'slug',p_record->>'name',p_record->>'category_id',coalesce(p_record->>'description',''),(p_record->>'price_minor')::integer,(p_record->>'available')::boolean,(p_record->>'active')::boolean,p_record->>'image',coalesce((p_record->>'illustrative')::boolean,false)) on conflict(id) do update set slug=excluded.slug,name=excluded.name,category_id=excluded.category_id,description=excluded.description,price_minor=excluded.price_minor,available=excluded.available,active=excluded.active,image=excluded.image,illustrative=excluded.illustrative returning to_jsonb(products) into result;
 elsif p_entity='categories' then
  insert into public.categories(id,name) values(p_record->>'id',p_record->>'name') on conflict(id) do update set name=excluded.name returning to_jsonb(categories) into result;
 elsif p_entity='variants' then
  insert into public.variants(id,product_id,name,price_minor,available) values(coalesce((p_record->>'id')::uuid,gen_random_uuid()),p_record->>'product_id',p_record->>'name',(p_record->>'price_minor')::integer,(p_record->>'available')::boolean) on conflict(id) do update set name=excluded.name,price_minor=excluded.price_minor,available=excluded.available returning to_jsonb(variants) into result;
 elsif p_entity='modifiers' then
  insert into public.modifiers(id,name,price_minor,available) values(coalesce((p_record->>'id')::uuid,gen_random_uuid()),p_record->>'name',(p_record->>'price_minor')::integer,(p_record->>'available')::boolean) on conflict(id) do update set name=excluded.name,price_minor=excluded.price_minor,available=excluded.available returning to_jsonb(modifiers) into result;
  insert into public.product_modifiers(product_id,modifier_id) values(p_record->>'product_id',(result->>'id')::uuid) on conflict do nothing;
 elsif p_entity='branches' then
  update public.branches set instapay_details=nullif(trim(p_record->>'instapay_details'),''),receipt_retention_days=(p_record->>'receipt_retention_days')::integer where id=(p_record->>'id')::uuid returning to_jsonb(branches) into result;
 elsif p_entity='branch_availability' then
  insert into public.branch_availability(branch_id,product_id,available) values((p_record->>'branch_id')::uuid,p_record->>'product_id',(p_record->>'available')::boolean) on conflict(branch_id,product_id) do update set available=excluded.available returning to_jsonb(branch_availability) into result;
 else raise exception 'INVALID_ENTITY'; end if;
 return result;
end $$;
revoke all on function public.bareeq_menu_save(text,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.bareeq_menu_save(text,jsonb,uuid,uuid) to service_role;
