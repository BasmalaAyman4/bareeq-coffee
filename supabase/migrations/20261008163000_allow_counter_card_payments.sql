-- Ensure cashier counter card (Visa / Fawry) orders pass DB constraints and RPC validation.
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check check(payment_method in ('cash','instapay','card','gateway'));
alter table public.orders drop constraint if exists orders_fulfillment_check;
alter table public.orders add constraint orders_fulfillment_check check(fulfillment in ('takeaway','dine_in','counter','delivery'));
alter table public.payments drop constraint if exists payments_method_check;
alter table public.payments add constraint payments_method_check check(method in ('cash','instapay','card','gateway'));

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
 if (p->>'source'='web' and (p->>'payment_method' not in ('cash','instapay') or p->>'fulfillment' not in ('takeaway','dine_in','delivery'))) or (p->>'source'='cashier' and (p->>'payment_method' not in ('cash','card') or p->>'fulfillment' not in ('counter','takeaway','dine_in'))) then raise exception 'INVALID_PAYMENT_METHOD'; end if;
 if p->>'table_id' is not null and not exists(select 1 from public.cafe_tables where id=(p->>'table_id')::uuid and branch_id=(p->>'branch_id')::uuid and active) then raise exception 'INVALID_TABLE'; end if;
 q=public.bareeq_quote(p);
 if p->>'quote_hash' is distinct from q->>'quote_hash' then return jsonb_build_object('price_changed',true,'quote',q); end if;
 if p->>'payment_method'='instapay' and nullif(q->>'instapay_details','') is null then raise exception 'INSTAPAY_NOT_CONFIGURED'; end if;
 initial=case when p->>'source'='cashier' then 'completed' when p->>'payment_method'='instapay' then 'awaiting_receipt' else 'new' end;
 effective_fulfillment=case when p->>'source'='cashier' and p->>'fulfillment' not in ('counter','takeaway','dine_in') then 'counter' else p->>'fulfillment' end;
 effective_customer=case when p->>'source'='cashier' then 'Walk-in customer' else trim(p->>'customer_name') end;
 insert into public.orders(branch_id,source,fulfillment,table_id,customer_name,phone,notes,status,payment_method,total_minor,delivery_minor,delivery_address,created_by,completed_at)
 values((p->>'branch_id')::uuid,p->>'source',effective_fulfillment,(p->>'table_id')::uuid,effective_customer,case when p->>'source'='cashier' then '' else coalesce(p->>'phone','') end,case when p->>'source'='cashier' then '' else coalesce(p->>'notes','') end,initial,p->>'payment_method',(q->>'total_minor')::bigint,coalesce((q->>'delivery_minor')::integer,0),case when p->>'fulfillment'='delivery' then trim(p->>'address') else null end,p_user,case when p->>'source'='cashier' then now() else null end) returning * into o;
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

revoke all on function public.bareeq_create(jsonb,uuid,text,uuid,uuid) from public, anon, authenticated;
grant execute on function public.bareeq_create(jsonb,uuid,text,uuid,uuid) to service_role;
