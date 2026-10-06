import { api } from '@/services/api';

import type { Controller } from '@/features/checkout/hooks/use-checkout';
export function ResumeOrder({
  setOrder,
  pending,
  busy,
  run,
  submit,
}: Pick<Controller, 'setOrder' | 'pending' | 'busy' | 'run' | 'submit'>) {
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
            if (pending.id)
              setOrder(
                await api('order', {
                  id: pending.id,
                  token: pending.token,
                }),
              );
            else await submit(pending);
          })
        }
      >
        Check / retry saved order
      </button>
    </section>
  );
}
