-- Amounts are integer piastres. Existing orders retain their recorded totals.
alter table public.orders
  add column delivery_minor integer not null default 0,
  add column delivery_address text;

alter table public.orders drop constraint orders_fulfillment_check;
alter table public.orders add constraint orders_fulfillment_check
  check (fulfillment in ('takeaway', 'dine_in', 'counter', 'delivery'));
alter table public.orders add constraint orders_delivery_check check (
  (fulfillment = 'delivery' and source = 'web' and delivery_minor = 3000
    and delivery_address is not null
    and char_length(trim(delivery_address)) between 5 and 300
    and total_minor >= delivery_minor)
  or (fulfillment <> 'delivery' and delivery_minor = 0 and delivery_address is null)
);

-- Patch only delivery pricing/persistence. Production and fresh installations
-- can have different counter-sale implementations; keep both unchanged.
do $migration$
declare
  definition text;
  before_text text;
  after_text text;
begin
  definition := pg_get_functiondef('public.bareeq_quote(jsonb)'::regprocedure);
  before_text := 'total bigint=0;';
  after_text := 'total bigint=0; delivery_fee integer=0;';
  if strpos(definition, before_text) = 0 then raise exception 'Unexpected quote declaration'; end if;
  definition := replace(definition, before_text, after_text);

  before_text := ' perform pg_advisory_xact_lock(710051);';
  after_text := $patch$
 if p->>'fulfillment' = 'delivery' then
  if p->>'source' is distinct from 'web' then raise exception 'INVALID_FULFILLMENT'; end if;
  if jsonb_typeof(p->'address') is distinct from 'string'
    or char_length(trim(p->>'address')) not between 5 and 300 then
   raise exception 'INVALID_ADDRESS';
  end if;
  delivery_fee := 3000;
 end if;
 perform pg_advisory_xact_lock(710051);$patch$;
  if strpos(definition, before_text) = 0 then raise exception 'Unexpected quote locking'; end if;
  definition := replace(definition, before_text, after_text);

  before_text := $patch$'total_minor',total,$patch$;
  after_text := $patch$'items_minor',total,'delivery_minor',delivery_fee,'total_minor',total+delivery_fee,$patch$;
  if strpos(definition, before_text) = 0 then raise exception 'Unexpected quote total'; end if;
  definition := replace(definition, before_text, after_text);
  -- Preserve existing collection quotes; delivery quotes include the fee.
  before_text := 'md5(lines::text||b.id::text)';
  after_text := $patch$md5(lines::text||b.id::text||case when delivery_fee>0 then ':delivery:'||delivery_fee::text else '' end)$patch$;
  if strpos(definition, before_text) = 0 then raise exception 'Unexpected quote hash'; end if;
  definition := replace(definition, before_text, after_text);
  execute definition;

  definition := pg_get_functiondef('public.bareeq_create(jsonb,uuid,text,uuid,uuid)'::regprocedure);
  before_text := $patch$('takeaway','dine_in')$patch$;
  after_text := $patch$('takeaway','dine_in','delivery')$patch$;
  if strpos(definition, before_text) = 0 then raise exception 'Unexpected fulfillment validation'; end if;
  definition := replace(definition, before_text, after_text);
  before_text := 'status,payment_method,total_minor,created_by';
  after_text := 'status,payment_method,total_minor,delivery_minor,delivery_address,created_by';
  if strpos(definition, before_text) = 0 then raise exception 'Unexpected order columns'; end if;
  definition := replace(definition, before_text, after_text);
  before_text := $patch$(q->>'total_minor')::bigint,p_user$patch$;
  after_text := $patch$(q->>'total_minor')::bigint,(q->>'delivery_minor')::integer,case when p->>'fulfillment'='delivery' then trim(p->>'address') else null end,p_user$patch$;
  if strpos(definition, before_text) = 0 then raise exception 'Unexpected order values'; end if;
  definition := replace(definition, before_text, after_text);
  execute definition;
end $migration$;

-- CREATE OR REPLACE preserves privileges, but keep guest/staff direct RPC
-- execution explicitly denied. The authenticated Edge API owns this boundary.
revoke all on function public.bareeq_quote(jsonb) from public, anon, authenticated;
revoke all on function public.bareeq_create(jsonb,uuid,text,uuid,uuid) from public, anon, authenticated;
grant execute on function public.bareeq_quote(jsonb) to service_role;
grant execute on function public.bareeq_create(jsonb,uuid,text,uuid,uuid) to service_role;
