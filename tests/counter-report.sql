-- Rollback-only integration test against the real pricing, auth and report functions.
begin;
-- MIGRATIONS
do $$
declare f uuid=gen_random_uuid(); c uuid=gen_random_uuid(); fs uuid=gen_random_uuid(); cs uuid=gen_random_uuid();
 b uuid=gen_random_uuid(); product text='counter-test-'||gen_random_uuid()::text; p jsonb; q jsonb; o jsonb; again jsonb; r jsonb; k uuid=gen_random_uuid();
begin
 insert into auth.users(id,aud,role,email) values(f,'authenticated','authenticated',f::text||'@example.invalid'),(c,'authenticated','authenticated',c::text||'@example.invalid');
 insert into auth.sessions(id,user_id,created_at,updated_at) values(fs,f,now(),now()),(cs,c,now(),now());
 insert into public.staff_roles(user_id,role,must_change_password) values(f,'founder',false),(c,'cashier',false);
 insert into public.branches(id,name,instapay_details) values(b,'ROLLBACK TEST','TEST ONLY');
 insert into public.categories(id,name) values(product,product);
 insert into public.products(id,slug,name,category_id,price_minor) values(product,product,'TEST',product,10000);
 p=jsonb_build_object('branch_id',b,'source','cashier','fulfillment','takeaway','customer_name','Walk-in customer','phone','','payment_method','card','items',jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1,'modifier_ids','[]'::jsonb)));
 q=public.bareeq_quote(p); p=p||jsonb_build_object('quote_hash',q->>'quote_hash');
 begin perform public.bareeq_create(p,k,repeat('c',64)); raise exception 'Anonymous counter accepted'; exception when others then if sqlerrm<>'FORBIDDEN' then raise;end if;end;
 o=public.bareeq_create(p,k,repeat('c',64),c,cs);
 if o->>'status'<>'completed' or o->>'fulfillment'<>'counter' then raise exception 'Counter not completed';end if;
 if not exists(select 1 from public.payments where order_id=(o->>'id')::uuid and method='card' and status='collected' and amount_minor=10000) then raise exception 'Card not collected';end if;
 again=public.bareeq_create(p,k,repeat('c',64),c,cs);
 if again->>'id'<>o->>'id' then raise exception 'Duplicate order';end if;
 o=public.bareeq_create(p||'{"payment_method":"cash"}',gen_random_uuid(),repeat('c',64),c,cs);
 p=p||'{"source":"web","fulfillment":"delivery","address":"10 Test Street","payment_method":"instapay"}';
 q=public.bareeq_quote(p);p=p||jsonb_build_object('quote_hash',q->>'quote_hash');
 o=public.bareeq_create(p,gen_random_uuid(),repeat('c',64));
 if (o->>'total_minor')::int<>13000 then raise exception 'Delivery lost';end if;
 perform public.bareeq_receipt((o->>'id')::uuid,repeat('c',64),'rollback-only/receipt.jpg');
 perform public.bareeq_transition((o->>'id')::uuid,'new',f,fs);
 r=public.bareeq_report((now() at time zone 'Africa/Cairo')::date,b,f,fs);
 if (r->>'counter_count')::int<>2 or (r->>'web_count')::int<>1 or (r->>'collected_minor')::int<>33000 then raise exception 'Wrong report %',r;end if;
 if (r->>'collected_card_minor')::int<>10000 or (r->>'collected_cash_minor')::int<>10000 or (r->>'collected_instapay_minor')::int<>13000 then raise exception 'Wrong payment breakdown';end if;
 begin perform public.bareeq_report(current_date,b,c,cs);raise exception 'Cashier report accepted';exception when others then if sqlerrm<>'FORBIDDEN' then raise;end if;end;
 begin perform public.bareeq_create(p||'{"payment_method":"card"}',gen_random_uuid(),repeat('c',64));raise exception 'Web card accepted';exception when others then if sqlerrm<>'INVALID_PAYMENT_METHOD' then raise;end if;end;
 if has_function_privilege('anon','public.bareeq_create(jsonb,uuid,text,uuid,uuid)','execute') then raise exception 'Public RPC exposed';end if;
end $$;
select 'PASS: Visa, cash, counter completion, idempotency, delivery, InstaPay approval, collections report and access controls' as result;
rollback;
