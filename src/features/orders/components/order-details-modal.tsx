import { Dialog } from '@/components/ui/modal';
import { nextStatus } from '@/features/orders/order-display';
import { money } from '@/lib/money';
import { api } from '@/services/api';

import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard';
import { useI18n } from '@/i18n/i18n-provider';
export function OrderDetailsModal({
  founder,
  setError,
  busy,
  selected,
  setSelected,
  receipt,
  setReceipt,
  run,
  transition,
}: Pick<
  DashboardController,
  | 'founder'
  | 'setError'
  | 'busy'
  | 'selected'
  | 'setSelected'
  | 'receipt'
  | 'setReceipt'
  | 'run'
  | 'transition'
>) {
  const { t } = useI18n();
  return (
    <Dialog
      open={!!selected}
      title={selected ? `${t('orders')} #${selected.number}` : t('orders')}
      onClose={() => {
        setSelected(null);
        setReceipt('');
        history.replaceState({}, '', location.pathname);
      }}
    >
      {selected && (
        <>
          <p className="eyebrow">Order #{selected.number}</p>
          <h2>{selected.customer_name}</h2>
          <p>
            {selected.phone} · {selected.source} ·{' '}
            {selected.fulfillment.replace('_', ' ')}
          </p>
          <p>{selected.notes}</p>
          {selected.order_items.map((i: any) => (
            <div className="staff-line" key={i.id}>
              <span>
                {i.quantity} × {i.product_name} {i.variant_name}
                <small>
                  {i.order_item_modifiers.map((m: any) => m.name).join(', ')}
                </small>
              </span>
              <strong>{money(i.line_minor)}</strong>
            </div>
          ))}
          <h3>
            {t('total')} {money(selected.total_minor)}
          </h3>
          <p>{selected.status.replaceAll('_', ' ')}</p>
          {founder && selected.payment_method === 'instapay' && (
            <>
              <button
                className="button outline"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const r = await api('receipt', { id: selected.id });
                    if (r.deleted) {
                      setReceipt('');
                      setError(
                        'Receipt expired or is not uploaded. Order and payment history remain saved.',
                      );
                    } else setReceipt(r.url);
                  })
                }
              >
                {t('view')} receipt
              </button>
              {receipt && (
                <img
                  className="receipt-image"
                  src={receipt}
                  alt="Customer payment receipt"
                />
              )}
              {selected.status === 'awaiting_payment_verification' && (
                <>
                  <p className="verification-note">
                    Verify the actual incoming transfer for{' '}
                    {money(selected.total_minor)} before confirming. A
                    screenshot is evidence only.
                  </p>
                  <div className="staff-actions">
                    <button
                      disabled={busy}
                      className="button"
                      onClick={() => transition(selected, 'new')}
                    >
                      {t('confirm')} {t('payment').toLowerCase()}
                    </button>
                    <button
                      disabled={busy}
                      className="button outline"
                      onClick={() => transition(selected, 'payment_rejected')}
                    >
                      {t('reject')} {t('payment').toLowerCase()}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          {selected.source !== 'cashier' && nextStatus[selected.status] && (
            <div className="staff-actions">
              <button
                disabled={busy}
                className="button"
                onClick={() =>
                  transition(selected, nextStatus[selected.status])
                }
              >
                {nextStatus[selected.status] === 'completed'
                  ? t('completed')
                  : nextStatus[selected.status]}
              </button>
              <button
                disabled={busy}
                className="button outline"
                onClick={() => transition(selected, 'cancelled')}
              >
                {t('cancel')} {t('orders').toLowerCase()}
              </button>
            </div>
          )}
        </>
      )}
    </Dialog>
  );
}
