-- Auth's session tables are intentionally not exposed to service-role SQL.
-- Narrow private helpers check only a specified authenticated identity or revoke
-- sessions for the account whose password the checked Edge action changed.
create function private.staff_identity(p_user uuid,p_session uuid) returns jsonb language sql stable security definer set search_path='' as $$select jsonb_build_object('role',r.role,'changeRequired',r.must_change_password,'code',r.user_code) from public.staff_roles r join auth.sessions s on s.user_id=r.user_id where r.user_id=p_user and r.active and s.id=p_session$$;
create function private.revoke_staff_sessions(p_user uuid) returns void language sql security definer set search_path='' as $$delete from auth.sessions where user_id=p_user and exists(select 1 from public.staff_roles where user_id=p_user)$$;
revoke all on function private.staff_identity(uuid,uuid),private.revoke_staff_sessions(uuid) from public,anon,authenticated;
grant execute on function private.staff_identity(uuid,uuid),private.revoke_staff_sessions(uuid) to service_role;
create or replace function public.bareeq_identity(p_user uuid,p_session uuid) returns jsonb language sql security invoker set search_path='' as $$select private.staff_identity(p_user,p_session)$$;
create or replace function public.bareeq_staff(p_user uuid,p_session uuid) returns text language sql security invoker set search_path='' as $$select case when (i->>'changeRequired')::boolean=false then i->>'role' end from (select private.staff_identity(p_user,p_session) i) s$$;
create or replace function public.bareeq_password_done(p_user uuid,p_reset boolean) returns void language plpgsql security invoker set search_path='' as $$begin update public.staff_roles set must_change_password=p_reset where user_id=p_user;perform private.revoke_staff_sessions(p_user);end$$;
