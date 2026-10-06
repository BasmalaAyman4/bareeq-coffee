import { Field } from '@/components/ui/field';
import { ImageUpload } from '@/components/ui/image-upload';
import type { Controller } from '@/features/checkout/hooks/use-checkout';
import { PENDING } from '@/features/checkout/model';
import { money } from '@/lib/money';
import { config } from '@/lib/supabase';
import { api } from '@/services/api';
export function OrderConfirmation({
  menu,
  quote,
  setQuote,
  order,
  setOrder,
  pending,
  setPending,
  busy,
  run,
  hasReceipt,
}: Pick<
  Controller,
  | 'menu'
  | 'quote'
  | 'setQuote'
  | 'order'
  | 'setOrder'
  | 'pending'
  | 'setPending'
  | 'busy'
  | 'run'
  | 'hasReceipt'
>) {
  return (
    <section className="checkout-panel">
      <p className="eyebrow">Order #{order.number}</p>
      <h2>{money(order.total_minor)}</h2>
      <p role="status">{order.status.replaceAll('_', ' ')}</p>
      {order.payment_method === 'instapay' && (
        <>
          <p>Transfer exactly {money(order.total_minor)} to:</p>
          <strong>
            {order.instapay_details ??
              quote?.instapay_details ??
              menu.data?.branches.find((b) => b.id === order.branch_id)
                ?.instapay_details ??
              'InstaPay Account'}
          </strong>
          <p>
            The café will verify the incoming transfer. Uploading a screenshot
            does not confirm payment.
          </p>
          {!hasReceipt && (
            <Field label="Receipt image" hint="JPG, PNG or WebP · maximum 2 MB">
              <ImageUpload
                disabled={busy}
                title="Choose your receipt or drop it here"
                hint="JPG, PNG or WebP · proof of transfer only"
                onChange={(file) => {
                  if (!file) return;
                  run(async () => {
                    if (file.size > 2097152)
                      throw new Error('Receipt must be smaller than 2 MB.');
                    const res = await fetch(
                      config.url + '/functions/v1/bareeq-api',
                      {
                        method: 'POST',
                        signal: AbortSignal.timeout(45000),
                        headers: {
                          apikey: config.key,
                          'Content-Type': file.type,
                          'x-order-id': order.id,
                          'x-order-token': pending.token,
                        },
                        body: file,
                      },
                    );
                    const value = await res.json();
                    if (!res.ok) throw new Error(value.error);
                    setOrder(value);
                  });
                }}
              />
            </Field>
          )}
        </>
      )}
      <p>
        Keep this page or return on this device to check the order. If the
        connection fails, use Check status before starting another order.
      </p>
      <button
        className="button outline"
        disabled={busy}
        onClick={() =>
          run(async () =>
            setOrder(
              await api('order', { id: order.id, token: pending.token }),
            ),
          )
        }
      >
        Check status
      </button>
      {!['awaiting_receipt', 'awaiting_payment_verification'].includes(
        order.status,
      ) && (
        <button
          className="text-link"
          onClick={() => {
            localStorage.removeItem(PENDING);
            setPending(null);
            setOrder(null);
            setQuote(null);
          }}
        >
          Start another order
        </button>
      )}
    </section>
  );
}
