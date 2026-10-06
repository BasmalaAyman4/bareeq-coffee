import { api } from '@/services/api';

import type { Controller } from '@/features/checkout/hooks/use-checkout';
export function ResumeOrder({
  setOrder,
  pending,
  busy,
  run,
  submit,
  setConfirmationOpen,
}: Pick<
  Controller,
  'setOrder' | 'pending' | 'busy' | 'run' | 'submit' | 'setConfirmationOpen'
>) {
  return (
    <section className="checkout-panel">
      <h2>Resume your order</h2>
      <p>
        A saved submission needs checking. Retrying uses the same order
        reference and cannot create a duplicate.
      </p>
      <button
        className="button"
        disabled={busy}
        onClick={() =>
          run(async () => {
            if (pending.id) {
              const result = await api('order', {
                id: pending.id,
                token: pending.token,
              });
              setOrder(result);
              setConfirmationOpen(result.status !== 'awaiting_receipt');
            } else await submit(pending);
          })
        }
      >
        Check / retry saved order
      </button>
    </section>
  );
}
