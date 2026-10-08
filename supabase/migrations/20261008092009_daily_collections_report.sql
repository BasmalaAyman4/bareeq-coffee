-- Keep the legacy metrics for compatible clients; add explicit collection totals.
create or replace function public.bareeq_report(p_day date,p_branch uuid,p_user uuid,p_session uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb; tz text;
begin
 if public.bareeq_staff(p_user,p_session) is distinct from 'founder' then raise exception 'FORBIDDEN'; end if;
 select timezone into tz from public.branches where id=p_branch;
 if tz is null then raise exception 'INVALID_BRANCH'; end if;
 select jsonb_build_object('day',p_day,'timezone',tz,
  'counter_count',count(*) filter(where source='cashier' and status not in ('cancelled','payment_rejected')),
  'web_count',count(*) filter(where source='web' and status not in ('cancelled','payment_rejected','awaiting_receipt')),
  'order_count',count(*),'completed_count',count(*) filter(where status='completed'),
  'cancelled_count',count(*) filter(where status in ('cancelled','payment_rejected')),
  'revenue_minor',coalesce(sum(total_minor) filter(where status='completed'),0),
  'average_minor',coalesce(avg(total_minor) filter(where status='completed'),0),
  'cash_minor',coalesce(sum(total_minor) filter(where status='completed' and payment_method='cash'),0),
  'instapay_minor',coalesce(sum(total_minor) filter(where status='completed' and payment_method='instapay'),0),
  'online_minor',coalesce(sum(total_minor) filter(where status='completed' and source='web'),0),
  'dine_in_minor',coalesce(sum(total_minor) filter(where status='completed' and source<>'web' and fulfillment='dine_in'),0),
  'takeaway_minor',coalesce(sum(total_minor) filter(where status='completed' and source<>'web' and fulfillment='takeaway'),0))
 into result from public.orders where branch_id=p_branch
 and created_at >= p_day::timestamp at time zone tz and created_at < (p_day+1)::timestamp at time zone tz;
 select result || jsonb_build_object(
  'collected_minor',coalesce(sum(p.amount_minor),0),
  'collected_cash_minor',coalesce(sum(p.amount_minor) filter(where p.method='cash'),0),
  'collected_card_minor',coalesce(sum(p.amount_minor) filter(where p.method='card'),0),
  'collected_instapay_minor',coalesce(sum(p.amount_minor) filter(where p.method='instapay'),0))
 into result from public.payments p join public.orders o on o.id=p.order_id
 where o.branch_id=p_branch and p.status in ('verified','collected')
 and coalesce(p.verified_at,o.created_at) >= p_day::timestamp at time zone tz
 and coalesce(p.verified_at,o.created_at) < (p_day+1)::timestamp at time zone tz;
 return result || jsonb_build_object('top_products', (select coalesce(jsonb_agg(t),'[]') from (
 select i.product_name,sum(i.quantity) quantity,sum(i.line_minor) revenue_minor
 from public.order_items i join public.orders o on o.id=i.order_id
 where o.branch_id=p_branch and o.status='completed'
 and o.created_at >= p_day::timestamp at time zone tz and o.created_at < (p_day+1)::timestamp at time zone tz
 group by i.product_name order by sum(i.quantity) desc limit 10)t));
end $$;
revoke all on function public.bareeq_report(date,uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.bareeq_report(date,uuid,uuid,uuid) to service_role;
