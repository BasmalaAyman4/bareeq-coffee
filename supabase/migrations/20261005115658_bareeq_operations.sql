alter table public.staff_roles add column user_code text unique;
alter table public.staff_roles add column must_change_password boolean not null default true;
create table private.runtime_config (id boolean primary key default true check(id), config jsonb not null);
alter table private.runtime_config enable row level security;
grant all on private.runtime_config to service_role;
insert into private.runtime_config(config) values(jsonb_build_object('worker_secret',encode(gen_random_bytes(32),'hex')));
create function public.bareeq_runtime() returns jsonb language sql security invoker set search_path='' as $$select config from private.runtime_config where id$$;
create function public.bareeq_identity(p_user uuid,p_session uuid) returns jsonb language sql security invoker set search_path='' as $$select jsonb_build_object('role',r.role,'changeRequired',r.must_change_password,'code',r.user_code) from public.staff_roles r join auth.sessions s on s.user_id=r.user_id where r.user_id=p_user and r.active and s.id=p_session$$;
create or replace function private.staff_role() returns text language sql stable security definer set search_path='' as $$select r.role from public.staff_roles r where r.user_id=(select auth.uid()) and r.active and not r.must_change_password and exists(select 1 from auth.sessions s where s.id=((select auth.jwt())->>'session_id')::uuid and s.user_id=r.user_id)$$;
create or replace function public.bareeq_staff(p_user uuid,p_session uuid) returns text language sql security invoker set search_path='' as $$select r.role from public.staff_roles r join auth.sessions s on s.user_id=r.user_id where r.user_id=p_user and r.active and not r.must_change_password and s.id=p_session$$;
create function public.bareeq_password_done(p_user uuid,p_reset boolean) returns void language plpgsql security invoker set search_path='' as $$begin update public.staff_roles set must_change_password=p_reset where user_id=p_user; delete from auth.sessions where user_id=p_user; end$$;
create function public.bareeq_cleanup_candidates() returns table(path text,order_id uuid) language sql security invoker set search_path='' as $$
 select r.path,r.order_id from public.receipts r where r.deleted_at is null and r.delete_after<now()
 union all select o.name,null::uuid from storage.objects o where o.bucket_id='receipts' and o.created_at<now()-interval '7 days' and not exists(select 1 from public.receipts r where r.path=o.name)
 limit 200
$$;
create function public.bareeq_claim_notifications() returns setof public.notification_outbox language sql security invoker set search_path='' as $$
 update public.notification_outbox set next_attempt_at=now()+interval '2 minutes',attempts=attempts+1 where id in (select id from public.notification_outbox where delivered_at is null and next_attempt_at<=now() order by id limit 30 for update skip locked) returning *
$$;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.schedule('bareeq-background','* * * * *',$job$select net.http_post(url:='https://vdoxjbftaegdjvjpspql.supabase.co/functions/v1/bareeq-worker',headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select config->>'worker_secret' from private.runtime_config where id)),body:='{}'::jsonb);$job$);
select cron.schedule('bareeq-rate-cleanup','15 3 * * *',$job$delete from private.rate_limits where window_start<now()-interval '1 day';$job$);
do $$declare f record;begin for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'bareeq_%' loop execute 'revoke all on function '||f.signature||' from public,anon,authenticated';execute 'grant execute on function '||f.signature||' to service_role';end loop;end$$;
