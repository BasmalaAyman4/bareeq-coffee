import { Quantity } from '@/components/ui/quantity';
import { Picture } from '@/features/catalog/components/product-image';
import { Trash2 } from 'lucide-react';

import type { Controller } from '@/features/checkout/hooks/use-checkout';
export function CartItems({
  quantity,
  setQuote,
  lines,
}: Pick<Controller, 'quantity' | 'setQuote' | 'lines'>) {
  return (
    <div className="cart-items">
      {lines.map((l) => (
        <article className="cart-item" key={l.key}>
          {l.product && (
            <div className="cart-image">
              <Picture product={l.product} />
            </div>
          )}
          <div className="cart-item-name">
            <h2>{l.product?.name ?? 'Unavailable item'}</h2>
            <p>
              {l.product?.variants.find((v) => v.id === l.variant_id)?.name}{' '}
              {l.product?.modifiers
                .filter((m) => l.modifier_ids.includes(m.id))
                .map((m) => m.name)
                .join(', ')}
            </p>
            <button
              className="remove-button"
              onClick={() => {
                quantity(l.key, 0);
                setQuote(null);
              }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
          <Quantity
            value={l.quantity}
            onChange={(n) => {
              quantity(l.key, n);
              setQuote(null);
            }}
          />
        </article>
      ))}
    </div>
  );
}
