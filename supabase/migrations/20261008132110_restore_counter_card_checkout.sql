-- Counter orders use one configured branch and a walk-in customer snapshot.
-- Card is the café's physical Visa/Fawry machine; it is intentionally not
-- accepted for public web checkout.
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check check(payment_method in ('cash','instapay','card','gateway'));
alter table public.orders drop constraint if exists orders_fulfillment_check;
alter table public.orders add constraint orders_fulfillment_check check(fulfillment in ('takeaway','dine_in','counter','delivery'));
alter table public.payments drop constraint if exists payments_method_check;
alter table public.payments add constraint payments_method_check check(method in ('cash','instapay','card','gateway'));

drop policy if exists staff_orders on public.orders;
create policy staff_orders on public.orders for select to authenticated using(
  (select private.staff_role())='founder' or (
    (select private.staff_role())='cashier' and
    status in ('new','accepted','preparing','ready','completed','cancelled') and
    (payment_method in ('cash','card') or exists(select 1 from public.payments p where p.order_id=orders.id and p.status='verified'))
  )
);
drop policy if exists staff_payments on public.payments;
create policy staff_payments on public.payments for select to authenticated using(
  (select private.staff_role())='founder' or ((select private.staff_role())='cashier' and (method in ('cash','card') or status='verified'))
);

create or replace function public.bareeq_create(p jsonb,p_key uuid,p_token_hash text,p_user uuid default null,p_session uuid default null) returns jsonb language plpgsql security invoker set search_path='' as $$
declare q jsonb; old private.order_keys; o public.orders; l jsonb; m jsonb; item uuid; role_name text; initial text; payload_hash text=md5((p-'quote_hash')::text); effective_fulfillment text; effective_customer text;
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
 if p->>'source' not in ('web','cashier') then raise exception 'INVALID_ORDER'; end if;
 if (p->>'source'='web' and (p->>'payment_method' not in ('cash','instapay') or p->>'fulfillment' not in ('takeaway','dine_in','delivery'))) or (p->>'source'='cashier' and (p->>'payment_method' not in ('cash','card') or p->>'fulfillment' not in ('counter','takeaway'))) then raise exception 'INVALID_PAYMENT_METHOD'; end if;
 if p->>'table_id' is not null and not exists(select 1 from public.cafe_tables where id=(p->>'table_id')::uuid and branch_id=(p->>'branch_id')::uuid and active) then raise exception 'INVALID_TABLE'; end if;
 q=public.bareeq_quote(p);
 if p->>'quote_hash' is distinct from q->>'quote_hash' then return jsonb_build_object('price_changed',true,'quote',q); end if;
 if p->>'payment_method'='instapay' and nullif(q->>'instapay_details','') is null then raise exception 'INSTAPAY_NOT_CONFIGURED'; end if;
 initial=case when p->>'source'='cashier' then 'completed' when p->>'payment_method'='instapay' then 'awaiting_receipt' else 'new' end;
 effective_fulfillment=case when p->>'source'='cashier' then 'counter' else p->>'fulfillment' end;
 effective_customer=case when p->>'source'='cashier' then 'Walk-in customer' else trim(p->>'customer_name') end;
 insert into public.orders(branch_id,source,fulfillment,table_id,customer_name,phone,notes,status,payment_method,total_minor,created_by,completed_at,delivery_minor,delivery_address)
 values((p->>'branch_id')::uuid,p->>'source',effective_fulfillment,(p->>'table_id')::uuid,effective_customer,case when p->>'source'='cashier' then '' else coalesce(p->>'phone','') end,case when p->>'source'='cashier' then '' else coalesce(p->>'notes','') end,initial,p->>'payment_method',(q->>'total_minor')::bigint,p_user,case when p->>'source'='cashier' then now() else null end,coalesce((q->>'delivery_minor')::integer,0),case when p->>'fulfillment'='delivery' then trim(p->>'address') else null end) returning * into o;
 for l in select value from jsonb_array_elements(q->'lines') loop
  insert into public.order_items(order_id,product_id,variant_id,product_name,variant_name,quantity,unit_minor,line_minor) values(o.id,l->>'product_id',(l->>'variant_id')::uuid,l->>'product_name',l->>'variant_name',(l->>'quantity')::integer,(l->>'unit_minor')::bigint,(l->>'line_minor')::bigint) returning id into item;
  for m in select value from jsonb_array_elements(l->'modifiers') loop
   insert into public.order_item_modifiers(item_id,modifier_id,name,price_minor) values(item,(m->>'id')::uuid,m->>'name',(m->>'price_minor')::integer);
  end loop;
 end loop;
 insert into public.payments(order_id,method,status,amount_minor,verified_by,verified_at) values(o.id,o.payment_method,case when p->>'source'='cashier' then 'collected' when o.payment_method in ('cash','card') then 'unpaid' else 'pending' end,o.total_minor,case when p->>'source'='cashier' then p_user else null end,case when p->>'source'='cashier' then now() else null end);
 insert into private.order_keys values(p_key,p_token_hash,payload_hash,o.id);
 insert into public.order_events(order_id,actor_id,event,new_state) values(o.id,p_user,'created',initial);
 if initial='new' then
  insert into public.notification_outbox(order_id,audience,event) values(o.id,'cashier','actionable');
  insert into public.integration_outbox(order_id,event) values(o.id,'order.confirmed');
 end if;
 return to_jsonb(o);
end $$;

create or replace function public.bareeq_transition(p_id uuid,p_next text,p_user uuid,p_session uuid,p_reason text default '') returns jsonb language plpgsql security invoker set search_path='' as $$
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
  if o.payment_method='instapay' and not exists(select 1 from public.payments where order_id=p_id and status='verified') then raise exception 'PAYMENT_NOT_VERIFIED'; end if;
  if o.status=p_next then return to_jsonb(o); end if;
  if not ((o.status='new' and p_next='accepted') or (o.status='accepted' and p_next='preparing') or (o.status='preparing' and p_next='ready') or (o.status='ready' and p_next='completed') or (o.status in ('new','accepted','preparing','ready') and p_next='cancelled')) then raise exception 'INVALID_TRANSITION'; end if;
  if p_next='cancelled' and length(trim(p_reason)) not between 1 and 500 then raise exception 'REASON_REQUIRED'; end if;
  if p_next='completed' and o.payment_method in ('cash','card') then update public.payments set status='collected',verified_by=p_user,verified_at=now() where order_id=p_id; end if;
 end if;
 update public.orders set status=p_next,updated_at=now(),completed_at=case when p_next='completed' then now() else completed_at end where id=p_id returning * into o;
 insert into public.order_events(order_id,actor_id,event,previous_state,new_state,reason) values(p_id,p_user,'status_changed',old_status,p_next,nullif(p_reason,''));
 return to_jsonb(o);
end $$;

revoke all on function public.bareeq_create(jsonb,uuid,text,uuid,uuid),public.bareeq_transition(uuid,text,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.bareeq_create(jsonb,uuid,text,uuid,uuid),public.bareeq_transition(uuid,text,uuid,uuid,text) to service_role;
