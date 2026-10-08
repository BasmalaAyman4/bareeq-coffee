-- Transactional fixtures; combine with the report migration using pg_temp
-- instead of public, and omit its GRANT/REVOKE statements. No real data touched.
begin;
create temporary table branches(id uuid,timezone text);
create temporary table orders(id uuid,branch_id uuid,source text,status text,total_minor bigint,payment_method text,fulfillment text,created_at timestamptz);
create temporary table payments(order_id uuid,status text,amount_minor bigint,method text,verified_at timestamptz);
create temporary table order_items(order_id uuid,product_name text,quantity integer,line_minor bigint);
create function pg_temp.bareeq_staff(uuid,uuid) returns text language sql as $$select 'founder'::text$$;
-- REPORT_FUNCTION
insert into branches values('00000000-0000-4000-8000-000000000001','Africa/Cairo');
insert into orders select ('00000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'00000000-0000-4000-8000-000000000001',
 case when n<=2 then 'cashier' else 'web' end,
 case when n=4 then 'awaiting_payment_verification' when n=5 then 'cancelled' else 'completed' end,
 10000,case when n=1 then 'cash' when n=2 then 'card' else 'instapay' end,'takeaway',
 case when n=6 then '2026-10-06 10:00:00+03'::timestamptz else '2026-10-07 10:00:00+03'::timestamptz end
 from generate_series(1,6)n;
insert into payments select id,case when status='awaiting_payment_verification' then 'pending' when status='cancelled' then 'rejected' when source='cashier' then 'collected' else 'verified' end,total_minor,payment_method,'2026-10-07 11:00:00+03' from orders;
do $$declare r jsonb;begin
 r=pg_temp.bareeq_report('2026-10-07','00000000-0000-4000-8000-000000000001',null,null);
 if (r->>'counter_count')::int<>2 or (r->>'web_count')::int<>2 then raise exception 'Wrong channel counts: %',r;end if;
 if (r->>'collected_minor')::int<>40000 then raise exception 'Wrong collection total: %',r;end if;
 if (r->>'collected_instapay_minor')::int<>20000 then raise exception 'Previous-day order payment not counted on collection day';end if;
 r=pg_temp.bareeq_report('2026-10-08','00000000-0000-4000-8000-000000000001',null,null);
 if (r->>'collected_minor')::int<>0 or (r->>'web_count')::int<>0 then raise exception 'Empty day must return zero';end if;
end $$;
select 'report collection totals, unpaid exclusion, channel counts, payment date and empty day passed' as result;
rollback;
