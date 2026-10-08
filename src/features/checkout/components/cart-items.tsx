import { useCopy } from '@/i18n/i18n-provider';
import { useI18n } from '@/i18n/i18n-provider';
import { catalogLabel } from '@/i18n/catalog-label';
import { Quantity } from '@/components/ui/quantity';
import { Picture } from '@/features/catalog/components/product-image';
import { Trash2 } from 'lucide-react';

import type { Controller } from '@/features/checkout/hooks/use-checkout';
export function CartItems({
  quantity,
  setQuote,
  lines,
}: Pick<Controller, 'quantity' | 'setQuote' | 'lines'>) {
  const tr = useCopy();
  const { language } = useI18n();

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
            <h2>
              {l.product
                ? catalogLabel(l.product, language)
                : tr('Unavailable item')}
            </h2>
            <p>
              {tr(
                l.product?.variants.find((v) => v.id === l.variant_id)?.name ??
                  '',
              )}{' '}
              {l.product?.modifiers
                .filter((m) => l.modifier_ids.includes(m.id))
                .map((m) => catalogLabel(m, language))
                .join(', ')}
            </p>
            <button
              className="remove-button"
              onClick={() => {
                quantity(l.key, 0);
                setQuote(null);
              }}
            >
              <Trash2 size={14} /> {tr('Remove')}
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
