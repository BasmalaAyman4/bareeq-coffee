import { money } from '@/lib/money';
import Link from '@/router';

import type { Controller } from '@/features/checkout/hooks/use-checkout';
export function OrderSummary({
  checkout,
  staff,
  cart,
  quote,
  busy,
  subtotal,
  canOrder,
  place,
  method,
  receiptFile,
}: Pick<
  Controller,
  | 'checkout'
  | 'staff'
  | 'cart'
  | 'quote'
  | 'busy'
  | 'subtotal'
  | 'canOrder'
  | 'place'
  | 'method'
  | 'receiptFile'
>) {
  return (
    <aside className="order-summary">
      <h2>Order summary</h2>
      <dl>
        <div>
          <dt>Items</dt>
          <dd>{cart.reduce((n, l) => n + l.quantity, 0)}</dd>
        </div>
        <div>
          <dt>{quote ? 'Confirmed current total' : 'Menu subtotal'}</dt>
          <dd>{money(quote?.total_minor ?? subtotal)}</dd>
        </div>
      </dl>
      {quote ? (
        <>
          <p>
            This total was calculated by Bareeq. Confirm to place your order.
          </p>
          {method === 'instapay' && !receiptFile && (
            <p>Upload your transfer receipt to place the order.</p>
          )}
          <button
            className="button light"
            disabled={
              busy || !canOrder || (method === 'instapay' && !receiptFile)
            }
            onClick={place}
          >
            {busy ? 'Placing order…' : 'Place order'}
          </button>
        </>
      ) : (
        <p>
          We check the current prices and availability before you confirm.
          Collection and dine-in only; no delivery fee.
        </p>
      )}
      {!canOrder && (
        <p role="alert">
          Remove unavailable items or choose their required size.
        </p>
      )}
      {!checkout && !staff && (
        <Link className="button light" href="/checkout">
          Continue to checkout
        </Link>
      )}
    </aside>
  );
}
