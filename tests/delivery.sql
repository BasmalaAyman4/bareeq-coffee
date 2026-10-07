-- Run against Supabase; no orders, payments, or fixtures survive this test.
begin;
create temporary table delivery_test_results(name text, passed boolean);
create function pg_temp.delivery_ok(p boolean, n text) returns void language plpgsql as $$
begin
 if p is distinct from true then raise exception 'FAILED: %', n; end if;
 insert into delivery_test_results values(n, true);
end $$;

do $tests$
declare
 branch uuid = gen_random_uuid();
 product text = 'delivery-test-' || gen_random_uuid()::text;
 p jsonb; delivery jsonb; pickup_quote jsonb; delivery_quote jsonb;
 created jsonb; repeated jsonb; online jsonb; k uuid = gen_random_uuid();
 token_hash text = repeat('d',64);
begin
 insert into public.branches(id,name,instapay_details) values(branch,'ROLLBACK TEST ONLY','TEST ONLY');
 insert into public.categories(id,name) values(product,'ROLLBACK TEST ONLY');
 insert into public.products(id,slug,name,category_id,price_minor)
 values(product,product,'ROLLBACK TEST ONLY',product,12500);
 p = jsonb_build_object('branch_id',branch,'source','web','fulfillment','takeaway',
   'customer_name','Delivery test','phone','01000000000','payment_method','cash',
   'notes','Keep separate from address','items',jsonb_build_array(jsonb_build_object('product_id',product,'quantity',2,'modifier_ids','[]'::jsonb)));
 pickup_quote = public.bareeq_quote(p);
 perform pg_temp.delivery_ok((pickup_quote->>'total_minor')::integer=25000 and (pickup_quote->>'delivery_minor')::integer=0,'collection has no delivery fee');
 perform pg_temp.delivery_ok((public.bareeq_quote(p||'{"fulfillment":"dine_in"}'::jsonb)->>'delivery_minor')::integer=0,'dine-in has no delivery fee');
 delivery = p || '{"fulfillment":"delivery","address":"  10 Test Street, apartment 2  "}'::jsonb;
 delivery_quote = public.bareeq_quote(delivery);
 perform pg_temp.delivery_ok((delivery_quote->>'items_minor')::integer=25000 and (delivery_quote->>'delivery_minor')::integer=3000 and (delivery_quote->>'total_minor')::integer=28000,'delivery adds EGP 30 once per order');
 perform pg_temp.delivery_ok(delivery_quote->>'quote_hash' <> pickup_quote->>'quote_hash','delivery and collection use different quote hashes');
 perform pg_temp.delivery_ok((public.bareeq_quote(delivery||'{"delivery_minor":0,"total_minor":1}'::jsonb)->>'total_minor')::integer=28000,'database ignores forged delivery totals');
 created = public.bareeq_create(delivery || jsonb_build_object('quote_hash',pickup_quote->>'quote_hash'),k,token_hash);
 perform pg_temp.delivery_ok(created->>'price_changed'='true','switching fulfillment with an old quote requires confirmation');
 begin
  perform public.bareeq_quote(delivery - 'address');
  raise exception 'FAILED: missing address accepted';
 exception when others then if sqlerrm <> 'INVALID_ADDRESS' then raise; end if; end;
 begin
  perform public.bareeq_quote(delivery || '{"source":"cashier"}'::jsonb);
  raise exception 'FAILED: cashier delivery accepted';
 exception when others then if sqlerrm <> 'INVALID_FULFILLMENT' then raise; end if; end;
 perform pg_temp.delivery_ok(true,'address and delivery channel are enforced by the database');
 delivery = delivery || jsonb_build_object('quote_hash',delivery_quote->>'quote_hash');
 created = public.bareeq_create(delivery,k,token_hash);
 perform pg_temp.delivery_ok(created->>'delivery_address'='10 Test Street, apartment 2' and created->>'notes'='Keep separate from address','address is stored separately and trimmed');
 perform pg_temp.delivery_ok((created->>'total_minor')::integer=28000 and (created->>'delivery_minor')::integer=3000,'order persists the server-calculated delivery total');
 perform pg_temp.delivery_ok((select amount_minor=28000 from public.payments where order_id=(created->>'id')::uuid),'payment includes delivery');
 repeated = public.bareeq_create(delivery,k,token_hash);
 perform pg_temp.delivery_ok(created->>'id'=repeated->>'id','delivery retry does not duplicate order or fee');
 perform pg_temp.delivery_ok(public.bareeq_order((created->>'id')::uuid,token_hash)->>'delivery_address'='10 Test Street, apartment 2','saved-order recovery includes address');
 created = public.bareeq_create(p || jsonb_build_object('quote_hash',pickup_quote->>'quote_hash'),gen_random_uuid(),token_hash);
 perform pg_temp.delivery_ok((created->>'delivery_minor')::integer=0 and created->>'delivery_address' is null,'collection stores no delivery address or fee');
 online = public.bareeq_create(delivery || '{"payment_method":"instapay"}'::jsonb,gen_random_uuid(),token_hash);
 perform pg_temp.delivery_ok(online->>'status'='awaiting_receipt' and (online->>'total_minor')::integer=28000,'InstaPay delivery waits for receipt and charges full total');
 perform public.bareeq_receipt((online->>'id')::uuid,token_hash,'rollback-test/receipt.jpg');
 perform pg_temp.delivery_ok((select status='awaiting_payment_verification' from public.orders where id=(online->>'id')::uuid),'receipt alone never confirms delivery payment');
 perform pg_temp.delivery_ok(not has_function_privilege('anon','public.bareeq_create(jsonb,uuid,text,uuid,uuid)','EXECUTE') and not has_function_privilege('authenticated','public.bareeq_quote(jsonb)','EXECUTE'),'direct pricing and order RPC access stays restricted');
end $tests$;

select jsonb_agg(to_jsonb(delivery_test_results)) as results from delivery_test_results;
rollback;
