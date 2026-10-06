import { UIButton } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { unitPrice } from '@/features/counter/model';
import { money } from '@/lib/money';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import type { Controller } from '@/features/counter/hooks/use-counter-order';
import { useI18n } from '@/i18n/i18n-provider';
import { catalogLabel } from '@/i18n/catalog-label';
export function CounterCart({
  lines,
  payment,
  setPayment,
  busy,
  message,
  branchId,
  total,
  setQuantity,
  createOrder,
}: Pick<
  Controller,
  | 'lines'
  | 'payment'
  | 'setPayment'
  | 'busy'
  | 'message'
  | 'branchId'
  | 'total'
  | 'setQuantity'
  | 'createOrder'
>) {
  const { t, language } = useI18n();
  return (
    <aside className="flex min-h-[34rem] flex-col overflow-hidden rounded-3xl border border-bareeq-espresso/10 bg-bareeq-ivory shadow-sm xl:h-[calc(100vh-17rem)] xl:max-h-[calc(100vh-17rem)] xl:min-h-0 xl:self-start">
      <div className="flex items-center justify-between border-b border-bareeq-espresso/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={19} className="text-bareeq-burgundy" />
          <h2 className="!m-0 text-lg">{t('currentOrder')}</h2>
        </div>
        <StatusBadge tone="brand">
          {lines.reduce((sum, line) => sum + line.quantity, 0)} {t('items')}
        </StatusBadge>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {lines.map((line) => (
          <article
            className="rounded-xl border border-bareeq-espresso/8 bg-white p-3"
            key={line.key}
          >
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <strong className="block truncate">
                  {catalogLabel(line.product, language)}
                </strong>
                <p className="m-0 text-xs text-bareeq-espresso/60">
                  {[
                    line.product.variants.find(
                      (variant) => variant.id === line.variantId,
                    )?.name,
                    ...line.product.modifiers
                      .filter((modifier) =>
                        line.modifierIds.includes(modifier.id),
                      )
                      .map((modifier) => modifier.name),
                  ]
                    .filter(Boolean)
                    .join(' · ') || t('standard')}
                </p>
              </div>
              <strong className="text-sm">
                {money(unitPrice(line) * line.quantity)}
              </strong>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                className="rounded-lg p-1.5 text-bareeq-espresso/55 border-none hover:bg-bareeq-blush/40 hover:text-red-700"
                aria-label={`${t('delete')} ${catalogLabel(line.product, language)}`}
                onClick={() => setQuantity(line.key, 0)}
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="grid size-7 place-items-center rounded-full border border-bareeq-burgundy/25 text-bareeq-burgundy"
                  onClick={() => setQuantity(line.key, line.quantity - 1)}
                >
                  <Minus size={14} />
                </button>
                <strong className="w-5 text-center text-sm">
                  {line.quantity}
                </strong>
                <button
                  className="grid size-7 place-items-center rounded-full border border-bareeq-burgundy/25 bg-bareeq-burgundy text-bareeq-ivory"
                  onClick={() => setQuantity(line.key, line.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
        {!lines.length && (
          <div className="grid h-52 place-items-center text-center text-sm text-bareeq-espresso/55">
            {t('addToOrder')}
          </div>
        )}
      </div>
      <div className="border-t border-bareeq-espresso/10 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-bareeq-espresso/55">
          {t('payment')} · {t('counterSale')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <UIButton
            tone={payment === 'cash' ? 'primary' : 'secondary'}
            className="!rounded-xl"
            onClick={() => setPayment('cash')}
          >
            {t('cash')}
          </UIButton>
          <UIButton
            tone={payment === 'card' ? 'primary' : 'secondary'}
            className="!rounded-xl"
            onClick={() => setPayment('card')}
          >
            {t('visa')}
          </UIButton>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-sm text-bareeq-espresso/65">{t('total')}</span>
          <strong className="text-2xl text-bareeq-burgundy">
            {money(total)}
          </strong>
        </div>
        <UIButton
          className="mt-4 w-full !rounded-xl"
          disabled={!lines.length || !branchId}
          loading={busy}
          onClick={createOrder}
        >
          Pay {money(total)}
        </UIButton>
        {message && (
          <p
            className="mb-0 mt-3 text-center text-xs font-medium text-bareeq-espresso/70"
            role="status"
          >
            {message}
          </p>
        )}
      </div>
    </aside>
  );
}
