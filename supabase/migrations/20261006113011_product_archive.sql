alter table public.products add column deleted_at timestamptz;
create function public.bareeq_delete_product(p_id text,p_user uuid,p_session uuid)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if public.bareeq_staff(p_user,p_session) is distinct from 'founder' then
    raise exception 'FORBIDDEN';
  end if;
  perform pg_advisory_xact_lock(710051);
  update public.products set active=false,available=false,deleted_at=coalesce(deleted_at,now()) where id=p_id;
  if not found then raise exception 'NOT_FOUND'; end if;
end $$;
revoke all on function public.bareeq_delete_product(text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.bareeq_delete_product(text,uuid,uuid) to service_role;
