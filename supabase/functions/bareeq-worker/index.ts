import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import webpush from 'npm:web-push@3.6.7';
const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);
async function checked(r: any) {
  if (r.error) throw r.error;
  return r.data;
}
Deno.serve(async (req) => {
  try {
    const runtime = await checked(await db.rpc('bareeq_runtime'));
    if (
      req.method !== 'POST' ||
      req.headers.get('Authorization') !== 'Bearer ' + runtime.worker_secret
    )
      return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
    const body = await req.json();
    let deleted = 0,
      delivered = 0;
    const expired = await checked(await db.rpc('bareeq_cleanup_candidates'));
    for (const receipt of expired) {
      const r = await db.storage.from('receipts').remove([receipt.path]);
      if (r.error) continue;
      if (receipt.order_id)
        await checked(
          await db
            .from('receipts')
            .update({ deleted_at: new Date().toISOString() })
            .eq('order_id', receipt.order_id),
        );
      deleted++;
    }
    if (runtime.vapid_public && runtime.vapid_private) {
      webpush.setVapidDetails(
        runtime.vapid_subject,
        runtime.vapid_public,
        runtime.vapid_private,
      );
      const events = await checked(await db.rpc('bareeq_claim_notifications'));
      for (const event of events) {
        const roles = await checked(
          await db
            .from('staff_roles')
            .select('user_id')
            .eq('role', event.audience)
            .eq('active', true)
            .eq('must_change_password', false),
        );
        const ids = roles.map((r: any) => r.user_id);
        const subscriptions = ids.length
          ? await checked(
              await db
                .from('push_subscriptions')
                .select('*')
                .in('user_id', ids),
            )
          : [];
        let failed = false;
        for (const s of subscriptions) {
          try {
            await webpush.sendNotification(
              s.subscription,
              JSON.stringify({
                title: 'Bareeq',
                body:
                  event.audience === 'founder'
                    ? 'An InstaPay payment needs verification.'
                    : 'A new online order is ready for the cashier.',
                url: `/${event.audience}?order=${event.order_id}`,
                tag: `bareeq-${event.id}`,
              }),
              { TTL: 3600, timeout: 10000 },
            );
          } catch (e) {
            if ([404, 410].includes(e.statusCode))
              await db.from('push_subscriptions').delete().eq('id', s.id);
            else failed = true;
          }
        }
        if (!failed) {
          await checked(
            await db
              .from('notification_outbox')
              .update({ delivered_at: new Date().toISOString() })
              .eq('id', event.id),
          );
          delivered++;
        }
      }
    }
    return Response.json({ deleted, delivered });
  } catch {
    return Response.json({ error: 'WORKER_FAILED' }, { status: 500 });
  }
});
