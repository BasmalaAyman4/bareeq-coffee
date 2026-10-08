import { useCopy } from '@/i18n/i18n-provider';
import { Dialog } from '@/components/ui/modal';
import { nextStatus } from '@/features/orders/order-display';
import { money } from '@/lib/money';
import { api } from '@/services/api';

import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard';
import { useI18n } from '@/i18n/i18n-provider';
import { OrderAmounts } from './order-amounts';
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
  const tr = useCopy();

  const { t, isArabic } = useI18n();
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
          <p className="eyebrow">
            {tr('Order #')}
            {selected.number}
          </p>
          <h2>{selected.customer_name}</h2>
          <p>
            <bdi>{selected.phone}</bdi> · {tr(selected.source)} ·{' '}
            {tr(selected.fulfillment.replace('_', ' '))}
          </p>
          <p>{selected.notes}</p>
          {selected.fulfillment === 'delivery' && (
            <div className="my-3 rounded-xl border border-bareeq-espresso/15 p-3">
              <strong>{isArabic ? 'عنوان التوصيل' : 'Delivery address'}</strong>
              <p className="whitespace-pre-wrap">{selected.delivery_address}</p>
            </div>
          )}
          {selected.order_items.map((i: any) => (
            <div className="staff-line" key={i.id}>
              <span>
                {i.quantity} × {tr(i.product_name)} {tr(i.variant_name ?? '')}
                <small>
                  {i.order_item_modifiers
                    .map((m: any) => tr(m.name))
                    .join(', ')}
                </small>
              </span>
              <strong>{tr(money(i.line_minor))}</strong>
            </div>
          ))}
          <OrderAmounts
            itemsMinor={selected.total_minor - (selected.delivery_minor ?? 0)}
            deliveryMinor={selected.delivery_minor ?? 0}
            totalMinor={selected.total_minor}
          />
          <p>{tr(selected.status.replaceAll('_', ' '))}</p>
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
                {t('view')} {tr('receipt')}
              </button>
              {receipt && (
                <img
                  className="receipt-image"
                  src={receipt}
                  alt={tr('Customer payment receipt')}
                />
              )}
              {selected.status === 'awaiting_payment_verification' && (
                <>
                  <p className="verification-note">
                    {tr('Verify the actual incoming transfer for')}{' '}
                    {tr(money(selected.total_minor))}{' '}
                    {tr('before confirming. A screenshot is evidence only.')}
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
          {!founder &&
            selected.source !== 'cashier' &&
            nextStatus[selected.status] && (
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
                    : tr(nextStatus[selected.status])}
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
